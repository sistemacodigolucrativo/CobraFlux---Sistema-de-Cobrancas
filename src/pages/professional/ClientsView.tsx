import React, { useMemo, useState } from 'react';
import {
  Archive,
  FileSpreadsheet,
  History,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Upload,
} from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  Textarea,
} from '../../components/ui/Primitives';
import { useApp } from '../../context/AppContext';
import { clientSchema, parseAndValidateClientsCsv, type CsvImportRowPreview } from '../../domain/finance';
import { formatBRL, parseBRLToCents } from '../../domain/money';
import { formatDateBR } from '../../domain/recurrence';
import { demoBillingService } from '../../services/demoService';
import type { Client, ClientStatus } from '../../types/domain';
import { getChargeStatusColor, getChargeStatusLabel, getClientStatusLabel } from '../../utils/labels';

const SAMPLE_CSV = `nome;telefone;email;servico;valor;vencimento
Patrícia Lemos;11988881234;patricia.lemos@email.com;Consultoria Personal;580,00;10
Bruno Santana;11977774321;bruno.s@email.com;Mentoria Híbrida;420,00;15`;

export const ClientsView: React.FC = () => {
  const { snapshot, activeOrg, activePlan, refreshSnapshot, pushToast, playSound } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | ClientStatus>('todos');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);

  // CSV Modal
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRaw, setCsvRaw] = useState(SAMPLE_CSV);
  const [csvPreview, setCsvPreview] = useState<CsvImportRowPreview[]>(() =>
    parseAndValidateClientsCsv(SAMPLE_CSV)
  );

  // Form Fields
  const [name, setName] = useState('');
  const [phoneDdi, setPhoneDdi] = useState('+5511');
  const [email, setEmail] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [monthlyFeeStr, setMonthlyFeeStr] = useState('450,00');
  const [preferredDueDay, setPreferredDueDay] = useState('10');
  const [notes, setNotes] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const orgClients = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.clients.filter((c) => c.organizationId === activeOrg.id);
  }, [snapshot, activeOrg]);

  const orgServices = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.services.filter((s) => s.organizationId === activeOrg.id && s.active);
  }, [snapshot, activeOrg]);

  const activeCount = useMemo(
    () => orgClients.filter((c) => c.status !== 'arquivado').length,
    [orgClients]
  );

  const filteredClients = useMemo(() => {
    return orgClients.filter((c) => {
      if (statusFilter !== 'todos' && c.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.serviceName.toLowerCase().includes(q) ||
          c.internalCode.toLowerCase().includes(q) ||
          c.phoneDdi.includes(q)
        );
      }
      return true;
    });
  }, [orgClients, search, statusFilter]);

  const openCreateModal = () => {
    setEditingClient(null);
    setName('');
    setPhoneDdi('+5511');
    setEmail('');
    setServiceName(orgServices[0]?.name ?? 'Mensalidade Personal');
    setMonthlyFeeStr(
      orgServices[0] ? (orgServices[0].defaultPriceCents / 100).toFixed(2).replace('.', ',') : '450,00'
    );
    setPreferredDueDay('10');
    setNotes('');
    setWhatsappOptIn(true);
    setFormError(null);
    setShowFormModal(true);
  };

  const openEditModal = (cli: Client) => {
    setEditingClient(cli);
    setName(cli.name);
    setPhoneDdi(cli.phoneDdi);
    setEmail(cli.email ?? '');
    setServiceName(cli.serviceName);
    setMonthlyFeeStr((cli.monthlyFeeCents / 100).toFixed(2).replace('.', ','));
    setPreferredDueDay(String(cli.preferredDueDay));
    setNotes(cli.notes);
    setWhatsappOptIn(cli.whatsappOptIn);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    const cents = parseBRLToCents(monthlyFeeStr);
    const dueDay = Number.parseInt(preferredDueDay, 10) || 10;

    const parsed = clientSchema.safeParse({
      name,
      phoneDdi,
      email,
      serviceName,
      monthlyFeeCents: cents,
      preferredDueDay: dueDay,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
      playSound('error');
      return;
    }

    if (editingClient) {
      const res = await demoBillingService.updateClient(activeOrg.id, editingClient.id, {
        name: parsed.data.name,
        phoneDdi: parsed.data.phoneDdi,
        email: parsed.data.email || undefined,
        serviceName: parsed.data.serviceName,
        monthlyFeeCents: parsed.data.monthlyFeeCents,
        preferredDueDay: parsed.data.preferredDueDay,
        notes,
        whatsappOptIn,
      });
      if (!res.ok) {
        setFormError(res.error ?? 'Erro ao atualizar.');
        playSound('error');
        return;
      }
      pushToast({ type: 'success', title: 'Cliente atualizado' });
    } else {
      const res = await demoBillingService.createClient(activeOrg.id, {
        name: parsed.data.name,
        phoneDdi: parsed.data.phoneDdi,
        email: parsed.data.email || undefined,
        serviceName: parsed.data.serviceName,
        monthlyFeeCents: parsed.data.monthlyFeeCents,
        preferredDueDay: parsed.data.preferredDueDay,
        status: 'ativo',
        notes,
        whatsappOptIn,
      });
      if (!res.ok) {
        setFormError(res.error ?? 'Limite do plano atingido.');
        playSound('error');
        return;
      }
      pushToast({ type: 'success', title: 'Cliente cadastrado com sucesso' });
    }

    playSound('signup_success');
    await refreshSnapshot();
    setShowFormModal(false);
  };

  const handleArchiveToggle = async (cli: Client) => {
    if (!activeOrg) return;
    const nextStatus: ClientStatus = cli.status === 'arquivado' ? 'ativo' : 'arquivado';
    const res = await demoBillingService.updateClient(activeOrg.id, cli.id, { status: nextStatus });
    if (!res.ok) {
      playSound('error');
      pushToast({ type: 'error', title: 'Reativação bloqueada pelo plano', message: res.error });
      return;
    }
    await refreshSnapshot();
    playSound(nextStatus === 'arquivado' ? 'cancel' : 'tap');
    pushToast({
      type: 'info',
      title: nextStatus === 'arquivado' ? 'Cliente arquivado' : 'Cliente reativado',
    });
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const txt = String(reader.result ?? '');
      setCsvRaw(txt);
      setCsvPreview(parseAndValidateClientsCsv(txt));
    };
    reader.readAsText(file);
  };

  const handleConfirmCsvImport = async () => {
    if (!activeOrg) return;
    const validRows = csvPreview.filter((r) => r.valid);
    if (validRows.length === 0) {
      pushToast({ type: 'error', title: 'Nenhuma linha válida para importar' });
      return;
    }
    const res = await demoBillingService.importClientsBatch(activeOrg.id, validRows);
    if (!res.ok) {
      playSound('error');
      pushToast({ type: 'error', title: 'Importação não permitida', message: res.error });
      return;
    }
    await refreshSnapshot();
    playSound('signup_success');
    pushToast({
      type: 'success',
      title: `${res.importedCount} clientes importados`,
    });
    setShowCsvModal(false);
  };

  const clientHistoryCharges = useMemo(() => {
    if (!snapshot || !historyClient) return [];
    return snapshot.charges.filter((c) => c.clientId === historyClient.id);
  }, [snapshot, historyClient]);

  if (!activeOrg) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#E2BE72]">
            Carteira exclusiva de {activeOrg.name} ·{' '}
            <span className="tabular-nums">
              {activeCount}
              {activePlan?.maxClients ? ` / ${activePlan.maxClients}` : ''} clientes ativos
            </span>
          </p>
          <h1 className="text-2xl font-display font-bold text-[#F6F1E8] mt-0.5">Clientes</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setCsvPreview(parseAndValidateClientsCsv(csvRaw));
              setShowCsvModal(true);
            }}
          >
            <Upload className="w-4 h-4" />
            Importar CSV
          </Button>
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            Cadastrar cliente
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9EA7BA] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Pesquisar clientes"
            placeholder="Buscar por nome, código, telefone ou serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[42px] rounded-xl bg-[#0B0D12] border border-white/10 pl-10 pr-4 text-sm text-[#F6F1E8] placeholder:text-[#9EA7BA]/60 focus:outline-none focus:border-[#E2BE72]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B0D12] border border-white/8 overflow-x-auto">
          {(['todos', 'ativo', 'inadimplente', 'arquivado'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                statusFilter === st ? 'bg-[#E2BE72] text-[#0B0D12]' : 'text-[#B8BFCD] hover:text-[#F6F1E8]'
              }`}
            >
              {st === 'todos' ? 'Todos' : getClientStatusLabel(st)}
            </button>
          ))}
        </div>
      </Card>

      {/* Client List (Cards on Mobile, Table on Desktop) */}
      {filteredClients.length === 0 ? (
        <EmptyState
          title="Nenhum cliente encontrado"
          description="Ajuste os filtros de pesquisa ou cadastre seu primeiro cliente para começar a emitir cobranças."
          actionLabel="Cadastrar cliente"
          onAction={openCreateModal}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredClients.map((cli) => (
              <Card key={cli.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F6F1E8] truncate">{cli.name}</p>
                    <p className="text-xs text-[#9EA7BA]">
                      {cli.internalCode} · {cli.phoneDdi}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      cli.status === 'ativo'
                        ? 'text-[#33C994]'
                        : cli.status === 'inadimplente'
                          ? 'text-[#F16C79]'
                          : 'text-[#9EA7BA]'
                    }`}
                  >
                    {getClientStatusLabel(cli.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#B8BFCD] pt-2 border-t border-white/8">
                  <span className="truncate">{cli.serviceName}</span>
                  <span className="font-semibold text-[#F6F1E8] tabular-nums">
                    {formatBRL(cli.monthlyFeeCents)} · Dia {cli.preferredDueDay}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setHistoryClient(cli)}>
                    Histórico
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => openEditModal(cli)}>
                    Editar
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-[#9EA7BA] bg-[#0B0D12]/40">
                    <th className="py-3 px-4 font-medium">Código / Cliente</th>
                    <th className="py-3 px-4 font-medium">Contato</th>
                    <th className="py-3 px-4 font-medium">Serviço contratado</th>
                    <th className="py-3 px-4 font-medium text-right">Mensalidade</th>
                    <th className="py-3 px-4 font-medium text-center">Dia venc.</th>
                    <th className="py-3 px-4 font-medium">Situação</th>
                    <th className="py-3 px-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {filteredClients.map((cli) => (
                    <tr key={cli.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-[#F6F1E8]">{cli.name}</p>
                        <p className="text-xs text-[#9EA7BA] font-mono">{cli.internalCode}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#B8BFCD]">
                        <p className="tabular-nums">{cli.phoneDdi}</p>
                        {cli.email && <p className="text-[#9EA7BA]">{cli.email}</p>}
                      </td>
                      <td className="py-3.5 px-4 text-[#B8BFCD]">{cli.serviceName}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-[#F6F1E8] tabular-nums">
                        {formatBRL(cli.monthlyFeeCents)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[#B8BFCD] tabular-nums">
                        Dia {cli.preferredDueDay}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-semibold ${
                            cli.status === 'ativo'
                              ? 'text-[#33C994]'
                              : cli.status === 'inadimplente'
                                ? 'text-[#F16C79]'
                                : 'text-[#9EA7BA]'
                          }`}
                        >
                          {getClientStatusLabel(cli.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setHistoryClient(cli)}
                            aria-label={`Ver histórico de ${cli.name}`}
                            className="p-2 rounded-lg text-[#9EA7BA] hover:text-[#E2BE72] hover:bg-white/5 cursor-pointer"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(cli)}
                            aria-label={`Editar ${cli.name}`}
                            className="p-2 rounded-lg text-[#9EA7BA] hover:text-[#F6F1E8] hover:bg-white/5 cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchiveToggle(cli)}
                            aria-label={
                              cli.status === 'arquivado' ? `Reativar ${cli.name}` : `Arquivar ${cli.name}`
                            }
                            className="p-2 rounded-lg text-[#9EA7BA] hover:text-[#F16C79] hover:bg-white/5 cursor-pointer"
                          >
                            {cli.status === 'arquivado' ? (
                              <RotateCcw className="w-4 h-4" />
                            ) : (
                              <Archive className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingClient ? 'Editar cliente' : 'Cadastrar novo cliente'}
      >
        <form onSubmit={handleSaveClient} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-[#F16C79]/40 bg-[#F16C79]/10 p-3 text-xs text-[#F6F1E8]">
              {formError}
            </div>
          )}
          <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telefone com DDI"
              placeholder="+5511999998888"
              value={phoneDdi}
              onChange={(e) => setPhoneDdi(e.target.value)}
              required
            />
            <Input
              label="E-mail (opcional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Input
            label="Serviço ou plano contratado"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Valor mensal (R$)"
              value={monthlyFeeStr}
              onChange={(e) => setMonthlyFeeStr(e.target.value)}
              required
            />
            <Select
              label="Dia preferencial de vencimento"
              value={preferredDueDay}
              onChange={(e) => setPreferredDueDay(e.target.value)}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  Dia {day}
                </option>
              ))}
            </Select>
          </div>
          <Textarea
            label="Observações"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <label className="flex items-center gap-2.5 text-xs text-[#B8BFCD] cursor-pointer">
            <input
              type="checkbox"
              checked={whatsappOptIn}
              onChange={(e) => setWhatsappOptIn(e.target.checked)}
              className="w-4 h-4 accent-[#E2BE72]"
            />
            Cliente autorizou lembretes de cobrança via WhatsApp (LGPD)
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowFormModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editingClient ? 'Salvar alterações' : 'Cadastrar cliente'}</Button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        open={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        title="Importar clientes via CSV"
        subtitle="Formato: nome;telefone;email;servico;valor;vencimento"
        maxWidthClass="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-xs text-[#E2BE72] cursor-pointer hover:underline">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Carregar arquivo .csv</span>
              <input type="file" accept=".csv,text/csv" onChange={handleCsvFileUpload} className="hidden" />
            </label>
            <span className="text-xs text-[#9EA7BA]">
              {csvPreview.filter((r) => r.valid).length} válidas · {csvPreview.filter((r) => !r.valid).length}{' '}
              com erro
            </span>
          </div>

          <Textarea
            label="Conteúdo CSV (edite ou cole seus dados)"
            rows={4}
            value={csvRaw}
            onChange={(e) => {
              setCsvRaw(e.target.value);
              setCsvPreview(parseAndValidateClientsCsv(e.target.value));
            }}
          />

          <div className="rounded-xl border border-white/10 bg-[#0B0D12] max-h-52 overflow-y-auto divide-y divide-white/8">
            {csvPreview.map((row) => (
              <div key={row.rowNumber} className="px-3.5 py-2.5 text-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-[#F6F1E8] truncate">
                    Linha {row.rowNumber}: {row.name || '(sem nome)'}
                  </p>
                  {row.valid ? (
                    <p className="text-[#9EA7BA] truncate">
                      {row.phoneDdi} · {row.serviceName} · Dia {row.preferredDueDay}
                    </p>
                  ) : (
                    <p className="text-[#F16C79]">{row.errors.join(' ')}</p>
                  )}
                </div>
                <span className="font-mono tabular-nums text-[#F6F1E8] shrink-0">
                  {formatBRL(row.monthlyFeeCents)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCsvModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmCsvImport}>
              Confirmar importação ({csvPreview.filter((r) => r.valid).length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* Client History Modal */}
      <Modal
        open={historyClient !== null}
        onClose={() => setHistoryClient(null)}
        title={historyClient ? `Histórico · ${historyClient.name}` : 'Histórico'}
        maxWidthClass="max-w-xl"
      >
        {historyClient && (
          <div className="space-y-4">
            <div className="text-xs text-[#B8BFCD] flex flex-wrap gap-3">
              <span>Código: {historyClient.internalCode}</span>
              <span>·</span>
              <span>WhatsApp: {historyClient.phoneDdi}</span>
              <span>·</span>
              <span>Opt-in: {historyClient.whatsappOptIn ? 'Autorizado' : 'Cancelado'}</span>
            </div>
            {clientHistoryCharges.length === 0 ? (
              <p className="text-sm text-[#9EA7BA]">Nenhuma cobrança emitida para este cliente.</p>
            ) : (
              <div className="divide-y divide-white/8 border border-white/10 rounded-xl bg-[#0B0D12]">
                {clientHistoryCharges.map((ch) => (
                  <div key={ch.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-medium text-[#F6F1E8]">{ch.description}</p>
                      <p className="text-[#9EA7BA]">
                        Venc. {formatDateBR(ch.dueDate)} ·{' '}
                        <span className={getChargeStatusColor(ch.status)}>
                          {getChargeStatusLabel(ch.status)}
                        </span>
                      </p>
                    </div>
                    <span className="font-semibold text-[#F6F1E8] tabular-nums">
                      {formatBRL(ch.amountCents)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
