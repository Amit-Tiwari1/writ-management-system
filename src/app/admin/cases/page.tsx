"use client";

import React, { useState, useMemo, useCallback } from "react";
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
} from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CaseRegisterPage() {
  const router = useRouter();
  const { isOpen: isSyncOpen, onOpen: onSyncOpen, onOpenChange: onSyncOpenChange } = useDisclosure();
  
  const [filterValue, setFilterValue] = useState("");
  const [tempFilter, setTempFilter] = useState("");
  const [selectedCourt, setSelectedCourt] = useState<string>("ALL");
  const [selectedWing, setSelectedWing] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [activeSyncCase, setActiveSyncCase] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sample data
  const [casesData, setCasesData] = useState([
    {
      id: "1",
      cnrNumber: "UPHC010029312026",
      internalFileNo: "PRPB-R/938/2026",
      noticeNoYear: "67186 / 2026",
      caseNoYear: "WRIT-A / 4012 / 2026",
      court: "High Court Allahabad",
      bench: "Principal Bench",
      wing: "Recruitment Wing",
      subCategory: "Dying in Harness Rules - SICP",
      petitioner: "Abhay Gupta & 4 Others",
      respondent: "State of UP & Chairman UPPRPB",
      oic: "SP Legal (Cell-1)",
      pairokar: "Shanu Pratap Singh",
      ndoh: "22 Sep 2026",
      ndohDays: "In 6 Days",
      courtStatus: "Pending",
      internalStatus: "PWC Awaited",
      isStay: false,
      isContempt: false,
      syncBadge: "synced",
    },
    {
      id: "2",
      cnrNumber: "UPHC020011402026",
      internalFileNo: "PRPB-R/942/2026",
      noticeNoYear: "66714 / 2026",
      caseNoYear: "WRIT-A / 4021 / 2026",
      court: "High Court Lucknow",
      bench: "Lucknow Bench",
      wing: "Recruitment Wing",
      subCategory: "Constable Civil Police Rec. 2023",
      petitioner: "Vikas Kumar Yadav",
      respondent: "Chairman UPPRPB & Ors",
      oic: "Swahleen Ahmad (SI)",
      pairokar: "Dashrath Lal",
      ndoh: "18 Sep 2026",
      ndohDays: "In 2 Days",
      courtStatus: "Pending",
      internalStatus: "Counter Filed",
      isStay: false,
      isContempt: true,
      syncBadge: "synced",
    },
    {
      id: "3",
      cnrNumber: "UPHC010089212025",
      internalFileNo: "PRPB-R/812/2025",
      noticeNoYear: "57000 / 2025",
      caseNoYear: "WRIT-A / 7100 / 2025",
      court: "High Court Allahabad",
      bench: "Principal Bench",
      wing: "Promotion Wing",
      subCategory: "Constable PAC Recruitment",
      petitioner: "Rohit Kumar",
      respondent: "DGP Headquarters & Board",
      oic: "DySP Promotion",
      pairokar: "Shanu Pratap Singh",
      ndoh: "30 Sep 2026",
      ndohDays: "In 14 Days",
      courtStatus: "Pending",
      internalStatus: "Stay In Force",
      isStay: true,
      isContempt: false,
      syncBadge: "discrepancy",
    },
    {
      id: "4",
      cnrNumber: "UPHC010041122025",
      internalFileNo: "PRPB-R/670/2025",
      noticeNoYear: "47045 / 2025",
      caseNoYear: "WRIT-A / 2025 / 19",
      court: "High Court Allahabad",
      bench: "Principal Bench",
      wing: "Promotion Wing",
      subCategory: "Sub Inspector Ranker Exam",
      petitioner: "Sujit Yadav",
      respondent: "State of UP",
      oic: "Swahleen Ahmad (SI)",
      pairokar: "Shanu Pratap Singh",
      ndoh: "05 Oct 2026",
      ndohDays: "In 19 Days",
      courtStatus: "Disposed",
      internalStatus: "Closed",
      isStay: false,
      isContempt: false,
      syncBadge: "manual",
    },
  ]);

  const columns = [
    { name: "SYNC", uid: "syncBadge" },
    { name: "CNR & WRIT NO.", uid: "caseIdentity" },
    { name: "COURT & BENCH", uid: "court" },
    { name: "PARTIES", uid: "parties" },
    { name: "SUB CATEGORY", uid: "subCategory" },
    { name: "OFFICER & PAIROKAR", uid: "officer" },
    { name: "NEXT HEARING (NDOH)", uid: "ndoh" },
    { name: "STATUS", uid: "status" },
    { name: "ACTIONS", uid: "actions" },
  ];

  // Filtering Logic
  const filteredItems = useMemo(() => {
    let filtered = [...casesData];

    if (filterValue) {
      filtered = filtered.filter(
        (item) =>
          item.cnrNumber.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.caseNoYear.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.petitioner.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.noticeNoYear.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (selectedCourt !== "ALL") {
      filtered = filtered.filter((item) => item.court === selectedCourt);
    }
    if (selectedWing !== "ALL") {
      filtered = filtered.filter((item) => item.wing === selectedWing);
    }
    if (selectedStatus === "STAY") {
      filtered = filtered.filter((item) => item.isStay);
    }
    if (selectedStatus === "CONTEMPT") {
      filtered = filtered.filter((item) => item.isContempt);
    }
    return filtered;
  }, [casesData, filterValue, selectedCourt, selectedWing, selectedStatus]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, filteredItems]);

  const handleApplyFilters = () => {
    setFilterValue(tempFilter);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilterValue("");
    setTempFilter("");
    setSelectedCourt("ALL");
    setSelectedWing("ALL");
    setSelectedStatus("ALL");
    setPage(1);
  };

  const triggerSyncModal = (item: any) => {
    setActiveSyncCase(item);
    onSyncOpen();
  };

  const executeSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      if (activeSyncCase) {
        setCasesData((prev) =>
          prev.map((c) =>
            c.id === activeSyncCase.id
              ? { ...c, syncBadge: "synced", ndoh: "24 Sep 2026", ndohDays: "In 8 Days" }
              : c
          )
        );
      }
      setIsSyncing(false);
      onSyncOpenChange();
    }, 1200);
  };

  const renderCell = useCallback(
    (item: any, columnKey: React.Key) => {
      switch (columnKey) {
        case "syncBadge":
          return (
            <div className="flex justify-center">
              {item.syncBadge === "synced" && (
                <Tooltip content="Synced with eCourts CIS < 24h ago">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" />
                </Tooltip>
              )}
              {item.syncBadge === "discrepancy" && (
                <Tooltip content="Discrepancy: Court record updated; please re-sync">
                  <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500 shadow-sm" />
                </Tooltip>
              )}
              {item.syncBadge === "manual" && (
                <Tooltip content="Standalone offline record">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-400 shadow-sm" />
                </Tooltip>
              )}
            </div>
          );

        case "caseIdentity":
          return (
            <div>
              <Link
                href={`/admin/cases/${item.id}`}
                className="font-mono text-xs font-bold text-slate-900 hover:text-blue-700 hover:underline"
              >
                {item.cnrNumber}
              </Link>
              <p className="text-xs font-bold text-blue-700">{item.caseNoYear}</p>
              <p className="text-[10px] text-slate-400">Notice: {item.noticeNoYear}</p>
            </div>
          );

        case "court":
          return (
            <div>
              <p className="text-xs font-medium text-slate-800">{item.court}</p>
              <p className="text-[10px] text-slate-400">{item.bench}</p>
            </div>
          );

        case "parties":
          return (
            <div className="max-w-[180px]">
              <p className="truncate text-xs font-semibold text-slate-900">{item.petitioner}</p>
              <p className="truncate text-[11px] text-slate-500">vs {item.respondent}</p>
            </div>
          );

        case "subCategory":
          return (
            <div className="max-w-[160px]">
              <p className="truncate text-xs text-slate-700">{item.subCategory}</p>
            </div>
          );

        case "officer":
          return (
            <div>
              <p className="text-xs font-medium text-slate-800">{item.oic}</p>
              <p className="text-[10px] text-slate-500">Pairokar: {item.pairokar}</p>
            </div>
          );

        case "ndoh":
          return (
            <div>
              <Chip
                size="sm"
                variant="flat"
                color={item.isContempt ? "danger" : "warning"}
                className="text-xs font-bold"
              >
                {item.ndoh}
              </Chip>
              <p className="mt-0.5 text-[10px] text-slate-400">{item.ndohDays}</p>
            </div>
          );

        case "status":
          return (
            <div className="flex flex-col gap-1">
              <Chip
                size="sm"
                variant="flat"
                color={
                  item.isContempt
                    ? "danger"
                    : item.isStay
                    ? "danger"
                    : item.internalStatus === "PWC Awaited"
                    ? "warning"
                    : "success"
                }
                className="text-xs font-semibold"
              >
                {item.internalStatus}
              </Chip>
              {item.isStay && (
                <Chip size="sm" variant="solid" color="danger" className="h-4 px-1 text-[9px] font-bold">
                  STAY IN FORCE
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
                  onPress={() => router.push(`/admin/cases/${item.id}`)}
                >
                  View 360° Dossier
                </DropdownItem>
                <DropdownItem
                  key="dms"
                  startContent={<span className="material-symbols-rounded text-sm">folder_open</span>}
                  onPress={() => router.push(`/admin/documents?caseId=${item.id}`)}
                >
                  Open E-File DMS
                </DropdownItem>
                <DropdownItem
                  key="noting"
                  startContent={<span className="material-symbols-rounded text-sm">edit_note</span>}
                  onPress={() => router.push(`/admin/communications/notings?caseId=${item.id}`)}
                >
                  Green Sheet Noting
                </DropdownItem>
                <DropdownItem
                  key="sync"
                  startContent={<span className="material-symbols-rounded text-sm">sync</span>}
                  onPress={() => triggerSyncModal(item)}
                >
                  Re-sync eCourts API
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );

        default:
          return <p className="text-xs">{item[columnKey as any]}</p>;
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
              <h1 className="text-base font-bold text-slate-900">2.1 Case Register (Writ Index)</h1>
              <p className="text-xs text-slate-500">
                Centralized database of High Court, Supreme Court & Tribunal petitions[cite: 1]
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                startContent={<span className="material-symbols-rounded text-sm">download</span>}
                onClick={() => alert("Generating consolidated Excel export for filtered records...")}
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
                  New Case Registration
                </Button>
              </Link>
            </div>
          </div>

          {/* Filter Status Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            <Chip
              size="sm"
              variant={selectedStatus === "ALL" ? "solid" : "flat"}
              className={`cursor-pointer text-xs font-semibold ${
                selectedStatus === "ALL" ? "bg-[#0f2744] text-white" : "bg-slate-100 text-slate-700"
              }`}
              onClick={() => setSelectedStatus("ALL")}
            >
              All Writs ({casesData.length})
            </Chip>
            <Chip
              size="sm"
              variant={selectedStatus === "STAY" ? "solid" : "flat"}
              color="danger"
              className="cursor-pointer text-xs font-semibold"
              onClick={() => setSelectedStatus("STAY")}
            >
              ⚠️ Stay in Force ({casesData.filter((c) => c.isStay).length})
            </Chip>
            <Chip
              size="sm"
              variant={selectedStatus === "CONTEMPT" ? "solid" : "flat"}
              color="danger"
              className="cursor-pointer text-xs font-semibold"
              onClick={() => setSelectedStatus("CONTEMPT")}
            >
              🔴 Contempt Alerts ({casesData.filter((c) => c.isContempt).length})
            </Chip>
          </div>

          {/* Search and Filters Bar */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search CNR, Writ No, Party, Notice..."
              value={tempFilter}
              onValueChange={setTempFilter}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50"
            />

            <Select
              size="sm"
              radius="sm"
              placeholder="Select Court"
              selectedKeys={[selectedCourt]}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="bg-slate-50"
            >
              <SelectItem key="ALL">All Courts</SelectItem>
              <SelectItem key="High Court Allahabad">High Court Allahabad</SelectItem>
              <SelectItem key="High Court Lucknow">High Court Lucknow</SelectItem>
            </Select>

            <Select
              size="sm"
              radius="sm"
              placeholder="Owning Wing / Section"
              selectedKeys={[selectedWing]}
              onChange={(e) => setSelectedWing(e.target.value)}
              className="bg-slate-50"
            >
              <SelectItem key="ALL">All Wings</SelectItem>
              <SelectItem key="Recruitment Wing">Recruitment Wing</SelectItem>
              <SelectItem key="Promotion Wing">Promotion Wing</SelectItem>
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
            aria-label="Comprehensive Case Register Table"
            className="min-w-full"
            bottomContent={
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <span className="text-xs text-slate-500">
                  Showing {(page - 1) * rowsPerPage + 1} to{" "}
                  {Math.min(page * rowsPerPage, filteredItems.length)} of {filteredItems.length} records
                </span>
                <Pagination
                  size="sm"
                  isCompact
                  showControls
                  total={Math.ceil(filteredItems.length / rowsPerPage) || 1}
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
            <TableBody items={items} emptyContent="No registered cases found matching your filters">
              {(item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isSyncOpen} onOpenChange={onSyncOpenChange} placement="top" size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">sync</span>
                Trigger Live eCourts Sync
              </ModalHeader>
              <ModalBody className="space-y-3 text-xs">
                <p className="text-slate-600">
                  You are about to query the official High Court CIS registry via NAPIX for:
                </p>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-1 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Case No:</span>
                    <span className="font-bold text-slate-800">{activeSyncCase?.caseNoYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CNR Number:</span>
                    <span className="font-mono font-bold text-blue-800">{activeSyncCase?.cnrNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Court Bench:</span>
                    <span className="text-slate-800">{activeSyncCase?.court}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  This background job pulls updated next hearing dates, judicial business summaries, and newly signed order PDFs.
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
                  onClick={executeSync}
                >
                  Poll Registry Now
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}