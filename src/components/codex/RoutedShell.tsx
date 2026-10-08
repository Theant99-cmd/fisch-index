import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Shell, type TabKey } from "./Shell";
import { RodLinkCtx, type RodLinkFn } from "./ui";

const rodLink: RodLinkFn = (id, children, className, kind = "rod") =>
  kind === "fish" ? <Link to="/fish/$id" params={{ id }} className={className}>{children}</Link>
  : kind === "hunt" ? <Link to="/hunts/$id" params={{ id }} className={className}>{children}</Link>
  : kind === "item" ? <Link to="/items/$id" params={{ id }} className={className}>{children}</Link>
  : <Link to="/rods/$id" params={{ id }} className={className}>{children}</Link>;

export function RoutedShell({ active, children }: { active: TabKey; children: ReactNode }) {
  return (
    <RodLinkCtx.Provider value={rodLink}>
      <Shell
        active={active}
        renderTab={(t, cls) => (
          <Link key={t.key} to={t.to} className={cls}>
            {t.label}
          </Link>
        )}
      >
        {children}
      </Shell>
    </RodLinkCtx.Provider>
  );
}
