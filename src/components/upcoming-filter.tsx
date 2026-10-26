"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { todayIso } from "@/lib/content/utils";

const subscribe = () => () => {};

type UpcomingItem = { key: string; date: string | null; node: ReactNode };

/**
 * The site is static, so "upcoming" is decided at build time. This hides,
 * in the browser, concerts that have already happened since the last build.
 */
export function UpcomingFilter({
  items,
  empty,
}: {
  items: readonly UpcomingItem[];
  empty: ReactNode;
}) {
  const today = useSyncExternalStore(
    subscribe,
    () => todayIso(),
    () => null,
  );

  const visible = today ? items.filter((item) => item.date !== null && item.date >= today) : items;
  if (visible.length === 0) return <>{empty}</>;
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((item) => (
        <li key={item.key} className="flex">
          {item.node}
        </li>
      ))}
    </ul>
  );
}
