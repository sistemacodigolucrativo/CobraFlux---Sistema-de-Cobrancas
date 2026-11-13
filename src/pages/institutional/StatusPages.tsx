import React from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { Button, Card, GoldenLogo } from '../../components/ui/Primitives';
import { useApp } from '../../context/AppContext';

export const StatusPage: React.FC<{ mode: 'confirmation' | 'error' }> = ({ mode }) => {
  const { setEnvironment, switchUser } = useApp();
  const isConfirmation = mode === 'confirmation';

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F6F1E8] flex flex-col">
      <header className="border-b border-white/8 px-4 sm:px-6 h-16 flex items-center justify-between max-w-5xl w-full mx-auto">
        <button
          type="button"
          onClick={() => setEnvironment('site')}
          className="inline-flex items-center gap-2 text-sm text-[#B8BFCD] hover:text-[#F6F1E8] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao site
        </button>
        <GoldenLogo compact />
        <span className="text-xs text-[#9EA7BA]">
          {isConfirmation ? 'Confirmação' : 'Aviso de rota'}
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="max-w-lg w-full p-7 sm:p-9 text-center space-y-5 golden-sheen">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-[#0B0D12] border border-white/10">
            {isConfirmation ? (
              <CheckCircle2 className="w-7 h-7 text-[#33C994]" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-[#F16C79]" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-[#E2BE72]">
              {isConfirmation ? 'Operação concluída (Ambiente Demonstrativo)' : 'Página não encontrada ou indisponível'}
            </p>
            <h1 className="text-2xl font-display font-bold text-[#F6F1E8]">
              {isConfirmation
                ? 'Sua solicitação foi registrada com sucesso.'
                : 'Não foi possível localizar o endereço informado.'}
            </h1>
            <p className="text-sm text-[#B8BFCD] leading-relaxed">
              {isConfirmation
                ? 'As alterações permanecem salvas localmente no armazenamento do navegador. Você pode seguir diretamente para o painel operacional ou retornar à página inicial.'
                : 'O link acessado pode estar expirado, digitado incorretamente ou apontar para um identificador que não existe nesta base demonstrativa.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button onClick={() => setEnvironment('site')} variant="secondary" className="w-full sm:w-auto">
              Ir para o site institucional
            </Button>
            <Button onClick={() => switchUser('usr_rafael')} className="w-full sm:w-auto">
              <Sparkles className="w-4 h-4" />
              Abrir painel demo
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};
