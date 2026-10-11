"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Select,
  SelectItem,
  Card,
  CardBody,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import axiosClient from "@/api/axiosClient";

interface ConnectedWritItem {
  writNumber: string;
  cnrNumber?: string;
  petitionerName?: string;
  taggedDate?: string;
}

interface CaseItem {
  _id: string;
  fileNo: string;
  noticeNumber?: string;
  writNumber?: string;
  cnrNumber?: string;
  identifierTier: 1 | 2 | 3 | 4;
  court: string;
  courtCode: string;
  caseType: string;
  benchLocation: string;
  courtRoomNo?: string;
  coramBench?: string;
  leadPetitioner: string;
  respondentString: string;
  assignedOIC: string;
  assignedPairokar: string;
  sectionWing: string;
  category: string;
  subCategory?: string;
  disputeSubject: string;
  stage: string;
  judicialStatus: string;
  internalHold?: {
    location: string;
    holdDays: number;
  };
  ndoh: string | null;
  hasActiveStay: boolean;
  isContemptNotice: boolean;
  connectedWrits: ConnectedWritItem[];
  coPetitionersCount: number;
  syncStatus: "LIVE_SYNCED" | "SCHEDULED" | "MANUAL_DOCKET" | "DISCREPANCY";
  createdAt: string;
}

interface PillsMetrics {
  all: number;
  withConnected: number;
  advanceNotice: number;
  stayInForce: number;
  contemptAlerts: number;
}

