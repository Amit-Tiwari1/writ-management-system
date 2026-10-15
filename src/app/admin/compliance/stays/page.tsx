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
  Input,
  Textarea,
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

import { ComplianceAPI, ActiveStayItem } from "@/api/complianceApi";

export default function ActiveStaysRosterPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedStay, setSelectedStay] = useState<ActiveStayItem | null>(null);

  const [staysData, setStaysData] = useState<ActiveStayItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalActiveStays: 0,
    vacationMotionsDueUnder7Days: 0,
    vacationApplicationsFiled: 0,
    averageStayDurationDays: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [standingCounsel, setStandingCounsel] = useState("Chief Standing Counsel (HC Allahabad)");
  const [filingDate, setFilingDate] = useState(new Date().toISOString().split("T")[0]);
  const [urgencyReasons, setUrgencyReasons] = useState(
    "Recruitment examination process for Constable posts is halted. Administrative hardship and public interest demand immediate vacation of interim order under Article 226(3)."
  );

  const loadStays = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ComplianceAPI.getActiveStays();
      if (res?.success) {
        setStaysData(res.data || []);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err: any) {
      console.error("Failed to load stays roster:", err);
      toast.error(err.response?.data?.message || "Failed to load active stays roster");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStays();
  }, [loadStays]);

  const handleOpenDraftModal = (stayItem: ActiveStayItem) => {
    setSelectedStay(stayItem);
    onOpen();
  };

  const handleConfirmVacationDraft = async (onClose: () => void) => {
    if (!selectedStay) return;
    setIsSubmitting(true);
    try {
      const res = await ComplianceAPI.updateVacationMotion(selectedStay._id, {
        vacationMotionStatus: "VACATION_FILED",
        vacationFilingDate: filingDate,
      });

      if (res?.success) {
        toast.success(
          `Vacation Application under Article 226(3) dispatched to ${standingCounsel}!`,
          { duration: 5000, icon: "⚖️" }
        );
        onClose();
        loadStays();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update vacation motion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
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
                <h1 className="text-base font-bold text-slate-900">5.1 Active Stays Roster</h1>
                <Chip size="sm" className="bg-rose-500/20 px-1 text-[10px] font-bold text-rose-700">
                  {metrics.totalActiveStays} Injunctions Active
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Track interim court stay orders, operational injunctions &amp; Article 226(3) vacation motions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                startContent={<span className="material-symbols-rounded text-sm">download</span>}
                onClick={() => toast.success("Exporting certified Active Stays MIS (Excel)...")}
              >
                Export Stay MIS
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
              <p className="text-[11px] font-semibold text-rose-700">Vacation Motions Due (&lt; 7 Days)</p>
              <h3 className="text-xl font-bold text-rose-900">
                {String(metrics.vacationMotionsDueUnder7Days).padStart(2, "0")}
              </h3>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <p className="text-[11px] font-semibold text-emerald-700">Vacation Applications Filed</p>
              <h3 className="text-xl font-bold text-emerald-900">
                {String(metrics.vacationApplicationsFiled).padStart(2, "0")}
              </h3>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
              <p className="text-[11px] font-semibold text-blue-700">Average Stay Duration</p>
              <h3 className="text-xl font-bold text-blue-900">{metrics.averageStayDurationDays} Days</h3>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Active stays table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CASE &amp; CNR NO.
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                COURT &amp; CORAM
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                STAY ORDER SCOPE
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ORDER DATE &amp; DURATION
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                VACATION MOTION STATUS
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                OIC
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                ACTION
              </TableColumn>
            </TableHeader>
            <TableBody
              items={staysData}
              isLoading={loading}
              loadingContent={
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              }
              emptyContent={!loading ? "No active judicial stays in force. All examination/recruitment heads clear." : " "}
            >
              {(item) => (
                <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell>
                    <Link
                      href={`/admin/cases/${item.caseId}`}
                      className="font-mono text-xs font-bold text-slate-900 hover:text-blue-700 hover:underline"
                    >
                      {item.caseAndCnr?.writNumber || item.caseAndCnr?.fileNo}
                    </Link>
                    <p className="font-mono text-[10px] text-slate-400">{item.caseAndCnr?.cnrNumber || "CNR Unassigned"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-slate-800">{item.courtAndCoram?.court}</p>
                    <p className="text-[10px] text-slate-500">{item.courtAndCoram?.coram || "--"}</p>
                  </TableCell>
                  <TableCell className="max-w-[260px]">
                    <p className="text-xs text-rose-900 font-semibold leading-relaxed">{item.stayOrderScope || "Interim stay in force"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold text-slate-800">
                      {item.orderDateAndDuration?.orderDate
                        ? new Date(item.orderDateAndDuration.orderDate).toLocaleDateString("en-GB")
                        : "--"}
                    </p>
                    <Chip size="sm" variant="flat" color="danger" className="text-[10px] font-bold h-4 px-1">
                      {item.orderDateAndDuration?.stayDurationDays || 0} Days Active
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          item.vacationMotionStatus === "VACATION_FILED" ||
                          item.vacationMotionStatus === "LISTED FOR ARGUMENTS"
                            ? "success"
                            : item.vacationMotionStatus === "URGENT ACTION REQUIRED"
                            ? "danger"
                            : "warning"
                        }
                        className="text-[10px] font-bold"
                      >
                        {item.vacationMotionStatus.replace(/_/g, " ")}
                      </Chip>
                      <p className="text-[10px] text-slate-400">
                        Deadline:{" "}
                        {item.vacationDeadline
                          ? new Date(item.vacationDeadline).toLocaleDateString("en-GB")
                          : "Art 226(3) Pending"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-medium">{item.oic}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      radius="sm"
                      className="bg-[#0f2744] text-[11px] font-semibold text-white hover:bg-[#163a66] h-7 px-2"
                      onClick={() => handleOpenDraftModal(item)}
                    >
                      Draft Vacation
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">gavel</span>
                Application for Vacation of Stay (Article 226(3)) — {selectedStay?.caseAndCnr?.writNumber}
              </ModalHeader>
              <ModalBody className="space-y-4 text-xs">
                <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-900 border border-rose-200">
                  <p className="font-bold">Interim Order Scope in Force:</p>
                  <p className="mt-1 font-serif text-[11px] leading-relaxed">{selectedStay?.stayOrderScope}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    size="sm"
                    label="Assigned Standing Counsel"
                    labelPlacement="outside"
                    value={standingCounsel}
                    onValueChange={setStandingCounsel}
                    isRequired
                  />
                  <Input
                    size="sm"
                    label="Proposed Filing Date"
                    labelPlacement="outside"
                    type="date"
                    value={filingDate}
                    onValueChange={setFilingDate}
                    isRequired
                  />
                </div>

                <Textarea
                  size="sm"
                  minRows={3}
                  label="Urgency &amp; Grounds for Vacation"
                  labelPlacement="outside"
                  value={urgencyReasons}
                  onValueChange={setUrgencyReasons}
                  placeholder="Specify statutory grounds under Article 226(3)..."
                  isRequired
                />

                <div className="rounded-lg bg-blue-50/60 p-2.5 border border-blue-200 text-blue-900 text-[11px]">
                  <b>Automatic Action:</b> Submitting this draft will automatically update the tracking status in the
                  Active Stays Roster and alert the designated Officer-in-Charge.
                </div>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-emerald-700 font-semibold text-white hover:bg-emerald-800"
                  isLoading={isSubmitting}
                  onClick={() => handleConfirmVacationDraft(onClose)}
                >
                  Generate &amp; Send to Counsel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}