"use client";

import React, { useState } from "react";
import WritSidebar from "./components/WritSidebar";
import { Input, Button } from "@nextui-org/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function WritAppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const pathname = usePathname();

 const getHeaderMeta = () => {
    if (pathname === "/admin") {
      return { title: "1.0 Dashboard Cockpit", sub: "Lucknow District Registry · Real-time Overview" };
    }
    if (pathname.includes("/cases/register")) {
      return { title: "2.2 Case Intake Wizard", sub: "Judicial Discovery & Ingestion via CNR" };
    }
    if (pathname.includes("/cases/batch")) {
      return { title: "2.3 Co-Petitioners Registry", sub: "Bulk & Multi-Party Litigation" };
    }
    if (pathname.includes("/cases/discovery")) {
      return { title: "2.4 Inward Discovery Desk", sub: "Daily Cause List & Alias Auto-Matcher" };
    }
    if (pathname.includes("/cases")) {
      return { title: "2.1 Case Register (Index)", sub: "Comprehensive Legal Repository & MIS" };
    }
    if (pathname.includes("/documents")) {
      return { title: "3.0 Document DMS", sub: "Structured Case E-Files & Split Annotator" };
    }
    if (pathname.includes("/communications") || pathname.includes("/notings")) {
      return { title: "4.0 Green Sheet Notings", sub: "File Movement & Secretariat Comments" };
    }
    if (pathname.includes("/compliance/stays")) {
      return { title: "5.1 Active Stays Roster", sub: "Interim Stay Vacation Tracking" };
    }
    if (pathname.includes("/compliance/contempt")) {
      return { title: "5.2 Contempt Radar", sub: "Time-Bound Compliance Escalations" };
    }
    if (pathname.includes("/compliance/archive")) {
      return { title: "5.3 Compliance Archival", sub: "Affidavit Verification & File Closeout" };
    }
    if (pathname.includes("/masters")) {
      return { title: "6.0 System Masters", sub: "Institutional Hierarchy & Taxonomy Config" };
    }
    if (pathname.includes("/admin/users")) {
      return { title: "7.1 Officers & Users", sub: "Staff Directory & Profile Assignment" };
    }
    if (pathname.includes("/admin/rbac")) {
      return { title: "7.2 Dynamic RBAC Roles", sub: "Menu & Action Permission Matrix" };
    }
    if (pathname.includes("/admin/audit-logs")) {
      return { title: "7.3 Security Audit Trail", sub: "Immutable Transaction Ledger" };
    }
    if (pathname.includes("/admin/sync-health")) {
      return { title: "7.4 eCourts Sync Health", sub: "NAPIX Token & Polling Diagnostics" };
    }
    return { title: "Writ Management System", sub: "Legal Cell Portal" };
  };

  const meta = getHeaderMeta();

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
            <div className="w-64 md:w-80">
              <Input
                size="sm"
                radius="sm"
                placeholder="Search case no. or party"
                startContent={
                  <span className="material-symbols-rounded text-sm text-slate-400">search</span>
                }
                className="bg-slate-50"
              />
            </div>

            <Button isIconOnly size="sm" variant="light" radius="sm" className="text-slate-600">
              <span className="material-symbols-rounded text-lg">notifications</span>
            </Button>

            <Button
              size="sm"
              variant="bordered"
              radius="sm"
              className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
              startContent={
                <span className="material-symbols-rounded text-sm text-slate-500">bar_chart</span>
              }
            >
              Reports
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
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}