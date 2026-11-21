import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { demoBillingService } from '../services/demoService';
import { loadLocalUiPreferences, saveLocalUiPreferences } from '../services/db';
import type {
  DemoDatabaseSnapshot,
  Organization,
  Subscription,
  SubscriptionPlan,
  User,
} from '../types/domain';
import { soundEngine, type SoundEffectType } from '../utils/sound';

export type AppEnvironment =
  | 'site'
  | 'auth'
  | 'professional'
  | 'admin'
  | 'public_payment'
  | 'confirmation'
  | 'error';

export type ProfessionalTab =
  | 'inicio'
  | 'clientes'
  | 'cobrancas'
  | 'recorrencias'
  | 'pagamentos'
  | 'mensagens'
  | 'relatorios'
  | 'notificacoes'
  | 'assinatura'
  | 'configuracoes';

export type AdminTab =
  | 'visao_geral'
  | 'profissionais'
  | 'assinaturas'
  | 'simulacao'
  | 'mensagens'
  | 'auditoria'
  | 'configuracoes'
  | 'suporte';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'processing';
  title: string;
  message?: string;
}

interface UiPrefs {
  soundEnabled: boolean;
  soundVolume: number;
  reduceMotion: boolean;
}

interface AppContextValue {
  snapshot: DemoDatabaseSnapshot | null;
  loading: boolean;
  loadError: string | null;
  refreshSnapshot: () => Promise<void>;
  environment: AppEnvironment;
  setEnvironment: (env: AppEnvironment) => void;
  profTab: ProfessionalTab;
  setProfTab: (tab: ProfessionalTab) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  publicPaymentId: string | null;
  openPublicPayment: (publicId: string) => void;
  authMode: 'login' | 'register' | 'recover';
  setAuthMode: (m: 'login' | 'register' | 'recover') => void;
  activeUser: User | null;
  activeOrg: Organization | null;
  activeSubscription: Subscription | null;
  activePlan: SubscriptionPlan | null;
  switchUser: (userId: string) => Promise<void>;
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
  uiPrefs: UiPrefs;
  updateUiPrefs: (patch: Partial<UiPrefs>) => void;
  playSound: (effect: SoundEffectType) => void;
  notifyBrowser: (title: string, body: string) => void;
  unreadNotificationsCount: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshot, setSnapshot] = useState<DemoDatabaseSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [environment, setEnvironmentState] = useState<AppEnvironment>('site');
  const [profTab, setProfTabState] = useState<ProfessionalTab>('inicio');
  const [adminTab, setAdminTabState] = useState<AdminTab>('visao_geral');
  const [publicPaymentId, setPublicPaymentId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recover'>('login');

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastTimersRef = useRef<Map<string, number>>(new Map());

  const [uiPrefs, setUiPrefs] = useState<UiPrefs>(() => loadLocalUiPreferences());

  // Sync audio & reduced motion preferences
  useEffect(() => {
    soundEngine.configure(uiPrefs.soundEnabled, uiPrefs.soundVolume);
    saveLocalUiPreferences(uiPrefs);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('reduce-motion', uiPrefs.reduceMotion);
    }
  }, [uiPrefs]);

  // Respect system prefers-reduced-motion on initial load if not overridden
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq.matches && !localStorage.getItem('golden_billing_ui_prefs_v1')) {
        setUiPrefs((prev) => ({ ...prev, reduceMotion: true }));
      }
    }
  }, []);

  const updateUiPrefs = useCallback((patch: Partial<UiPrefs>) => {
    setUiPrefs((prev) => ({ ...prev, ...patch }));
  }, []);

  const playSound = useCallback((effect: SoundEffectType) => {
    soundEngine.play(effect);
  }, []);

  const dismissToast = useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      setToasts((prev) => {
        // Prevent duplicate toasts with identical title & message
        const dup = prev.find((t) => t.title === toast.title && t.message === toast.message);
        if (dup) return prev;
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const timer = window.setTimeout(() => {
          dismissToast(id);
        }, toast.type === 'error' ? 6000 : 4200);
        toastTimersRef.current.set(id, timer);
        return [...prev.slice(-3), { ...toast, id }];
      });
    },
    [dismissToast]
  );

  const notifyBrowser = useCallback((title: string, body: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
        });
      } catch {
        // Ignore in headless/restricted environments
      }
    }
  }, []);

  const refreshSnapshot = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await demoBillingService.getSnapshot();
      setSnapshot(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Erro ao carregar os dados locais.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSnapshot();
  }, [refreshSnapshot]);

  // Hash & query routing sync (#/pagar/:publicId, #/painel, #/admin, ?autostart=1)
  useEffect(() => {
    const applyLocation = () => {
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);
      if (hash.startsWith('#/pagar/')) {
        const pubId = hash.replace('#/pagar/', '').split('?')[0];
        if (pubId) {
          setPublicPaymentId(pubId);
          setEnvironmentState('public_payment');
          return;
        }
      }
      if (hash.startsWith('#/admin')) {
        setEnvironmentState('admin');
        return;
      }
      if (hash.startsWith('#/painel') || search.get('autostart') === '1') {
        setEnvironmentState('professional');
        return;
      }
      if (hash.startsWith('#/entrar')) {
        setEnvironmentState('auth');
        return;
      }
      if (hash.startsWith('#/confirmacao')) {
        setEnvironmentState('confirmation');
        return;
      }
      if (hash.startsWith('#/erro')) {
        setEnvironmentState('error');
        return;
      }
      if (
        hash &&
        hash !== '#' &&
        !['#topo', '#funcionalidades', '#demonstracao', '#planos', '#faq', '#contato'].includes(hash)
      ) {
        setEnvironmentState('error');
      }
    };
    applyLocation();
    window.addEventListener('hashchange', applyLocation);
    return () => window.removeEventListener('hashchange', applyLocation);
  }, []);

  const setEnvironment = useCallback(
    (env: AppEnvironment) => {
      setEnvironmentState(env);
      soundEngine.play('navigate');
      if (env === 'site') {
        window.location.hash = '';
      } else if (env === 'professional') {
        window.location.hash = '#/painel';
      } else if (env === 'admin') {
        window.location.hash = '#/admin';
      } else if (env === 'auth') {
        window.location.hash = '#/entrar';
      } else if (env === 'confirmation') {
        window.location.hash = '#/confirmacao';
      } else if (env === 'error') {
        window.location.hash = '#/erro';
      }
      window.scrollTo({ top: 0, behavior: uiPrefs.reduceMotion ? 'auto' : 'smooth' });
    },
    [uiPrefs.reduceMotion]
  );

  const setProfTab = useCallback((tab: ProfessionalTab) => {
    setProfTabState(tab);
    soundEngine.play('navigate');
  }, []);

  const setAdminTab = useCallback((tab: AdminTab) => {
    setAdminTabState(tab);
    soundEngine.play('navigate');
  }, []);

  const openPublicPayment = useCallback((pubId: string) => {
    setPublicPaymentId(pubId);
    setEnvironmentState('public_payment');
    window.location.hash = `#/pagar/${pubId}`;
    soundEngine.play('navigate');
    window.scrollTo({ top: 0 });
  }, []);

  const switchUser = useCallback(
    async (userId: string) => {
      const updated = await demoBillingService.switchDemoUser(userId);
      setSnapshot(updated);
      const user = updated.users.find((u) => u.id === userId);
      if (user?.role === 'admin') {
        setEnvironment('admin');
      } else {
        setEnvironment('professional');
        setProfTabState('inicio');
      }
      pushToast({
        type: 'info',
        title: `Perfil ativo: ${user?.name ?? 'Demonstração'}`,
        message: user?.demoLabel,
      });
    },
    [pushToast, setEnvironment]
  );

  const activeUser = useMemo(() => {
    if (!snapshot) return null;
    return snapshot.users.find((u) => u.id === snapshot.activeUserId) ?? snapshot.users[0] ?? null;
  }, [snapshot]);

  const activeOrg = useMemo(() => {
    if (!snapshot || !activeUser) return null;
    return snapshot.organizations.find((o) => o.id === activeUser.organizationId) ?? null;
  }, [snapshot, activeUser]);

  const activeSubscription = useMemo(() => {
    if (!snapshot || !activeOrg) return null;
    return snapshot.subscriptions.find((s) => s.organizationId === activeOrg.id) ?? null;
  }, [snapshot, activeOrg]);

  const activePlan = useMemo(() => {
    if (!snapshot || !activeSubscription) return null;
    return snapshot.subscriptionPlans.find((p) => p.id === activeSubscription.planId) ?? null;
  }, [snapshot, activeSubscription]);

  const unreadNotificationsCount = useMemo(() => {
    if (!snapshot || !activeOrg) return 0;
    return snapshot.notifications.filter((n) => n.organizationId === activeOrg.id && !n.read).length;
  }, [snapshot, activeOrg]);

  return (
    <AppContext.Provider
      value={{
        snapshot,
        loading,
        loadError,
        refreshSnapshot,
        environment,
        setEnvironment,
        profTab,
        setProfTab,
        adminTab,
        setAdminTab,
        publicPaymentId,
        openPublicPayment,
        authMode,
        setAuthMode,
        activeUser,
        activeOrg,
        activeSubscription,
        activePlan,
        switchUser,
        toasts,
        pushToast,
        dismissToast,
        uiPrefs,
        updateUiPrefs,
        playSound,
        notifyBrowser,
        unreadNotificationsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}

/** Optional context for UI primitives shared by demo and production. */
export function useOptionalApp(): AppContextValue | null {
  return useContext(AppContext);
}
