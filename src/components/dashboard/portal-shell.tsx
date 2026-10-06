"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import {
  CaretRightIcon,
  CaretUpDownIcon,
  HouseIcon,
  MoonIcon,
  SidebarSimpleIcon,
  SunIcon,
  UserIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { ComponentType, ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SignOutMenuItem } from "@/components/sign-out-button";
import { initials, roleLabel, type PortalUser } from "@/lib/portal-user";
import { THEME_STORAGE_KEY, setThemeCookie, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "portal-sidebar";
const PREFERENCE_CHANGE_EVENT = "portal-preference-change";
const DESKTOP_QUERY = "(min-width: 768px)";
type Preferences = { theme: Theme; collapsed: boolean };
type SidebarMode = "expanded" | "collapsed";

const DEFAULT_PREFERENCES: Preferences = { theme: "light", collapsed: false };
const NO_OP = () => {};
let cachedPreferences = DEFAULT_PREFERENCES;

function subscribeToPreferenceChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PREFERENCE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PREFERENCE_CHANGE_EVENT, onStoreChange);
  };
}

function getPreferences(): Preferences {
  const nextPreferences: Preferences = {
    theme: localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light",
    collapsed: localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed",
  };

  if (
    cachedPreferences.theme !== nextPreferences.theme ||
    cachedPreferences.collapsed !== nextPreferences.collapsed
  ) {
    cachedPreferences = nextPreferences;
  }

  return cachedPreferences;
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
    return <Image src={user.image} alt="" width={32} height={32} referrerPolicy="no-referrer" onError={() => setFailed(true)} className={cn("size-8 rounded-lg object-cover", className)} />;
  }

  return <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950", className)}>{initials(user.name)}</span>;
}

