"use client";

import React, { useState, useEffect, Suspense } from "react";
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
} from "@nextui-org/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ComplianceArchivalContent() {
  const searchParams = useSearchParams();
  const queryCaseId = searchParams.get("caseId");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isViewerOpen, onOpen: onViewerOpen, onOpenChange: onViewerOpenChange } = useDisclosure();

  const [selectedCase, setSelectedCase] = useState("WRIT-A/4012/2026");
  const [actionTakenMaster, setActionTakenMaster] = useState("ORDER_DECIDED");
  const [narrativeSummary, setNarrativeSummary] = useState(
    "Speaking order passed by competent authority complying with Hon'ble Court directions. Copy communicated to petitioner."
  );

  const [viewingAffidavit, setViewingAffidavit] = useState<any>(null);

  // Auto-open modal if redirected from 5.2 Contempt Radar with a caseId
  useEffect(() => {
    if (queryCaseId) {
      if (queryCaseId === "2") setSelectedCase("CONTEMPT/312/2026");
      else if (queryCaseId === "1") setSelectedCase("WRIT-A/4012/2026");
      onOpen();
    }
  }, [queryCaseId, onOpen]);

  const [archivedCompliances, setArchivedCompliances] = useState([
    {
      id: "a1",
      caseNoYear: "WRIT-A / 2025 / 19",
      cnrNumber: "UPHC010041122025",
      court: "High Court Allahabad",
      petitioner: "Sujit Yadav",
      directionGiven: "Consider compassionate appointment under Dying in Harness Rules",
      actionTakenDesc: "Appointment letter issued as Sub Inspector on 12-Aug-2026",
      complianceAffidavitDate: "20 Aug 2026",
      closedBy: "SP Legal (Cell-1)",
      closedAt: "25 Aug 2026",
      status: "COMPLIED_CLOSED",
      affidavitFile: "Affidavit_Compliance_Sujit_Yadav_Sealed.pdf",
    },
    {
      id: "a2",
      caseNoYear: "WRIT-A / 1102 / 2025",
      cnrNumber: "UPHC020011402025",
      court: "High Court Lucknow",
      petitioner: "Pankaj Tiwari",
      directionGiven: "Decide representation regarding height measurement discrepancy",
      actionTakenDesc: "Speaking order passed by DG/Chairman rejecting claim with medical board report",
      complianceAffidavitDate: "02 Sep 2026",
      closedBy: "Member Secretary",
      closedAt: "05 Sep 2026",
      status: "COMPLIED_CLOSED",
      affidavitFile: "Compliance_Speaking_Order_Affidavit_HC.pdf",
    },
  ]);

  const handleArchiveSubmit = (onClose: () => void) => {
    const newArchivedItem = {
      id: `a-${Date.now()}`,
      caseNoYear: selectedCase.replace("-", " / ").replace("/", " / "),
      cnrNumber: "UPHC010029312026",
      court: selectedCase.includes("CONTEMPT") ? "High Court Lucknow" : "High Court Allahabad",
      petitioner: "Abhay Gupta & Others",
      directionGiven: "Decide representation by speaking order within prescribed period",
      actionTakenDesc: narrativeSummary,
      complianceAffidavitDate: "24 Sep 2026",
      closedBy: "V. Sharma (Legal Registry)",
      closedAt: "Today (24 Sep 2026)",
      status: "COMPLIED_CLOSED",
      affidavitFile: "Compliance_Affidavit_Sealed_Certified.pdf",
    };

    setArchivedCompliances((prev) => [newArchivedItem, ...prev]);
    alert(`Case ${selectedCase} marked as Complied & moved to Permanent Legal Archive!`);
    onClose();
  };

  const handleOpenAffidavitViewer = (item: any) => {
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
                <h1 className="text-base font-bold text-slate-900">5.3 Compliance Filing & Archival</h1>
                <Chip size="sm" className="bg-emerald-500/20 px-1 text-[10px] font-bold text-emerald-800">
                  Case Closeout Workflow
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Upload certified compliance affidavits, execute dual-officer sign-offs, and move files to permanent archive[cite: 1]
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
                Close & Archive Case File
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Archived Cases Grid */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Complied & Decided Archive Records ({archivedCompliances.length})
          </h3>
          <span className="text-[11px] text-slate-400">All judicial commands verified</span>
        </div>

        <CardBody className="p-0">
          <Table removeWrapper aria-label="Complied archive table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CASE NO. & CNR
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PETITIONER & COURT
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
                CLOSED BY & DATE
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                STATUS
              </TableColumn>
            </TableHeader>
            <TableBody items={archivedCompliances}>
              {(item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell>
                    <p className="font-mono text-xs font-bold text-slate-900">{item.caseNoYear}</p>
                    <p className="font-mono text-[10px] text-slate-400">{item.cnrNumber}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold text-slate-900">{item.petitioner}</p>
                    <p className="text-[10px] text-slate-400">{item.court}</p>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-xs text-slate-700 leading-relaxed">{item.directionGiven}</p>
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <p className="text-xs text-emerald-950 font-medium leading-relaxed">{item.actionTakenDesc}</p>
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
                          {item.complianceAffidavitDate}
                        </p>
                        <p className="text-[9px] text-slate-400">View Certified Proof</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-slate-800">{item.closedBy}</p>
                    <p className="text-[10px] text-slate-400">{item.closedAt}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Chip size="sm" color="success" variant="flat" className="text-[10px] font-bold">
                      COMPLIED & CLOSED
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
                Submit Compliance & Archive File
              </ModalHeader>
              <ModalBody className="space-y-4 text-xs">
                <Select
                  size="sm"
                  label="Select Writ to Complete Compliance"
                  labelPlacement="outside"
                  selectedKeys={[selectedCase]}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  isRequired
                >
                  <SelectItem key="WRIT-A/4012/2026">WRIT-A/4012/2026 — Abhay Gupta vs State of UP</SelectItem>
                  <SelectItem key="CONTEMPT/312/2026">CONTEMPT/312/2026 — Abhay Gupta vs Chairman (Contempt Notice)</SelectItem>
                  <SelectItem key="WRIT-A/7100/2025">WRIT-A/7100/2025 — Rohit Kumar</SelectItem>
                </Select>

                <Select
                  size="sm"
                  label="Action Taken Status (Master)[cite: 1]"
                  labelPlacement="outside"
                  selectedKeys={[actionTakenMaster]}
                  onChange={(e) => setActionTakenMaster(e.target.value)}
                  isRequired
                >
                  <SelectItem key="ORDER_DECIDED">Representation Decided by Speaking Order</SelectItem>
                  <SelectItem key="APPOINTMENT_GIVEN">Appointment / Benefit Granted</SelectItem>
                  <SelectItem key="RE_EXAM_HELD">Re-examination / PST Conducted</SelectItem>
                  <SelectItem key="DISMISSED_MERIT">Writ Dismissed on Merit (No Board Action Needed)</SelectItem>
                </Select>

                <Textarea
                  size="sm"
                  label="Compliance Narrative Summary"
                  labelPlacement="outside"
                  value={narrativeSummary}
                  onValueChange={setNarrativeSummary}
                  minRows={3}
                  placeholder="Briefly state how judicial order was complied with..."
                  isRequired
                />

                <div className="rounded-xl border-2 border-dashed border-slate-300 p-5 text-center hover:bg-slate-50/50 cursor-pointer">
                  <span className="material-symbols-rounded text-3xl text-emerald-700">verified_user</span>
                  <p className="mt-1 text-xs font-bold text-slate-800">Attach Filed Compliance Affidavit Copy (PDF)</p>
                  <p className="text-[10px] text-slate-400">Must include High Court filing stamp & notary seal</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-emerald-700 font-semibold text-white hover:bg-emerald-800"
                  onClick={() => handleArchiveSubmit(onClose)}
                >
                  Verify & Permanently Archive
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 2. Certified Compliance Proof Viewer Modal */}
      <Modal isOpen={isViewerOpen} onOpenChange={onViewerOpenChange} placement="center" size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 py-3">
                <span className="material-symbols-rounded text-rose-500">picture_as_pdf</span>
                Certified High Court Compliance Proof — {viewingAffidavit?.caseNoYear}
              </ModalHeader>
              <ModalBody className="py-4 space-y-3 text-xs">
                <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                  <div>
                    <p className="font-bold">Affidavit Status: VERIFIED & SEALED BY CSC</p>
                    <p className="text-[11px] text-emerald-800">Filed on: {viewingAffidavit?.complianceAffidavitDate}</p>
                  </div>
                  <Chip size="sm" color="success" variant="solid" className="font-bold text-[10px]">
                    DISPOSING CERTIFICATE
                  </Chip>
                </div>

                <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 min-h-[300px] flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-rounded text-5xl text-rose-500">task_alt</span>
                  <p className="mt-2 text-xs font-bold text-slate-900">{viewingAffidavit?.affidavitFile}</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                    Sworn compliance affidavit signed by {viewingAffidavit?.closedBy} confirming implementation of: &quot;{viewingAffidavit?.actionTakenDesc}&quot;
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" radius="sm" className="bg-[#0f2744] text-white text-xs font-semibold">
                      Open Scanned Copy
                    </Button>
                    <Button size="sm" radius="sm" variant="bordered" className="text-xs font-semibold">
                      Download Copy
                    </Button>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-slate-100 py-2">
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Close Viewer
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