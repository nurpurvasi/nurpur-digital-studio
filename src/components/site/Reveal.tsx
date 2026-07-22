import { useEffect, useRef, useState, type ReactNode } from "react";

type Variant = "up" | "fade" | "left" | "right" | "scale";

const variants: Record<Variant, { hidden: string; shown: string }> = {
  up: {
    hidden: "opacity-0 translate-y-8",
    shown: "opacity-100 translate-y-0",
  },
  fade: {
    hidden: "opacity-0",
    shown: "opacity-100",
  },
  left: {
    hidden: "opacity-0 -translate-x-8",
    shown: "opacity-100 translate-x-0",
  },
  right: {
    hidden: "opacity-0 translate-x-8",
    shown: "opacity-100 translate-x-0",
  },
  scale: {
    hidden: "opacity-0 scale-[0.96]",
    shown: "opacity-100 scale-100",
  },
};

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
  as: Tag = "div",
  once = true,
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const v = variants[variant];
  const Comp = Tag as any;
  return (
    <Comp
      ref={ref as any}
      style={{ transitionDelay: `${delay}ms` }}
      className={`will-change-transform transition-all duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
        shown ? v.shown : v.hidden
      } ${className}`}
    >
      {children}
    </Comp>
  );
}
