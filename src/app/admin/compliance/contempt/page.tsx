"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { ComplianceAPI, ContemptRadarItem } from "@/api/complianceApi";

export default function ContemptRadarPage() {
  const router = useRouter();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onOpenChange: onAlertOpenChange } = useDisclosure();

  const [contemptList, setContemptList] = useState<ContemptRadarItem[]>([]);
  const [summary, setSummary] = useState({
    totalShowCauseMatters: 0,
    level3CriticalUnder3Days: 0,
    level2HighWarningUnder7Days: 0,
    level1MonitoredUnder14Days: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isAlertSending, setIsAlertSending] = useState<boolean>(false);

  // 1. Fetch Real Contempt Risk Radar Data from Backend
  const loadContemptData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ComplianceAPI.getContemptRadar();
      if (res?.success) {
        setContemptList(res.data || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err: any) {
      console.error("Failed to load contempt radar:", err);
      toast.error(err.response?.data?.message || "Failed to load contempt radar data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContemptData();
  }, [loadContemptData]);

  // 2. Trigger Level-3 Emergency SMS/Email Broadcast via Backend
  const handleSendEscalations = async () => {
    setIsAlertSending(true);
    try {
      const res = await ComplianceAPI.triggerRedZoneAlerts();
      if (res?.success) {
        toast.success(
          res.message || "Emergency Level-3 Escalation dispatched to Board Chairman, DG & Legal OIC!",
          { duration: 5000, icon: "🚨" }
        );
        onAlertOpenChange();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to dispatch SMS alerts");
    } finally {
      setIsAlertSending(false);
    }
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
                  {summary.totalShowCauseMatters} Show Cause Matters
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
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Level 1: 14 Days Remaining
                </span>
                <Chip size="sm" variant="flat" color="warning" className="h-4 text-[9px] font-bold">
                  {summary.level1MonitoredUnder14Days} Cases
                </Chip>
              </div>
              <p className="text-xs text-slate-700 font-medium mt-1">Automatic alert to Desk Officer &amp; Handling Section</p>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50/60 p-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
                  Level 2: 7 Days Remaining
                </span>
                <Chip size="sm" variant="flat" color="warning" className="h-4 text-[9px] font-bold">
                  {summary.level2HighWarningUnder7Days} Cases
                </Chip>
              </div>
              <p className="text-xs text-slate-700 font-medium mt-1">Urgent escalation to HOD &amp; Officer-in-Charge</p>
            </div>

            <div className="rounded-lg border border-rose-300 bg-rose-50 p-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                  Level 3: Critical (&lt; 3 Days)
                </span>
                <Chip size="sm" variant="solid" color="danger" className="h-4 text-[9px] font-bold">
                  {summary.level3CriticalUnder3Days} Cases
                </Chip>
              </div>
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
                CONTEMPT CASE &amp; WRIT
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PETITIONER &amp; CONTEMNOR
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
            <TableBody
              items={contemptList}
              isLoading={loading}
              loadingContent={
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              }
              emptyContent={!loading ? "No pending contempt show-cause notices. Compliance matrix green." : " "}
            >
              {(item: ContemptRadarItem) => {
                const totalDays = item.countdown?.totalDays || 42;
                const daysLeft = item.countdown?.daysRemaining || 0;
                const daysElapsed = Math.max(0, totalDays - daysLeft);
                const progressPercent = Math.min(100, (daysElapsed / totalDays) * 100);

                return (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell>
                      {item.severity === "CRITICAL" && (
                        <Chip size="sm" color="danger" variant="solid" className="text-[10px] font-bold animate-pulse">
                          CRITICAL &lt; 3D
                        </Chip>
                      )}
                      {item.severity === "HIGH_WARNING" && (
                        <Chip size="sm" color="warning" variant="solid" className="text-[10px] font-bold text-white">
                          HIGH WARNING
                        </Chip>
                      )}
                      {item.severity === "MONITORED" && (
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
                        {item.contemptCaseAndWrit?.contemptNumber}
                      </Link>
                      <p className="text-[10px] text-slate-400">Orig: {item.contemptCaseAndWrit?.originalWrit}</p>
                      <p className="text-[10px] text-slate-500">{item.contemptCaseAndWrit?.court}</p>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs font-semibold text-slate-900">{item.petitionerAndContemnor?.petitioner}</p>
                      <p className="text-[11px] font-bold text-slate-700">vs {item.petitionerAndContemnor?.contemnor}</p>
                    </TableCell>

                    <TableCell className="max-w-[240px]">
                      <p className="text-xs text-slate-700 leading-relaxed font-serif">{item.courtDirections}</p>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={`font-bold ${daysLeft <= 3 ? "text-rose-700" : daysLeft <= 7 ? "text-amber-700" : "text-blue-700"}`}>
                            {daysLeft} Days Left
                          </span>
                          <span className="text-[10px] text-slate-400">of {totalDays}d</span>
                        </div>
                        <Progress
                          size="sm"
                          value={progressPercent}
                          color={daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "primary"}
                          className="h-1.5"
                        />
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs font-semibold text-slate-800">{item.complianceProgress}</p>
                      <p className="text-[10px] text-slate-400">OIC: {item.oic}</p>
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
                );
              }}
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
                  <p className="font-bold">CRITICAL ESCALATION PROTOCOL:</p>
                  <p className="mt-1">
                    There are <b>{summary.level3CriticalUnder3Days} contempt matters</b> having less than 3 days remaining before personal appearance orders are issued.
                  </p>
                </div>
                <p className="text-slate-600">
                  This action triggers high-priority SMS &amp; WhatsApp dispatch to:
                </p>
                <div className="rounded border border-slate-200 bg-slate-50 p-2.5 space-y-1 font-mono text-[11px]">
                  <div>• DG / Chairman Board (Apex Monitoring)</div>
                  <div>• Member Secretary / ADG (Administration)</div>
                  <div>• SP Legal / Designated OICs (Compliance Desks)</div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isAlertSending}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  isLoading={isAlertSending}
                  onClick={handleSendEscalations}
                >
                  Confirm &amp; Broadcast
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}