import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [key, setKey] = useState(pathname);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (pathname === key) return;
    setVisible(false);
    const t = setTimeout(() => {
      setKey(pathname);
      setVisible(true);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }, 220);
    return () => clearTimeout(t);
  }, [pathname, key]);

  return (
    <div
      key={key}
      className={`transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {children}
    </div>
  );
}
