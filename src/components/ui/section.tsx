import { cn } from "@/lib/utils";

export function Section({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="text-sm text-zinc-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
