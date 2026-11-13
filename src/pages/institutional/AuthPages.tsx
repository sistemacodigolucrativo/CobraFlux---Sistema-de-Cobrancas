import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldAlert, UserCheck } from 'lucide-react';
import { Button, Card, GoldenLogo, Input, Select } from '../../components/ui/Primitives';
import { useApp } from '../../context/AppContext';
import { demoBillingService } from '../../services/demoService';
import type { PlanTier } from '../../types/domain';

export const AuthPages: React.FC = () => {
  const {
    snapshot,
    authMode,
    setAuthMode,
    setEnvironment,
    switchUser,
    refreshSnapshot,
    pushToast,
    playSound,
  } = useApp();

  const [email, setEmail] = useState('rafael@studioforce.com.br');
  const [password, setPassword] = useState('demo1234');
  const [authFeedback, setAuthFeedback] = useState<'none' | 'recover_ok' | 'error'>('none');

  // Register state
  const [regName, setRegName] = useState('');
  const [regBusiness, setRegBusiness] = useState('');
  const [regCategory, setRegCategory] = useState('Personal Trainer');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+5511999990000');
  const [regPlan, setRegPlan] = useState<PlanTier>('essencial');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const match = snapshot?.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!match || password.length < 4) {
      setAuthFeedback('error');
      playSound('error');
      return;
    }
    setAuthFeedback('none');
    await switchUser(match.id);
    playSound('signup_success');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regBusiness.trim() || !regEmail.includes('@')) {
      setAuthFeedback('error');
      playSound('error');
      return;
    }
    const res = await demoBillingService.registerDemoProfessional({
      name: regName,
      businessName: regBusiness,
      category: regCategory,
      email: regEmail,
      phone: regPhone,
      planId: regPlan,
    });
    if (!res.ok) {
      pushToast({ type: 'error', title: 'Cadastro não concluído', message: res.error });
      playSound('error');
      return;
    }
    await refreshSnapshot();
    playSound('signup_success');
    pushToast({
      type: 'success',
      title: 'Conta demonstrativa criada',
      message: 'Você entrou no painel profissional com persistência local.',
    });
    setEnvironment('professional');
  };

  const handleRecoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setAuthFeedback('error');
      playSound('error');
      return;
    }
    setAuthFeedback('recover_ok');
    playSound('notification');
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F6F1E8] flex flex-col">
      <header className="border-b border-white/8 px-4 sm:px-6 h-16 flex items-center justify-between max-w-6xl w-full mx-auto">
        <button
          type="button"
          onClick={() => setEnvironment('site')}
          className="inline-flex items-center gap-2 text-sm text-[#B8BFCD] hover:text-[#F6F1E8] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao site
        </button>
        <GoldenLogo compact />
        <span className="text-xs text-[#9EA7BA]">Modo Demo</span>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0B0D12] border border-white/8">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthFeedback('none');
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  authMode === 'login' ? 'bg-[#E2BE72] text-[#0B0D12]' : 'text-[#B8BFCD] hover:text-[#F6F1E8]'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthFeedback('none');
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  authMode === 'register' ? 'bg-[#E2BE72] text-[#0B0D12]' : 'text-[#B8BFCD] hover:text-[#F6F1E8]'
                }`}
              >
                Cadastrar profissional
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('recover');
                  setAuthFeedback('none');
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  authMode === 'recover' ? 'bg-[#E2BE72] text-[#0B0D12]' : 'text-[#B8BFCD] hover:text-[#F6F1E8]'
                }`}
              >
                Recuperar acesso
              </button>
            </div>

            {authFeedback === 'error' && (
              <div className="rounded-xl border border-[#F16C79]/40 bg-[#F16C79]/10 p-3.5 flex items-start gap-2.5 text-xs text-[#F6F1E8]">
                <ShieldAlert className="w-4 h-4 text-[#F16C79] shrink-0 mt-0.5" />
                <span>
                  Credenciais ou campos inválidos para o ambiente demonstrativo. Utilize um dos perfis ao lado ou
                  verifique os dados informados.
                </span>
              </div>
            )}

            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h1 className="text-xl font-display font-bold text-[#F6F1E8]">Acesso demonstrativo</h1>
                  <p className="text-xs text-[#9EA7BA] mt-1">
                    Esta autenticação local simula sessões por organização e não substitui autenticação de
                    produção.
                  </p>
                </div>
                <Input
                  label="E-mail da conta demonstrativa"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Senha de demonstração"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  hint="Qualquer senha com 4+ caracteres funciona para os perfis listados ao lado."
                  required
                />
                <Button type="submit" className="w-full" size="lg">
                  Entrar na conta selecionada
                </Button>
              </form>
            )}

            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <h1 className="text-xl font-display font-bold text-[#F6F1E8]">Criar conta profissional</h1>
                  <p className="text-xs text-[#9EA7BA] mt-1">
                    Cria uma nova organização isolada no armazenamento local do navegador.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome completo"
                    placeholder="Ex: Bruno Oliveira"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                  <Input
                    label="Nome do estúdio ou empresa"
                    placeholder="Ex: Studio Bruno Pilates"
                    value={regBusiness}
                    onChange={(e) => setRegBusiness(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Área de atuação"
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                  >
                    <option value="Personal Trainer">Personal Trainer</option>
                    <option value="Professor Particular">Professor Particular</option>
                    <option value="Nutricionista">Nutricionista</option>
                    <option value="Consultor">Consultor</option>
                    <option value="Estética">Profissional de Estética</option>
                    <option value="Prestador de Serviços">Outro Prestador de Serviços</option>
                  </Select>
                  <Input
                    label="WhatsApp com DDI"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="E-mail profissional"
                    type="email"
                    placeholder="contato@estudio.com.br"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                  <Select
                    label="Plano inicial (Demo)"
                    value={regPlan}
                    onChange={(e) => setRegPlan(e.target.value as PlanTier)}
                  >
                    <option value="free">Free (R$ 0 · até 5 clientes)</option>
                    <option value="essencial">Essencial (R$ 39/mês)</option>
                    <option value="premium">Premium (R$ 79/mês)</option>
                  </Select>
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Criar conta e abrir painel
                </Button>
              </form>
            )}

            {authMode === 'recover' && (
              <div className="space-y-4">
                {authFeedback === 'recover_ok' ? (
                  <div className="py-6 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-[#33C994] mx-auto" />
                    <h2 className="text-lg font-display font-semibold text-[#F6F1E8]">
                      Solicitação de recuperação simulada
                    </h2>
                    <p className="text-sm text-[#B8BFCD]">
                      Em produção, um link temporário seria enviado para <strong>{email}</strong>. No modo demo,
                      escolha qualquer perfil ao lado para acesso imediato.
                    </p>
                    <Button variant="secondary" onClick={() => setAuthMode('login')}>
                      Voltar para o login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleRecoverSubmit} className="space-y-4">
                    <div>
                      <h1 className="text-xl font-display font-bold text-[#F6F1E8]">Recuperar acesso</h1>
                      <p className="text-xs text-[#9EA7BA] mt-1">
                        Simulação do fluxo de redefinição segura de senha por e-mail.
                      </p>
                    </div>
                    <Input
                      label="E-mail cadastrado"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" className="w-full" size="lg">
                      Enviar instruções (Demo)
                    </Button>
                  </form>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* 5 Demo Profiles Switcher */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#E2BE72]">Contas Fictícias Prontas</p>
            <h2 className="text-lg font-display font-bold text-[#F6F1E8]">
              Acesso em 1 clique por cenário
            </h2>
            <p className="text-xs text-[#B8BFCD]">
              Cada conta possui sua própria organização, clientes, assinaturas e regras isoladas.
            </p>
          </div>

          <div className="space-y-2.5">
            {snapshot?.users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => switchUser(u.id)}
                className="w-full text-left rounded-2xl border border-[#A78952]/25 bg-[#151922] hover:border-[#E2BE72] p-4 flex items-center justify-between gap-3 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#F6F1E8] truncate">{u.name}</p>
                  <p className="text-xs text-[#E2BE72] truncate">{u.demoLabel}</p>
                  <p className="text-[11px] text-[#9EA7BA] truncate mt-0.5">{u.email}</p>
                </div>
                <UserCheck className="w-4 h-4 text-[#E2BE72] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
