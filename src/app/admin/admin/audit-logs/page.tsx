"use client";

import React, { useState, useMemo } from "react";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";

export default function AuditLogsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const [logs] = useState([
    {
      id: "LOG-9921",
      timestamp: "16 Sep 2026, 14:02:11",
      user: "V. Sharma (Registry Officer)",
      ipAddress: "103.49.206.85",
      action: "CASE_REGISTRATION",
      targetEntity: "WRIT-A / 4012 / 2026",
      mutationDetails: "Registered fresh case via eCourts CNR auto-fetch; file PRPB-R/938/2026 issued",
      severity: "INFO",
      tokenHash: "AUTH-JWT-2026-9912048821a",
      fullPayload: JSON.stringify(
        {
          cnr: "UPHC010029312026",
          docket: "PRPB-R/938/2026",
          petitioner: "Abhay Gupta & 4 Others",
          court: "High Court Allahabad",
          status: "PWC Awaited",
        },
        null,
        2
      ),
    },
    {
      id: "LOG-9920",
      timestamp: "16 Sep 2026, 11:45:00",
      user: "SP Legal (Cell-1)",
      ipAddress: "10.0.12.44",
      action: "DIGITAL_SIGN_NOTE",
      targetEntity: "Noting Minute #3",
      mutationDetails: "Digitally signed Minute #3 approving Para-Wise Comments (PWC)",
      severity: "SECURITY",
      tokenHash: "DSC-CERT-SPLEGAL-8891241",
      fullPayload: JSON.stringify(
        {
          minuteNo: 3,
          signer: "Superintendent of Police (Legal)",
          hash: "SP-LEGAL-7721",
          lawApproved: "Civil Service Conduct Rules 1991",
        },
        null,
        2
      ),
    },
    {
      id: "LOG-9919",
      timestamp: "16 Sep 2026, 09:15:32",
      user: "System Daemon (eCourts Poller)",
      ipAddress: "127.0.0.1",
      action: "SYNC_STATUS_UPDATE",
      targetEntity: "WRIT-A / 7100 / 2025",
      mutationDetails: "Detected court discrepancy: Next hearing listed on 30-Sep-2026",
      severity: "WARNING",
      tokenHash: "NAPIX-DAEMON-CRON-4412",
      fullPayload: JSON.stringify(
        {
          cnr: "UPHC010089212025",
          source: "High Court Allahabad CIS Scraper",
          ndohOld: "15-Sep-2026",
          ndohNew: "30-Sep-2026",
          flag: "DISCREPANCY_NOTIFIED",
        },
        null,
        2
      ),
    },
    {
      id: "LOG-9918",
      timestamp: "15 Sep 2026, 17:30:19",
      user: "Swahleen Ahmad (SI)",
      ipAddress: "103.49.206.85",
      action: "DOCUMENT_UPLOAD",
      targetEntity: "MinIO S3",
      mutationDetails: "Uploaded 01_Petitions_and_Annexures/Original_Writ_Petition.pdf (SHA-256 verified)",
      severity: "INFO",
      tokenHash: "S3-UPLOAD-AUTH-110294",
      fullPayload: JSON.stringify(
        {
          fileName: "Original_Writ_Petition_Filed_4012_2026.pdf",
          size: "4.2 MB",
          hash: "sha256:9f83ab20419c8821",
          bucket: "upprpb-legal-dms",
        },
        null,
        2
      ),
    },
  ]);

  const handleOpenLogModal = (log: any) => {
    setSelectedLog(log);
    onOpen();
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.mutationDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.ipAddress.includes(searchQuery);

      const matchesSeverity =
        severityFilter === "ALL" || l.severity === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [logs, searchQuery, severityFilter]);

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
                <h1 className="text-base font-bold text-slate-900">7.3 Security Audit Trail & Mutation Log</h1>
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
              onClick={() => alert("Exporting cryptographic signed audit log archive (.csv.sig)...")}
            >
              Export Signed Audit Log
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search by Log ID, user, dossier, or IP address..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50 sm:col-span-2"
            />
            <Select
              size="sm"
              radius="sm"
              placeholder="Filter by Log Severity"
              selectedKeys={[severityFilter]}
              onChange={(e) => setSeverityFilter(e.target.value || "ALL")}
              className="bg-slate-50 font-semibold"
            >
              <SelectItem key="ALL">All Event Severities</SelectItem>
              <SelectItem key="SECURITY">Security / Digital Signature</SelectItem>
              <SelectItem key="WARNING">Warning / Sync Discrepancy</SelectItem>
              <SelectItem key="INFO">General Information & Uploads</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Audit Log Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Immutable Transaction Ledger ({filteredLogs.length} Events)
          </h3>
          <span className="text-[11px] text-slate-400">SHA-256 Hash Chained Records</span>
        </div>

        <CardBody className="p-0">
          <Table removeWrapper aria-label="Audit Logs Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">LOG ID & TIME</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">PERFORMED BY USER</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">SOURCE IP</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">ACTION TYPE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">TARGET DOSSIER</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">MUTATION TRANSACTION SUMMARY</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">PAYLOAD</TableColumn>
            </TableHeader>
            <TableBody items={filteredLogs} emptyContent="No security audit events match the specified query.">
              {(l) => (
                <TableRow key={l.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell>
                    <p className="font-mono text-xs font-bold text-slate-900">{l.id}</p>
                    <p className="text-[10px] text-slate-400">{l.timestamp}</p>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-800">{l.user}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{l.ipAddress}</TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={l.severity === "SECURITY" ? "success" : l.severity === "WARNING" ? "warning" : "primary"}
                      className="text-[10px] font-bold font-mono"
                    >
                      {l.action}
                    </Chip>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-blue-700 font-semibold">{l.targetEntity}</TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-[280px] font-serif leading-relaxed truncate">
                    {l.mutationDetails}
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
                Forensic Transaction Inspector — {selectedLog?.id}
              </ModalHeader>
              <ModalBody className="py-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <span className="text-slate-400">Timestamp:</span>
                    <p className="font-semibold text-slate-800">{selectedLog?.timestamp}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Authorized Officer:</span>
                    <p className="font-semibold text-slate-800">{selectedLog?.user}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Source IP & Location:</span>
                    <p className="font-mono text-slate-800">{selectedLog?.ipAddress} (UP Police WAN)</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Action Classification:</span>
                    <p className="font-mono font-bold text-blue-800">{selectedLog?.action}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Cryptographic Auth Hash:</span>
                    <p className="font-mono text-[11px] text-slate-700">{selectedLog?.tokenHash}</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-1">Raw JSON Event Payload (State Mutation):</p>
                  <pre className="rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-48">
                    {selectedLog?.fullPayload}
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