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
  Input,
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

export default function ActiveStaysRosterPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedStay, setSelectedStay] = useState<any>(null);

  const [standingCounsel, setStandingCounsel] = useState("Chief Standing Counsel (HC)");
  const [filingDate, setFilingDate] = useState("2026-09-26");
  const [urgencyReasons, setUrgencyReasons] = useState(
    "Recruitment examination process for 60,244 Constable posts is halted. Administrative hardship and public interest demand immediate vacation of interim order."
  );

  const [staysData, setStaysData] = useState([
    {
      id: "s1",
      caseId: "3", // Maps to WRIT-A/7100/2025
      caseNoYear: "WRIT-A / 7100 / 2025",
      cnrNumber: "UPHC010089212025",
      courtBench: "High Court Allahabad (Bench 12)",
      coramJudge: "Hon'ble Justice M.C. Tripathi",
      stayOrderDate: "12 Aug 2026",
      stayScope: "Stay on declaration of final selection result for Constable PAC",
      daysActive: "35 Days",
      vacationFiled: false,
      limitationDeadline: "20 Sep 2026",
      vacationStatus: "DRAFT_PENDING_CSC",
      oic: "DySP Promotion",
    },
    {
      id: "s2",
      caseId: "1",
      caseNoYear: "WRIT-A / 8911 / 2025",
      cnrNumber: "UPHC010041122025",
      courtBench: "High Court Allahabad (Bench 34)",
      coramJudge: "Hon'ble Justice Saurabh Shyam",
      stayOrderDate: "28 Aug 2026",
      stayScope: "Interim stay on physical standard test (PST) disqualification order",
      daysActive: "19 Days",
      vacationFiled: true,
      limitationDeadline: "Filed on 08 Sep",
      vacationStatus: "LISTED_FOR_ARGUMENTS",
      oic: "SP Legal (Cell-1)",
    },
    {
      id: "s3",
      caseId: "2",
      caseNoYear: "WRIT-C / 1092 / 2026",
      cnrNumber: "UPHC020044192026",
      courtBench: "High Court Lucknow Bench",
      coramJudge: "Hon'ble Justice Alok Mathur",
      stayOrderDate: "04 Sep 2026",
      stayScope: "Status quo granted on tender procurement execution",
      daysActive: "12 Days",
      vacationFiled: false,
      limitationDeadline: "18 Sep 2026",
      vacationStatus: "URGENT_ACTION_REQUIRED",
      oic: "Addl. Secy (Recruitment)",
    },
  ]);

  const handleOpenDraftModal = (stayItem: any) => {
    setSelectedStay(stayItem);
    onOpen();
  };

  const handleConfirmVacationDraft = (onClose: () => void) => {
    if (!selectedStay) return;

    setStaysData((prev) =>
      prev.map((item) =>
        item.id === selectedStay.id
          ? {
              ...item,
              vacationFiled: true,
              vacationStatus: "APPLICATION_DISPATCHED_TO_CSC",
              limitationDeadline: `Filed on ${filingDate}`,
            }
          : item
      )
    );

    alert(
      `Vacation Application under Article 226(3) successfully generated for ${selectedStay.caseNoYear} and dispatched to ${standingCounsel}!`
    );
    onClose();
  };

  const vacationDueCount = staysData.filter((s) => !s.vacationFiled).length;
  const vacationFiledCount = staysData.filter((s) => s.vacationFiled).length;

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
                <h1 className="text-base font-bold text-slate-900">5.1 Active Stays Roster</h1>
                <Chip size="sm" className="bg-rose-500/20 px-1 text-[10px] font-bold text-rose-700">
                  {staysData.length} Injunctions Active
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Track interim court stay orders, operational injunctions & Article 226(3) vacation motions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                startContent={<span className="material-symbols-rounded text-sm">download</span>}
                onClick={() => alert("Exporting certified Active Stays MIS (Excel)...")}
              >
                Export Stay MIS
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
              <p className="text-[11px] font-semibold text-rose-700">Vacation Motions Due (&lt; 7 Days)</p>
              <h3 className="text-xl font-bold text-rose-900">0{vacationDueCount}</h3>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <p className="text-[11px] font-semibold text-emerald-700">Vacation Applications Filed</p>
              <h3 className="text-xl font-bold text-emerald-900">0{vacationFiledCount}</h3>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
              <p className="text-[11px] font-semibold text-blue-700">Average Stay Duration</p>
              <h3 className="text-xl font-bold text-blue-900">22 Days</h3>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Table Grid */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Active stays table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CASE & CNR NO.
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                COURT & CORAM
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                STAY ORDER SCOPE
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ORDER DATE & DURATION
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
            <TableBody items={staysData}>
              {(item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell>
                    <Link
                      href={`/admin/cases/${item.caseId}`}
                      className="font-mono text-xs font-bold text-slate-900 hover:text-blue-700 hover:underline"
                    >
                      {item.caseNoYear}
                    </Link>
                    <p className="font-mono text-[10px] text-slate-400">{item.cnrNumber}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-slate-800">{item.courtBench}</p>
                    <p className="text-[10px] text-slate-500">{item.coramJudge}</p>
                  </TableCell>
                  <TableCell className="max-w-[260px]">
                    <p className="text-xs text-rose-900 font-semibold leading-relaxed">{item.stayScope}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold text-slate-800">{item.stayOrderDate}</p>
                    <Chip size="sm" variant="flat" color="danger" className="text-[10px] font-bold h-4 px-1">
                      {item.daysActive}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          item.vacationStatus === "LISTED_FOR_ARGUMENTS" ||
                          item.vacationStatus === "APPLICATION_DISPATCHED_TO_CSC"
                            ? "success"
                            : item.vacationStatus === "URGENT_ACTION_REQUIRED"
                            ? "danger"
                            : "warning"
                        }
                        className="text-[10px] font-bold"
                      >
                        {item.vacationStatus.replace(/_/g, " ")}
                      </Chip>
                      <p className="text-[10px] text-slate-400">Deadline: {item.limitationDeadline}</p>
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

      {/* Vacation of Stay Drafting Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">gavel</span>
                Application for Vacation of Stay (Article 226(3)) — {selectedStay?.caseNoYear}
              </ModalHeader>
              <ModalBody className="space-y-4 text-xs">
                <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-900 border border-rose-200">
                  <p className="font-bold">Interim Order Scope in Force:</p>
                  <p className="mt-1 font-serif text-[11px] leading-relaxed">{selectedStay?.stayScope}</p>
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
                  label="Urgency & Grounds for Vacation"
                  labelPlacement="outside"
                  value={urgencyReasons}
                  onValueChange={setUrgencyReasons}
                  placeholder="Specify statutory grounds under Article 226(3)..."
                  isRequired
                />

                <div className="rounded-lg bg-blue-50/60 p-2.5 border border-blue-200 text-blue-900 text-[11px]">
                  <b>Automatic Action:</b> Submitting this draft will automatically update the tracking status and link
                  this motion to the case DMS under <code>03_Counter_Affidavits_Filed</code>.
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
                  onClick={() => handleConfirmVacationDraft(onClose)}
                >
                  Generate & Send to Counsel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}