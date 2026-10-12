"use client";

import React, { useState, useEffect, useMemo } from "react";
import WritSidebar from "./components/WritSidebar";
import {
  Input,
  Button,
  Skeleton,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Chip,
} from "@nextui-org/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutAction } from "@/store/slices/authSlice";
import {
  fetchUnreadCount,
  fetchNotificationsList,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/store/slices/notificationSlice";
import { NotificationItem } from "@/api/notificationApi";
import toast from "react-hot-toast";

export default function WritAppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // 🚀 Read directly from Redux Store
  const {
    items: notifications,
    unreadCount,
    isLoading: isNotifLoading,
  } = useAppSelector((state) => state.notifications);

  // Initial load and interval poller via Redux actions
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchUnreadCount());
      dispatch(fetchNotificationsList({ limit: 8 }));

      // 30 seconds interval poller
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, dispatch]);

  // Click on single notification -> Mark read & route
  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.isRead) {
      dispatch(markNotificationAsRead(notif._id));
    }

    switch (notif.type) {
      case "FILE_FORWARDED":
        router.push(`/admin/communications/notings?caseId=${notif.caseId}`);
        break;
      case "CONTEMPT_NOTICE":
        router.push("/admin/compliance/contempt");
        break;
      case "STAY_ALERT":
        router.push("/admin/compliance/stays");
        break;
      default:
        router.push(`/admin/cases/${notif.caseId}`);
        break;
    }
  };

  // Mark all as read via Redux
  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead())
      .unwrap()
      .then(() => toast.success("All alerts marked as read"))
      .catch(() => toast.error("Failed to mark all as read"));
  };

  // Navigation Guard Effect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Dynamic Header Title & Subtitle
  const meta = useMemo(() => {
    if (!user?.allowedMenus) {
      return { title: "UPPRPB Legal Portal", sub: "Writ Case Management System" };
    }

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

    return { title: "1.0 Dashboard Cockpit", sub: "Lucknow District Registry · Real-time Overview" };
  }, [user?.allowedMenus, pathname]);

  const handleLogout = () => {
    dispatch(logoutAction());
    toast.success("Signed out successfully.");
    router.replace("/");
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "A";

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
        <div className="hidden w-64 border-r border-slate-200 bg-[#0f2744] p-4 lg:flex lg:flex-col justify-between">
          <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
          <div className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
            <Skeleton className="h-6 w-48 rounded" />
          </div>
          <div className="p-6">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

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

            {/* NOTIFICATION BELL WITH BADGE & DROPDOWN DRAWER */}
            <Dropdown placement="bottom-end">
              <Badge
                content={unreadCount > 0 ? unreadCount : null}
                color="danger"
                shape="circle"
                size="sm"
                isInvisible={unreadCount === 0}
              >
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light" radius="sm" className="text-slate-600">
                    <span className="material-symbols-rounded text-xl">notifications</span>
                  </Button>
                </DropdownTrigger>
              </Badge>
              <DropdownMenu
                aria-label="Officer Notifications"
                className="w-80 sm:w-96 p-2 max-h-[460px] overflow-y-auto"
              >
                <DropdownSection
                  title="Official Notifications"
                  classNames={{
                    heading: "text-xs font-bold text-slate-900 uppercase tracking-wider flex justify-between items-center",
                  }}
                >
                  <DropdownItem
                    key="header-summary"
                    isReadOnly
                    className="cursor-default bg-slate-50 rounded-lg p-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">
                        {unreadCount > 0 ? `${unreadCount} unread alert(s)` : "All caught up"}
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          disabled={isNotifLoading}
                          className="text-[11px] font-bold text-blue-700 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection classNames={{ base: "divide-y divide-slate-100" }}>
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <DropdownItem
                        key={n._id}
                        onPress={() => handleNotificationClick(n)}
                        className={`p-2.5 rounded-lg my-1 transition-colors ${
                          !n.isRead ? "bg-blue-50/60 font-semibold" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`material-symbols-rounded text-lg mt-0.5 ${
                              n.type === "CONTEMPT_NOTICE"
                                ? "text-rose-600"
                                : n.type === "STAY_ALERT"
                                ? "text-amber-600"
                                : "text-blue-600"
                            }`}
                          >
                            {n.type === "CONTEMPT_NOTICE"
                              ? "notification_important"
                              : n.type === "STAY_ALERT"
                              ? "gavel"
                              : "forward_to_inbox"}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                                {n.title}
                              </p>
                              {n.isUrgent && (
                                <Chip size="sm" color="danger" variant="solid" className="h-3.5 text-[8px] font-bold px-1">
                                  URGENT
                                </Chip>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 font-normal">
                              {n.message}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                              <span>Docket: {n.fileNo}</span>
                              <span>{new Date(n.createdAt).toLocaleDateString("en-GB")}</span>
                            </div>
                          </div>
                        </div>
                      </DropdownItem>
                    ))
                  ) : (
                    <DropdownItem key="empty" isReadOnly className="text-center text-xs text-slate-400 py-6">
                      No notifications on your desk.
                    </DropdownItem>
                  )}
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>

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