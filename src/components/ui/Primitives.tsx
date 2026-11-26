import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  Loader2,
  WifiOff,
  X,
  XCircle,
} from 'lucide-react';
import { useApp, useOptionalApp } from '../../context/AppContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const GoldenLogo: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const uid = React.useId().replace(/:/g, '');
  const goldId = `cf-gold-${uid}`;
  const goldBrightId = `cf-gold-b-${uid}`;
  const swooshId = `cf-swoosh-${uid}`;
  const greenId = `cf-green-${uid}`;
  const pulseId = `cf-pulse-${uid}`;
  const wordId = `cf-word-${uid}`;

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      {/* CobraFlux CF Monogram Emblem */}
      <svg
        className={compact ? 'w-10 h-8 shrink-0' : 'w-12 h-9 shrink-0'}
        viewBox="0 0 120 90"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={goldId} x1="12" y1="10" x2="92" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF2B8" />
            <stop offset="35%" stopColor="#E8C36A" />
            <stop offset="70%" stopColor="#C89B3C" />
            <stop offset="100%" stopColor="#F5D491" />
          </linearGradient>
          <linearGradient id={goldBrightId} x1="20" y1="8" x2="78" y2="75" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF7D6" />
            <stop offset="50%" stopColor="#E2BE72" />
            <stop offset="100%" stopColor="#9C7832" />
          </linearGradient>
          <linearGradient id={swooshId} x1="10" y1="72" x2="108" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E86FAE" />
            <stop offset="45%" stopColor="#E2BE72" />
            <stop offset="100%" stopColor="#33C994" />
          </linearGradient>
          <linearGradient id={greenId} x1="36" y1="62" x2="64" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="55%" stopColor="#33C994" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </linearGradient>
        </defs>

        {/* Orbital pink-to-emerald swoosh */}
        <path
          d="M16 58C10 47 22 28 48 16C74 4 102 6 108 18C113 28 101 46 80 58"
          stroke={`url(#${swooshId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.92"
        />
        <path
          d="M90 54C74 66 42 75 22 68C14 65 11 60 13 54"
          stroke="#E86FAE"
          strokeWidth="3.4"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* Circuit board traces extending top-right from F */}
        <path
          d="M72 22H90L98 15H105"
          stroke={`url(#${goldId})`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="108" cy="15" r="3" stroke="#E86FAE" strokeWidth="2.2" fill="#0B0D12" />
        <path
          d="M70 28H92L99 22H106"
          stroke={`url(#${goldId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="109" cy="22" r="2.7" stroke="#F5D491" strokeWidth="2" fill="#0B0D12" />

        {/* Rising green bar chart + upward arrow inside C */}
        <rect x="41" y="51" width="5.5" height="9" rx="1.2" fill={`url(#${greenId})`} />
        <rect x="49" y="46" width="5.5" height="14" rx="1.2" fill={`url(#${greenId})`} />
        <rect x="57" y="40" width="5.5" height="20" rx="1.2" fill={`url(#${greenId})`} />
        <path
          d="M37 49C45 45 53 38 60 28"
          stroke="#6EE7B7"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path d="M54 29L62 25L62.5 34L58.5 31.5L54 29Z" fill="#6EE7B7" />

        {/* Sculpted metallic gold C */}
        <path
          d="M73 16H47C34 16 24 26 21 42C18 58 26 68 41 68H54L58 58H43C34 58 30 52 32 42C34 31 41 26 50 26H67L73 16Z"
          fill={`url(#${goldId})`}
          stroke="#FFF5CC"
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Interlocked metallic gold F */}
        <path
          d="M66 32H94L89 41H73L70 49H86L81 58H67L57 78H46L66 32Z"
          fill={`url(#${goldBrightId})`}
          stroke="#FFF5CC"
          strokeOpacity="0.5"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark + Signature Pulse Line */}
      <span className="inline-flex flex-col leading-none">
        <svg
          className={compact ? 'h-[19px] w-[94px]' : 'h-[22px] w-[112px]'}
          viewBox="0 0 132 26"
          fill="none"
          role="img"
          aria-label="CobraFlux"
        >
          <defs>
            <linearGradient id={wordId} x1="0" y1="2" x2="130" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF2B8" />
              <stop offset="40%" stopColor="#E8C36A" />
              <stop offset="75%" stopColor="#C89B3C" />
              <stop offset="100%" stopColor="#F5D491" />
            </linearGradient>
          </defs>
          <text
            x="1"
            y="20"
            fill={`url(#${wordId})`}
            fontFamily="Manrope, Plus Jakarta Sans, sans-serif"
            fontSize="22"
            fontWeight="800"
            fontStyle="italic"
            letterSpacing="-0.5"
          >
            CobraFlux
          </text>
        </svg>

        <svg
          className={compact ? 'h-[6px] w-[94px] mt-0.5' : 'h-[7px] w-[112px] mt-0.5'}
          viewBox="0 0 132 10"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={pulseId} x1="0" y1="5" x2="132" y2="5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#33C994" stopOpacity="0.15" />
              <stop offset="22%" stopColor="#33C994" />
              <stop offset="42%" stopColor="#E2BE72" />
              <stop offset="50%" stopColor="#E86FAE" />
              <stop offset="60%" stopColor="#E2BE72" />
              <stop offset="80%" stopColor="#33C994" />
              <stop offset="100%" stopColor="#33C994" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path
            d="M2 5H52L58 5L61 1.5L65 8.5L69 2.5L72 5H130"
            stroke={`url(#${pulseId})`}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
};

export const CobraFluxLogo = GoldenLogo;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'emerald' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  onClick,
  ...rest
}) => {
  const optionalContext = useOptionalApp();

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-[#E2BE72] text-[#0B0D12] hover:bg-[#F5D491] font-semibold shadow-sm shadow-[#E2BE72]/15',
    secondary:
      'bg-[#1F2531] text-[#F6F1E8] border border-[#A78952]/30 hover:border-[#E2BE72]/60 hover:bg-[#252c3a]',
    ghost:
      'bg-transparent text-[#B8BFCD] hover:text-[#F6F1E8] hover:bg-white/5',
    danger:
      'bg-[#F16C79] text-[#0B0D12] hover:bg-[#f58590] font-semibold',
    emerald:
      'bg-[#33C994] text-[#0B0D12] hover:bg-[#49d6a3] font-semibold',
    pink:
      'bg-[#E86FAE] text-[#0B0D12] hover:bg-[#ee88bd] font-semibold',
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'min-h-[38px] px-3.5 py-1.5 text-xs rounded-lg',
    md: 'min-h-[42px] px-5 py-2 text-sm rounded-xl',
    lg: 'min-h-[48px] px-6 py-2.5 text-sm rounded-xl',
  };

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      onClick={(e) => {
        if (variant === 'primary') optionalContext?.playSound('tap');
        onClick?.(e);
      }}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2BE72] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}> = ({ children, className = '', elevated = false }) => (
  <div
    className={`rounded-2xl border border-[#A78952]/20 ${
      elevated ? 'bg-[#1F2531]' : 'bg-[#151922]'
    } transition-colors duration-200 ${className}`}
  >
    {children}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, id, className = '', ...rest }) => {
  const inputId = id ?? `inp_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-xs font-medium text-[#B8BFCD]">
        {label}
      </label>
      <input
        id={inputId}
        {...rest}
        className={`w-full min-h-[44px] rounded-xl bg-[#0B0D12] border ${
          error ? 'border-[#F16C79]' : 'border-white/12 focus:border-[#E2BE72]'
        } px-3.5 py-2.5 text-sm text-[#F6F1E8] placeholder:text-[#9EA7BA]/60 focus:outline-none transition-colors ${className}`}
      />
      {error && <p className="text-xs text-[#F16C79]">{error}</p>}
      {!error && hint && <p className="text-xs text-[#9EA7BA]">{hint}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, error, id, className = '', children, ...rest }) => {
  const selectId = id ?? `sel_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-xs font-medium text-[#B8BFCD]">
        {label}
      </label>
      <select
        id={selectId}
        {...rest}
        className={`w-full min-h-[44px] rounded-xl bg-[#0B0D12] border ${
          error ? 'border-[#F16C79]' : 'border-white/12 focus:border-[#E2BE72]'
        } px-3.5 py-2.5 text-sm text-[#F6F1E8] focus:outline-none transition-colors ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[#F16C79]">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, hint, id, className = '', ...rest }) => {
  const areaId = id ?? `txt_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={areaId} className="block text-xs font-medium text-[#B8BFCD]">
        {label}
      </label>
      <textarea
        id={areaId}
        {...rest}
        className={`w-full rounded-xl bg-[#0B0D12] border border-white/12 focus:border-[#E2BE72] px-3.5 py-2.5 text-sm text-[#F6F1E8] placeholder:text-[#9EA7BA]/60 focus:outline-none transition-colors ${className}`}
      />
      {hint && <p className="text-xs text-[#9EA7BA]">{hint}</p>}
    </div>
  );
};

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}> = ({ open, onClose, title, subtitle, children, maxWidthClass = 'max-w-lg' }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`w-full ${maxWidthClass} max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#151922] border border-[#A78952]/30 shadow-2xl overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 id="modal-title" className="text-base font-display font-semibold text-[#F6F1E8]">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-[#9EA7BA] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#9EA7BA] hover:text-[#F6F1E8] hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4">{children}</div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="rounded-2xl border border-dashed border-[#A78952]/30 bg-[#151922]/60 p-8 text-center space-y-3">
    <h3 className="text-base font-display font-semibold text-[#F6F1E8]">{title}</h3>
    <p className="text-sm text-[#B8BFCD] max-w-md mx-auto">{description}</p>
    {actionLabel && onAction && (
      <div className="pt-2">
        <Button onClick={onAction}>{actionLabel}</Button>
      </div>
    )}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Não foi possível carregar os dados', message, onRetry }) => (
  <div className="rounded-2xl border border-[#F16C79]/35 bg-[#151922] p-6 text-center space-y-3">
    <AlertTriangle className="w-7 h-7 text-[#F16C79] mx-auto" aria-hidden="true" />
    <h3 className="text-base font-display font-semibold text-[#F6F1E8]">{title}</h3>
    <p className="text-sm text-[#B8BFCD]">{message}</p>
    {onRetry && (
      <Button variant="secondary" onClick={onRetry}>
        Tentar novamente
      </Button>
    )}
  </div>
);

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = 'h-24' }) => (
  <div className={`animate-pulse rounded-2xl bg-[#1F2531]/70 ${className}`} aria-hidden="true" />
);

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-5 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const iconMap = {
          success: <CheckCircle2 className="w-4 h-4 text-[#33C994] shrink-0" />,
          error: <XCircle className="w-4 h-4 text-[#F16C79] shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-[#E2BE72] shrink-0" />,
          info: <Info className="w-4 h-4 text-[#E86FAE] shrink-0" />,
          processing: <Loader2 className="w-4 h-4 text-[#E2BE72] animate-spin shrink-0" />,
        };
        const borderMap = {
          success: 'border-[#33C994]/40',
          error: 'border-[#F16C79]/40',
          warning: 'border-[#E2BE72]/40',
          info: 'border-[#E86FAE]/40',
          processing: 'border-[#E2BE72]/40',
        };
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl bg-[#1F2531] border ${borderMap[t.type]} p-3.5 shadow-xl`}
          >
            <div className="mt-0.5">{iconMap[t.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F6F1E8]">{t.title}</p>
              {t.message && <p className="text-xs text-[#B8BFCD] mt-0.5">{t.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label={`Dispensar aviso ${t.title}`}
              className="text-[#9EA7BA] hover:text-[#F6F1E8] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'full' }> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <Button variant="secondary" size={variant === 'compact' ? 'sm' : 'md'} onClick={install}>
        <Download className="w-4 h-4 text-[#E2BE72]" />
        Instalar aplicativo
      </Button>
    );
  }

  if (isIOS) {
    return (
      <>
        <Button
          variant="secondary"
          size={variant === 'compact' ? 'sm' : 'md'}
          onClick={() => setShowIOSGuide(true)}
        >
          <Download className="w-4 h-4 text-[#E2BE72]" />
          Instalar no iOS
        </Button>
        <Modal
          open={showIOSGuide}
          onClose={() => setShowIOSGuide(false)}
          title="Instalar CobraFlux no iPhone / iPad"
        >
          <ol className="space-y-2 text-sm text-[#B8BFCD] list-decimal list-inside">
            <li>Toque no botão Compartilhar na barra do Safari.</li>
            <li>Role as opções e toque em Adicionar à Tela de Início.</li>
          </ol>
          <div className="pt-2">
            <Button className="w-full" onClick={() => setShowIOSGuide(false)}>
              Entendi
            </Button>
          </div>
        </Modal>
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#1F2531] border border-[#E2BE72]/50 px-3.5 py-2 text-xs font-medium text-[#F5D491] shadow-lg">
      <WifiOff className="w-4 h-4 text-[#E2BE72]" />
      <span>Modo offline · Dados locais preservados no navegador</span>
    </div>
  );
};
