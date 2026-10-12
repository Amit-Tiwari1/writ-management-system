"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Chip, Button } from "@nextui-org/react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutAction, MenuItem } from "@/store/slices/authSlice";
import toast from "react-hot-toast";

interface WritSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function WritSidebar({ isMobileOpen, setIsMobileOpen }: WritSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleAccordion = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (route: string) => pathname === route;
  const isStartsWith = (route: string) => pathname.startsWith(route);

  const groupedMenus = useMemo(() => {
    const list: MenuItem[] = user?.allowedMenus || [];
    console.log(`[LexWrit Sidebar] Dynamic Menu Engine: Hydrating ${list.length} menus from DB`);

    const map: Record<string, MenuItem[]> = {};
    list.forEach((menu) => {
      const group = menu.groupTitle || "OPERATIONS";
      if (!map[group]) map[group] = [];
      map[group].push(menu);
    });

    return map;
  }, [user?.allowedMenus]);

  useEffect(() => {
    if (!user?.allowedMenus) return;
    const updates: Record<string, boolean> = {};

    user.allowedMenus.forEach((menu) => {
      if (menu.subMenus && menu.subMenus.length > 0) {
        const hasActiveSub = menu.subMenus.some(
          (sub) => pathname === sub.path || pathname.startsWith(sub.path)
        );
        if (hasActiveSub) {
          updates[menu.key] = true;
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      setExpanded((prev) => ({ ...prev, ...updates }));
    }
  }, [pathname, user?.allowedMenus]);

  const handleLogout = () => {
    console.log("[LexWrit Sidebar] Sign-out triggered by:", user?.username);
    dispatch(logoutAction());
    toast.success("Logged out successfully.");
    router.replace("/");
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "A";

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-[#0f2744] text-slate-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white shadow-inner">
              UP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-bold uppercase tracking-wider text-white">UPPRPB</h1>
                <Chip size="sm" className="h-4 bg-blue-500/20 px-1 text-[9px] font-bold text-blue-300 font-mono">
                  WCMS
                </Chip>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Writ Legal Registry</p>
            </div>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="text-white lg:hidden"
            onPress={() => setIsMobileOpen(false)}
          >
            <span className="material-symbols-rounded">close</span>
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 text-xs">
          {Object.keys(groupedMenus).length > 0 ? (
            Object.entries(groupedMenus).map(([groupTitle, menus]) => (
              <div key={groupTitle}>
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80">
                  {groupTitle}
                </p>
                <nav className="space-y-1">
                  {menus.map((menu) => {
                    const hasSubMenus = menu.subMenus && menu.subMenus.length > 0;
                    const isGroupOpen = expanded[menu.key] ?? false;
                    const menuActive =
                      isActive(menu.path) || (menu.path !== "/admin" && isStartsWith(menu.path));

                    if (hasSubMenus) {
                      return (
                        <div key={menu.key}>
                          <button
                            type="button"
                            onClick={() => toggleAccordion(menu.key)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-rounded text-lg text-slate-400">
                                {menu.icon || "folder"}
                              </span>
                              <span>{menu.label}</span>
                            </div>
                            <span className="material-symbols-rounded text-sm text-slate-400">
                              {isGroupOpen ? "expand_more" : "chevron_right"}
                            </span>
                          </button>

                          {isGroupOpen && (
                            <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                              {menu.subMenus!.map((sub) => {
                                const subActive = isActive(sub.path);
                                return (
                                  <Link
                                    key={sub.key}
                                    href={sub.path}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`flex items-center justify-between rounded-md px-2.5 py-1.5 transition-colors ${
                                      subActive
                                        ? "bg-white/15 font-semibold text-white"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="material-symbols-rounded text-sm">
                                        {sub.icon || "description"}
                                      </span>
                                      <span className="truncate">{sub.label}</span>
                                    </div>
                                    {sub.badge && (
                                      <Chip
                                        size="sm"
                                        className={`h-4 px-1 text-[9px] font-bold ${
                                          sub.badgeColor === "danger"
                                            ? "bg-rose-500 text-white"
                                            : sub.badgeColor === "warning"
                                            ? "bg-amber-500/20 text-amber-300"
                                            : "bg-blue-500/20 text-blue-300"
                                        }`}
                                      >
                                        {sub.badge}
                                      </Chip>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={menu.key}
                        href={menu.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors ${
                          menuActive
                            ? "bg-white/15 font-semibold text-white shadow-sm"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-rounded text-lg">
                          {menu.icon || "grid_view"}
                        </span>
                        <span>{menu.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              Loading dynamic permission tree...
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow">
              {userInitial}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">{user?.name || "Officer"}</p>
              <p className="truncate text-[10px] text-slate-400">
                {user?.designation || user?.role || "Board Cadre"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-400 transition-colors"
            >
              <span className="material-symbols-rounded text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}