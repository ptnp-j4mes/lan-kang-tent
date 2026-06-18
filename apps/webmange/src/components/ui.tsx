// ponytail: minimal shadcn-style primitives in one file — no CLI, no per-component files.
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
  {
    variants: {
      variant: {
        default: "bg-brand text-white hover:bg-brand/90",
        outline: "border border-slate-300 bg-white hover:bg-slate-50",
        ghost: "hover:bg-slate-100",
        danger: "bg-red-600 text-white hover:bg-red-700",
        subtle: "bg-slate-200 text-slate-700 hover:bg-slate-300",
      },
      size: { default: "h-9 px-4", sm: "h-8 px-3 text-xs", icon: "h-9 w-9" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>
>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1 block text-xs font-medium text-slate-600", className)} {...props} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)} {...props} />;
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-slate-100 px-5 py-3", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-slate-800", className)} {...props} />;
}
export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

const badgeColors: Record<string, string> = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-200 text-slate-600",
  blue: "bg-blue-100 text-blue-700",
};
export function Badge({ color = "slate", children }: { color?: keyof typeof badgeColors; children: React.ReactNode }) {
  return <span className={cn("inline-block rounded px-2 py-0.5 text-xs font-medium", badgeColors[color])}>{children}</span>;
}

export function Spinner() {
  return <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />;
}

// minimal table helpers
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("border-b border-slate-200 px-3 py-2 text-left font-medium text-slate-500", className)}>{children}</th>;
}
export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-slate-100 px-3 py-2 align-middle", className)}>{children}</td>;
}
