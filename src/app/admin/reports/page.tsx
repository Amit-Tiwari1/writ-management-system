"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Pagination,
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import toast from "react-hot-toast";

import { ReportsAPI, ReportItem } from "@/api/reportsApi";
import { MastersAPI } from "@/api/mastersApi";

// Pre-defined Institutional MIS Report Cards
const REPORT_CARDS = [
  {
    key: "HEARING_DATE_RANGE",
    title: "Upcoming Hearings (NDOH)",
    description: "Date-range listing of matters listed before High Court Benches",
    icon: "calendar_month",
    badge: "Most Used",
    color: "primary",
  },
  {
    key: "STAY_ORDERS",
    title: "Active Stays & Injunctions",
    description: "Stay orders in effect with Article 226(3) vacation deadlines",
    icon: "gavel",
    badge: "High Risk",
    color: "danger",
  },
  {
    key: "CONTEMPT_MATTERS",
    title: "Contempt Risk Tracker",
    description: "Show-cause notices with 42-day personal appearance countdown",
    icon: "notification_important",
    badge: "Critical",
    color: "danger",
  },
  {
    key: "CATEGORY_WISE",
    title: "Category & Wing Distribution",
    description: "Classification across Recruitment, Promotion and Establishment",
    icon: "category",
    badge: "Administrative",
    color: "default",
  },
  {
    key: "COURT_WISE",
    title: "Judicial Forum Wise",
    description: "Allahabad HC, Lucknow Bench, Supreme Court and SPST tribunals",
    icon: "account_balance",
    badge: "Judicial",
    color: "default",
  },
  {
    key: "EXAM_CYCLE",
    title: "Recruitment / Bharti Cycle",
    description: "Constable 2023-24, SI Direct, PAC and Ministerial cadres",
    icon: "badge",
    badge: "Exam Cell",
    color: "default",
  },
  {
    key: "OIC_PERFORMANCE",
    title: "Officer-in-Charge (OIC) Workload",
    description: "Pending notings, unfiled counter-affidavits and bottleneck ageing",
    icon: "person_alert",
    badge: "Bottleneck",
    color: "warning",
  },
  {
    key: "STATUS_PENDING_PWC",
    title: "Pending PWC Instructions",
    description: "Matters awaiting Para-Wise Comments approval from sections",
    icon: "hourglass_top",
    badge: "Action Due",
    color: "warning",
  },
];

