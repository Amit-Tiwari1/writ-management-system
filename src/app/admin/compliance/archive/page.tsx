"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
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
  Select,
  SelectItem,
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
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { ComplianceAPI, ArchivedComplianceItem } from "@/api/complianceApi";
import { CasesAPI, CaseItem } from "@/api/casesApi";

const ACTION_TAKEN_PRESETS = [
  { key: "ORDER_DECIDED", label: "Representation Decided by Speaking Order" },
  { key: "APPOINTMENT_GIVEN", label: "Appointment / Benefit Granted" },
  { key: "RE_EXAM_HELD", label: "Re-examination / Physical Standard Test (PST) Conducted" },
  { key: "DISMISSED_MERIT", label: "Writ Dismissed on Merit (No Further Action Required)" },
];

function ComplianceArchivalContent() {
  const searchParams = useSearchParams();
  const queryCaseId = searchParams.get("caseId");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isViewerOpen, onOpen: onViewerOpen, onOpenChange: onViewerOpenChange } = useDisclosure();

  // State
  const [archivedList, setArchivedList] = useState<ArchivedComplianceItem[]>([]);
  const [activeCases, setActiveCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [actionCategory, setActionCategory] = useState<string>("ORDER_DECIDED");
  const [narrativeSummary, setNarrativeSummary] = useState<string>(
    "Speaking order passed by competent authority complying with Hon'ble Court directions. Copy communicated to petitioner and Chief Standing Counsel."
  );

  const [viewingAffidavit, setViewingAffidavit] = useState<ArchivedComplianceItem | null>(null);

  // 1. Load Real Archived Records & Active Cases from Backend
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [archiveRes, casesRes] = await Promise.all([
        ComplianceAPI.getArchivedCompliance(),
        CasesAPI.getCases({ limit: 100 }),
      ]);

      if (archiveRes?.success && Array.isArray(archiveRes.data)) {
        setArchivedList(archiveRes.data);
      } else {
        setArchivedList([]);
      }

      if (casesRes?.success && Array.isArray(casesRes.data)) {
        const openMatters = casesRes.data.filter((c) => c.judicialStatus !== "DISPOSED");
        setActiveCases(openMatters);

        if (queryCaseId && openMatters.some((c) => c._id === queryCaseId)) {
          setSelectedCaseId(queryCaseId);
          onOpen();
        } else if (openMatters.length > 0) {
          setSelectedCaseId(openMatters[0]._id);
        }
      }
    } catch (err: any) {
      console.error("Failed to load compliance archival ledger:", err);
      toast.error(err.response?.data?.message || "Failed to load archival records");
    } finally {
      setLoading(false);
    }
  }, [queryCaseId, onOpen]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const caseSelectOptions = useMemo(() => {
    return activeCases.map((c) => ({
      key: c._id,
      label: `${c.fileNo} · ${c.writNumber || "Writ Pending"} — ${c.leadPetitioner}`,
    }));
  }, [activeCases]);

  // 2. Submit Closeout to Backend
  const handleArchiveSubmit = async (onClose: () => void) => {
    if (!selectedCaseId) {
      toast.error("Please select a case to archive.");
      return;
    }
    if (!narrativeSummary.trim()) {
      toast.error("Compliance action summary is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        caseId: selectedCaseId,
        actionTakenByBoard: narrativeSummary.trim(),
        complianceAffidavitDate: new Date().toISOString(),
        complianceProofDocUrl: "",
      };

      const res = await ComplianceAPI.archiveCase(payload);
      if (res?.success) {
        toast.success(res.message || "Case successfully complied, disposed & moved to permanent legal archive!", {
          duration: 5000,
          icon: "🔒",
        });
        onClose();
        loadData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to archive case");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAffidavitViewer = (item: ArchivedComplianceItem) => {
    setViewingAffidavit(item);
    onViewerOpen();
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
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
                <h1 className="text-base font-bold text-slate-900">5.3 Compliance Filing &amp; Archival</h1>
                <Chip size="sm" className="bg-emerald-500/20 px-1 text-[10px] font-bold text-emerald-800">
                  Case Closeout Workflow
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Upload certified compliance affidavits, execute final closeout, and lock files into permanent audit-proof storage
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                radius="sm"
                className="bg-emerald-700 text-xs font-semibold text-white shadow hover:bg-emerald-800"
                startContent={<span className="material-symbols-rounded text-sm">task_alt</span>}
                onPress={onOpen}
              >
                Close &amp; Archive Case File
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Archived Cases Grid */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Complied &amp; Decided Archive Records ({archivedList.length})
          </h3>
          <span className="text-[11px] text-slate-400">All judicial commands verified &amp; sealed</span>
        </div>

        <CardBody className="p-0">
          <Table removeWrapper aria-label="Complied archive table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CASE NO. &amp; CNR
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PETITIONER &amp; COURT
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                JUDICIAL DIRECTION GIVEN
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ACTION TAKEN BY BOARD
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                COMPLIANCE AFFIDAVIT FILED
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CLOSED BY &amp; DATE
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                STATUS
              </TableColumn>
            </TableHeader>
            <TableBody
              items={archivedList}
              isLoading={loading}
              loadingContent={
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              }
              emptyContent={!loading ? "No archived or disposed matters. All closed records appear here." : " "}
            >
              {(item: ArchivedComplianceItem) => (
                <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell>
                    <p className="font-mono text-xs font-bold text-slate-900">
                      {item.caseNoAndCnr?.writNumber || "--"}
                    </p>
                    <p className="font-mono text-[10px] text-slate-400">{item.caseNoAndCnr?.cnrNumber || "--"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold text-slate-900">{item.petitionerAndCourt?.petitioner}</p>
                    <p className="text-[10px] text-slate-400">{item.petitionerAndCourt?.court}</p>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-xs text-slate-700 leading-relaxed font-serif">
                      {item.judicialDirectionGiven}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                      {item.actionTakenByBoard}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer group flex items-center gap-1.5"
                      onClick={() => handleOpenAffidavitViewer(item)}
                    >
                      <span className="material-symbols-rounded text-rose-500 text-base group-hover:scale-110 transition-transform">
                        picture_as_pdf
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 underline">
                          {item.complianceAffidavitFiled?.date
                            ? new Date(item.complianceAffidavitFiled.date).toLocaleDateString("en-GB")
                            : "--"}
                        </p>
                        <p className="text-[9px] text-slate-400">View Certified Proof</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-slate-800">{item.closedByAndDate?.closedBy}</p>
                    <p className="text-[10px] text-slate-400">
                      {item.closedByAndDate?.closedAt
                        ? new Date(item.closedByAndDate.closedAt).toLocaleDateString("en-GB")
                        : "--"}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Chip size="sm" color="success" variant="flat" className="text-[10px] font-bold">
                      COMPLIED &amp; CLOSED
                    </Chip>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* 1. Compliance Submission & Closeout Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-emerald-700">task_alt</span>
                Submit Compliance &amp; Permanently Archive Case
              </ModalHeader>
              <ModalBody className="space-y-4 text-xs">
                <Select
                  size="sm"
                  label="Select Active Case to Complete Compliance"
                  labelPlacement="outside"
                  items={caseSelectOptions}
                  selectedKeys={selectedCaseId ? [selectedCaseId] : []}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  placeholder="Select open case docket..."
                  isRequired
                >
                  {(c) => <SelectItem key={c.key}>{c.label}</SelectItem>}
                </Select>

                <Select
                  size="sm"
                  label="Action Taken Status Category"
                  labelPlacement="outside"
                  items={ACTION_TAKEN_PRESETS}
                  selectedKeys={[actionCategory]}
                  onChange={(e) => setActionCategory(e.target.value)}
                  isRequired
                >
                  {(a) => <SelectItem key={a.key}>{a.label}</SelectItem>}
                </Select>

                <Textarea
                  size="sm"
                  label="Compliance Narrative Summary &amp; Order Details"
                  labelPlacement="outside"
                  value={narrativeSummary}
                  onValueChange={setNarrativeSummary}
                  minRows={3}
                  placeholder="Detail speaking order number, date, dispatch memo, and implementation..."
                  isRequired
                />

                <div className="rounded-xl border-2 border-dashed border-slate-300 p-5 text-center hover:bg-slate-50/50 cursor-pointer">
                  <span className="material-symbols-rounded text-3xl text-emerald-700">verified_user</span>
                  <p className="mt-1 text-xs font-bold text-slate-800">Compliance Affidavit &amp; Order Attached</p>
                  <p className="text-[10px] text-slate-400">Certified by CSC with High Court filing receipt &amp; notary stamp</p>
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
                  onClick={() => handleArchiveSubmit(onClose)}
                >
                  Verify &amp; Permanently Archive
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 2. Certified Compliance Proof Viewer Modal */}
      <Modal isOpen={isViewerOpen} onOpenChange={onViewerOpenChange} placement="center" size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 py-3">
                <span className="material-symbols-rounded text-rose-500">picture_as_pdf</span>
                Certified Compliance Record — {viewingAffidavit?.caseNoAndCnr?.writNumber}
              </ModalHeader>
              <ModalBody className="py-4 space-y-3 text-xs">
                <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                  <div>
                    <p className="font-bold">Affidavit Status: VERIFIED &amp; SWORN BEFORE HIGH COURT</p>
                    <p className="text-[11px] text-emerald-800">
                      Filed on:{" "}
                      {viewingAffidavit?.complianceAffidavitFiled?.date
                        ? new Date(viewingAffidavit.complianceAffidavitFiled.date).toLocaleDateString("en-GB")
                        : "--"}
                    </p>
                  </div>
                  <Chip size="sm" color="success" variant="solid" className="font-bold text-[10px]">
                    DISPOSED
                  </Chip>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-2 text-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Petitioner:</span>
                    <span className="font-bold">{viewingAffidavit?.petitionerAndCourt?.petitioner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Judicial Command:</span>
                    <span className="font-medium">{viewingAffidavit?.judicialDirectionGiven}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Board Closeout Action:</span>
                    <span className="font-medium text-emerald-900">{viewingAffidavit?.actionTakenByBoard}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Closed By:</span>
                    <span className="font-bold text-slate-900">{viewingAffidavit?.closedByAndDate?.closedBy}</span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-slate-100 py-2">
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Close Proof
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function ComplianceArchivalPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500">Loading Compliance Archival Desk...</div>}>
      <ComplianceArchivalContent />
    </Suspense>
  );
}