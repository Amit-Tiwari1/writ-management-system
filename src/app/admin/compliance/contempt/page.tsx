"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ContemptRadarPage() {
  const router = useRouter();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onOpenChange: onAlertOpenChange } = useDisclosure();
  const [isAlertSending, setIsAlertSending] = useState(false);

  const contemptMatters = [
    {
      id: "c1",
      caseId: "2", // Links to active case in 2.1
      contemptCaseNo: "CONTEMPT / 312 / 2026",
      origWritNo: "WRIT-A / 1102 / 2025",
      courtBench: "High Court Lucknow Bench",
      petitioner: "Abhay Gupta",
      respondent: "Chairman UPPRPB (Contemnor)",
      judicialCommand: "Decide representation dated 10-02-2025 by reasoned & speaking order within 6 weeks",
      totalDaysGranted: 42,
      daysElapsed: 39,
      daysRemaining: 3,
      riskLevel: "CRITICAL_RED",
      handlingOfficer: "SP Legal / Addl. Secy",
      complianceStatus: "Order Drafted, Awaiting Signature",
    },
    {
      id: "c2",
      caseId: "1",
      contemptCaseNo: "CONTEMPT / 88 / 2026",
      origWritNo: "WRIT-A / 4012 / 2025",
      courtBench: "High Court Allahabad",
      petitioner: "Manoj Yadav",
      respondent: "Member Secretary (Contemnor)",
      judicialCommand: "Re-conduct physical measurement test (PST) in presence of CMO within 4 weeks",
      totalDaysGranted: 28,
      daysElapsed: 22,
      daysRemaining: 6,
      riskLevel: "HIGH_AMBER",
      handlingOfficer: "DySP Promotion",
      complianceStatus: "Board Notice Issued to Candidate",
    },
    {
      id: "c3",
      caseId: "3",
      contemptCaseNo: "CONTEMPT / 401 / 2026",
      origWritNo: "WRIT-A / 9001 / 2024",
      courtBench: "High Court Allahabad",
      petitioner: "S.K. Mishra",
      respondent: "Director General of Police / Board",
      judicialCommand: "Release arrears of pay & seniority benefit within 2 months",
      totalDaysGranted: 60,
      daysElapsed: 44,
      daysRemaining: 16,
      riskLevel: "NORMAL",
      handlingOfficer: "Senior Accounts Officer",
      complianceStatus: "Calculation Underway in Accounts Wing",
    },
  ];

  const handleSendEscalations = () => {
    setIsAlertSending(true);
    setTimeout(() => {
      setIsAlertSending(false);
      onAlertOpenChange();
      alert("Emergency Level-3 Escalation dispatched to Board Chairman, DG & Legal OIC via SMS Gateway!");
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
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
                <h1 className="text-base font-bold text-slate-900">5.2 Contempt Risk Radar</h1>
                <Chip size="sm" className="bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {contemptMatters.length} Show Cause Matters
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Real-time compliance countdown engine preventing personal appearances and adverse judicial observations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                radius="sm"
                className="bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700 shadow-sm"
                startContent={<span className="material-symbols-rounded text-sm">notification_important</span>}
                onClick={onAlertOpen}
              >
                Trigger Red-Zone SMS Alerts
              </Button>
            </div>
          </div>

          {/* 3-Level Automated Escalation Pathway Indicator */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Level 1: 14 Days Remaining
              </span>
              <p className="text-xs text-slate-700 font-medium mt-1">Automatic alert to Desk Officer & Handling Section</p>
            </div>
            <div className="rounded-lg border border-orange-200 bg-orange-50/60 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
                Level 2: 7 Days Remaining
              </span>
              <p className="text-xs text-slate-700 font-medium mt-1">Urgent escalation to HOD & Officer-in-Charge</p>
            </div>
            <div className="rounded-lg border border-rose-300 bg-rose-50 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                Level 3: Critical (&lt; 3 Days)
              </span>
              <p className="text-xs text-rose-900 font-bold mt-1">Red-Zone briefing to Board Chairman / DG</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Table Grid */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Contempt cases radar table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                RISK SEVERITY
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CONTEMPT CASE & WRIT
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PETITIONER & CONTEMNOR
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                COURT DIRECTIONS / COMMAND
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                COUNTDOWN (DAYS REMAINING)
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                COMPLIANCE PROGRESS
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                ACTION
              </TableColumn>
            </TableHeader>
            <TableBody items={contemptMatters}>
              {(item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell>
                    {item.riskLevel === "CRITICAL_RED" && (
                      <Chip size="sm" color="danger" variant="solid" className="text-[10px] font-bold animate-pulse">
                        CRITICAL &lt; 3D
                      </Chip>
                    )}
                    {item.riskLevel === "HIGH_AMBER" && (
                      <Chip size="sm" color="warning" variant="solid" className="text-[10px] font-bold text-white">
                        HIGH WARNING
                      </Chip>
                    )}
                    {item.riskLevel === "NORMAL" && (
                      <Chip size="sm" color="primary" variant="flat" className="text-[10px] font-bold">
                        MONITORED
                      </Chip>
                    )}
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/admin/cases/${item.caseId}`}
                      className="font-mono text-xs font-bold text-rose-700 hover:underline"
                    >
                      {item.contemptCaseNo}
                    </Link>
                    <p className="text-[10px] text-slate-400">Orig: {item.origWritNo}</p>
                    <p className="text-[10px] text-slate-500">{item.courtBench}</p>
                  </TableCell>

                  <TableCell>
                    <p className="text-xs font-semibold text-slate-900">{item.petitioner}</p>
                    <p className="text-[11px] font-bold text-slate-700">vs {item.respondent}</p>
                  </TableCell>

                  <TableCell className="max-w-[240px]">
                    <p className="text-xs text-slate-700 leading-relaxed font-serif">{item.judicialCommand}</p>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-rose-700">{item.daysRemaining} Days Left</span>
                        <span className="text-[10px] text-slate-400">of {item.totalDaysGranted}d</span>
                      </div>
                      <Progress
                        size="sm"
                        value={(item.daysElapsed / item.totalDaysGranted) * 100}
                        color={item.riskLevel === "CRITICAL_RED" ? "danger" : "warning"}
                        className="h-1.5"
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="text-xs font-semibold text-slate-800">{item.complianceStatus}</p>
                    <p className="text-[10px] text-slate-400">OIC: {item.handlingOfficer}</p>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      radius="sm"
                      className="bg-emerald-600 text-[11px] font-semibold text-white hover:bg-emerald-700 h-7 px-2"
                      onClick={() => router.push(`/admin/compliance/archive?caseId=${item.caseId}`)}
                    >
                      Submit Proof
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Red-Zone SMS Broadcast Modal */}
      <Modal isOpen={isAlertOpen} onOpenChange={onAlertOpenChange} placement="top" size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">notification_important</span>
                Trigger Level-3 Emergency Contempt Alerts
              </ModalHeader>
              <ModalBody className="space-y-3 text-xs">
                <div className="rounded-lg bg-rose-50 p-3 border border-rose-200 text-rose-950 font-medium">
                  <p className="font-bold">CRITICAL WARNING:</p>
                  <p className="mt-1">
                    CONTEMPT / 312 / 2026 has less than <b>3 days remaining</b> before judicial show-cause deadline expires.
                  </p>
                </div>
                <p className="text-slate-600">
                  This action will immediately transmit high-priority SMS & WhatsApp dispatch to:
                </p>
                <div className="rounded border border-slate-200 bg-slate-50 p-2.5 space-y-1 font-mono text-[11px]">
                  <div>• DG / Chairman Board (Apex Monitoring)</div>
                  <div>• Member Secretary / ADG (Administration)</div>
                  <div>• SP Legal / OIC (Drafting Desk)</div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  isLoading={isAlertSending}
                  onClick={handleSendEscalations}
                >
                  Confirm & Broadcast
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}