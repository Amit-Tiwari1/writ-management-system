"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
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
import { MastersAPI } from "@/api/mastersApi";
import { AdminAPI } from "@/api/userApi";
import { CaseItem, PillsMetrics } from "@/types/case.types";
import ExportButton from "../components/ExportButton";

interface FilterOption {
  key: string;
  label: string;
}

export default function CaseRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active query parameters from URL
  const currentSearch = searchParams.get("search") || "";
  const currentCourt = searchParams.get("court") || "ALL";
  const currentWing = searchParams.get("wing") || "ALL";
  const currentCaseType = searchParams.get("caseType") || "ALL";
  const currentCategory = searchParams.get("category") || "ALL";
  const currentSubCategory = searchParams.get("subCategory") || "ALL";
  const currentSubject = searchParams.get("subject") || "ALL";
  const currentOic = searchParams.get("oic") || "ALL";
  const currentState = searchParams.get("state") || "ALL";
  const currentStatusFilter = searchParams.get("statusFilter") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const hearingDateParam = searchParams.get("hearingDate");

  const { isOpen: isSyncOpen, onOpen: onSyncOpen, onOpenChange: onSyncOpenChange } = useDisclosure();
  const { isOpen: isConnectedOpen, onOpen: onConnectedOpen, onOpenChange: onConnectedOpenChange } = useDisclosure();

  // Master Dropdown States
  const [courtOptions, setCourtOptions] = useState<FilterOption[]>([]);
  const [wingOptions, setWingOptions] = useState<FilterOption[]>([]);
  const [caseTypeOptions, setCaseTypeOptions] = useState<FilterOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<FilterOption[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<FilterOption[]>([]);
  const [oicOptions, setOicOptions] = useState<FilterOption[]>([]);
  const [stateOptions, setStateOptions] = useState<FilterOption[]>([]);

  // Controlled Filter Form States
  const [searchInput, setSearchInput] = useState<string>(currentSearch);
  const [tempCourt, setTempCourt] = useState<string>(currentCourt);
  const [tempWing, setTempWing] = useState<string>(currentWing);
  const [tempCaseType, setTempCaseType] = useState<string>(currentCaseType);
  const [tempCategory, setTempCategory] = useState<string>(currentCategory);
  const [tempSubCategory, setTempSubCategory] = useState<string>(currentSubCategory);
  const [tempSubject, setTempSubject] = useState<string>(currentSubject);
  const [tempOic, setTempOic] = useState<string>(currentOic);
  const [tempState, setTempState] = useState<string>(currentState);

  // Table Data States
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAttaching, setIsAttaching] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const rowsPerPage = 10;

  const [activeSyncCase, setActiveSyncCase] = useState<CaseItem | null>(null);
  const [selectedLeadCase, setSelectedLeadCase] = useState<CaseItem | null>(null);
  const [newTaggedWritNo, setNewTaggedWritNo] = useState<string>("");
  const [newTaggedPetitioner, setNewTaggedPetitioner] = useState<string>("");

  const [metrics, setMetrics] = useState<PillsMetrics>({
    all: 0,
    withConnected: 0,
    advanceNotice: 0,
    stayInForce: 0,
    contemptAlerts: 0,
  });

  // Load all foundational master filters dynamically
  useEffect(() => {
    async function loadMasterFilters() {
      try {
        const [intakeRes, subCatRes, subjectRes, usersRes, stateRes] = await Promise.all([
          MastersAPI.getIntakeDropdowns(),
          MastersAPI.getSubCategories({ limit: 100 }),
          MastersAPI.getSubjects({ limit: 150 }),
          AdminAPI.getUsersList({ limit: 100, status: "ACTIVE" }),
          MastersAPI.getStates({ limit: 50 }),
        ]);

        if (intakeRes?.success && intakeRes.data) {
          if (intakeRes.data.courts) {
            setCourtOptions([
              { key: "ALL", label: "All Courts" },
              ...intakeRes.data.courts.map((c: any) => ({
                key: c.shortCode || c.courtName,
                label: `${c.courtName} (${c.shortCode})`,
              })),
            ]);
          }
          if (intakeRes.data.caseTypes) {
            setCaseTypeOptions([
              { key: "ALL", label: "All Case Types" },
              ...intakeRes.data.caseTypes.map((ct: any) => ({
                key: ct.shortName || ct.caseTypeName,
                label: `${ct.caseTypeName} (${ct.shortName || ""})`,
              })),
            ]);
          }
          if (intakeRes.data.categories) {
            setCategoryOptions([
              { key: "ALL", label: "All Categories" },
              ...intakeRes.data.categories.map((cat: any) => ({
                key: cat.categoryName,
                label: cat.categoryName,
              })),
            ]);
          }
          if (intakeRes.data.departments) {
            setWingOptions([
              { key: "ALL", label: "All Wings" },
              ...intakeRes.data.departments.map((d: any) => ({
                key: d.unitName,
                label: d.unitName,
              })),
            ]);
          }
        }

        if (subCatRes?.success && Array.isArray(subCatRes.data)) {
          setSubCategoryOptions([
            { key: "ALL", label: "All Sub-Categories / Exams" },
            ...subCatRes.data.map((sc: any) => ({
              key: sc.subCategoryName,
              label: sc.subCategoryName,
            })),
          ]);
        }

        if (subjectRes?.success && Array.isArray(subjectRes.data)) {
          setSubjectOptions([
            { key: "ALL", label: "All Dispute Issues" },
            ...subjectRes.data.map((sub: any) => ({
              key: sub.subjectTitle,
              label: sub.subjectTitle,
            })),
          ]);
        }

        if (usersRes?.success && Array.isArray(usersRes.data)) {
          setOicOptions([
            { key: "ALL", label: "All Nodal Officers / OIC" },
            ...usersRes.data.map((u: any) => ({
              key: u.officerName,
              label: `${u.officerName} (${u.designationAndWing?.designation || u.assignedRole || "Staff"})`,
            })),
          ]);
        }

        if (stateRes?.success && Array.isArray(stateRes.data)) {
          setStateOptions([
            { key: "ALL", label: "All States / Origin" },
            ...stateRes.data.map((s: any) => ({
              key: s.stateName,
              label: s.stateName,
            })),
          ]);
        }
      } catch (err) {
        console.error("Failed to load master filters:", err);
      }
    }
    loadMasterFilters();
  }, []);

  const buildAndPushUrl = useCallback(
    (overrides: Record<string, any> = {}) => {
      const merged = {
        search: currentSearch,
        court: currentCourt,
        wing: currentWing,
        caseType: currentCaseType,
        category: currentCategory,
        subCategory: currentSubCategory,
        subject: currentSubject,
        oic: currentOic,
        state: currentState,
        statusFilter: currentStatusFilter,
        page: currentPage,
        ...overrides,
      };

      const params = new URLSearchParams();
      if (merged.search && merged.search.trim().length >= 3) params.set("search", merged.search.trim());
      if (merged.court && merged.court !== "ALL") params.set("court", merged.court);
      if (merged.wing && merged.wing !== "ALL") params.set("wing", merged.wing);
      if (merged.caseType && merged.caseType !== "ALL") params.set("caseType", merged.caseType);
      if (merged.category && merged.category !== "ALL") params.set("category", merged.category);
      if (merged.subCategory && merged.subCategory !== "ALL") params.set("subCategory", merged.subCategory);
      if (merged.subject && merged.subject !== "ALL") params.set("subject", merged.subject);
      if (merged.oic && merged.oic !== "ALL") params.set("oic", merged.oic);
      if (merged.state && merged.state !== "ALL") params.set("state", merged.state);
      if (merged.statusFilter && merged.statusFilter !== "all") params.set("statusFilter", merged.statusFilter);
      if (merged.page && merged.page > 1) params.set("page", String(merged.page));
      if (hearingDateParam) params.set("hearingDate", hearingDateParam);

      router.replace(`/admin/cases?${params.toString()}`, { scroll: false });
    },
    [
      currentSearch,
      currentCourt,
      currentWing,
      currentCaseType,
      currentCategory,
      currentSubCategory,
      currentSubject,
      currentOic,
      currentState,
      currentStatusFilter,
      currentPage,
      hearingDateParam,
      router,
    ]
  );

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: rowsPerPage,
      };

      if (currentSearch.trim().length >= 3) params.search = currentSearch.trim();
      if (currentCourt !== "ALL") params.court = currentCourt;
      if (currentWing !== "ALL") params.wing = currentWing;
      if (currentCaseType !== "ALL") params.caseType = currentCaseType;
      if (currentCategory !== "ALL") params.category = currentCategory;
      if (currentSubCategory !== "ALL") params.subCategory = currentSubCategory;
      if (currentSubject !== "ALL") params.subject = currentSubject;
      if (currentOic !== "ALL") params.oic = currentOic;
      if (currentState !== "ALL") params.state = currentState;
      if (currentStatusFilter !== "all") params.statusFilter = currentStatusFilter;
      if (hearingDateParam) params.hearingDate = hearingDateParam;

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
      toast.error(err.response?.data?.message || "Failed to load register");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    currentSearch,
    currentCourt,
    currentWing,
    currentCaseType,
    currentCategory,
    currentSubCategory,
    currentSubject,
    currentOic,
    currentState,
    currentStatusFilter,
    hearingDateParam,
  ]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    setSearchInput(currentSearch);
    setTempCourt(currentCourt);
    setTempWing(currentWing);
    setTempCaseType(currentCaseType);
    setTempCategory(currentCategory);
    setTempSubCategory(currentSubCategory);
    setTempSubject(currentSubject);
    setTempOic(currentOic);
    setTempState(currentState);
  }, [
    currentSearch,
    currentCourt,
    currentWing,
    currentCaseType,
    currentCategory,
    currentSubCategory,
    currentSubject,
    currentOic,
    currentState,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentCourt !== "ALL") count++;
    if (currentWing !== "ALL") count++;
    if (currentCaseType !== "ALL") count++;
    if (currentCategory !== "ALL") count++;
    if (currentSubCategory !== "ALL") count++;
    if (currentSubject !== "ALL") count++;
    if (currentOic !== "ALL") count++;
    if (currentState !== "ALL") count++;
    if (currentSearch.trim().length >= 3) count++;
    return count;
  }, [
    currentCourt,
    currentWing,
    currentCaseType,
    currentCategory,
    currentSubCategory,
    currentSubject,
    currentOic,
    currentState,
    currentSearch,
  ]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    const clean = val.trim();
    if (clean.length >= 3) {
      buildAndPushUrl({ search: clean, page: 1 });
    } else if (clean.length === 0 && currentSearch !== "") {
      buildAndPushUrl({ search: "", page: 1 });
    }
  };

  const handleApplyFilters = () => {
    buildAndPushUrl({
      search: searchInput.trim().length >= 3 ? searchInput.trim() : "",
      court: tempCourt,
      wing: tempWing,
      caseType: tempCaseType,
      category: tempCategory,
      subCategory: tempSubCategory,
      subject: tempSubject,
      oic: tempOic,
      state: tempState,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setTempCourt("ALL");
    setTempWing("ALL");
    setTempCaseType("ALL");
    setTempCategory("ALL");
    setTempSubCategory("ALL");
    setTempSubject("ALL");
    setTempOic("ALL");
    setTempState("ALL");
    router.replace("/admin/cases");
  };

  const handleStatusPillClick = (statusKey: string) => {
    buildAndPushUrl({
      statusFilter: statusKey,
      page: 1,
    });
  };

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

  const openConnectedModal = (leadCase: CaseItem) => {
    setSelectedLeadCase(leadCase);
    onConnectedOpen();
  };

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

  const columns = [
    { name: "SYNC", uid: "syncBadge" },
    { name: "FILE DOCKET NO.", uid: "fileDocketNo" },
    { name: "JUDICIAL IDENTIFIERS & CONNECTED WRITS", uid: "judicialIdentity" },
    { name: "COURT & BENCH", uid: "court" },
    { name: "PARTIES & DISPUTE SUBJECT", uid: "parties" },
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
            <div className="max-w-[220px]">
              <p className="truncate text-xs font-bold text-slate-900">{item.leadPetitioner}</p>
              <p className="truncate text-[11px] text-slate-500">vs {item.respondentString}</p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                <span className="rounded bg-slate-100 px-1 text-[9px] font-semibold text-slate-600">
                  {item.category}
                </span>
                <span className="truncate text-[9px] font-medium text-blue-700">
                  {item.disputeSubject}
                </span>
              </div>
            </div>
          );
case "officer": {
  const oicName =
    typeof item.assignedOIC === "object" && item.assignedOIC !== null
      ? item.assignedOIC.name
      : item.assignedOIC;

  const pairokarName =
    typeof item.assignedPairokar === "object" && item.assignedPairokar !== null
      ? item.assignedPairokar.name
      : item.assignedPairokar;
      return (
    <div>
      <p className="text-xs font-bold text-slate-800">
        {oicName || "--"}
      </p>

      <p className="text-[10px] text-slate-500">
        Pairokar: {pairokarName || "--"}
      </p>

      <p className="text-[9px] text-slate-400">
        {item.sectionWing || "--"}
      </p>
    </div>
  );
}

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
                color={item.isContemptNotice ? "danger" : item.hasActiveStay ? "danger" : "warning"}
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
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4 space-y-3">
          {/* Header Action Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  2.1 Case Register (Master Writ &amp; Connected Writs Index)
                </h1>
                {activeFiltersCount > 0 && (
                  <Chip size="sm" color="primary" variant="flat" className="text-[10px] font-bold">
                    {activeFiltersCount} Active Filters
                  </Chip>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Institutional File Dockets · Bench Jurisdictions · Hearing Schedules · Exportable MIS Register
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton
                endpoint="/cases/export"
                filterParams={{
                  search: currentSearch,
                  court: currentCourt,
                  wing: currentWing,
                  caseType: currentCaseType,
                  category: currentCategory,
                  subCategory: currentSubCategory,
                  subject: currentSubject,
                  oic: currentOic,
                  state: currentState,
                  statusFilter: currentStatusFilter,
                  hearingDate: hearingDateParam,
                }}
                fileBaseName="UPPRPB_Case_Register"
                allowExcel={true}
                allowPdf={true}
              />

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

          {/* 5 Status Metrics Pills */}
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {hearingDateParam && (
              <Chip size="sm" color="primary" variant="flat" className="font-bold text-xs">
                📅 Hearing Date: {hearingDateParam}
              </Chip>
            )}

            <Chip
              size="sm"
              variant={currentStatusFilter === "all" ? "solid" : "flat"}
              className={`cursor-pointer text-xs font-semibold ${
                currentStatusFilter === "all" ? "bg-[#0f2744] text-white" : "bg-slate-100 text-slate-700"
              }`}
              onClick={() => handleStatusPillClick("all")}
            >
              All Dockets ({metrics.all})
            </Chip>

            <Chip
              size="sm"
              variant={currentStatusFilter === "with_connected" ? "solid" : "flat"}
              color="primary"
              className="cursor-pointer text-xs font-semibold"
              onClick={() => handleStatusPillClick("with_connected")}
            >
              🔗 With Connected Writs ({metrics.withConnected})
            </Chip>

            <Chip
              size="sm"
              variant={currentStatusFilter === "advance_notice" ? "solid" : "flat"}
              color="warning"
              className="cursor-pointer text-xs font-semibold"
              onClick={() => handleStatusPillClick("advance_notice")}
            >
              📄 Advance Notice Stage ({metrics.advanceNotice})
            </Chip>

            <Chip
              size="sm"
              variant={currentStatusFilter === "stay" ? "solid" : "flat"}
              color="danger"
              className="cursor-pointer text-xs font-semibold"
              onClick={() => handleStatusPillClick("stay")}
            >
              ⚠️ Stay in Force ({metrics.stayInForce})
            </Chip>

            <Chip
              size="sm"
              variant={currentStatusFilter === "contempt" ? "solid" : "flat"}
              color="danger"
              className="cursor-pointer text-xs font-semibold"
              onClick={() => handleStatusPillClick("contempt")}
            >
              🔴 Contempt Alerts ({metrics.contemptAlerts})
            </Chip>
          </div>

          {/* Row 1 Filters: Search, Court, Case Type, Category, Sub-Category */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5 border-t border-slate-100 pt-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search docket, writ, party (3+ chars)..."
              value={searchInput}
              onValueChange={handleSearchChange}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50"
            />

            <Select
              size="sm"
              radius="sm"
              placeholder="Judicial Forum / Court"
              aria-label="Court"
              items={courtOptions}
              selectedKeys={[tempCourt]}
              onChange={(e) => setTempCourt(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              {(c) => <SelectItem key={c.key}>{c.label}</SelectItem>}
            </Select>

            <Select
              size="sm"
              radius="sm"
              placeholder="Case Type"
              aria-label="Case Type"
              items={caseTypeOptions.length > 0 ? caseTypeOptions : [{ key: "ALL", label: "All Case Types" }]}
              selectedKeys={[tempCaseType]}
              onChange={(e) => setTempCaseType(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              {(ct) => <SelectItem key={ct.key}>{ct.label}</SelectItem>}
            </Select>

            <Select
              size="sm"
              radius="sm"
              placeholder="Master Category"
              aria-label="Category"
              items={categoryOptions.length > 0 ? categoryOptions : [{ key: "ALL", label: "All Categories" }]}
              selectedKeys={[tempCategory]}
              onChange={(e) => setTempCategory(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              {(cat) => <SelectItem key={cat.key}>{cat.label}</SelectItem>}
            </Select>

            <Select
              size="sm"
              radius="sm"
              placeholder="Exam Cycle / Sub-Category"
              aria-label="Sub-Category"
              items={subCategoryOptions.length > 0 ? subCategoryOptions : [{ key: "ALL", label: "All Sub-Categories" }]}
              selectedKeys={[tempSubCategory]}
              onChange={(e) => setTempSubCategory(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              {(sc) => <SelectItem key={sc.key}>{sc.label}</SelectItem>}
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
            <Select
              size="sm"
              radius="sm"
              placeholder="Litigation Dispute Subject"
              aria-label="Subject"
              items={subjectOptions.length > 0 ? subjectOptions : [{ key: "ALL", label: "All Dispute Issues" }]}
              selectedKeys={[tempSubject]}
              onChange={(e) => setTempSubject(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              {(sub) => <SelectItem key={sub.key}>{sub.label}</SelectItem>}
            </Select>

            <Select
              size="sm"
              radius="sm"
              placeholder="Assigned Nodal OIC"
              aria-label="OIC"
              items={oicOptions.length > 0 ? oicOptions : [{ key: "ALL", label: "All Nodal Officers" }]}
              selectedKeys={[tempOic]}
              onChange={(e) => setTempOic(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              {(o) => <SelectItem key={o.key}>{o.label}</SelectItem>}
            </Select>

            <Select
              size="sm"
              radius="sm"
              placeholder="Owning Wing / Section"
              aria-label="Section Wing"
              items={wingOptions.length > 0 ? wingOptions : [{ key: "ALL", label: "All Wings" }]}
              selectedKeys={[tempWing]}
              onChange={(e) => setTempWing(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              {(w) => <SelectItem key={w.key}>{w.label}</SelectItem>}
            </Select>

            <Select
              size="sm"
              radius="sm"
              placeholder="State / Origin"
              aria-label="State"
              items={stateOptions.length > 0 ? stateOptions : [{ key: "ALL", label: "All States" }]}
              selectedKeys={[tempState]}
              onChange={(e) => setTempState(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              {(st) => <SelectItem key={st.key}>{st.label}</SelectItem>}
            </Select>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                radius="sm"
                className="w-full bg-[#0f2744] text-xs font-semibold text-white shadow-sm hover:bg-[#163a66]"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
              <Button
                size="sm"
                radius="sm"
                variant="bordered"
                className="border-slate-200 text-xs font-semibold text-slate-700"
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
            aria-label="Case Register Table"
            className="min-w-full"
            bottomContent={
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <span className="text-xs text-slate-500">
                  Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (Total{" "}
                  <strong>{totalCount}</strong> Records)
                </span>
                <Pagination
                  size="sm"
                  isCompact
                  showControls
                  total={totalPages}
                  page={currentPage}
                  onChange={(newPage) => {
                    buildAndPushUrl({ page: newPage });
                  }}
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

      {/* Tagged Writs Modal */}
      <Modal isOpen={isConnectedOpen} onOpenChange={onConnectedOpenChange} size="2xl" scrollBehavior="inside">
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

      {/* Live eCourts Sync Modal */}
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