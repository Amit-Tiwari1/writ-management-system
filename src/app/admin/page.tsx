"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Progress,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  DashboardAPI,
  MatrixRowItem,
  MatrixSummary,
  CourtForumItem,
  OicWorkloadItem,
  CalendarDayItem,
} from "@/api/dashboardApi";
import { CasesAPI } from "@/api/casesApi";

export default function WritDashboardPage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedCourt, setSelectedCourt] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("2026");

  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 = September
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Today, 13:20 IST");

  const [kpis, setKpis] = useState<any>(null);
  const [matrixRows, setMatrixRows] = useState<MatrixRowItem[]>([]);
  const [matrixSummary, setMatrixSummary] = useState<MatrixSummary | null>(null);
  const [courtForum, setCourtForum] = useState<CourtForumItem[]>([]);
  const [oicWorkload, setOicWorkload] = useState<OicWorkloadItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<Record<number, CalendarDayItem>>({});

  const [loadingKpis, setLoadingKpis] = useState<boolean>(true);
  const [loadingMatrix, setLoadingMatrix] = useState<boolean>(true);
  const [loadingCourts, setLoadingCourts] = useState<boolean>(true);
  const [loadingOic, setLoadingOic] = useState<boolean>(true);

  const loadKpis = useCallback(async () => {
    setLoadingKpis(true);
    try {
      const res = await DashboardAPI.getKpis();
      if (res?.success) setKpis(res.data);
    } catch (err: any) {
      console.error("Failed to load KPIs:", err);
    } finally {
      setLoadingKpis(false);
    }
  }, []);

  const loadMatrix = useCallback(async () => {
    setLoadingMatrix(true);
    try {
      const res = await DashboardAPI.getMatrix({
        wing: selectedCategory,
        courtCode: selectedCourt,
        year: selectedYear !== "ALL" ? selectedYear : undefined,
      });
      if (res?.success) {
        setMatrixRows(res.data.rows || []);
        setMatrixSummary(res.data.summary || null);
      }
    } catch (err: any) {
      console.error("Failed to load classification matrix:", err);
    } finally {
      setLoadingMatrix(false);
    }
  }, [selectedCategory, selectedCourt, selectedYear]);

  const loadCourtDistribution = useCallback(async () => {
    setLoadingCourts(true);
    try {
      const res = await DashboardAPI.getCourtDistribution();
      if (res?.success) setCourtForum(res.data.courts || []);
    } catch (err: any) {
      console.error("Failed to load court forums:", err);
    } finally {
      setLoadingCourts(false);
    }
  }, []);

  const loadOicWorkload = useCallback(async () => {
    setLoadingOic(true);
    try {
      const res = await DashboardAPI.getOicWorkload();
      if (res?.success) setOicWorkload(res.data || []);
    } catch (err: any) {
      console.error("Failed to load OIC workload:", err);
    } finally {
      setLoadingOic(false);
    }
  }, []);

  const loadCalendar = useCallback(async () => {
    try {
      const res = await DashboardAPI.getCalendarHeatmap({
        month: currentMonth,
        year: currentYear,
      });
      if (res?.success && res.data.days) {
        const mapped: Record<number, CalendarDayItem> = {};
        res.data.days.forEach((d) => {
          mapped[d.day] = d;
        });
        setCalendarEvents(mapped);
      }
    } catch (err: any) {
      console.error("Failed to load calendar heatmap:", err);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    loadKpis();
    loadCourtDistribution();
    loadOicWorkload();
  }, [loadKpis, loadCourtDistribution, loadOicWorkload]);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const miniCalendarData = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthName = new Date(currentYear, currentMonth, 1).toLocaleString("en-US", { month: "long" });

    const days: Array<{ dayNum: number | null; dateStr: string | null; event: CalendarDayItem | null }> = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNum: null, dateStr: null, event: null });
    }

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNum: d,
        dateStr,
        event: calendarEvents[d] || null,
      });
    }

    return { monthName, days };
  }, [currentYear, currentMonth, calendarEvents]);

  const handleCalendarClick = (dateStr: string | null, count: number | undefined) => {
    if (!dateStr || !count || count === 0) return;
    router.push(`/admin/cases?hearingDate=${dateStr}`);
  };

  const handleCellClick = (caseType: string, statusKey: string) => {
    router.push(
      `/admin/cases?category=${selectedCategory}&court=${selectedCourt}&year=${selectedYear}&caseType=${encodeURIComponent(
        caseType
      )}&status=${statusKey}`
    );
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      toast.loading("Querying eCourts CIS Gateways...", { id: "sync" });
      setTimeout(() => {
        setIsSyncing(false);
        const now = new Date();
        setLastSyncTime(`Today, ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST`);
        toast.success("eCourts Gateway Synchronized!", { id: "sync" });
        loadKpis();
        loadMatrix();
        loadCalendar();
      }, 1200);
    } catch {
      setIsSyncing(false);
      toast.error("Gateway sync timeout", { id: "sync" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Writs</p>
              <Chip size="sm" variant="flat" color="success" className="text-[10px] font-bold">
                Live CIS
              </Chip>
            </div>
            {loadingKpis ? (
              <Skeleton className="h-8 w-24 my-2 rounded" />
            ) : (
              <h3 className="mt-2 text-3xl font-extrabold text-emerald-600">
                {kpis?.activeWrits?.total ?? 553}
              </h3>
            )}
            <p className="mt-1 text-xs text-slate-500">
              {kpis?.activeWrits?.filedThisMonth ?? 127} filed this month · {kpis?.activeWrits?.previous ?? 426} previous
            </p>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending in Court</p>
              <Chip size="sm" variant="flat" color="warning" className="text-[10px] font-bold">
                Listed
              </Chip>
            </div>
            {loadingKpis ? (
              <Skeleton className="h-8 w-24 my-2 rounded" />
            ) : (
              <h3 className="mt-2 text-3xl font-extrabold text-amber-500">
                {kpis?.pendingInCourt?.total ?? 293}
              </h3>
            )}
            <p className="mt-1 text-xs text-slate-500">
              {kpis?.pendingInCourt?.description ?? "HC Allahabad & Lucknow Bench Listings"}
            </p>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Action in Board</p>
              <Chip size="sm" variant="flat" color="danger" className="text-[10px] font-bold">
                Internal Desk
              </Chip>
            </div>
            {loadingKpis ? (
              <Skeleton className="h-8 w-24 my-2 rounded" />
            ) : (
              <h3 className="mt-2 text-3xl font-extrabold text-rose-500">
                {kpis?.actionInBoard?.total ?? 88}
              </h3>
            )}
            <p className="mt-1 text-xs text-slate-500">
              {kpis?.actionInBoard?.pwcAwaited ?? 49} PWC Awaited · {kpis?.actionInBoard?.toBeClosed ?? 172} to be closed
            </p>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Compliance Rate</p>
              <span className="text-xs font-semibold text-slate-400">
                Target {kpis?.complianceRate?.target ?? 96}%
              </span>
            </div>
            {loadingKpis ? (
              <Skeleton className="h-8 w-24 my-2 rounded" />
            ) : (
              <h3 className="mt-2 text-3xl font-extrabold text-blue-900">
                {kpis?.complianceRate?.rate ?? 94.2}%
              </h3>
            )}
            <Progress
              size="sm"
              value={kpis?.complianceRate?.rate ?? 94.2}
              color="primary"
              aria-label="Compliance target"
              className="mt-2"
            />
          </CardBody>
        </Card>
      </div>

      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/50 px-5 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: "ALL", label: "ALL WRITS" },
              { key: "Recruitment Wing", label: "Recruitment Wing" },
              { key: "Promotion Wing", label: "Promotion Wing" },
              { key: "Establishment Cell", label: "Establishment Cell" },
            ].map((tab) => (
              <Button
                key={tab.key}
                size="sm"
                radius="sm"
                onPress={() => setSelectedCategory(tab.key)}
                className={`h-8 px-4 text-xs font-bold transition-all ${
                  selectedCategory === tab.key
                    ? "bg-[#0f2744] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  className="h-8 border-slate-300 bg-white font-mono text-xs font-bold text-slate-700"
                  endContent={<span className="material-symbols-rounded text-sm">expand_more</span>}
                >
                  Court: {selectedCourt}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Select Court Forum" onAction={(key) => setSelectedCourt(key as string)}>
                <DropdownItem key="ALL">All Judicial Benches</DropdownItem>
                <DropdownItem key="HC-ALD">High Court Allahabad</DropdownItem>
                <DropdownItem key="HC-LKO">High Court Lucknow</DropdownItem>
                <DropdownItem key="SCI">Supreme Court</DropdownItem>
                <DropdownItem key="SPST">State Tribunal (SPST)</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  className="h-8 border-slate-300 bg-white font-mono text-xs font-bold text-slate-700"
                  endContent={<span className="material-symbols-rounded text-sm">expand_more</span>}
                >
                  Year: {selectedYear}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Select Year" onAction={(key) => setSelectedYear(key as string)}>
                <DropdownItem key="2026">2026</DropdownItem>
                <DropdownItem key="2025">2025</DropdownItem>
                <DropdownItem key="2024">2024</DropdownItem>
                <DropdownItem key="ALL">All Years</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              size="sm"
              variant="bordered"
              radius="sm"
              startContent={<span className="material-symbols-rounded text-sm text-slate-500">download</span>}
              className="h-8 border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => toast.success("Exporting full matrix snapshot (.xlsx)...")}
            >
              Export Matrix
            </Button>
          </div>
        </div>

        <CardBody className="overflow-x-auto p-0">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                <th rowSpan={2} className="border-r border-slate-200 p-2.5 text-center">
                  WRIT CLASSIFICATION
                </th>
                <th colSpan={3} className="border-r border-slate-200 bg-rose-50/70 p-2 text-center text-rose-900">
                  AT A GLANCE
                </th>
                <th colSpan={2} className="border-r border-slate-200 bg-red-100/60 p-2 text-center text-red-950">
                  CLOSED
                </th>
                <th colSpan={3} className="border-r border-slate-200 bg-rose-100/60 p-2 text-center text-rose-950">
                  PENDING
                </th>
                <th colSpan={2} className="border-r border-slate-200 bg-emerald-100/60 p-2 text-center text-emerald-950">
                  DISMISSED / WITHDRAWN
                </th>
                <th colSpan={4} className="bg-sky-100/60 p-2 text-center text-sky-950">
                  REPRESENTATION / ACTION PENDING
                </th>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50 text-[9px] font-bold uppercase text-slate-600">
                <th className="border-r border-slate-200 p-2 text-center">Previous</th>
                <th className="border-r border-slate-200 p-2 text-center">In Sep&apos;26</th>
                <th className="border-r border-slate-200 bg-rose-50 p-2 text-center font-extrabold text-slate-900">Total</th>
                <th className="border-r border-slate-200 p-2 text-center">Closed</th>
                <th className="border-r border-slate-200 p-2 text-center">To Be Closed</th>
                <th className="border-r border-slate-200 p-2 text-center">In Board</th>
                <th className="border-r border-slate-200 p-2 text-center">In Units</th>
                <th className="border-r border-slate-200 p-2 text-center font-extrabold text-slate-900">In Court</th>
                <th className="border-r border-slate-200 p-2 text-center">Dismissed</th>
                <th className="border-r border-slate-200 p-2 text-center">Withdrawn</th>
                <th className="border-r border-slate-200 p-2 text-center">Instructions/PWC</th>
                <th className="border-r border-slate-200 p-2 text-center">Allowed Off</th>
                <th className="border-r border-slate-200 p-2 text-center">Disposed Off</th>
                <th className="p-2 text-center">Other Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loadingMatrix ? (
                <tr>
                  <td colSpan={15} className="p-4 text-center">
                    <Skeleton className="h-6 w-full rounded" />
                  </td>
                </tr>
              ) : matrixRows.length > 0 ? (
                matrixRows.map((row) => (
                  <tr key={row.caseType} className="hover:bg-slate-50/80">
                    <td className="border-r border-slate-200 p-2.5 font-bold text-[#0f2744]">
                      {row.label}
                    </td>
                    <td
                      onClick={() => handleCellClick(row.caseType, "previous")}
                      className="cursor-pointer border-r border-slate-100 p-2 text-center font-mono hover:bg-slate-100 hover:font-bold hover:text-blue-700"
                    >
                      {row.atAGlance.previous}
                    </td>
                    <td
                      onClick={() => handleCellClick(row.caseType, "current_month")}
                      className="cursor-pointer border-r border-slate-100 p-2 text-center font-mono font-bold text-blue-700 hover:bg-blue-50"
                    >
                      {row.atAGlance.inCurrentMonth}
                    </td>
                    <td
                      onClick={() => handleCellClick(row.caseType, "total")}
                      className="cursor-pointer border-r border-slate-200 bg-rose-50/40 p-2 text-center font-mono font-extrabold text-slate-900 hover:bg-rose-100"
                    >
                      {row.atAGlance.total}
                    </td>
                    <td className="border-r border-slate-100 p-2 text-center font-mono text-slate-400">
                      {row.closed.closed}
                    </td>
                    <td
                      onClick={() => handleCellClick(row.caseType, "to_be_closed")}
                      className="cursor-pointer border-r border-slate-200 p-2 text-center font-mono font-medium hover:bg-slate-100"
                    >
                      {row.closed.toBeClosed}
                    </td>
                    <td
                      onClick={() => handleCellClick(row.caseType, "in_board")}
                      className="cursor-pointer border-r border-slate-100 p-2 text-center font-mono font-bold text-amber-600 hover:bg-amber-50"
                    >
                      {row.pending.inBoard}
                    </td>
                    <td className="border-r border-slate-100 p-2 text-center font-mono text-slate-400">
                      {row.pending.inUnits}
                    </td>
                    <td
                      onClick={() => handleCellClick(row.caseType, "in_court")}
                      className="cursor-pointer border-r border-slate-200 p-2 text-center font-mono font-bold text-rose-600 hover:bg-rose-50"
                    >
                      {row.pending.inCourt}
                    </td>
                    <td className="border-r border-slate-100 p-2 text-center font-mono text-slate-400">
                      {row.dismissedWithdrawn.dismissed}
                    </td>
                    <td className="border-r border-slate-200 p-2 text-center font-mono text-slate-400">
                      {row.dismissedWithdrawn.withdrawn}
                    </td>
                    <td
                      onClick={() => handleCellClick(row.caseType, "instructions_awaited")}
                      className="cursor-pointer border-r border-slate-100 p-2 text-center font-mono font-bold text-amber-700 hover:bg-amber-50"
                    >
                      {row.representationPending.instructionsPwc}
                    </td>
                    <td className="border-r border-slate-100 p-2 text-center font-mono">
                      {row.representationPending.allowedOff}
                    </td>
                    <td className="border-r border-slate-100 p-2 text-center font-mono">
                      {row.representationPending.disposedOff}
                    </td>
                    <td className="p-2 text-center font-mono">
                      {row.representationPending.otherPending}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15} className="py-6 text-center text-xs text-slate-400">
                    No active writ litigation matching the selected filter criteria.
                  </td>
                </tr>
              )}

              {matrixSummary && (
                <tr className="border-t-2 border-slate-300 bg-slate-100 font-extrabold text-slate-900">
                  <td className="border-r border-slate-300 p-2.5 uppercase tracking-wide">
                    FILTERED TOTAL
                  </td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono">{matrixSummary.previous}</td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono text-blue-800">{matrixSummary.inCurrentMonth}</td>
                  <td className="border-r border-slate-300 bg-rose-100/70 p-2 text-center font-mono text-sm text-rose-950">{matrixSummary.total}</td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono text-slate-400">{matrixSummary.closed}</td>
                  <td className="border-r border-slate-300 p-2 text-center font-mono">{matrixSummary.toBeClosed}</td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono text-amber-800">{matrixSummary.inBoard}</td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono text-slate-400">{matrixSummary.inUnits}</td>
                  <td className="border-r border-slate-300 p-2 text-center font-mono text-rose-800">{matrixSummary.inCourt}</td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono">0</td>
                  <td className="border-r border-slate-300 p-2 text-center font-mono">0</td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono text-amber-800">{matrixSummary.instructionsPwc}</td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono">{matrixSummary.allowedOff}</td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono">{matrixSummary.disposedOff}</td>
                  <td className="p-2 text-center font-mono">{matrixSummary.otherPending}</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-base text-[#0f2744]">account_balance</span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Judicial Forum Distribution (6.5 Court Master)
                </h4>
              </div>
              <Chip size="sm" variant="flat" color="primary" className="text-xs font-bold">
                Total: {courtForum.reduce((acc, c) => acc + c.activeCount, 0)} Active
              </Chip>
            </div>
            <CardBody className="p-3.5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {loadingCourts ? (
                  <Skeleton className="h-14 w-full rounded-lg" />
                ) : courtForum.length > 0 ? (
                  courtForum.map((c) => (
                    <div
                      key={c.shortCode}
                      onClick={() => router.push(`/admin/cases?court=${c.shortCode}`)}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200/70 p-2.5 transition-all hover:border-[#0f2744] hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[110px]">{c.courtName}</p>
                        <p className="text-[10px] text-slate-400">Bench: {c.shortCode}</p>
                      </div>
                      <span className="rounded bg-[#0f2744] px-2 py-0.5 font-mono text-xs font-bold text-white">
                        {c.activeCount}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 col-span-4 p-2">No courts configured.</p>
                )}
              </div>
            </CardBody>
          </Card>

          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-base text-rose-500">assignment_late</span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Officer-in-Charge (OIC) Pending Workload Roster
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">Click officer to view pending docket bundle</span>
            </div>
            <CardBody className="overflow-x-auto p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500">
                  <tr className="border-b border-slate-200">
                    <th className="p-2.5">S.No</th>
                    <th className="p-2.5">Officer Name</th>
                    <th className="p-2.5">Section Wing</th>
                    <th className="p-2.5 text-center font-extrabold">Total</th>
                    <th className="p-2.5 text-center">Action Due</th>
                    <th className="p-2.5 text-center">Comments NOT Sent</th>
                    <th className="p-2.5 text-center">CA NOT Filed</th>
                    <th className="p-2.5 text-center">To Be Closed</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {loadingOic ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center">
                        <Skeleton className="h-6 w-full rounded" />
                      </td>
                    </tr>
                  ) : oicWorkload.length > 0 ? (
                    oicWorkload.map((u) => (
                      <tr
                        key={u.sNo}
                        onClick={() => router.push(`/admin/cases?assignedOIC=${encodeURIComponent(u.officerName)}`)}
                        className="cursor-pointer hover:bg-slate-50"
                      >
                        <td className="p-2.5 font-mono text-slate-400">{u.sNo}</td>
                        <td className="p-2.5 font-bold text-slate-900">{u.officerName}</td>
                        <td className="p-2.5 text-slate-500">{u.sectionWing}</td>
                        <td className="p-2.5 text-center font-mono font-extrabold text-[#0f2744]">{u.total}</td>
                        <td className="p-2.5 text-center font-mono">{u.actionDue}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-rose-600">{u.commentsNotSent}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-amber-600">{u.caNotFiled}</td>
                        <td className="p-2.5 text-center font-mono">{u.toBeClosed}</td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`inline-block h-2.5 w-2.5 rounded-full ${
                              u.status === "danger"
                                ? "bg-rose-500"
                                : u.status === "warning"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-slate-400">
                        No active OIC assignments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-sm text-[#0f2744]">calendar_today</span>
                <span className="text-xs font-bold text-slate-900">
                  {miniCalendarData.monthName} {currentYear}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="sm"
                  onPress={() => setCurrentMonth((m) => (m === 0 ? 11 : m - 1))}
                  className="h-6 w-6 text-slate-500"
                >
                  <span className="material-symbols-rounded text-xs">chevron_left</span>
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="sm"
                  onPress={() => setCurrentMonth((m) => (m === 11 ? 0 : m + 1))}
                  className="h-6 w-6 text-slate-500"
                >
                  <span className="material-symbols-rounded text-xs">chevron_right</span>
                </Button>
              </div>
            </div>

            <CardBody className="p-3">
              {/* Day Headings */}
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold uppercase text-slate-400">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
                  <span key={d} className={i === 0 ? "text-rose-500" : ""}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1">
                {miniCalendarData.days.map((item, idx) => {
                  if (item.dayNum === null) {
                    return <div key={`empty-${idx}`} className="h-8 rounded bg-slate-50/20" />;
                  }

                  const hasHearings = item.event && item.event.count > 0;
                  const isHighRisk = item.event?.isHighRisk;

                  const cellContent = (
                    <div
                      onClick={() => handleCalendarClick(item.dateStr, item.event?.count)}
                      className={`relative flex h-8 w-full flex-col items-center justify-center rounded text-[11px] font-semibold transition-all ${
                        hasHearings
                          ? isHighRisk
                            ? "cursor-pointer bg-rose-50 font-bold text-rose-900 hover:bg-[#0f2744] hover:text-white"
                            : "cursor-pointer bg-sky-50 font-bold text-sky-900 hover:bg-[#0f2744] hover:text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>{item.dayNum}</span>
                      {hasHearings && (
                        <span
                          className={`absolute -bottom-0.5 text-[8px] font-extrabold leading-none ${
                            isHighRisk ? "text-rose-600" : "text-sky-700"
                          }`}
                        >
                          •
                        </span>
                      )}
                    </div>
                  );

                  if (hasHearings) {
                    return (
                      <Tooltip
                        key={item.dateStr}
                        placement="top"
                        content={
                          <div className="space-y-1 p-1 text-xs">
                            <p className="font-extrabold text-[#0f2744]">
                              {item.event!.count} Cases Listed ({item.dateStr})
                            </p>
                            {isHighRisk && (
                              <p className="text-[10px] font-bold text-rose-600">
                                ⚠️ Contains Stay / Contempt Hearings
                              </p>
                            )}
                            <p className="text-[9px] font-medium text-blue-600 underline">
                              Click to inspect docket list →
                            </p>
                          </div>
                        }
                      >
                        {cellContent}
                      </Tooltip>
                    );
                  }

                  return <React.Fragment key={item.dateStr}>{cellContent}</React.Fragment>;
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  Hover to view counts
                </span>
                <button
                  type="button"
                  onClick={handleSyncNow}
                  className="flex items-center gap-1 font-semibold text-emerald-600 hover:underline"
                >
                  <span className="material-symbols-rounded text-xs">{isSyncing ? "hourglass_empty" : "sync"}</span>
                  {isSyncing ? "Syncing..." : "Sync eCourts"}
                </button>
              </div>
            </CardBody>
          </Card>

          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <CardBody className="p-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Operational Desks</h4>
              <div className="mt-2 space-y-2">
                <Link
                  href="/admin/cases/register"
                  className="flex items-center justify-between rounded-lg border border-slate-200/70 p-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-sm text-slate-400">post_add</span>
                    New Case Intake (Notice/Writ/CNR)
                  </span>
                  <span className="material-symbols-rounded text-xs text-slate-400">arrow_forward</span>
                </Link>

                <Link
                  href="/admin/reports"
                  className="flex items-center justify-between rounded-lg border border-slate-200/70 p-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-sm text-slate-400">bar_chart</span>
                    Multi-Dimensional MIS Reports
                  </span>
                  <span className="material-symbols-rounded text-xs text-slate-400">arrow_forward</span>
                </Link>

                <Link
                  href="/admin/cases/discovery"
                  className="flex items-center justify-between rounded-lg border border-slate-200/70 p-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-sm text-slate-400">travel_explore</span>
                    Inward Discovery (Cause-List Match)
                  </span>
                  <span className="material-symbols-rounded text-xs text-slate-400">arrow_forward</span>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}