function SidebarNavigation({ user, pathname, mode, onNavigate }: { user: PortalUser; pathname: string; mode: SidebarMode; onNavigate: () => void }) {
  const isExpanded = mode === "expanded";

  return (
    <>
      <div className={cn(isExpanded ? "mb-2 border-b border-zinc-200 p-2 dark:border-zinc-800" : null)}>
        <Link href="/" onClick={onNavigate} title={isExpanded ? undefined : "Siotics"} className={cn("flex items-center gap-2 rounded-lg p-2 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50", !isExpanded && "justify-center")}>
          <span className={cn(isExpanded ? "grid min-w-0 text-left leading-tight" : "sr-only")}><span className="truncate text-sm font-medium">Siotics</span><span className="truncate text-xs text-zinc-600 dark:text-zinc-400">Portal</span></span>
        </Link>
      </div>
      <nav aria-label="Portal" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 pb-2">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return <li key={item.href}><Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} title={isExpanded ? undefined : item.label} className={cn("flex h-8 items-center gap-2 rounded-lg px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50", !isExpanded && "justify-center", active ? "bg-zinc-200 font-medium text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50" : "text-zinc-700 hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800")}><Icon size={16} aria-hidden /><span className={cn(isExpanded ? "truncate" : "sr-only")}>{item.label}</span></Link></li>;
          })}
        </ul>
      </nav>
      <DropdownMenu>
        <div className="p-2">
          <DropdownMenuTrigger title={isExpanded ? undefined : user.name} render={<button type="button" className={cn("flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-zinc-200/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50", !isExpanded && "justify-center")} />}>
            <UserAvatar user={user} />
            <span className={cn(isExpanded ? "grid min-w-0 flex-1 text-left leading-tight" : "sr-only")}><span className="truncate text-sm font-medium">{user.name}</span><span className="truncate text-xs text-zinc-600 dark:text-zinc-400">{user.email}</span></span>
            <CaretUpDownIcon size={16} aria-hidden="true" className={cn(isExpanded ? "shrink-0 text-zinc-500" : "sr-only")} />
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent side={isExpanded ? "top" : "right"} align="end" className="w-56 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1.5 text-xs text-zinc-600 dark:text-zinc-400">{roleLabel(user.role)}</DropdownMenuLabel>
            <DropdownMenuItem render={<Link href="/account" />} onClick={onNavigate} className="gap-2 rounded-md px-2 py-1.5 text-sm font-normal hover:bg-zinc-100 focus:bg-zinc-100 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800"><UserIcon size={16} aria-hidden="true" />Account</DropdownMenuItem>
            <SignOutMenuItem />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function PortalShell({ user, children, className }: { user: PortalUser; children: ReactNode; className?: string }) {
  const pathname = usePathname();
  const { theme, collapsed } = useSyncExternalStore(
    subscribeToPreferenceChanges,
    getPreferences,
    () => DEFAULT_PREFERENCES
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktop, setDesktop] = useState(true);
  const [interactiveTheme, setInteractiveTheme] = useState(false);
  const sidebarMode: SidebarMode = desktop && collapsed ? "collapsed" : "expanded";
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

  function toggleSidebar() {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "expanded" : "collapsed");
      window.dispatchEvent(new Event(PREFERENCE_CHANGE_EVENT));
      return;
    }
    setMobileOpen((current) => !current);
  }
  function toggleTheme() {
    setInteractiveTheme(true);
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("theme-transition");
      window.setTimeout(() => document.documentElement.classList.remove("theme-transition"), 300);
    }
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setThemeCookie(nextTheme);
    window.dispatchEvent(new Event(PREFERENCE_CHANGE_EVENT));
  }

  return <div className={cn("flex min-h-dvh flex-col", className)}>
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <ButtonPrimitive onClick={toggleSidebar} aria-expanded={sidebarExpanded} className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-zinc-100 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50"><SidebarSimpleIcon size={18} aria-hidden="true" /><span className="sr-only">{sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}</span></ButtonPrimitive>
      <span className="mr-1 h-4 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />
      <nav aria-label="Breadcrumb" className="hidden min-w-0 sm:block"><ol className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">{pathname === "/" ? <li className="font-medium text-zinc-950 dark:text-zinc-50" aria-current="page">Home</li> : <><li><Link href="/" className="rounded-sm hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50">Home</Link></li><li aria-hidden="true"><CaretRightIcon size={14} /></li><li className="font-medium text-zinc-950 dark:text-zinc-50" aria-current="page">{pageLabel}</li></>}</ol></nav>
      <ButtonPrimitive onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} className="relative inline-flex size-8 items-center justify-center rounded-lg hover:bg-zinc-100 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50"><SunIcon size={18} aria-hidden="true" className={cn("absolute", interactiveTheme && "transition-all duration-300 motion-reduce:transition-none", theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0")} /><MoonIcon size={18} aria-hidden="true" className={cn("absolute", interactiveTheme && "transition-all duration-300 motion-reduce:transition-none", theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100")} /></ButtonPrimitive>
      <p className="ml-auto text-sm text-zinc-600 dark:text-zinc-400">{roleLabel(user.role)}</p>
    </header>
    <div className="flex flex-1">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetContent side="left" showCloseButton={false} className="top-14 h-[calc(100dvh-3.5rem)] w-64 border-zinc-200 bg-zinc-50 p-0 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 md:hidden"><SheetHeader className="sr-only"><SheetTitle>Portal navigation</SheetTitle><SheetDescription>Navigate the Siotics portal.</SheetDescription></SheetHeader><SidebarNavigation user={user} pathname={pathname} mode="expanded" onNavigate={() => setMobileOpen(false)} /></SheetContent></Sheet>
      <aside className={cn("fixed top-14 bottom-0 left-0 z-30 hidden w-64 flex-col border-r border-zinc-200 bg-zinc-50 motion-safe:transition-[width] motion-safe:duration-200 dark:border-zinc-800 dark:bg-zinc-950 md:flex", collapsed ? "md:w-14" : "md:w-64")}><SidebarNavigation user={user} pathname={pathname} mode={sidebarMode} onNavigate={NO_OP} /></aside>
      <main className={cn("flex min-w-0 flex-1 flex-col motion-safe:transition-[padding] motion-safe:duration-200", collapsed ? "md:pl-14" : "md:pl-64")}>{children}</main>
    </div>
  </div>;
}
