import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Lock,
  MessageSquare,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button, Card, GoldenLogo, Input, Modal, PWAInstallButton, Textarea } from '../../components/ui/Primitives';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../domain/money';
import { demoBillingService } from '../../services/demoService';
import { HERO_STUDIO_IMG } from '../../utils/media';

const FAQS = [
  {
    q: 'O sistema movimenta dinheiro real ou envia WhatsApp verdadeiro nesta versão?',
    a: 'Não. Esta é uma demonstração funcional completa com persistência local (IndexedDB). Todos os pagamentos Pix, comprovantes e lembretes de WhatsApp operam em simulador, preparados por contratos de serviço para conexão futura com Asaas, Mercado Pago, Efí e WhatsApp Business.',
  },
  {
    q: 'O que acontece se eu reduzir meu plano para o Free tendo mais de 5 clientes?',
    a: 'Seus clientes já cadastrados nunca são apagados. O sistema preserva todo o histórico e bloqueia apenas o cadastro de novos clientes acima do limite contratado até você arquivar registros ou fazer um novo upgrade.',
  },
  {
    q: 'Como funciona o tratamento de vencimentos nos dias 29, 30 e 31?',
    a: 'Nos meses mais curtos, como fevereiro ou abril, o motor de recorrências ajusta automaticamente a data para o último dia válido daquele mês e retorna ao dia preferencial nos meses seguintes, evitando duplicidades.',
  },
  {
    q: 'Meus clientes precisam baixar aplicativo ou criar senha para pagar?',
    a: 'Não. Cada cobrança gera um link público individual com identificador não previsível, otimizado para abertura imediata no celular do cliente, exibindo valor, vencimento, QR Code e código demonstrativo.',
  },
];

