import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getIsAdmin } from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";

type AdminModeCtx = {
  isAdmin: boolean;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  toggle: () => void;
};

const Ctx = createContext<AdminModeCtx>({
  isAdmin: false,
  editMode: false,
  setEditMode: () => {},
  toggle: () => {},
});

export function useAdminMode() {
  return useContext(Ctx);
}

const LS_KEY = "nvd_edit_mode";

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const checkAdmin = useServerFn(getIsAdmin);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setHasSession(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const q = useQuery({
    queryKey: ["admin-check", hasSession],
    queryFn: () => checkAdmin(),
    enabled: hasSession === true,
    staleTime: 60_000,
  });
  const isAdmin = !!q.data?.isAdmin;

  const [editMode, setEditModeState] = useState(false);

  // Restore edit-mode preference once we know the user is admin.
  useEffect(() => {
    if (!isAdmin) {
      setEditModeState(false);
      return;
    }
    try {
      setEditModeState(localStorage.getItem(LS_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, [isAdmin]);

  const setEditMode = (v: boolean) => {
    setEditModeState(v);
    try {
      localStorage.setItem(LS_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  return (
    <Ctx.Provider
      value={{
        isAdmin,
        editMode: isAdmin && editMode,
        setEditMode,
        toggle: () => setEditMode(!editMode),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
