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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
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
  HearingDateCaseItem,
} from "@/api/dashboardApi";

export default function WritDashboardPage() {
  const router = useRouter();
  const {
    isOpen: isDayModalOpen,
    onOpen: onDayModalOpen,
    onOpenChange: onDayModalOpenChange,
  } = useDisclosure();

  // Current System Date Context
  const today = new Date();
  const defaultYear = today.getFullYear();
  const defaultMonth = today.getMonth(); // 0-indexed (e.g. 10 for November)

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedCourt, setSelectedCourt] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>(String(defaultYear));

  const [currentYear, setCurrentYear] = useState<number>(defaultYear);
  const [currentMonth, setCurrentMonth] = useState<number>(defaultMonth);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isExportingMatrix, setIsExportingMatrix] = useState<boolean>(false);

  const [kpis, setKpis] = useState<any>(null);
  const [matrixRows, setMatrixRows] = useState<MatrixRowItem[]>([]);
  const [matrixSummary, setMatrixSummary] = useState<MatrixSummary | null>(
    null,
  );
  const [courtForum, setCourtForum] = useState<CourtForumItem[]>([]);
  const [oicWorkload, setOicWorkload] = useState<OicWorkloadItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<
    Record<number, CalendarDayItem>
  >({});

  // Calendar Day Drill-down state
  const [selectedDateDetails, setSelectedDateDetails] = useState<string>("");
  const [selectedDateCases, setSelectedDateCases] = useState<
    HearingDateCaseItem[]
  >([]);
  const [loadingDateCases, setLoadingDateCases] = useState<boolean>(false);

  const [loadingKpis, setLoadingKpis] = useState<boolean>(true);
  const [loadingMatrix, setLoadingMatrix] = useState<boolean>(true);
  const [loadingCourts, setLoadingCourts] = useState<boolean>(true);
  const [loadingOic, setLoadingOic] = useState<boolean>(true);

  // Dynamic Year List: 2010 to next year (2027)
  const availableYears = useMemo(() => {
    const startYear = 2010;
    const endYear = defaultYear + 1;
    const years: string[] = ["ALL"];
    for (let y = endYear; y >= startYear; y--) {
      years.push(String(y));
    }
    return years;
  }, [defaultYear]);

  const currentMonthLabel = useMemo(() => {
    return new Date().toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    });
  }, []);

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

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }
  };
  const miniCalendarData = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
    ).getDate();
    const monthName = new Date(currentYear, currentMonth, 1).toLocaleString(
      "en-US",
      { month: "long" },
    );

    const days: Array<{
      dayNum: number | null;
      dateStr: string | null;
      event: CalendarDayItem | null;
    }> = [];

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

  // Calendar Click Handler: Opens in-app inspection modal
  const handleCalendarClick = async (
    dateStr: string | null,
    count: number | undefined,
  ) => {
    if (!dateStr || !count || count === 0) return;
    setSelectedDateDetails(dateStr);
    onDayModalOpen();
    setLoadingDateCases(true);
    try {
      const res = await DashboardAPI.getCasesForHearingDate(dateStr);
      if (res?.success) {
        setSelectedDateCases(res.data || []);
      }
    } catch {
      toast.error("Failed to load hearing dockets for selected date");
    } finally {
      setLoadingDateCases(false);
    }
  };

  const handleCellClick = (caseType: string, statusKey: string) => {
    router.push(
      `/admin/cases?category=${selectedCategory}&court=${selectedCourt}&year=${selectedYear}&caseType=${encodeURIComponent(
        caseType,
      )}&status=${statusKey}`,
    );
  };

  const handleExportMatrix = async () => {
    setIsExportingMatrix(true);
    const toastId = toast.loading(
      "Generating Institutional Writ Matrix PDF...",
    );
    try {
      const htmlContent = await DashboardAPI.downloadMatrixPdf({
        wing: selectedCategory,
        courtCode: selectedCourt,
        year: selectedYear !== "ALL" ? selectedYear : undefined,
      });
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.dismiss(toastId);
        toast.error("Please allow popups to download Matrix PDF.");
        return;
      }
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success("Classification Matrix PDF exported successfully!", {
        id: toastId,
      });
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(
        err.response?.data?.message || "Failed to export Matrix PDF.",
      );
    } finally {
      setIsExportingMatrix(false);
    }
  };

  const handleSyncNow = async () => {
    if (isSyncing) return;

    setIsSyncing(true);

    const toastId = toast.loading("Refreshing dashboard data...");

    try {
      await Promise.all([
        loadKpis(),
        loadMatrix(),
        loadCourtDistribution(),
        loadOicWorkload(),
        loadCalendar(),
      ]);

      toast.success("Dashboard refresh completed.", {
        id: toastId,
      });
    } catch (error) {
      console.error("Dashboard refresh failed:", error);

      toast.error("Failed to refresh dashboard data.", {
        id: toastId,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Top 4 High-Level KPI Cards (Pure Real Database Values - Zero Dummy Data) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Writs
              </p>
              <Chip
                size="sm"
                variant="flat"
                color="success"
                className="text-[10px] font-bold"
              >
                Live CIS
              </Chip>
            </div>
            {loadingKpis ? (
              <Skeleton className="h-8 w-24 my-2 rounded" />
            ) : (
              <h3 className="mt-2 text-3xl font-extrabold text-emerald-600">
                {kpis?.activeWrits?.total ?? 0}
              </h3>
            )}
            <p className="mt-1 text-xs text-slate-500">
              {kpis?.activeWrits?.filedThisMonth ?? 0} filed this month ·{" "}
              {kpis?.activeWrits?.previous ?? 0} previous
            </p>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pending in Court
              </p>
              <Chip
                size="sm"
                variant="flat"
                color="warning"
                className="text-[10px] font-bold"
              >
                Listed
              </Chip>
            </div>
            {loadingKpis ? (
              <Skeleton className="h-8 w-24 my-2 rounded" />
            ) : (
              <h3 className="mt-2 text-3xl font-extrabold text-amber-500">
                {kpis?.pendingInCourt?.total ?? 0}
              </h3>
            )}
            <p className="mt-1 text-xs text-slate-500">
              {kpis?.pendingInCourt?.description ??
                "HC Allahabad & Lucknow Bench Listings"}
            </p>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Action in Board
              </p>
              <Chip
                size="sm"
                variant="flat"
                color="danger"
                className="text-[10px] font-bold"
              >
                Internal Desk
              </Chip>
            </div>
            {loadingKpis ? (
              <Skeleton className="h-8 w-24 my-2 rounded" />
            ) : (
              <h3 className="mt-2 text-3xl font-extrabold text-rose-500">
                {kpis?.actionInBoard?.total ?? 0}
              </h3>
            )}
            <p className="mt-1 text-xs text-slate-500">
              {kpis?.actionInBoard?.pwcAwaited ?? 0} PWC Awaited ·{" "}
              {kpis?.actionInBoard?.toBeClosed ?? 0} to be closed
            </p>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Compliance Rate
              </p>
              <span className="text-xs font-semibold text-slate-400">
                Target {kpis?.complianceRate?.target ?? 96}%
              </span>
            </div>
            {loadingKpis ? (
              <Skeleton className="h-8 w-24 my-2 rounded" />
            ) : (
              <h3 className="mt-2 text-3xl font-extrabold text-blue-900">
                {kpis?.complianceRate?.rate ?? 0}%
              </h3>
            )}
            <Progress
              size="sm"
              value={kpis?.complianceRate?.rate ?? 0}
              color="primary"
              aria-label="Compliance target"
              className="mt-2"
            />
          </CardBody>
        </Card>
      </div>

      {/* 2. Multi-Dimensional Writ Classification Matrix */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/50 px-5 py-3">
          {/* Section Wing Tabs */}
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

          {/* Master Filters (Court, 2010+ Year Dropdown, B&W Export) */}
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  className="h-8 border-slate-300 bg-white font-mono text-xs font-bold text-slate-700"
                  endContent={
                    <span className="material-symbols-rounded text-sm">
                      expand_more
                    </span>
                  }
                >
                  Court: {selectedCourt}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Select Court Forum"
                onAction={(key) => setSelectedCourt(key as string)}
              >
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
                  endContent={
                    <span className="material-symbols-rounded text-sm">
                      expand_more
                    </span>
                  }
                >
                  Year: {selectedYear}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Select Year"
                className="max-h-64 overflow-y-auto"
                onAction={(key) => setSelectedYear(key as string)}
              >
                {availableYears.map((yr) => (
                  <DropdownItem key={yr}>
                    {yr === "ALL" ? "All Years" : yr}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Button
              size="sm"
              variant="bordered"
              radius="sm"
              startContent={
                <span className="material-symbols-rounded text-sm text-blue-700">
                  picture_as_pdf
                </span>
              }
              className="h-8 border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
              isLoading={isExportingMatrix}
              onClick={handleExportMatrix}
            >
              Export Matrix
            </Button>
          </div>
        </div>

        <CardBody className="overflow-x-auto p-0">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                <th
                  rowSpan={2}
                  className="border-r border-slate-200 p-2.5 text-center"
                >
                  WRIT CLASSIFICATION
                </th>
                <th
                  colSpan={3}
                  className="border-r border-slate-200 bg-rose-50/70 p-2 text-center text-rose-900"
                >
                  AT A GLANCE
                </th>
                <th
                  colSpan={2}
                  className="border-r border-slate-200 bg-red-100/60 p-2 text-center text-red-950"
                >
                  CLOSED
                </th>
                <th
                  colSpan={3}
                  className="border-r border-slate-200 bg-rose-100/60 p-2 text-center text-rose-950"
                >
                  PENDING
                </th>
                <th
                  colSpan={2}
                  className="border-r border-slate-200 bg-emerald-100/60 p-2 text-center text-emerald-950"
                >
                  DISMISSED / WITHDRAWN
                </th>
                <th
                  colSpan={4}
                  className="bg-sky-100/60 p-2 text-center text-sky-950"
                >
                  REPRESENTATION / ACTION PENDING
                </th>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50 text-[9px] font-bold uppercase text-slate-600">
                <th className="border-r border-slate-200 p-2 text-center">
                  Previous
                </th>
                <th className="border-r border-slate-200 p-2 text-center text-blue-900">
                  IN {currentMonthLabel.toUpperCase()}
                </th>
                <th className="border-r border-slate-200 bg-rose-50 p-2 text-center font-extrabold text-slate-900">
                  Total
                </th>
                <th className="border-r border-slate-200 p-2 text-center">
                  Closed
                </th>
                <th className="border-r border-slate-200 p-2 text-center">
                  To Be Closed
                </th>
                <th className="border-r border-slate-200 p-2 text-center">
                  In Board
                </th>
                <th className="border-r border-slate-200 p-2 text-center">
                  In Units
                </th>
                <th className="border-r border-slate-200 p-2 text-center font-extrabold text-slate-900">
                  In Court
                </th>
                <th className="border-r border-slate-200 p-2 text-center">
                  Dismissed
                </th>
                <th className="border-r border-slate-200 p-2 text-center">
                  Withdrawn
                </th>
                <th className="border-r border-slate-200 p-2 text-center">
                  Instructions/PWC
                </th>
                <th className="border-r border-slate-200 p-2 text-center">
                  Allowed Off
                </th>
                <th className="border-r border-slate-200 p-2 text-center">
                  Disposed Off
                </th>
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
                      onClick={() =>
                        handleCellClick(row.caseType, "current_month")
                      }
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
                      onClick={() =>
                        handleCellClick(row.caseType, "to_be_closed")
                      }
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
                      onClick={() =>
                        handleCellClick(row.caseType, "instructions_awaited")
                      }
                      className="cursor-pointer border-r border-slate-100 p-2 text-center font-mono font-bold text-amber-700 hover:bg-amber-50"
                    >
                      {row.representationPending.pwcInstructions}
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
                  <td
                    colSpan={15}
                    className="py-6 text-center text-xs text-slate-400"
                  >
                    No active writ litigation matching the selected filter
                    criteria.
                  </td>
                </tr>
              )}

              {matrixSummary && (
                <tr className="border-t-2 border-slate-300 bg-slate-100 font-extrabold text-slate-900">
                  <td className="border-r border-slate-300 p-2.5 uppercase tracking-wide">
                    FILTERED TOTAL
                  </td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono">
                    {matrixSummary.previous}
                  </td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono text-blue-800">
                    {matrixSummary.inCurrentMonth}
                  </td>
                  <td className="border-r border-slate-300 bg-rose-100/70 p-2 text-center font-mono text-sm text-rose-950">
                    {matrixSummary.total}
                  </td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono text-slate-400">
                    {matrixSummary.closed}
                  </td>
                  <td className="border-r border-slate-300 p-2 text-center font-mono">
                    {matrixSummary.toBeClosed}
                  </td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono text-amber-800">
                    {matrixSummary.inBoard}
                  </td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono text-slate-400">
                    {matrixSummary.inUnits}
                  </td>
                  <td className="border-r border-slate-300 p-2 text-center font-mono text-rose-800">
                    {matrixSummary.inCourt}
                  </td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono">
                    0
                  </td>
                  <td className="border-r border-slate-300 p-2 text-center font-mono">
                    0
                  </td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono text-amber-800">
                    {matrixSummary.instructionsPwc}
                  </td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono">
                    {matrixSummary.allowedOff}
                  </td>
                  <td className="border-r border-slate-200 p-2 text-center font-mono">
                    {matrixSummary.disposedOff}
                  </td>
                  <td className="p-2 text-center font-mono">
                    {matrixSummary.otherPending}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* 3. Bottom Row: Left (Courts + OIC Workload) & Right (Interactive Heatmap Calendar) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Judicial Forum Master Distribution */}
          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-base text-[#0f2744]">
                  account_balance
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Judicial Forum Distribution (6.5 Court Master)
                </h4>
              </div>
              <Chip
                size="sm"
                variant="flat"
                color="primary"
                className="text-xs font-bold"
              >
                Total: {courtForum.reduce((acc, c) => acc + c.activeCount, 0)}{" "}
                Active
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
                      onClick={() =>
                        router.push(`/admin/cases?court=${c.shortCode}`)
                      }
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200/70 p-2.5 transition-all hover:border-[#0f2744] hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
                          {c.courtName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Bench: {c.shortCode}
                        </p>
                      </div>
                      <span className="rounded bg-[#0f2744] px-2 py-0.5 font-mono text-xs font-bold text-white">
                        {c.activeCount}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 col-span-4 p-2">
                    No courts configured.
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* OIC Workload Table */}
          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-base text-rose-500">
                  assignment_late
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Officer-in-Charge (OIC) Pending Workload Roster
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Click officer to view pending docket bundle
              </span>
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
                        onClick={() =>
                          router.push(
                            `/admin/cases?assignedOIC=${encodeURIComponent(u.officerName)}`,
                          )
                        }
                        className="cursor-pointer hover:bg-slate-50"
                      >
                        <td className="p-2.5 font-mono text-slate-400">
                          {u.sNo}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {u.officerName}
                        </td>
                        <td className="p-2.5 text-slate-500">
                          {u.sectionWing}
                        </td>
                        <td className="p-2.5 text-center font-mono font-extrabold text-[#0f2744]">
                          {u.total}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {u.actionDue}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-rose-600">
                          {u.commentsNotSent}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-amber-600">
                          {u.caNotFiled}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {u.toBeClosed}
                        </td>
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
                      <td
                        colSpan={9}
                        className="p-4 text-center text-slate-400"
                      >
                        No active OIC assignments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Hearing Heatmap Calendar */}
        <div className="space-y-4">
          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-sm text-[#0f2744]">
                  calendar_today
                </span>
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
                  onPress={handlePreviousMonth}
                  className="h-6 w-6 text-slate-500"
                >
                  <span className="material-symbols-rounded text-xs">
                    chevron_left
                  </span>
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="sm"
                  onPress={handleNextMonth}
                  className="h-6 w-6 text-slate-500"
                >
                  <span className="material-symbols-rounded text-xs">
                    chevron_right
                  </span>
                </Button>
              </div>
            </div>

            <CardBody className="p-3">
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold uppercase text-slate-400">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
                  <span key={d} className={i === 0 ? "text-rose-500" : ""}>
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {miniCalendarData.days.map((item, idx) => {
                  if (item.dayNum === null) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="h-8 rounded bg-slate-50/20"
                      />
                    );
                  }

                  const hasHearings = item.event && item.event.count > 0;
                  const isHighRisk = item.event?.isHighRisk;

                  const cellContent = (
                    <div
                      onClick={() =>
                        handleCalendarClick(item.dateStr, item.event?.count)
                      }
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
                              Click to view all cases →
                            </p>
                          </div>
                        }
                      >
                        {cellContent}
                      </Tooltip>
                    );
                  }

                  return (
                    <React.Fragment key={item.dateStr}>
                      {cellContent}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  Click date to inspect cause list
                </span>
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="flex items-center gap-1 font-semibold text-emerald-600 hover:underline disabled:opacity-50"
                >
                  <span className="material-symbols-rounded text-xs">
                    {isSyncing ? "hourglass_empty" : "refresh"}
                  </span>

                  {isSyncing ? "Refreshing..." : "Refresh Dashboard"}
                </button>
              </div>
            </CardBody>
          </Card>

          {/* Operational Quick Links */}
          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <CardBody className="p-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Operational Desks
              </h4>
              <div className="mt-2 space-y-2">
                <Link
                  href="/admin/cases/register"
                  className="flex items-center justify-between rounded-lg border border-slate-200/70 p-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-sm text-slate-400">
                      post_add
                    </span>
                    New Case Intake (Notice/Writ/CNR)
                  </span>
                  <span className="material-symbols-rounded text-xs text-slate-400">
                    arrow_forward
                  </span>
                </Link>

                <Link
                  href="/admin/reports"
                  className="flex items-center justify-between rounded-lg border border-slate-200/70 p-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-sm text-slate-400">
                      bar_chart
                    </span>
                    Multi-Dimensional MIS Reports
                  </span>
                  <span className="material-symbols-rounded text-xs text-slate-400">
                    arrow_forward
                  </span>
                </Link>

                <Link
                  href="/admin/cases/discovery"
                  className="flex items-center justify-between rounded-lg border border-slate-200/70 p-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-sm text-slate-400">
                      travel_explore
                    </span>
                    Inward Discovery (Cause-List Match)
                  </span>
                  <span className="material-symbols-rounded text-xs text-slate-400">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 4. Calendar Hearing Date Click Drill-down Modal */}
      <Modal
        isOpen={isDayModalOpen}
        onOpenChange={onDayModalOpenChange}
        size="4xl"
        placement="top"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-slate-100 flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-blue-700">
                    event_available
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Scheduled Court Hearings for {selectedDateDetails}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Total: {selectedDateCases.length} Matters Listed in
                      Cause-List
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mr-6">
                  <Button
                    size="sm"
                    variant="bordered"
                    radius="sm"
                    className="text-xs h-7 border-slate-300"
                    startContent={
                      <span className="material-symbols-rounded text-sm">
                        print
                      </span>
                    }
                    onClick={() => window.print()}
                  >
                    Print Cause List
                  </Button>
                </div>
              </ModalHeader>
              <ModalBody className="p-0">
                <Table
                  removeWrapper
                  aria-label="Day hearings table"
                  className="min-w-full"
                >
                  <TableHeader>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">
                      DOCKET / WRIT NO.
                    </TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">
                      LEAD PETITIONER
                    </TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">
                      COURT &amp; ROOM
                    </TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">
                      STAGE / ADVOCATE
                    </TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">
                      ASSIGNED OIC
                    </TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400 text-center">
                      ACTION
                    </TableColumn>
                  </TableHeader>
                  <TableBody
                    items={selectedDateCases}
                    isLoading={loadingDateCases}
                    loadingContent={
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-6 w-full rounded" />
                        <Skeleton className="h-6 w-full rounded" />
                      </div>
                    }
                    emptyContent={
                      !loadingDateCases
                        ? "No matters scheduled on this date."
                        : " "
                    }
                  >
                    {(item: HearingDateCaseItem) => (
                      <TableRow
                        key={item._id}
                        className="border-b border-slate-100 hover:bg-slate-50/70"
                      >
                        <TableCell>
                          <p className="font-mono text-xs font-bold text-slate-900">
                            {item.fileNo}
                          </p>
                          <p className="text-[10px] text-blue-700 font-semibold">
                            {item.writNumber || "Awaiting Allotment"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-semibold text-slate-900">
                            {item.leadPetitioner}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {item.hasActiveStay && (
                              <Chip
                                size="sm"
                                color="danger"
                                variant="solid"
                                className="text-[8px] h-3.5 px-1 font-bold"
                              >
                                STAY
                              </Chip>
                            )}
                            {item.isContemptNotice && (
                              <Chip
                                size="sm"
                                color="danger"
                                variant="solid"
                                className="text-[8px] h-3.5 px-1 font-bold"
                              >
                                CONTEMPT
                              </Chip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-semibold text-slate-800">
                            {item.courtCode || item.benchLocation || "--"}
                          </p>

                          <p className="text-[10px] text-slate-400">
                            Room: {item.courtRoomNo || "Main Hall"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-medium text-slate-700">
                            {item.stage || "Active Stage"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Adv: {item.petitionerAdvocate || "--"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-[10px] text-slate-400">
                            OIC Reference
                          </p>
                          <p className="text-xs font-semibold text-slate-800">
                            {item.assignedOIC || "--"}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          <Link href={`/admin/cases/${item._id}`}>
                            <Button
                              size="sm"
                              radius="sm"
                              variant="bordered"
                              className="text-[11px] h-7 border-slate-300"
                            >
                              360° Dossier
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter className="border-t border-slate-100 py-2.5">
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={onClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
