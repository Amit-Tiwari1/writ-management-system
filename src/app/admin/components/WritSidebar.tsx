"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Chip, Button } from "@nextui-org/react";

interface WritSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function WritSidebar({ isMobileOpen, setIsMobileOpen }: WritSidebarProps) {
  const pathname = usePathname();

  // Accordion open/close state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    cases: true,
    compliance: false,
    masters: true,   // मास्टर्स हमेशा आसानी से दिखें
    admin: false,
  });

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (route: string) => pathname === route;
  const isStartsWith = (route: string) => pathname.startsWith(route);

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
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white shadow-inner">
              UP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-bold uppercase tracking-wider text-white">UPPRPB</h1>
                <Chip size="sm" className="h-4 bg-blue-500/20 px-1 text-[9px] font-bold text-blue-300">
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

        {/* Scrollable Navigation */}
        <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 text-xs">
          {/* SECTION 1: OPERATIONS & CASES */}
          <div>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80">
              Operations & Case Hub
            </p>
            <nav className="space-y-1">
              <Link
                href="/admin"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors ${
                  isActive("/admin")
                    ? "bg-white/15 font-semibold text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="material-symbols-rounded text-lg">grid_view</span>
                <span>1.0 Dashboard Cockpit</span>
              </Link>

              {/* 2.0 Writ & Case Hub Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => toggle("cases")}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-rounded text-lg text-slate-400">balance</span>
                    <span>2.0 Writ & Case Hub</span>
                  </div>
                  <span className="material-symbols-rounded text-sm text-slate-400">
                    {expanded.cases ? "expand_more" : "chevron_right"}
                  </span>
                </button>

                {expanded.cases && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                    <Link
                      href="/admin/cases"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/cases")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">description</span>
                      <span>2.1 Case Register (Index)</span>
                    </Link>

                    <Link
                      href="/admin/cases/register"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/cases/register")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">post_add</span>
                      <span>2.2 Intake (CNR Wizard)</span>
                    </Link>

                    <Link
                      href="/admin/cases/batch"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/cases/batch")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">group</span>
                      <span>2.3 Co-Petitioners</span>
                    </Link>

                    <Link
                      href="/admin/cases/discovery"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center justify-between rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/cases/discovery")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-rounded text-sm text-amber-400">radar</span>
                        <span>2.4 Inward Discovery</span>
                      </div>
                      <Chip size="sm" className="h-4 bg-amber-500/20 px-1 text-[9px] font-bold text-amber-300">
                        AUTO
                      </Chip>
                    </Link>
                  </div>
                )}
              </div>

              {/* 3.0 Document DMS */}
              <Link
                href="/admin/documents"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors ${
                  isStartsWith("/admin/documents")
                    ? "bg-white/15 font-semibold text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="material-symbols-rounded text-lg">folder_copy</span>
                <span>3.0 Document DMS & Tree</span>
              </Link>

              {/* 4.0 Green Sheet Notings */}
              <Link
                href="/admin/communications/notings"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors ${
                  isStartsWith("/admin/communications/notings")
                    ? "bg-white/15 font-semibold text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="material-symbols-rounded text-lg">edit_note</span>
                <span>4.0 Green Sheet Notings</span>
              </Link>
            </nav>
          </div>

          {/* SECTION 2: COMPLIANCE */}
          <div>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80">
              Judicial Orders & Risk
            </p>
            <nav className="space-y-1">
              <div>
                <button
                  type="button"
                  onClick={() => toggle("compliance")}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-rounded text-lg text-rose-400">schedule</span>
                    <span>5.0 Directives & Stays</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Chip size="sm" className="h-4 bg-rose-500/20 px-1 text-[9px] font-bold text-rose-300">
                      3 Overdue
                    </Chip>
                    <span className="material-symbols-rounded text-sm text-slate-400">
                      {expanded.compliance ? "expand_more" : "chevron_right"}
                    </span>
                  </div>
                </button>

                {expanded.compliance && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                    <Link
                      href="/admin/compliance/stays"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/compliance/stays")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">pause_circle</span>
                      <span>5.1 Active Stays Roster</span>
                    </Link>

                    <Link
                      href="/admin/compliance/contempt"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center justify-between rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/compliance/contempt")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-rounded text-sm text-rose-400">crisis_alert</span>
                        <span>5.2 Contempt Radar</span>
                      </div>
                      <Chip size="sm" className="h-4 bg-rose-500 px-1 text-[9px] font-bold text-white">
                        CRITICAL
                      </Chip>
                    </Link>

                    <Link
                      href="/admin/compliance/archive"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/compliance/archive")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">task_alt</span>
                      <span>5.3 Compliance Archival</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* SECTION 3: SYSTEM MASTERS (पुराने 15 मास्टर्स का संगठित रूप) */}
          <div>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80">
              Institution Masters
            </p>
            <nav className="space-y-1">
              <div>
                <button
                  type="button"
                  onClick={() => toggle("masters")}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-rounded text-lg text-slate-400">database</span>
                    <span>6.0 System Masters</span>
                  </div>
                  <span className="material-symbols-rounded text-sm text-slate-400">
                    {expanded.masters ? "expand_more" : "chevron_right"}
                  </span>
                </button>

                {expanded.masters && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {/* Old: District */}
                    <Link
                      href="/admin/masters/location"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/masters/location")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">map</span>
                      <span>6.1 District & Zones</span>
                    </Link>

                    {/* Old: Department */}
                    <Link
                      href="/admin/masters/organization"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/masters/organization")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">domain</span>
                      <span>6.2 Department / Units</span>
                    </Link>

                    {/* Old: Rank */}
                    <Link
                      href="/admin/masters/ranks"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/masters/ranks")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">military_tech</span>
                      <span>6.3 Rank Master</span>
                    </Link>

                    {/* Old: Designation */}
                    <Link
                      href="/admin/masters/designations"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/masters/designations")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">badge</span>
                      <span>6.4 Designation Master</span>
                    </Link>

                    {/* Old: Court & Case Type */}
                    <Link
                      href="/admin/masters/judicial"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/masters/judicial")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">account_balance</span>
                      <span>6.5 Court & Case Types</span>
                    </Link>

                    {/* Old: Case Category, Sub Category, Subject */}
                    <Link
                      href="/admin/masters/taxonomy"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/masters/taxonomy")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">category</span>
                      <span>6.6 Category & Subject Tree</span>
                    </Link>

                    {/* Old: Subject Wise Custodian */}
                    <Link
                      href="/admin/masters/custodians"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/masters/custodians")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">assignment_ind</span>
                      <span>6.7 Subject Custodian Map</span>
                    </Link>

                    {/* Old: Respondents */}
                    <Link
                      href="/admin/masters/respondents"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/masters/respondents")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">groups</span>
                      <span>6.8 Respondent Groups</span>
                    </Link>

                    {/* Old: Action Taken */}
                    <Link
                      href="/admin/masters/actions"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/masters/actions")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">rule</span>
                      <span>6.9 Action Taken Mapping</span>
                    </Link>

                    {/* New: Keyword Alias Matrix */}
                    <Link
                      href="/admin/masters/aliases"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/masters/aliases")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">spellcheck</span>
                      <span>6.10 Institution Aliases</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* SECTION 4: ADMINISTRATION & USER MANAGEMENT */}
          <div>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80">
              Users, Security & Audit
            </p>
            <nav className="space-y-1">
              <div>
                <button
                  type="button"
                  onClick={() => toggle("admin")}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-rounded text-lg text-slate-400">admin_panel_settings</span>
                    <span>7.0 Admin & Security</span>
                  </div>
                  <span className="material-symbols-rounded text-sm text-slate-400">
                    {expanded.admin ? "expand_more" : "chevron_right"}
                  </span>
                </button>

                {expanded.admin && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {/* Old: Officer Master & User List */}
                    <Link
                      href="/admin/admin/users"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/admin/users")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">person_outline</span>
                      <span>7.1 Officers & Users</span>
                    </Link>

                    {/* Old: User Role Master */}
                    <Link
                      href="/admin/admin/rbac"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/admin/rbac")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">manage_accounts</span>
                      <span>7.2 Dynamic RBAC Roles</span>
                    </Link>

                    {/* New: Audit Trail */}
                    <Link
                      href="/admin/admin/audit-logs"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/admin/audit-logs")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">history</span>
                      <span>7.3 Action & Audit Logs</span>
                    </Link>

                    {/* New: eCourts Sync Diagnostics */}
                    <Link
                      href="/admin/admin/sync-health"
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                        isActive("/admin/admin/sync-health")
                          ? "bg-white/15 font-semibold text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">sync_saved_locally</span>
                      <span>7.4 eCourts Sync Health</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>

        {/* User Card Pinned to Bottom */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow">
              VS
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">V. Sharma</p>
              <p className="truncate text-[10px] text-slate-400">Registry Officer (OIC)</p>
            </div>
            <span className="material-symbols-rounded cursor-pointer text-slate-400 hover:text-white">
              logout
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}