export default function CaseRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hearingDateParam = searchParams.get("hearingDate");

  // Sync Modal & Tagged Writs Modal Disclosures
  const { isOpen: isSyncOpen, onOpen: onSyncOpen, onOpenChange: onSyncOpenChange } = useDisclosure();
  const { isOpen: isConnectedOpen, onOpen: onConnectedOpen, onOpenChange: onConnectedOpenChange } = useDisclosure();

  // Data & Loading States
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAttaching, setIsAttaching] = useState<boolean>(false);

  // Filters & Pagination State
  const [search, setSearch] = useState<string>("");
  const [tempSearch, setTempSearch] = useState<string>("");
  const [selectedCourt, setSelectedCourt] = useState<string>("ALL");
  const [selectedWing, setSelectedWing] = useState<string>("ALL");
  const [activePill, setActivePill] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const rowsPerPage = 10;

  // Active Modals Item References
  const [activeSyncCase, setActiveSyncCase] = useState<CaseItem | null>(null);
  const [selectedLeadCase, setSelectedLeadCase] = useState<CaseItem | null>(null);

  // New Tagged Writ Form State
  const [newTaggedWritNo, setNewTaggedWritNo] = useState<string>("");
  const [newTaggedPetitioner, setNewTaggedPetitioner] = useState<string>("");

  // Metrics Pills Counters
  const [metrics, setMetrics] = useState<PillsMetrics>({
    all: 0,
    withConnected: 0,
    advanceNotice: 0,
    stayInForce: 0,
    contemptAlerts: 0,
  });

  // Fetch Cases Function from Real Backend API
  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      let statusFilter: string | undefined = undefined;
      if (activePill === "with_connected") statusFilter = "with_connected";
      else if (activePill === "advance_notice") statusFilter = "advance_notice";
      else if (activePill === "stay") statusFilter = "stay";
      else if (activePill === "contempt") statusFilter = "contempt";

      const params: Record<string, any> = {
        page,
        limit: rowsPerPage,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedCourt !== "ALL") params.court = selectedCourt;
      if (selectedWing !== "ALL") params.wing = selectedWing;
      if (statusFilter) params.statusFilter = statusFilter;

      const response = await axiosClient.get("/cases", { params });

      if (response.data?.success) {
        setCases(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.total || 0);
        if (response.data.pillsMetrics) {
          setMetrics(response.data.pillsMetrics);
        }
      }
    } catch (err: any) {
      console.error("[CaseRegister] Error loading cases:", err);
      toast.error(err.response?.data?.message || "Failed to load litigation register");
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCourt, selectedWing, activePill]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleApplyFilters = () => {
    setSearch(tempSearch);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setTempSearch("");
    setSelectedCourt("ALL");
    setSelectedWing("ALL");
    setActivePill("all");
    setPage(1);
    router.push("/admin/cases");
  };

  // Trigger eCourts CIS Background Polling via Backend
  const handleExecuteSync = async () => {
    if (!activeSyncCase) return;
    setIsSyncing(true);
    try {
      const response = await axiosClient.post(`/cases/${activeSyncCase._id}/sync-ecourts`);
      if (response.data?.success) {
        toast.success(`Docket ${activeSyncCase.fileNo} synchronized with eCourts Gateway!`, {
          icon: "⚖️",
        });
        onSyncOpenChange();
        fetchCases();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "eCourts Sync Failed");
    } finally {
      setIsSyncing(false);
    }
  };

  // Open Connected Writs Management Modal
  const openConnectedModal = (leadCase: CaseItem) => {
    setSelectedLeadCase(leadCase);
    onConnectedOpen();
  };

  // Attach a new connected writ into the lead docket in Backend
  const handleAttachWrit = async () => {
    if (!newTaggedWritNo || !selectedLeadCase) return;
    setIsAttaching(true);
    try {
      const response = await axiosClient.post(`/cases/${selectedLeadCase._id}/connected-writs`, {
        writNumber: newTaggedWritNo.toUpperCase().trim(),
        petitionerName: newTaggedPetitioner.trim() || "Tagged Litigant",
      });

      if (response.data?.success) {
        toast.success("Connected writ tagged successfully!");
        setSelectedLeadCase((prev) =>
          prev
            ? {
                ...prev,
                connectedWrits: response.data.connectedWrits,
              }
            : null
        );
        setNewTaggedWritNo("");
        setNewTaggedPetitioner("");
        fetchCases();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to tag connected writ");
    } finally {
      setIsAttaching(false);
    }
  };

  // Columns Configuration
  const columns = [
    { name: "SYNC", uid: "syncBadge" },
    { name: "FILE DOCKET NO.", uid: "fileDocketNo" },
    { name: "JUDICIAL IDENTIFIERS & CONNECTED WRITS", uid: "judicialIdentity" },
    { name: "COURT & BENCH", uid: "court" },
    { name: "PARTIES", uid: "parties" },
    { name: "OFFICER & PAIROKAR", uid: "officer" },
    { name: "NEXT HEARING (NDOH)", uid: "ndoh" },
    { name: "PROCEDURAL & INTERNAL HOLD STATUS", uid: "dualStatus" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const renderCell = useCallback(
    (item: CaseItem, columnKey: React.Key) => {
      switch (columnKey) {
        case "syncBadge":
          return (
            <div className="flex justify-center">
              {item.syncStatus === "LIVE_SYNCED" && (
                <Tooltip content="Live synced with eCourts CIS">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" />
                </Tooltip>
              )}
              {item.syncStatus === "DISCREPANCY" && (
                <Tooltip content="Discrepancy detected in judicial records">
                  <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500 shadow-sm" />
                </Tooltip>
              )}
              {(item.syncStatus === "MANUAL_DOCKET" || item.syncStatus === "SCHEDULED") && (
                <Tooltip content="Manual or scheduled docket">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-400 shadow-sm" />
                </Tooltip>
              )}
            </div>
          );

        case "fileDocketNo":
          return (
            <div>
              <Link
                href={`/admin/cases/${item._id}`}
                className="font-mono text-xs font-black text-[#0f2744] hover:underline"
              >
                {item.fileNo}
              </Link>
              <p className="text-[10px] text-slate-400">Dak / Almirah Ref</p>
            </div>
          );

        case "judicialIdentity":
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-extrabold text-blue-800">
                  {item.writNumber || "Awaiting Writ No."}
                </span>
                {item.noticeNumber && (
                  <>
                    <span>·</span>
                    <span className="rounded bg-slate-100 px-1 font-mono text-[10px] text-slate-700">
                      {item.noticeNumber}
                    </span>
                  </>
                )}
              </div>
              <p className="font-mono text-[9px] text-slate-400">
                CNR: {item.cnrNumber || "Awaiting Allotment"}
              </p>

              {item.connectedWrits && item.connectedWrits.length > 0 ? (
                <button
                  type="button"
                  onClick={() => openConnectedModal(item)}
                  className="flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-700 hover:bg-blue-100"
                >
                  <span className="material-symbols-rounded text-xs">link</span>
                  <span>{item.connectedWrits.length} Connected Writs</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openConnectedModal(item)}
                  className="text-[9px] font-medium text-slate-400 hover:text-blue-700 hover:underline"
                >
                  + Tag Connected Writ
                </button>
              )}
            </div>
          );

        case "court":
          return (
            <div>
              <p className="text-xs font-semibold text-slate-800">{item.court}</p>
              <p className="text-[10px] text-slate-400">
                {item.benchLocation} Bench · {item.caseType}
              </p>
            </div>
          );

        case "parties":
          return (
            <div className="max-w-[200px]">
              <p className="truncate text-xs font-bold text-slate-900">{item.leadPetitioner}</p>
              <p className="truncate text-[11px] text-slate-500">vs {item.respondentString}</p>
              <span className="text-[9px] text-slate-400">{item.disputeSubject}</span>
            </div>
          );

        case "officer":
          return (
            <div>
              <p className="text-xs font-bold text-slate-800">{item.assignedOIC}</p>
              <p className="text-[10px] text-slate-500">Pairokar: {item.assignedPairokar}</p>
              <p className="text-[9px] text-slate-400">{item.sectionWing}</p>
            </div>
          );

        case "ndoh": {
          const ndohDate = item.ndoh
            ? new Date(item.ndoh).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "--";
          return (
            <div>
              <Chip
                size="sm"
                variant="flat"
                color={item.isContemptNotice ? "danger" : "warning"}
                className="text-xs font-bold"
              >
                {ndohDate}
              </Chip>
              {item.courtRoomNo && item.courtRoomNo !== "--" && (
                <p className="mt-0.5 text-[10px] text-slate-400">Court No: {item.courtRoomNo}</p>
              )}
            </div>
          );
        }

        case "dualStatus":
          return (
            <div className="flex flex-col gap-1 max-w-[190px]">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span className="text-[11px] font-bold text-slate-800">{item.stage}</span>
              </div>

              {item.internalHold && (
                <div className="rounded border border-amber-200 bg-amber-50/70 px-1.5 py-0.5 text-[10px]">
                  <span className="font-semibold text-amber-900">
                    Hold: {item.internalHold.location}
                  </span>
                  <span className="ml-1 text-[9px] font-bold text-rose-600">
                    ({item.internalHold.holdDays}d)
                  </span>
                </div>
              )}

              {item.hasActiveStay && (
                <Chip size="sm" variant="solid" color="danger" className="h-4 px-1 text-[8px] font-extrabold">
                  INTERIM STAY IN FORCE
                </Chip>
              )}
            </div>
          );

        case "actions":
          return (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light" className="text-slate-500">
                  <span className="material-symbols-rounded">more_vert</span>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Action Menu" className="text-xs">
                <DropdownItem
                  key="view"
                  startContent={<span className="material-symbols-rounded text-sm">visibility</span>}
                  onPress={() => router.push(`/admin/cases/${item._id}`)}
                >
                  View 360° Dossier
                </DropdownItem>
                <DropdownItem
                  key="tag_writs"
                  startContent={<span className="material-symbols-rounded text-sm">link</span>}
                  onPress={() => openConnectedModal(item)}
                >
                  Manage Connected Writs
                </DropdownItem>
                <DropdownItem
                  key="dms"
                  startContent={<span className="material-symbols-rounded text-sm">folder_open</span>}
                  onPress={() => router.push(`/admin/documents?caseId=${item._id}`)}
                >
                  Open E-File DMS
                </DropdownItem>
                <DropdownItem
                  key="noting"
                  startContent={<span className="material-symbols-rounded text-sm">edit_note</span>}
                  onPress={() => router.push(`/admin/communications/notings?caseId=${item._id}`)}
                >
                  Green Sheet Noting
                </DropdownItem>
                <DropdownItem
                  key="sync"
                  startContent={<span className="material-symbols-rounded text-sm">sync</span>}
                  onPress={() => {
                    setActiveSyncCase(item);
                    onSyncOpen();
                  }}
                >
                  Re-sync eCourts NAPIX
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );

        default:
          return <p className="text-xs">--</p>;
      }
    },
    [router]
  );

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-base font-bold text-slate-900">
                2.1 Case Register (Master Writ &amp; Connected Writs Index)
              </h1>
              <p className="text-xs text-slate-500">
                Standalone File Docket · Judicial Notice/Writ/CNR · Connected Writs · Dual Court/Hold Status
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                startContent={<span className="material-symbols-rounded text-sm">download</span>}
                onClick={() => toast.success("Preparing consolidated MIS Excel export...")}
              >
                Export XLS
              </Button>
              <Link href="/admin/cases/register">
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] text-xs font-semibold text-white shadow-sm hover:bg-[#163a66]"
                  startContent={<span className="material-symbols-rounded text-sm">add</span>}
                >
                  New Case Intake
                </Button>
              </Link>
            </div>
          </div>

          {/* Active Filter Chips & Metrics Banner */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {hearingDateParam && (
              <Chip size="sm" color="primary" variant="flat" className="font-bold text-xs">
                📅 Hearing Date: {hearingDateParam}
              </Chip>
            )}

            <Chip
              size="sm"
              variant={activePill === "all" ? "solid" : "flat"}
              className={`cursor-pointer text-xs font-semibold ${
                activePill === "all" ? "bg-[#0f2744] text-white" : "bg-slate-100 text-slate-700"
              }`}
              onClick={() => {
                setActivePill("all");
                setPage(1);
              }}
            >
              All Dockets ({metrics.all})
            </Chip>

            <Chip
              size="sm"
              variant={activePill === "with_connected" ? "solid" : "flat"}
              color="primary"
              className="cursor-pointer text-xs font-semibold"
              onClick={() => {
                setActivePill("with_connected");
                setPage(1);
              }}
            >
              🔗 With Connected Writs ({metrics.withConnected})
            </Chip>

            <Chip
              size="sm"
              variant={activePill === "advance_notice" ? "solid" : "flat"}
              color="warning"
              className="cursor-pointer text-xs font-semibold"
              onClick={() => {
                setActivePill("advance_notice");
                setPage(1);
              }}
            >
              📄 Advance Notice Stage ({metrics.advanceNotice})
            </Chip>

            <Chip
              size="sm"
              variant={activePill === "stay" ? "solid" : "flat"}
              color="danger"
              className="cursor-pointer text-xs font-semibold"
              onClick={() => {
                setActivePill("stay");
                setPage(1);
              }}
            >
              ⚠️ Stay in Force ({metrics.stayInForce})
            </Chip>

            <Chip
              size="sm"
              variant={activePill === "contempt" ? "solid" : "flat"}
              color="danger"
              className="cursor-pointer text-xs font-semibold"
              onClick={() => {
                setActivePill("contempt");
                setPage(1);
              }}
            >
              🔴 Contempt Alerts ({metrics.contemptAlerts})
            </Chip>
          </div>

          {/* Universal Search & Master Dropdown Filters */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search File No, Writ, Notice, CNR, Litigant..."
              value={tempSearch}
              onValueChange={setTempSearch}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50"
            />

            <Select
              size="sm"
              radius="sm"
              placeholder="Select Court"
              selectedKeys={[selectedCourt]}
              onChange={(e) => {
                setSelectedCourt(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50"
            >
              <SelectItem key="ALL">All Courts</SelectItem>
              <SelectItem key="HC-ALD">High Court Allahabad</SelectItem>
              <SelectItem key="HC-LKO">High Court Lucknow</SelectItem>
              <SelectItem key="SCI">Supreme Court of India</SelectItem>
              <SelectItem key="SPST">State Tribunal (SPST)</SelectItem>
            </Select>

            <Select
              size="sm"
              radius="sm"
              placeholder="Owning Wing / Section"
              selectedKeys={[selectedWing]}
              onChange={(e) => {
                setSelectedWing(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50"
            >
              <SelectItem key="ALL">All Wings</SelectItem>
              <SelectItem key="Recruitment Wing">Recruitment Wing</SelectItem>
              <SelectItem key="Promotion Wing">Promotion Wing</SelectItem>
              <SelectItem key="Legal Cell">Legal Cell</SelectItem>
              <SelectItem key="Establishment Wing">Establishment Wing</SelectItem>
            </Select>

            <div className="flex gap-2">
              <Button
                size="sm"
                radius="sm"
                className="w-full bg-[#0f2744] text-xs font-semibold text-white hover:bg-[#163a66]"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
              <Button
                size="sm"
                radius="sm"
                variant="bordered"
                className="border-slate-200 text-xs font-semibold"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Grid Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="4-Identifier and Connected Writs Register Table"
            className="min-w-full"
            bottomContent={
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
                  onChange={(newPage) => setPage(newPage)}
                />
              </div>
            }
          >
            <TableHeader columns={columns}>
              {(col) => (
                <TableColumn
                  key={col.uid}
                  align={col.uid === "actions" || col.uid === "syncBadge" ? "center" : "start"}
                  className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400"
                >
                  {col.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={cases}
              isLoading={loading}
              loadingContent={
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              }
              emptyContent={!loading ? "No registered dockets found matching active filters." : " "}
            >
              {(item) => (
                <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* MODAL 1: CONNECTED / TAGGED WRITS MANAGER */}
      <Modal
        isOpen={isConnectedOpen}
        onOpenChange={onConnectedOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-blue-700">link</span>
                  <span className="text-sm font-bold text-slate-900">
                    Connected / Tagged Writs Registry
                  </span>
                </div>
                <p className="text-xs font-normal text-slate-500">
                  Leading Docket: <strong className="text-slate-800">{selectedLeadCase?.fileNo}</strong> ·{" "}
                  <span className="text-blue-700">{selectedLeadCase?.writNumber || "Notice"}</span>
                </p>
              </ModalHeader>

              <ModalBody className="space-y-4 py-4 text-xs">
                <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-slate-700">
                  <p className="font-semibold text-blue-900">Judicial Tagging Notice:</p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    All connected petitions listed below will automatically share this Lead Docket&apos;s Next Date of Hearing (NDOH) and Court Room assignment.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800">
                    Currently Attached Writs ({selectedLeadCase?.connectedWrits?.length || 0})
                  </h4>
                  {selectedLeadCase?.connectedWrits && selectedLeadCase.connectedWrits.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedLeadCase.connectedWrits.map((cw, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5"
                        >
                          <div>
                            <span className="font-bold text-[#0f2744]">{cw.writNumber}</span>
                            <p className="text-[11px] font-medium text-slate-600">
                              Petitioner: {cw.petitionerName || "--"}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {cw.taggedDate ? new Date(cw.taggedDate).toLocaleDateString() : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-slate-400 italic">No connected writs attached to this leading case yet.</p>
                  )}
                </div>

                {/* Attach New Writ Form */}
                <div className="rounded-lg border border-dashed border-slate-300 p-3 space-y-2">
                  <p className="font-bold text-slate-800">Tag a New Writ to this Lead File:</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Input
                      size="sm"
                      label="Connected Writ No."
                      labelPlacement="outside"
                      placeholder="e.g. WRIT-A / 4502 / 2026"
                      value={newTaggedWritNo}
                      onValueChange={setNewTaggedWritNo}
                    />
                    <Input
                      size="sm"
                      label="Petitioner Name"
                      labelPlacement="outside"
                      placeholder="e.g. Ramesh Chandra & Ors"
                      value={newTaggedPetitioner}
                      onValueChange={setNewTaggedPetitioner}
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      radius="sm"
                      className="bg-[#0f2744] text-xs font-semibold text-white"
                      isLoading={isAttaching}
                      onPress={handleAttachWrit}
                      startContent={!isAttaching && <span className="material-symbols-rounded text-sm">add_link</span>}
                    >
                      Attach to Lead Docket
                    </Button>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button size="sm" radius="sm" variant="bordered" onPress={onClose}>
                  Done
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: LIVE ECOURTS NAPIX SYNC MODAL */}
      <Modal isOpen={isSyncOpen} onOpenChange={onSyncOpenChange} placement="top" size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">sync</span>
                Trigger Live eCourts NAPIX Sync
              </ModalHeader>
              <ModalBody className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Querying the official High Court CIS database via NAPIX gateway for:
                </p>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-1 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500">File Docket No:</span>
                    <span className="font-mono font-bold text-slate-800">{activeSyncCase?.fileNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Writ / Case No:</span>
                    <span className="font-bold text-blue-800">{activeSyncCase?.writNumber || "Awaiting"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Notice No:</span>
                    <span className="font-mono text-slate-700">{activeSyncCase?.noticeNumber || "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CNR Number:</span>
                    <span className="font-mono font-bold text-emerald-700">{activeSyncCase?.cnrNumber || "None"}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  This background task pulls fresh NDOH dates, bench coram updates, daily court orders, and updates all connected writs sharing this hearing.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSyncing}
                  onClick={handleExecuteSync}
                >
                  Poll eCourts Now
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}