export const LandingPage: React.FC = () => {
  const {
    snapshot,
    setEnvironment,
    setAuthMode,
    switchUser,
    openPublicPayment,
    pushToast,
    playSound,
  } = useApp();

  const [demoAmount, setDemoAmount] = useState('450,00');
  const [demoClient, setDemoClient] = useState('Carla Vasconcelos');
  const [demoStep, setDemoStep] = useState<'draft' | 'ready' | 'paid'>('ready');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactState, setContactState] = useState<'idle' | 'sent' | 'error'>('idle');
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const plans = snapshot?.subscriptionPlans ?? [];
  const sampleCharge = snapshot?.charges.find((c) => c.status === 'aguardando_pagamento') ?? snapshot?.charges[0];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.includes('@') || contactMessage.trim().length < 8) {
      setContactState('error');
      playSound('error');
      pushToast({
        type: 'error',
        title: 'Verifique os campos do formulário',
        message: 'Informe nome, e-mail válido e uma mensagem com ao menos 8 caracteres.',
      });
      return;
    }
    await demoBillingService.createSupportTicket(
      'org_visitante',
      contactName.trim(),
      contactSubject.trim() || 'Contato comercial pelo site',
      `${contactMessage.trim()} (Contato: ${contactEmail.trim()})`
    );
    setContactState('sent');
    playSound('signup_success');
    pushToast({
      type: 'success',
      title: 'Solicitação registrada',
      message: 'Sua mensagem foi encaminhada para a Central de Suporte no painel administrativo.',
    });
    setContactName('');
    setContactEmail('');
    setContactSubject('');
    setContactMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F6F1E8]">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0D12]/90 backdrop-blur-md border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a href="#topo" className="whitespace-nowrap shrink-0">
            <GoldenLogo />
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#B8BFCD]">
            <a href="#funcionalidades" className="hover:text-[#E2BE72] transition-colors whitespace-nowrap shrink-0">
              Funcionalidades
            </a>
            <a href="#demonstracao" className="hover:text-[#E2BE72] transition-colors whitespace-nowrap shrink-0">
              Demonstração
            </a>
            <a href="#planos" className="hover:text-[#E2BE72] transition-colors whitespace-nowrap shrink-0">
              Planos
            </a>
            <a href="#faq" className="hover:text-[#E2BE72] transition-colors whitespace-nowrap shrink-0">
              Dúvidas
            </a>
            <a href="#contato" className="hover:text-[#E2BE72] transition-colors whitespace-nowrap shrink-0">
              Contato
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="sm"
              onClick={() => {
                setAuthMode('login');
                setEnvironment('auth');
              }}
            >
              Acessar plataforma
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="topo" className="relative overflow-hidden border-b border-white/8">
        <div
          className="pointer-events-none absolute -top-24 left-1/3 w-96 h-96 rounded-full bg-[#E2BE72]/8 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#E86FAE]/6 blur-3xl"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-xs font-medium tracking-wide text-[#E2BE72]">
              Plataforma de Cobranças Recorrentes · Mercado Brasileiro · Ambiente Demonstrativo
            </p>
            <h1
              className="font-display font-bold tracking-tight text-[#F6F1E8] leading-[1.08]"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.6rem)', textWrap: 'balance' }}
            >
              Previsibilidade financeira para quem vive de serviços recorrentes.
            </h1>
            <p className="text-base text-[#B8BFCD] leading-relaxed max-w-xl">
              Personal trainers, nutricionistas, consultores, professores e clínicas de estética administram
              clientes, mensalidades, links de pagamento e lembretes de vencimento em uma operação única.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="lg" onClick={() => switchUser('usr_rafael')}>
                Explorar painel ao vivo
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setAuthMode('register');
                  setEnvironment('auth');
                }}
              >
                Criar conta de teste
              </Button>
              <PWAInstallButton variant="full" />
            </div>

            <div className="pt-4 border-t border-white/8 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#9EA7BA]">
              <span>Cobranças recorrentes</span>
              <span aria-hidden="true">·</span>
              <span>Link Pix sem cadastro</span>
              <span aria-hidden="true">·</span>
              <span>Simulador WhatsApp</span>
            </div>
          </div>

          <div className="lg:col-span-6 flex">
            <div className="relative w-full rounded-2xl overflow-hidden border border-[#A78952]/30 bg-gradient-to-br from-[#1F2531] via-[#151922] to-[#0B0D12] min-h-[300px] lg:min-h-[420px]">
              {!heroImgFailed ? (
                <img
                  src={HERO_STUDIO_IMG}
                  alt="Consultório e estúdio executivo contemporâneo com iluminação dourada"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full min-h-[300px] lg:min-h-[420px] flex items-center justify-center bg-[radial-gradient(circle_at_30%_25%,rgba(226,190,114,0.22),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(51,201,148,0.14),transparent_55%)]"
                  aria-hidden="true"
                >
                  <Sparkles className="w-12 h-12 text-[#E2BE72]/50" />
                </div>
              )}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/35 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-[#F5D491]">Studio Force Personal · Exemplo ativo</p>
                  <p className="text-lg font-display font-semibold text-[#F6F1E8] mt-0.5 tabular-nums">
                    R$ 1.320,00 liquidados no ciclo atual
                  </p>
                </div>
                {sampleCharge && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openPublicPayment(sampleCharge.publicId)}
                  >
                    Ver link de cobrança
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Capabilities Bento */}
      <section id="funcionalidades" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium text-[#E2BE72]">Arquitetura Operacional</p>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#F6F1E8]" style={{ textWrap: 'balance' }}>
            Controle completo do faturamento sem planilhas paralelas.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <Card className="md:col-span-7 p-6 sm:p-7 space-y-4 golden-sheen">
            <div className="flex items-center justify-between text-xs text-[#E2BE72]">
              <span>01. Motor de Recorrências e Vencimentos</span>
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-display font-semibold text-[#F6F1E8]">
              Cobranças mensais, semanais ou personalizadas sem duplicidade
            </h3>
            <p className="text-sm text-[#B8BFCD] leading-relaxed">
              Configure uma vez o dia preferencial de vencimento e o sistema trata automaticamente meses de 28,
              29 ou 30 dias, impede emissão duplicada no mesmo ciclo e encerra contratos na data final.
            </p>
            <div className="pt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#9EA7BA] border-t border-white/8">
              <span>Valores em centavos inteiros</span>
              <span aria-hidden="true">·</span>
              <span>Abatimento parcial de saldo</span>
              <span aria-hidden="true">·</span>
              <span>Estorno com trilha de auditoria</span>
            </div>
          </Card>

          <Card className="md:col-span-5 p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#E86FAE]">
              <span>02. Pagamento Mobile sem Atrito</span>
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-display font-semibold text-[#F6F1E8]">
              Link individual com QR Code demonstrativo
            </h3>
            <p className="text-sm text-[#B8BFCD] leading-relaxed">
              Seu cliente abre o link direto no celular, confere serviço, vencimento e liquida sem precisar criar
              conta ou lembrar senha.
            </p>
          </Card>

          <Card className="md:col-span-5 p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#33C994]">
              <span>03. Régua de Lembretes WhatsApp</span>
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-display font-semibold text-[#F6F1E8]">
              Comunicação gentil e suspensão automática ao pagar
            </h3>
            <p className="text-sm text-[#B8BFCD] leading-relaxed">
              Programe avisos 3 dias antes, no vencimento e pós-vencimento com janela de silêncio, limite
              semanal, registro de consentimento LGPD e cancelamento automático após liquidação.
            </p>
          </Card>

          <Card className="md:col-span-7 p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#E2BE72]">
              <span>04. Separação Rigorosa e Administração SaaS</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-display font-semibold text-[#F6F1E8]">
              Quatro ambientes isolados e prontos para APIs reais
            </h3>
            <p className="text-sm text-[#B8BFCD] leading-relaxed">
              Cada profissional acessa exclusivamente sua carteira. O administrador geral gerencia planos,
              assinaturas, limites, auditoria e receita recorrente da plataforma sem misturar com o volume dos
              profissionais.
            </p>
          </Card>
        </div>
      </section>

      {/* Interactive Live Product Demonstration */}
      <section id="demonstracao" className="border-y border-white/8 bg-[#151922]/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-medium text-[#E2BE72]">Demonstração Interativa</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#F6F1E8]">
              Teste a emissão e liquidação em segundos.
            </h2>
            <p className="text-sm text-[#B8BFCD] leading-relaxed">
              Simule o ciclo completo de uma cobrança ou alterne entre os cinco perfis demonstrativos para
              avaliar limites de plano, inadimplência e visão administrativa.
            </p>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-medium text-[#9EA7BA]">Entrar diretamente como:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {snapshot?.users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => switchUser(u.id)}
                    className="text-left rounded-xl border border-[#A78952]/25 bg-[#0B0D12] hover:border-[#E2BE72] px-3.5 py-2.5 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-[#F6F1E8] truncate">{u.name}</p>
                    <p className="text-[11px] text-[#9EA7BA] truncate">{u.demoLabel}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card elevated className="p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs text-[#E2BE72]">Simulador Rápido de Cobrança</p>
                  <p className="text-sm font-medium text-[#F6F1E8]">Prévia instantânea do fluxo do pagador</p>
                </div>
                <span className="text-xs text-[#9EA7BA]">Sem movimentação real</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome do cliente (prévia)"
                  value={demoClient}
                  onChange={(e) => setDemoClient(e.target.value)}
                />
                <Input
                  label="Valor da mensalidade (R$)"
                  value={demoAmount}
                  onChange={(e) => setDemoAmount(e.target.value)}
                />
              </div>

              <div className="rounded-xl bg-[#0B0D12] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-[#9EA7BA]">
                    {demoClient || 'Cliente Exemplo'} · Vencimento 15/11/2026
                  </p>
                  <p className="text-2xl font-display font-bold text-[#F6F1E8] tabular-nums">
                    R$ {demoAmount || '0,00'}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      demoStep === 'paid' ? 'text-[#33C994]' : 'text-[#F5D491]'
                    }`}
                  >
                    Situação: {demoStep === 'paid' ? 'Paga (Demo confirmada)' : 'Aguardando pagamento Pix'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {demoStep !== 'paid' ? (
                    <Button
                      variant="emerald"
                      size="sm"
                      onClick={() => {
                        setDemoStep('paid');
                        playSound('payment_success');
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Simular pagamento
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => setDemoStep('ready')}>
                      Reiniciar prévia
                    </Button>
                  )}
                  {sampleCharge && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openPublicPayment(sampleCharge.publicId)}
                    >
                      Abrir página pública real
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Plans Comparison */}
      <section id="planos" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium text-[#E2BE72]">Planos Comerciais Sugeridos</p>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#F6F1E8]">
            Estrutura transparente, configurável pelo administrador.
          </h2>
          <p className="text-sm text-[#B8BFCD]">
            Valores demonstrativos para validação de modelo comercial. A assinatura do profissional é sempre
            separada das cobranças enviadas aos clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const isHighlighted = plan.id === 'premium';
            return (
              <Card
                key={plan.id}
                elevated={isHighlighted}
                className={`p-6 flex flex-col justify-between space-y-6 ${
                  isHighlighted ? 'border-[#E2BE72]/50' : ''
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-display font-bold text-[#F6F1E8]">{plan.name}</h3>
                    {isHighlighted && <span className="text-xs font-medium text-[#E2BE72]">Mais completo</span>}
                  </div>
                  <p className="text-xs text-[#B8BFCD] min-h-[32px]">{plan.tagline}</p>

                  <div className="pt-2 border-t border-white/8">
                    <span className="text-3xl font-display font-bold text-[#F6F1E8] tabular-nums">
                      {formatBRL(plan.monthlyPriceCents)}
                    </span>
                    <span className="text-xs text-[#9EA7BA]"> / mês</span>
                  </div>

                  <div className="text-xs text-[#B8BFCD] space-y-1 pt-1">
                    <p>
                      Clientes: <strong className="text-[#F6F1E8]">{plan.maxClients ?? 'Ilimitados'}</strong>
                    </p>
                    <p>
                      Franquia WhatsApp:{' '}
                      <strong className="text-[#F6F1E8] tabular-nums">
                        {plan.monthlyMessageQuota} envios/mês
                      </strong>
                    </p>
                  </div>

                  <ul className="space-y-2.5 pt-2 text-sm text-[#B8BFCD]">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#33C994] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={isHighlighted ? 'primary' : 'secondary'}
                  className="w-full"
                  onClick={() => {
                    setAuthMode('register');
                    setEnvironment('auth');
                  }}
                >
                  Testar plano {plan.name}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-white/8 bg-[#151922]/35 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#E2BE72]">Perguntas Frequentes</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#F6F1E8]">
              Esclarecimentos sobre operação e segurança
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <Card key={item.q} className="overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-[#F6F1E8]">{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#E2BE72] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#9EA7BA] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-[#B8BFCD] leading-relaxed border-t border-white/6 pt-3">
                      {item.a}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact & Support */}
      <section id="contato" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-medium text-[#E2BE72]">Contato e Suporte</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#F6F1E8]">
              Fale com a equipe comercial ou suporte técnico.
            </h2>
            <p className="text-sm text-[#B8BFCD] leading-relaxed">
              As solicitações enviadas por aqui são registradas imediatamente na Central de Suporte do Painel
              Administrativo Geral para demonstração ponta a ponta.
            </p>
            <div className="space-y-1.5 text-sm text-[#B8BFCD] pt-2">
              <p>E-mail: {snapshot?.globalSettings.supportEmail ?? 'suporte@cobraflux.com.br'}</p>
              <p>Atendimento: {snapshot?.globalSettings.supportPhone ?? '+55 11 3000-4000'}</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card className="p-6">
              {contactState === 'sent' ? (
                <div className="py-6 text-center space-y-3">
                  <Lock className="w-7 h-7 text-[#33C994] mx-auto" />
                  <h3 className="text-lg font-display font-semibold text-[#F6F1E8]">
                    Mensagem recebida na Central de Suporte
                  </h3>
                  <p className="text-sm text-[#B8BFCD]">
                    Você já pode visualizá-la entrando no perfil Administrador Geral em Administração &gt; Suporte.
                  </p>
                  <Button variant="secondary" onClick={() => setContactState('idle')}>
                    Enviar nova mensagem
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Seu nome"
                      placeholder="Ex: Juliana Martins"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                    <Input
                      label="E-mail"
                      type="email"
                      placeholder="voce@empresa.com.br"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    label="Assunto"
                    placeholder="Ex: Dúvida sobre planos ou integração futura"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                  />
                  <Textarea
                    label="Mensagem"
                    rows={3}
                    placeholder="Descreva sua necessidade..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                  />
                  {contactState === 'error' && (
                    <p className="text-xs text-[#F16C79]">
                      Preencha corretamente seu nome, um e-mail válido e uma mensagem detalhada.
                    </p>
                  )}
                  <Button type="submit">Enviar solicitação</Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-white/8 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9EA7BA]">
          <div className="flex items-center gap-4">
            <GoldenLogo compact />
            <span>Ambiente demonstrativo sem movimentações financeiras reais</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setLegalModal('terms')}
              className="hover:text-[#F6F1E8] cursor-pointer"
            >
              Termos de Uso
            </button>
            <button
              type="button"
              onClick={() => setLegalModal('privacy')}
              className="hover:text-[#F6F1E8] cursor-pointer"
            >
              Política de Privacidade (LGPD)
            </button>
          </div>
        </div>
      </footer>

      <Modal
        open={legalModal !== null}
        onClose={() => setLegalModal(null)}
        title={legalModal === 'terms' ? 'Termos de Uso (Demonstrativo)' : 'Política de Privacidade e LGPD'}
      >
        {legalModal === 'terms' ? (
          <div className="space-y-3 text-sm text-[#B8BFCD] leading-relaxed">
            <p>
              O CobraFlux opera em versão demonstrativa local. Nenhuma cobrança Pix, transferência
              bancária ou disparo real de WhatsApp ocorre neste ambiente.
            </p>
            <p>
              Em implantação comercial futura, cada profissional será responsável pelos serviços prestados aos
              próprios clientes e pela habilitação regular junto ao provedor de pagamentos selecionado.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-[#B8BFCD] leading-relaxed">
            <p>
              Todos os dados criados nesta demonstração permanecem armazenados localmente no navegador
              (IndexedDB), podendo ser exportados ou excluídos integralmente a qualquer momento nas Configurações.
            </p>
            <p>
              Para conformidade com a LGPD, o sistema registra consentimento explícito de comunicação por cliente
              e permite revogação imediata de lembretes.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
