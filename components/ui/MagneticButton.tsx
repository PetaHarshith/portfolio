"use client";

import {
  useRef,
  type ElementType,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import gsap from "gsap";

type MagneticProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  strength?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function MagneticButton<T extends ElementType = "button">({
  as,
  children,
  className,
  strength = 14,
  ...rest
}: MagneticProps<T>) {
  const Component = (as ?? "button") as ElementType;
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <Component
      ref={ref}
      data-magnetic
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
