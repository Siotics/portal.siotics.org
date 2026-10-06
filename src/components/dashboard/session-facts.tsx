import { roleLabel, type PortalUser } from "@/lib/portal-user";
import { cn } from "@/lib/utils";

export function SessionFacts({
  user,
  className,
}: {
  user: PortalUser;
  className?: string;
}) {
  const rows = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Role", value: roleLabel(user.role) },
  ];

  return (
    <dl
      className={cn(
        "max-w-xl divide-y divide-zinc-200 border-y border-zinc-200 text-sm dark:divide-zinc-800 dark:border-zinc-800",
        className
      )}
    >
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[7.5rem_1fr] gap-3 py-3">
          <dt className="text-zinc-600 dark:text-zinc-400">{row.label}</dt>
          <dd className="min-w-0 break-words">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
