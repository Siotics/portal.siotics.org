"use client";

import {
  CaretRightIcon,
  CaretUpDownIcon,
  HouseIcon,
  MoonIcon,
  SidebarSimpleIcon,
  SunIcon,
  UserIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { ComponentType, ReactNode } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { initials, roleLabel, type PortalUser } from "@/lib/portal-user";
import { cn } from "@/lib/utils";
import Image from "next/image";

const SIDEBAR_STORAGE_KEY = "portal-sidebar";
const THEME_STORAGE_KEY = "portal-theme";
const PREFERENCE_CHANGE_EVENT = "portal-preference-change";
const DESKTOP_QUERY = "(min-width: 768px)";
type Theme = "light" | "dark";

function subscribeToPreferenceChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PREFERENCE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PREFERENCE_CHANGE_EVENT, onStoreChange);
  };
}

function getTheme(): Theme {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function getSidebarCollapsed() {
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed";
}

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
}[] = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/account", label: "Account", icon: UserIcon },
];

function UserAvatar({ user, className }: { user: PortalUser; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (user.image && !failed) {
    return (
      <Image
        src={user.image}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={cn("size-8 rounded-lg object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950",
        className
      )}
    >
      {initials(user.name)}
    </span>
  );
}

export function PortalShell({
  user,
  children,
  className,
}: {
  user: PortalUser;
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const sidebarId = useId();
  const menuId = useId();
  const theme = useSyncExternalStore(subscribeToPreferenceChanges, getTheme, () => "light");
  const collapsed = useSyncExternalStore(subscribeToPreferenceChanges, getSidebarCollapsed, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const [desktop, setDesktop] = useState(true);
  const [interactiveTheme, setInteractiveTheme] = useState(false);
  const showLabels = !desktop || !collapsed;
  const sidebarExpanded = desktop ? !collapsed : mobileOpen;
  const pageLabel = NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Portal";

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      document.documentElement.classList.remove("theme-transition");
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  function toggleSidebar() {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "expanded" : "collapsed");
      window.dispatchEvent(new Event(PREFERENCE_CHANGE_EVENT));
      return;
    }

    setMobileOpen((current) => !current);
  }

  function closeNavigationOverlays() {
    setMobileOpen(false);
    setMenuOpen(false);
  }

  function toggleTheme() {
    setInteractiveTheme(true);
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion) {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      document.documentElement.classList.add("theme-transition");
      transitionTimeoutRef.current = window.setTimeout(() => {
        document.documentElement.classList.remove("theme-transition");
        transitionTimeoutRef.current = null;
      }, 300);
    }

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(PREFERENCE_CHANGE_EVENT));
  }

  return (
    <div className={cn("flex min-h-dvh flex-col", className)}>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-expanded={sidebarExpanded}
          aria-controls={sidebarId}
          className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-zinc-100 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50"
        >
          <SidebarSimpleIcon size={18} aria-hidden="true" />
          <span className="sr-only">
            {sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          </span>
        </button>
        <span className="mr-1 h-4 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />
        <nav aria-label="Breadcrumb" className="hidden min-w-0 sm:block">
          <ol className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            {pathname === "/" ? (
              <li className="font-medium text-zinc-950 dark:text-zinc-50" aria-current="page">
                Home
              </li>
            ) : (
              <>
                <li>
                  <Link
                    href="/"
                    onClick={closeNavigationOverlays}
                    className="rounded-sm hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">
                  <CaretRightIcon size={14} />
                </li>
                <li className="font-medium text-zinc-950 dark:text-zinc-50" aria-current="page">
                  {pageLabel}
                </li>
              </>
            )}
          </ol>
        </nav>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          className="relative inline-flex size-8 items-center justify-center rounded-lg hover:bg-zinc-100 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50"
        >
          <SunIcon
            size={18}
            aria-hidden="true"
            className={cn(
              "absolute",
              interactiveTheme && "transition-all duration-300 motion-reduce:transition-none",
              theme === "dark"
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0"
            )}
          />
          <MoonIcon
            size={18}
            aria-hidden="true"
            className={cn(
              "absolute",
              interactiveTheme && "transition-all duration-300 motion-reduce:transition-none",
              theme === "dark"
                ? "rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100"
            )}
          />
        </button>
        <p className="ml-auto text-sm text-zinc-600 dark:text-zinc-400">{roleLabel(user.role)}</p>
      </header>

      <div className="flex flex-1">
        {mobileOpen ? (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-x-0 top-14 bottom-0 z-30 bg-zinc-950/40 md:hidden"
          />
        ) : null}
        <aside
          id={sidebarId}
          className={cn(
            "fixed top-14 bottom-0 left-0 z-30 flex w-64 flex-col border-r border-zinc-200 bg-zinc-50 motion-safe:transition-[transform,width] motion-safe:duration-200 dark:border-zinc-800 dark:bg-zinc-950 md:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            collapsed ? "md:w-14" : "md:w-64"
          )}
        >
          <div className={cn(showLabels ? "p-2 border-zinc-200 border-b dark:border-zinc-800 mb-2" : null)}>
            <Link
              href="/"
              onClick={closeNavigationOverlays}
              title={showLabels ? undefined : "Siotics"}
              className={cn(
                "flex items-center gap-2 rounded-lg p-2 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50",
                !showLabels && "justify-center"
              )}
            >
              <span className={cn(showLabels ? "grid min-w-0 text-left leading-tight" : "sr-only")}>
                <span className="truncate text-sm font-medium">Siotics</span>
                <span className="truncate text-xs text-zinc-600 dark:text-zinc-400">Portal</span>
              </span>
            </Link>
          </div>

          <nav aria-label="Portal" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 pb-2">
        
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeNavigationOverlays}
                      aria-current={active ? "page" : undefined}
                      title={showLabels ? undefined : item.label}
                      className={cn(
                        "flex h-8 items-center gap-2 rounded-lg px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50",
                        !showLabels && "justify-center",
                        active
                          ? "bg-zinc-200 font-medium text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50"
                          : "text-zinc-700 hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      )}
                    >
                      <Icon size={16} aria-hidden />
                      <span className={cn(showLabels ? "truncate" : "sr-only")}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div ref={menuRef} className="relative p-2">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((current) => !current)}
              title={showLabels ? undefined : user.name}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-zinc-200/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50",
                !showLabels && "justify-center"
              )}
            >
              <UserAvatar user={user} />
              <span className={cn(showLabels ? "grid min-w-0 flex-1 text-left leading-tight" : "sr-only")}>
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-zinc-600 dark:text-zinc-400">{user.email}</span>
              </span>
              <CaretUpDownIcon
                size={16}
                aria-hidden="true"
                className={cn(showLabels ? "shrink-0 text-zinc-500" : "sr-only")}
              />
            </button>
            {menuOpen ? (
              <div
                id={menuId}
                aria-label="Account menu"
                className={cn(
                  "absolute z-40 w-56 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950",
                  showLabels ? "bottom-full left-0 mb-1" : "bottom-0 left-full ml-1"
                )}
              >
                <p className="px-2 py-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {roleLabel(user.role)}
                </p>
                <Link
                  href="/account"
                  onClick={closeNavigationOverlays}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50"
                >
                  <UserIcon size={16} aria-hidden="true" />
                  Account
                </Link>
                <SignOutButton />
              </div>
            ) : null}
          </div>
        </aside>
        <main
          className={cn(
            "flex min-w-0 flex-1 flex-col motion-safe:transition-[padding] motion-safe:duration-200",
            collapsed ? "md:pl-14" : "md:pl-64"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