export default function MisReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>("HEARING_DATE_RANGE");

  // Filters State
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCourt, setSelectedCourt] = useState<string>("ALL");
  const [selectedWing, setSelectedWing] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Masters Dropdowns
  const [dropdowns, setDropdowns] = useState<any>(null);

  // Table & Pagination State
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const [downloadingExcel, setDownloadingExcel] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  // 1. Load Dropdowns
  useEffect(() => {
    async function loadMasters() {
      try {
        const res = await MastersAPI.getIntakeDropdowns();
        if (res?.success) setDropdowns(res.data);
      } catch (err) {
        console.error("Failed to load report dropdowns", err);
      }
    }
    loadMasters();
  }, []);

  // 2. Fetch Report Data
  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        reportType: selectedReport,
        page,
        limit: 15,
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedCourt !== "ALL") params.court = selectedCourt;
      if (selectedWing !== "ALL") params.wing = selectedWing;
      if (selectedStatus !== "ALL") params.status = selectedStatus;

      const res = await ReportsAPI.getReportData(params);
      if (res?.success) {
        setReportData(res.data || []);
        setTotalCount(res.totalCount || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Failed to load report:", err);
      toast.error(err.response?.data?.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, [selectedReport, page, startDate, endDate, selectedCourt, selectedWing, selectedStatus]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Download Excel
  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      toast.loading("Compiling Excel workbook...", { id: "excel" });
      const params: Record<string, any> = {
        reportType: selectedReport,
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedCourt !== "ALL") params.court = selectedCourt;
      if (selectedWing !== "ALL") params.wing = selectedWing;

      await ReportsAPI.downloadExcel(params);
      toast.success("Excel report downloaded successfully!", { id: "excel" });
    } catch (err: any) {
      toast.error("Failed to download Excel report", { id: "excel" });
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Download Watermarked PDF
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      toast.loading("Rendering watermarked UP Police certified PDF...", { id: "pdf" });
      const params: Record<string, any> = {
        reportType: selectedReport,
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedCourt !== "ALL") params.court = selectedCourt;
      if (selectedWing !== "ALL") params.wing = selectedWing;

      await ReportsAPI.downloadPdf(params);
      toast.success("Watermarked PDF report downloaded!", { id: "pdf" });
    } catch (err: any) {
      toast.error("Failed to generate PDF document", { id: "pdf" });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const courtOptions = useMemo(() => {
    const list = [{ key: "ALL", label: "All Courts / Tribunals" }];
    if (dropdowns?.courts) {
      dropdowns.courts.forEach((c: any) => {
        list.push({ key: c.courtName, label: c.courtName });
      });
    }
    return list;
  }, [dropdowns]);

  const wingOptions = useMemo(() => {
    const list = [{ key: "ALL", label: "All Department Wings" }];
    if (dropdowns?.departments) {
      dropdowns.departments.forEach((d: any) => {
        list.push({ key: d.unitName, label: d.unitName });
      });
    }
    return list;
  }, [dropdowns]);

  return (
    <div className="space-y-5">
      {/* 1. Header Information Bar */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/admin">
                  <Button isIconOnly size="sm" variant="light" className="text-slate-500">
                    <span className="material-symbols-rounded">arrow_back</span>
                  </Button>
                </Link>
                <h1 className="text-base font-bold text-slate-900">
                  6.0 Multi-Dimensional MIS Reports Engine
                </h1>
                <Chip size="sm" className="bg-[#0f2744] px-1 text-[10px] font-bold text-white">
                  Executive Intelligence
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Generate real-time certified reports, track hearing date-ranges, and export watermarked documents
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                className="border-emerald-600 text-emerald-800 bg-emerald-50 text-xs font-semibold hover:bg-emerald-100"
                startContent={<span className="material-symbols-rounded text-sm">table_view</span>}
                isLoading={downloadingExcel}
                onClick={handleDownloadExcel}
              >
                Export Excel (.xlsx)
              </Button>
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
                startContent={<span className="material-symbols-rounded text-sm">picture_as_pdf</span>}
                isLoading={downloadingPdf}
                onClick={handleDownloadPdf}
              >
                Export Certified PDF
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. Report Cards Grid (Click to activate) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {REPORT_CARDS.map((rc) => {
          const isSelected = selectedReport === rc.key;
          return (
            <Card
              key={rc.key}
              shadow="none"
              isPressable
              onPress={() => {
                setSelectedReport(rc.key);
                setPage(1);
              }}
              className={`cursor-pointer border transition-all text-left ${
                isSelected
                  ? "border-[#0f2744] bg-blue-50/50 shadow-sm ring-1 ring-[#0f2744]"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              }`}
            >
              <CardBody className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isSelected ? "bg-[#0f2744] text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span className="material-symbols-rounded text-lg">{rc.icon}</span>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={rc.color as any}
                    className="text-[9px] font-bold h-4 px-1"
                  >
                    {rc.badge}
                  </Chip>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{rc.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                    {rc.description}
                  </p>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* 3. Filter Controls Bar */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Parameters for:{" "}
              <span className="text-blue-900">
                {REPORT_CARDS.find((r) => r.key === selectedReport)?.title}
              </span>
            </h4>
            <span className="text-[11px] font-semibold text-slate-400">
              Total Matched: <b>{totalCount}</b> Cases
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <Input
              size="sm"
              type="date"
              label="Start Date (NDOH / Filing)"
              labelPlacement="outside"
              value={startDate}
              onValueChange={(val) => {
                setStartDate(val);
                setPage(1);
              }}
              className="bg-slate-50"
            />

            <Input
              size="sm"
              type="date"
              label="End Date (NDOH / Filing)"
              labelPlacement="outside"
              value={endDate}
              onValueChange={(val) => {
                setEndDate(val);
                setPage(1);
              }}
              className="bg-slate-50"
            />

            <Select
              size="sm"
              label="Judicial Court"
              labelPlacement="outside"
              items={courtOptions}
              selectedKeys={[selectedCourt]}
              onChange={(e) => {
                setSelectedCourt(e.target.value || "ALL");
                setPage(1);
              }}
              className="bg-slate-50 font-semibold"
            >
              {(c) => <SelectItem key={c.key}>{c.label}</SelectItem>}
            </Select>

            <Select
              size="sm"
              label="Department Wing"
              labelPlacement="outside"
              items={wingOptions}
              selectedKeys={[selectedWing]}
              onChange={(e) => {
                setSelectedWing(e.target.value || "ALL");
                setPage(1);
              }}
              className="bg-slate-50 font-semibold"
            >
              {(w) => <SelectItem key={w.key}>{w.label}</SelectItem>}
            </Select>

            <div className="flex items-end gap-2">
              <Button
                size="sm"
                radius="sm"
                variant="bordered"
                className="w-full text-xs font-semibold"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedCourt("ALL");
                  setSelectedWing("ALL");
                  setSelectedStatus("ALL");
                  setPage(1);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 4. Main Report Data Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="MIS Report Data Table"
            className="min-w-full"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <span className="text-xs text-slate-500">
                    Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total <strong>{totalCount}</strong> Records)
                  </span>
                  <Pagination
                    size="sm"
                    isCompact
                    showControls
                    total={totalPages}
                    page={page}
                    onChange={setPage}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">S.NO</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">FILE DOCKET NO</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">WRIT / NOTICE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">COURT &amp; CASE TYPE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">LEAD PETITIONER</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">WING &amp; RECRUITMENT</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">ASSIGNED OIC</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">NEXT HEARING (NDOH)</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400 text-center">FLAGS / STATUS</TableColumn>
            </TableHeader>
            <TableBody
              items={reportData}
              isLoading={loading}
              loadingContent={
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              }
              emptyContent={!loading ? "No records match the current filter selection." : " "}
            >
              {(item: ReportItem) => (
                <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell className="text-xs font-mono text-slate-400">{item.sNo}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/cases/${item._id}`}
                      className="font-mono text-xs font-bold text-blue-800 hover:underline"
                    >
                      {item.fileNo}
                    </Link>
                    <p className="font-mono text-[9px] text-slate-400">{item.cnrNumber}</p>
                  </TableCell>
                  <TableCell className="font-bold text-xs text-slate-900">{item.writOrNotice}</TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-slate-800">{item.court}</p>
                    <p className="text-[10px] text-slate-400">{item.caseType}</p>
                  </TableCell>
                  <TableCell className="max-w-[170px] truncate">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.petitioner}</p>
                    <p className="text-[10px] text-slate-400 truncate">vs {item.respondent}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-slate-700">{item.wing}</p>
                    <p className="text-[10px] text-slate-400">{item.examCycle}</p>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-800">{item.oic}</TableCell>
                  <TableCell className="font-bold text-xs text-amber-800">{item.ndoh}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      {item.hasStay && (
                        <Chip size="sm" color="danger" variant="solid" className="text-[8px] h-3.5 px-1 font-bold">
                          STAY ACTIVE
                        </Chip>
                      )}
                      {item.isContempt && (
                        <Chip size="sm" color="danger" variant="solid" className="text-[8px] h-3.5 px-1 font-bold animate-pulse">
                          CONTEMPT
                        </Chip>
                      )}
                      <Chip size="sm" variant="flat" color="primary" className="text-[9px] h-4 font-semibold">
                        {item.status}
                      </Chip>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}