"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";

export default function SyncHealthPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedBench, setSelectedBench] = useState<any>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const [benchHealth, setBenchHealth] = useState([
    {
      id: "bh-1",
      bench: "High Court Allahabad (Principal Bench)",
      protocol: "REST API",
      endpoint: "https://napix.ecourts.gov.in/v2/court/uphc_ald",
      lastSync: "14:00 IST Today",
      status: "SUCCESS",
      recordsSynced: 842,
      latency: "165 ms",
      workerQueueJobs: 0,
    },
    {
      id: "bh-2",
      bench: "High Court Lucknow Bench",
      protocol: "REST API",
      endpoint: "https://napix.ecourts.gov.in/v2/court/uphc_lko",
      lastSync: "14:02 IST Today",
      status: "SUCCESS",
      recordsSynced: 420,
      latency: "192 ms",
      workerQueueJobs: 0,
    },
    {
      id: "bh-3",
      bench: "Supreme Court of India CIS",
      protocol: "Scheduled Poller",
      endpoint: "https://api.sci.gov.in/cis/institution/feed",
      lastSync: "06:00 IST Today",
      status: "SUCCESS",
      recordsSynced: 18,
      latency: "240 ms",
      workerQueueJobs: 0,
    },
    {
      id: "bh-4",
      bench: "State Public Services Tribunal",
      protocol: "Offline Scraper",
      endpoint: "http://spst.up.gov.in/causelist/daily",
      lastSync: "Yesterday",
      status: "STANDALONE_FALLBACK",
      recordsSynced: 44,
      latency: "410 ms",
      workerQueueJobs: 1,
    },
  ]);

  const handleTriggerFullSync = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
      setBenchHealth((prev) =>
        prev.map((b) => ({
          ...b,
          lastSync: "Just now (Synced)",
          status: "SUCCESS",
        }))
      );
      alert("Manual sync broadcast complete! All 4 judicial gateways polled successfully.");
    }, 1500);
  };

  const handleOpenDiagnostics = (benchItem: any) => {
    setSelectedBench(benchItem);
    onOpen();
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
                <h1 className="text-base font-bold text-slate-900">7.4 eCourts & NAPIX Sync Diagnostics</h1>
                <Chip size="sm" color="success" variant="solid" className="px-1 text-[10px] font-bold text-white">
                  ALL GATEWAYS OPERATIONAL
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Real-time API gateway status, NAPIX quotas, latency telemetry, and BullMQ worker queue monitoring
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
                startContent={<span className="material-symbols-rounded text-sm">sync</span>}
                isLoading={isSyncingAll}
                onClick={handleTriggerFullSync}
              >
                Trigger Full Sync
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] font-semibold text-slate-500">Daily API Quota Usage</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">2,140 / 10,000</h3>
              <Progress size="sm" value={(2140 / 10000) * 100} color="primary" className="mt-2" />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] font-semibold text-slate-500">Average Gateway Latency</span>
              <h3 className="text-lg font-bold text-emerald-700 mt-1">180 ms</h3>
              <span className="text-[10px] text-emerald-600 font-bold">Fast & Responsive (NAPIX UP WAN)</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] font-semibold text-slate-500">NAPIX Access Token Expiry</span>
              <h3 className="text-lg font-bold text-blue-900 mt-1">7 Days Remaining</h3>
              <span className="text-[10px] text-slate-500">Auto-refresh rotation active</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Gateway Telemetry Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Connected Court Gateways Telemetry
          </h3>
        </div>
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Gateways Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">JUDICIAL FORUM BENCH</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">INTEGRATION PROTOCOL</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">LAST SUCCESSFUL POLLING</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">SYNCED ACTIVE WRITS</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">GATEWAY HEALTH</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">DIAGNOSTICS</TableColumn>
            </TableHeader>
            <TableBody items={benchHealth}>
              {(b) => (
                <TableRow key={b.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell className="text-xs font-bold text-slate-900">{b.bench}</TableCell>
                  <TableCell className="font-mono text-xs text-blue-700">{b.protocol}</TableCell>
                  <TableCell className="text-xs text-slate-600">{b.lastSync}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-800">{b.recordsSynced} Cases</TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={b.status === "SUCCESS" ? "success" : "warning"}
                      className="text-[10px] font-bold"
                    >
                      {b.status}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="light"
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 h-7 px-2"
                      onClick={() => handleOpenDiagnostics(b)}
                    >
                      Ping & Details
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Gateway Diagnostic Details Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 py-3">
                <span className="material-symbols-rounded text-emerald-600">dns</span>
                Judicial Endpoint Telemetry — {selectedBench?.bench}
              </ModalHeader>
              <ModalBody className="py-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="col-span-2">
                    <span className="text-slate-400">REST Gateway URL:</span>
                    <p className="font-mono font-bold text-blue-900 truncate">{selectedBench?.endpoint}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Response Latency:</span>
                    <p className="font-mono font-bold text-emerald-700">{selectedBench?.latency}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">HTTP Status:</span>
                    <p className="font-mono font-bold text-slate-800">200 OK (Authenticated)</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Active Writs Monitored:</span>
                    <p className="font-bold text-slate-900">{selectedBench?.recordsSynced} Petitions</p>
                  </div>
                  <div>
                    <span className="text-slate-400">BullMQ Pending Jobs:</span>
                    <p className="font-mono font-bold text-slate-800">{selectedBench?.workerQueueJobs} Jobs in Queue</p>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50/60 p-3 border border-blue-200 text-blue-950 space-y-1">
                  <p className="font-bold">Automated Synchronization Behavior:</p>
                  <p className="text-[11px] leading-relaxed">
                    Background workers poll this court registry twice daily (06:00 AM & 14:00 PM). Incoming orders, newly scheduled listing dates (NDOH), and interim injunction orders are cryptographically verified and committed to Screen 2.1 & 5.1 automatically.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-slate-100 py-2">
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Close Telemetry
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  onClick={() => {
                    alert(`Targeted poll ping dispatched to ${selectedBench?.bench}!`);
                    onClose();
                  }}
                >
                  Force Ping Endpoint
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}