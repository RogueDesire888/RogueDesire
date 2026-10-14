import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "text";

const base =
  "inline-flex items-center justify-center text-sm font-medium tracking-[0.08em] transition-[box-shadow,border-color,color] duration-200 motion-reduce:transition-none";

const variants: Record<Variant, string> = {
  primary:
    "min-h-11 border border-accent bg-transparent px-6 py-2.5 text-rd-white hover:shadow-[0_0_18px_color-mix(in_srgb,var(--accent-glow)_45%,transparent)] focus-visible:shadow-[0_0_18px_color-mix(in_srgb,var(--accent-glow)_45%,transparent)]",
  secondary:
    "min-h-11 border border-rd-chrome/40 bg-transparent px-6 py-2.5 text-rd-white hover:border-rd-chrome",
  text: "min-h-11 px-1 text-rd-white underline-offset-[6px] hover:underline focus-visible:underline",
};

type CommonProps = { variant?: Variant; className?: string; children: ReactNode };
type LinkProps = CommonProps & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className">;
type NativeButtonProps = CommonProps & { href?: undefined } & Omit<ComponentProps<"button">, "className">;

export function Button(props: LinkProps | NativeButtonProps) {
  const { variant = "primary", className = "", children, ...rest } = props;
  const classes = `${base} ${variants[variant]} ${className}`;

  if (rest.href !== undefined) {
    return (
      <Link {...(rest as Omit<LinkProps, keyof CommonProps>)} className={classes}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as Omit<NativeButtonProps, keyof CommonProps>;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
