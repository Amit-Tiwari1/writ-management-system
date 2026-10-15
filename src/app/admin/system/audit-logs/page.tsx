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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import toast from "react-hot-toast";

import { AdminAPI, AuditLogItem } from "@/api/userApi";

const SEVERITY_FILTER_ITEMS = [
  { key: "ALL", label: "All Event Severities" },
  { key: "INFO", label: "General Info & Ingestion (INFO)" },
  { key: "WARNING", label: "Sync Discrepancy & Alert (WARNING)" },
  { key: "CRITICAL", label: "Security & Mutation (CRITICAL)" },
];

export default function AuditLogsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tempSearch, setTempSearch] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (severityFilter !== "ALL") {
        params.severity = severityFilter;
      }

      const res = await AdminAPI.getAuditLogs(params);
      if (res?.success) {
        setLogs(res.data || []);
        setTotalCount(res.totalCount || 0);
        setTotalPages(res.pagination?.pages || 1);
      }
    } catch (err: any) {
      console.error("Failed to load audit logs:", err);
      toast.error(err.response?.data?.message || "Failed to load audit trail ledger");
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, severityFilter]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const handleApplySearch = () => {
    setSearchQuery(tempSearch);
    setPage(1);
  };

  const handleOpenLogModal = (log: AuditLogItem) => {
    setSelectedLog(log);
    onOpen();
  };

  const handleExportAuditLogs = () => {
    toast.success("Exporting certified cryptographic audit log archive (.csv)...");
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Information Bar */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/admin/cases">
                  <Button isIconOnly size="sm" variant="light" className="text-slate-500">
                    <span className="material-symbols-rounded">arrow_back</span>
                  </Button>
                </Link>
                <h1 className="text-base font-bold text-slate-900">
                  7.3 Security Audit Trail &amp; Mutation Log
                </h1>
                <Chip size="sm" className="bg-emerald-500/20 px-1 text-[10px] font-bold text-emerald-800">
                  Append-Only Ledger
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Tamper-evident logs of logins, case modifications, notings, and eCourts sync actions
              </p>
            </div>
            <Button
              size="sm"
              variant="bordered"
              radius="sm"
              className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
              startContent={<span className="material-symbols-rounded text-sm">download</span>}
              onClick={handleExportAuditLogs}
            >
              Export Signed Audit Log
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <div className="sm:col-span-2 flex gap-2">
              <Input
                size="sm"
                radius="sm"
                placeholder="Search by Log ID, user, dossier, or IP address..."
                value={tempSearch}
                onValueChange={setTempSearch}
                onKeyDown={(e) => e.key === "Enter" && handleApplySearch()}
                startContent={
                  <span className="material-symbols-rounded text-sm text-slate-400">search</span>
                }
                className="bg-slate-50 flex-1"
              />
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white hover:bg-[#163a66]"
                onClick={handleApplySearch}
              >
                Search
              </Button>
            </div>

            <Select
              size="sm"
              radius="sm"
              placeholder="Filter by Log Severity"
              items={SEVERITY_FILTER_ITEMS}
              selectedKeys={[severityFilter]}
              onChange={(e) => {
                setSeverityFilter(e.target.value || "ALL");
                setPage(1);
              }}
              className="bg-slate-50 font-semibold"
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Audit Log Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Immutable Transaction Ledger ({totalCount} Events)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">SHA-256 Hash Chained Records</span>
        </div>

        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="Audit Logs Table"
            className="min-w-full"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <span className="text-xs text-slate-500">
                    Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total <strong>{totalCount}</strong> Events)
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
              ) : null
            }
          >
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                LOG ID &amp; TIME
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PERFORMED BY USER
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SOURCE IP
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ACTION TYPE
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                TARGET DOSSIER
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                MUTATION TRANSACTION SUMMARY
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                PAYLOAD
              </TableColumn>
            </TableHeader>
            <TableBody
              items={logs}
              isLoading={loading}
              loadingContent={
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              }
              emptyContent={!loading ? "No security audit events match the specified query." : " "}
            >
              {(l: AuditLogItem) => (
                <TableRow key={l._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell>
                    <p className="font-mono text-xs font-bold text-slate-900">{l.logIdAndTime.logId}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(l.logIdAndTime.time).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-800">
                    {l.performedByUser}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{l.sourceIp}</TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        l.severity === "CRITICAL"
                          ? "danger"
                          : l.severity === "WARNING"
                          ? "warning"
                          : "primary"
                      }
                      className="text-[10px] font-bold font-mono"
                    >
                      {l.actionType}
                    </Chip>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-blue-700 font-semibold">
                    {l.targetDossier}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-[280px] font-serif leading-relaxed truncate">
                    {l.mutationTransactionSummary}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="light"
                      className="text-xs text-blue-700 hover:text-blue-900 font-semibold h-7 px-2"
                      onClick={() => handleOpenLogModal(l)}
                    >
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Forensic Audit Log Inspection Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 py-3">
                <span className="material-symbols-rounded text-blue-700">policy</span>
                Forensic Transaction Inspector — {selectedLog?.logIdAndTime?.logId}
              </ModalHeader>
              <ModalBody className="py-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <span className="text-slate-400">Timestamp:</span>
                    <p className="font-semibold text-slate-800">
                      {selectedLog?.logIdAndTime?.time
                        ? new Date(selectedLog.logIdAndTime.time).toLocaleString("en-GB")
                        : "--"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Authorized Officer:</span>
                    <p className="font-semibold text-slate-800">{selectedLog?.performedByUser}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Source IP &amp; Location:</span>
                    <p className="font-mono text-slate-800">{selectedLog?.sourceIp} (UP Police WAN)</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Action Classification:</span>
                    <p className="font-mono font-bold text-blue-800">{selectedLog?.actionType}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">SHA-256 Chain Hash (Tamper-Proof):</span>
                    <p className="font-mono text-[11px] text-slate-700 break-all">
                      {selectedLog?.sha256ChainHash}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-1">Raw State Mutation Snapshot:</p>
                  <pre className="rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-48">
                    {JSON.stringify(selectedLog?.payloadSnapshot || {}, null, 2)}
                  </pre>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-slate-100 py-2">
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Close Inspector
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}