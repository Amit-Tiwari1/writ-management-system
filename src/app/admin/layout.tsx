"use client";

import React, { useState, useEffect, useMemo } from "react";
import WritSidebar from "./components/WritSidebar";
import { Input, Button, Skeleton } from "@nextui-org/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutAction } from "@/store/slices/authSlice";
import toast from "react-hot-toast";

export default function WritAppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Hook 1: Navigation Guard Effect
  useEffect(() => {
    console.log("[LexWrit Layout] Hydrated Session Check:", {
      isLoading,
      isAuthenticated,
      officer: user?.name || "None",
      role: user?.role || "None",
      menusCount: user?.allowedMenus?.length || 0,
    });

    if (!isLoading && !isAuthenticated) {
      console.warn("[LexWrit Layout] No session active. Returning to portal entry.");
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router, user]);

  // Hook 2: Dynamic Header Title & Subtitle (Hamesha conditional return se pehle!)
  const meta = useMemo(() => {
    if (!user?.allowedMenus) {
      return { title: "UPPRPB Legal Portal", sub: "Writ Case Management System" };
    }

    // Direct path match
    for (const menu of user.allowedMenus) {
      if (menu.path === pathname) {
        return {
          title: menu.label,
          sub: `${menu.groupTitle || "Operations"} · UPPRPB Legal Cell`,
        };
      }
      if (menu.subMenus && menu.subMenus.length > 0) {
        for (const sub of menu.subMenus) {
          if (sub.path === pathname) {
            return {
              title: sub.label,
              sub: `${menu.label} · ${menu.groupTitle || "Registry"}`,
            };
          }
        }
      }
    }

    // Deep match (nested routes)
    for (const menu of user.allowedMenus) {
      if (menu.subMenus) {
        for (const sub of menu.subMenus) {
          if (pathname.startsWith(sub.path)) {
            return {
              title: sub.label,
              sub: `${menu.label} · ${menu.groupTitle || "Registry"}`,
            };
          }
        }
      }
      if (menu.path !== "/admin" && pathname.startsWith(menu.path)) {
        return {
          title: menu.label,
          sub: `${menu.groupTitle || "Operations"} · UPPRPB Legal Cell`,
        };
      }
    }

    return { title: "1.0 Dashboard Cockpit", sub: "Lucknow District Registry · Real-time Overview" };
  }, [user?.allowedMenus, pathname]);

  const handleLogout = () => {
    console.log("[LexWrit Layout] Officer logged out:", user?.username);
    dispatch(logoutAction());
    toast.success("Signed out successfully.");
    router.replace("/");
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "A";

  // CONDITIONAL RETURN 1: FULL SCREEN LOADING SKELETON
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
        {/* Sidebar Skeleton */}
        <div className="hidden w-64 border-r border-slate-200 bg-[#0f2744] p-4 lg:flex lg:flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg bg-white/10" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-3/4 rounded bg-white/10" />
                <Skeleton className="h-2.5 w-1/2 rounded bg-white/10" />
              </div>
            </div>
            <div className="pt-4 space-y-2.5">
              <Skeleton className="h-2.5 w-1/3 rounded bg-white/10" />
              <Skeleton className="h-8 w-full rounded-lg bg-white/10" />
              <Skeleton className="h-8 w-full rounded-lg bg-white/10" />
              <Skeleton className="h-8 w-full rounded-lg bg-white/10" />
            </div>
            <div className="pt-2 space-y-2.5">
              <Skeleton className="h-2.5 w-1/3 rounded bg-white/10" />
              <Skeleton className="h-8 w-full rounded-lg bg-white/10" />
              <Skeleton className="h-8 w-full rounded-lg bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
        </div>

        {/* Content Area Skeleton */}
        <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
          <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-2.5 w-64 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-60 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
          <div className="flex-1 p-6 space-y-5 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // CONDITIONAL RETURN 2: UNHEALTHY AUTH
  if (!isAuthenticated || !user) {
    return null;
  }

  // MAIN AUTHENTICATED LAYOUT
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 font-sans text-slate-800">
      <WritSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-6">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="lg:hidden"
              onPress={() => setIsMobileOpen(true)}
            >
              <span className="material-symbols-rounded text-2xl">menu</span>
            </Button>
            <div>
              <h2 className="text-base font-bold leading-none text-slate-900">{meta.title}</h2>
              <p className="mt-1 text-[11px] leading-none text-slate-500">{meta.sub}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-56 md:w-72">
              <Input
                size="sm"
                radius="sm"
                placeholder="Search case no. or party..."
                startContent={
                  <span className="material-symbols-rounded text-sm text-slate-400">search</span>
                }
                className="bg-slate-50"
              />
            </div>

            <Button isIconOnly size="sm" variant="light" radius="sm" className="text-slate-600">
              <span className="material-symbols-rounded text-lg">notifications</span>
            </Button>

            <Link href="/admin/cases/register">
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white shadow-sm hover:bg-[#163a66]"
                startContent={
                  <span className="material-symbols-rounded text-sm">post_add</span>
                }
              >
                New Writ
              </Button>
            </Link>

            {/* Officer Profile in Header */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f2744] text-xs font-bold text-white shadow-sm">
                {userInitial}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-xs font-bold leading-tight text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.designation || user.role}</p>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                title="Sign Out"
                className="text-slate-400 hover:text-rose-600"
                onPress={handleLogout}
              >
                <span className="material-symbols-rounded text-base">logout</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}