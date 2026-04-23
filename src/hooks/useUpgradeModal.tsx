import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { UpgradeModal, type UpgradeReason } from "@/components/UpgradeModal";

interface OpenOptions {
  reason?: UpgradeReason;
  featureName?: string;
}

interface ContextValue {
  open: (options?: OpenOptions) => void;
  close: () => void;
}

const Ctx = createContext<ContextValue>({ open: () => {}, close: () => {} });

export function UpgradeModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; reason?: UpgradeReason; featureName?: string }>({
    open: false,
  });

  const open = useCallback((options: OpenOptions = {}) => {
    setState({ open: true, reason: options.reason, featureName: options.featureName });
  }, []);

  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      <UpgradeModal
        open={state.open}
        onClose={close}
        reason={state.reason}
        featureName={state.featureName}
      />
    </Ctx.Provider>
  );
}

export function useUpgradeModal() {
  return useContext(Ctx);
}
