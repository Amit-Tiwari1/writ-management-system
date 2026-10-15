"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  useDisclosure,
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axiosClient from "@/api/axiosClient";
import { CasesAPI } from "@/api/casesApi";

interface MovementRecord {
  _id: string;
  fromOfficerName: string;
  fromDesignation: string;
  toOfficerName: string;
  toDesignation: string;
  actionType: string;
  notingPurpose: string;
  remarks: string;
  receivedAt: string;
  dispatchedAt: string;
  holdDurationDays: number;
  holdDurationHours: number;
  minuteNumber?: number;
}

export default function CaseDossier360Page() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.caseId as string;

  // Modals
  const { isOpen: isAttachOpen, onOpen: onAttachOpen, onOpenChange: onAttachOpenChange } = useDisclosure();
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onOpenChange: onStatusOpenChange } = useDisclosure();

  // Data States
  const [caseData, setCaseData] = useState<any>(null);
  const [petitioners, setPetitioners] = useState<any[]>([]);
  const [movementHistory, setMovementHistory] = useState<MovementRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [isAttaching, setIsAttaching] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Status Change Form State
  const [newStage, setNewStage] = useState<string>("");
  const [newJudicialStatus, setNewJudicialStatus] = useState<string>("");
  const [statusRemarks, setStatusRemarks] = useState<string>("");

  // Attach Writ Form State
  const [newWritNo, setNewWritNo] = useState("");
  const [newCnrNo, setNewCnrNo] = useState("");
  const [newPetitioner, setNewPetitioner] = useState("");

  // 1. Fetch Case Dossier Master Data
  const fetchCaseDossier = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      const res = await CasesAPI.getCaseById(caseId);
      if (res?.success) {
        setCaseData(res.case);
        setPetitioners(res.petitioners || []);
        setNewStage(res.case.stage || "Advance Notice Stage");
        setNewJudicialStatus(res.case.judicialStatus || "ACTIVE");
      }
    } catch (err: any) {
      console.error("Failed to load case dossier:", err);
      toast.error(err.response?.data?.message || "Failed to load case dossier");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  // 2. Fetch File Movement & Hold History
  const fetchMovementHistory = useCallback(async () => {
    if (!caseId) return;
    setLoadingHistory(true);
    try {
      const res = await axiosClient.get(`/cases/${caseId}/movement-history`);
      if (res.data?.success) {
        setMovementHistory(res.data.data || []);
      }
    } catch (err: any) {
      console.error("Failed to load movement history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchCaseDossier();
    fetchMovementHistory();
  }, [fetchCaseDossier, fetchMovementHistory]);

  // Handle Quick Status / Stage Mutation
  const handleUpdateStatus = async () => {
    if (!newStage.trim()) {
      toast.error("Please select a valid procedural stage");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await axiosClient.patch(`/cases/${caseId}/status`, {
        stage: newStage,
        judicialStatus: newJudicialStatus,
        remarks: statusRemarks,
      });

      if (res.data?.success) {
        toast.success("Case procedural status updated successfully!");
        onStatusOpenChange();
        fetchCaseDossier();
        fetchMovementHistory();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update case stage");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Tagging Connected Writ
  const handleAttachWrit = async () => {
    if (!newWritNo.trim()) {
      toast.error("Writ Number is required");
      return;
    }
    setIsAttaching(true);
    try {
      const res = await axiosClient.post(`/cases/${caseId}/connected-writs`, {
        writNumber: newWritNo.trim().toUpperCase(),
        cnrNumber: newCnrNo.trim().toUpperCase(),
        petitionerName: newPetitioner.trim() || "Tagged Litigant",
      });

      if (res.data?.success) {
        toast.success("Connected writ tagged successfully!");
        setNewWritNo("");
        setNewCnrNo("");
        setNewPetitioner("");
        onAttachOpenChange();
        fetchCaseDossier();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to tag connected writ");
    } finally {
      setIsAttaching(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-600">Case record not found.</p>
        <Link href="/admin/cases">
          <Button size="sm" variant="bordered">Back to Register</Button>
        </Link>
      </div>
    );
  }

  const ndohFormatted = caseData.ndoh
    ? new Date(caseData.ndoh).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not Listed";

  const connectedList = caseData.connectedWrits || [];

  return (
    <div className="space-y-4">
      {/* 360 Header Bar */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/admin/cases">
                  <Button isIconOnly size="sm" variant="light" className="text-slate-500">
                    <span className="material-symbols-rounded">arrow_back</span>
                  </Button>
                </Link>

                <div className="flex items-center gap-1.5 rounded-lg bg-[#0f2744] px-2.5 py-1 text-white shadow-sm">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">File Docket:</span>
                  <span className="font-mono text-xs font-extrabold">{caseData.fileNo}</span>
                </div>

                {caseData.noticeNumber && (
                  <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 font-mono text-xs font-bold text-amber-900">
                    Notice: {caseData.noticeNumber}
                  </span>
                )}

                <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 font-bold text-xs text-blue-800">
                  {caseData.writNumber || "Awaiting Writ Allocation"}
                </span>

                <Chip size="sm" variant="flat" color="primary" className="font-mono text-[10px] font-bold">
                  CNR: {caseData.cnrNumber || "Unassigned"}
                </Chip>

                {caseData.syncStatus === "LIVE_SYNCED" && (
                  <Chip size="sm" color="success" variant="flat" className="text-[10px] font-bold">
                    🟢 Live CIS Synced
                  </Chip>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-500 ml-9">
                {caseData.court} · {caseData.benchLocation} Bench ({caseData.caseType})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                className="border-slate-300 text-xs font-semibold text-slate-700 bg-white"
                startContent={<span className="material-symbols-rounded text-sm text-blue-700">published_with_changes</span>}
                onPress={onStatusOpen}
              >
                Change Stage
              </Button>
              <Link href={`/admin/cases/batch?caseId=${caseData._id}`}>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                  startContent={<span className="material-symbols-rounded text-sm">groups</span>}
                >
                  Co-Petitioners ({petitioners.length})
                </Button>
              </Link>
              <Link href={`/admin/documents?caseId=${caseData._id}`}>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                  startContent={<span className="material-symbols-rounded text-sm">folder_open</span>}
                >
                  E-File DMS
                </Button>
              </Link>
              <Link href={`/admin/communications/notings?caseId=${caseData._id}`}>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-emerald-700 text-xs font-semibold text-white hover:bg-emerald-800 shadow-sm"
                  startContent={<span className="material-symbols-rounded text-sm">edit_note</span>}
                >
                  Green Sheet
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 md:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Hearing (NDOH)</span>
              <p className="text-xs font-bold text-amber-700 mt-0.5">{ndohFormatted}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Court Stage</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{caseData.stage}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Custody (Hold)</span>
              <p className="text-xs font-bold text-[#0f2744] mt-0.5 truncate flex items-center justify-between">
                <span>{caseData.internalHold?.location || caseData.assignedOIC}</span>
                <span className="font-mono text-[10px] text-rose-600 bg-rose-50 px-1 rounded border border-rose-200">
                  {caseData.internalHold?.holdDays ?? 0}d
                </span>
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accountable OIC</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{caseData.assignedOIC}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Multi-Tab Dossier Deck */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <Tabs
            aria-label="Case Dossier Tabs"
            variant="underlined"
            classNames={{ tabList: "gap-6", cursor: "bg-[#0f2744]", tab: "max-w-fit px-0 h-9 text-xs font-semibold" }}
          >
            {/* Tab 1: Overview */}
            <Tab key="overview" title="Overview & Parties">
              <div className="mt-4 space-y-6 text-xs">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Litigant Parties & Counsels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 border border-slate-200/60">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Primary Petitioner(s)</span>
                      <p className="font-bold text-slate-900 mt-1 text-sm">{caseData.leadPetitioner}</p>
                      <p className="text-slate-500 mt-1">Counsel: {caseData.petitionerAdvocate || "--"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Respondent String</span>
                      <p className="font-bold text-slate-900 mt-1 text-sm">{caseData.respondentString}</p>
                      <p className="text-blue-700 font-semibold mt-1">Liaison Pairokar: {caseData.assignedPairokar}</p>
                    </div>
                  </div>
                </div>

                <Divider />

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Dispute Taxonomy & Subject</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Category</span>
                      <p className="font-bold text-slate-800 mt-0.5">{caseData.category}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Sub-Category / Bharti</span>
                      <p className="font-bold text-slate-800 mt-0.5">{caseData.subCategory || "--"}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Exam Cycle</span>
                      <p className="font-bold text-slate-800 mt-0.5">{caseData.examCycle}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded bg-blue-50/50 p-3 border border-blue-100 text-slate-700 leading-relaxed font-serif">
                    <b>Subject Grievance:</b> {caseData.disputeSubject}
                  </div>
                </div>
              </div>
            </Tab>

            {/* Tab 2: File Movement & Custody History (NEW AUDIT TRACKER) */}
            <Tab
              key="movement"
              title={`File Movement & Custody History (${movementHistory.length})`}
            >
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Chronological File Movement &amp; Hold Duration Audit
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Tamper-evident track record of file transit between secretariat desks and holding duration.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="bordered"
                    radius="sm"
                    className="text-xs font-semibold"
                    onClick={fetchMovementHistory}
                    isLoading={loadingHistory}
                    startContent={<span className="material-symbols-rounded text-sm">sync</span>}
                  >
                    Refresh Audit
                  </Button>
                </div>

                {movementHistory.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:bottom-0 before:left-2 before:top-2 before:w-0.5 before:bg-slate-200">
                    {movementHistory.map((m, idx) => (
                      <div key={m._id || idx} className="relative text-xs">
                        {/* Timeline Bullet */}
                        <div className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0f2744] text-[9px] font-bold text-white shadow">
                          {idx + 1}
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 shadow-2xs hover:bg-white transition-colors">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Chip
                                size="sm"
                                variant="flat"
                                color={m.actionType === "INITIAL_INTAKE" ? "primary" : "secondary"}
                                className="text-[10px] font-bold"
                              >
                                {m.actionType}
                              </Chip>
                              <span className="font-bold text-slate-900">{m.notingPurpose}</span>
                              {m.minuteNumber && (
                                <span className="font-mono text-[10px] text-slate-500">
                                  (Minute #{m.minuteNumber})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-700">
                                Hold: {m.holdDurationDays}d {m.holdDurationHours}h
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(m.dispatchedAt).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                            <div>
                              <span className="text-slate-400 font-medium">Dispatched By:</span>
                              <p className="font-bold text-slate-800">
                                {m.fromOfficerName} <span className="font-normal text-slate-500">({m.fromDesignation})</span>
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400 font-medium">Recipient Desk:</span>
                              <p className="font-bold text-emerald-800">
                                {m.toOfficerName} <span className="font-normal text-slate-500">({m.toDesignation})</span>
                              </p>
                            </div>
                          </div>

                          {m.remarks && (
                            <div className="mt-2 rounded bg-white p-2 border border-slate-200/80 text-slate-600 font-serif">
                              <em>&quot;{m.remarks}&quot;</em>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                    No recorded file movements on this docket yet. Movements log automatically upon Green Sheet forward.
                  </div>
                )}
              </div>
            </Tab>

            {/* Tab 3: Connected Bunch Writs */}
            <Tab
              key="connected"
              title={`Connected Bunch Writs (${connectedList.length})`}
            >
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Connected / Tagged Writs (Common Hearing Roster)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Petitions tagged to this Lead Case hear together on the same NDOH.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    radius="sm"
                    className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                    startContent={<span className="material-symbols-rounded text-sm">add_link</span>}
                    onPress={onAttachOpen}
                  >
                    Tag Connected Writ
                  </Button>
                </div>

                {connectedList.length > 0 ? (
                  <Table removeWrapper aria-label="Connected Writs Table" className="min-w-full">
                    <TableHeader>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">WRIT NUMBER</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">CNR NUMBER</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">TAGGED PETITIONER</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">TAGGED DATE</TableColumn>
                    </TableHeader>
                    <TableBody items={connectedList}>
                      {(w: any) => {
                        const idx = connectedList.indexOf(w);
                        return (
                          <TableRow key={idx} className="border-b border-slate-100">
                            <TableCell className="font-bold text-xs text-blue-700">{w.writNumber}</TableCell>
                            <TableCell className="font-mono text-xs text-slate-600">{w.cnrNumber || "--"}</TableCell>
                            <TableCell className="text-xs font-semibold text-slate-900">{w.petitionerName || "--"}</TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {w.taggedDate ? new Date(w.taggedDate).toLocaleDateString() : "--"}
                            </TableCell>
                          </TableRow>
                        );
                      }}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                    No connected writs attached to this petition.
                  </div>
                )}
              </div>
            </Tab>

            {/* Tab 4: Candidate Roster */}
            <Tab key="roster" title={`Candidate Roster (${petitioners.length})`}>
              <div className="mt-4">
                <Table removeWrapper aria-label="Petitioners Roster Table" className="min-w-full">
                  <TableHeader>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">ROLE</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">ROLL NO</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">CANDIDATE NAME</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">FATHER NAME</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">DISTRICT</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">STATUS</TableColumn>
                  </TableHeader>
                  <TableBody items={petitioners} emptyContent="No individual candidate records registered.">
                    {(p: any) => (
                      <TableRow key={p._id} className="border-b border-slate-100">
                        <TableCell>
                          <Chip size="sm" variant="flat" color={p.role === "Lead Petitioner" ? "primary" : "default"} className="text-[10px] font-bold">
                            {p.role}
                          </Chip>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-900">{p.rollNo}</TableCell>
                        <TableCell className="text-xs font-semibold text-slate-800">{p.name}</TableCell>
                        <TableCell className="text-xs text-slate-500">{p.fatherName || "--"}</TableCell>
                        <TableCell className="text-xs text-slate-700">{p.district || "--"}</TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" color="success" className="text-[10px] font-bold">
                            {p.status}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* MODAL 1: CHANGE PROCEDURAL STAGE / JUDICIAL STATUS */}
      <Modal isOpen={isStatusOpen} onOpenChange={onStatusOpenChange} placement="top" size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">published_with_changes</span>
                Update Procedural Court Stage: {caseData.fileNo}
              </ModalHeader>
              <ModalBody className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Court Stage / Milestone
                  </label>
                  <Select
                    size="sm"
                    radius="sm"
                    selectedKeys={[newStage]}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="bg-slate-50"
                  >
                    <SelectItem key="Advance Notice Stage">Advance Notice Stage</SelectItem>
                    <SelectItem key="Para-Wise Comments (PWC) Awaited">Para-Wise Comments (PWC) Awaited</SelectItem>
                    <SelectItem key="Counter Affidavit Granted 3 Weeks">Counter Affidavit Granted 3 Weeks</SelectItem>
                    <SelectItem key="Counter Affidavit Filed in Court">Counter Affidavit Filed in Court</SelectItem>
                    <SelectItem key="Rejoinder Affidavit Awaited">Rejoinder Affidavit Awaited</SelectItem>
                    <SelectItem key="Interim Stay In Force">Interim Stay In Force</SelectItem>
                    <SelectItem key="Listed for Final Arguments">Listed for Final Arguments</SelectItem>
                    <SelectItem key="Disposed Off / Closed">Disposed Off / Closed</SelectItem>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    System Judicial Status Flag
                  </label>
                  <Select
                    size="sm"
                    radius="sm"
                    selectedKeys={[newJudicialStatus]}
                    onChange={(e) => setNewJudicialStatus(e.target.value)}
                    className="bg-slate-50"
                  >
                    <SelectItem key="ACTIVE">ACTIVE (Normal Proceedings)</SelectItem>
                    <SelectItem key="PENDING_PWC">PENDING_PWC (Drafting Required)</SelectItem>
                    <SelectItem key="STAY_IN_FORCE">STAY_IN_FORCE (High Risk / Article 226(3))</SelectItem>
                    <SelectItem key="CONTEMPT_NOTICE">CONTEMPT_NOTICE (Time-bound Warning)</SelectItem>
                    <SelectItem key="DISPOSED">DISPOSED (Judicial Order Passed)</SelectItem>
                  </Select>
                </div>

                <Input
                  size="sm"
                  label="Remarks / Transition Note"
                  labelPlacement="outside"
                  placeholder="e.g. Counter Affidavit vetted and handed to CSC"
                  value={statusRemarks}
                  onValueChange={setStatusRemarks}
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isUpdatingStatus}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isUpdatingStatus}
                  onClick={handleUpdateStatus}
                >
                  Commit Status
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: TAG CONNECTED WRIT */}
      <Modal isOpen={isAttachOpen} onOpenChange={onAttachOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">add_link</span>
                Tag Connected Writ to Lead Docket: {caseData.fileNo}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Court Writ Number"
                  labelPlacement="outside"
                  placeholder="e.g. WRIT-A / 4025 / 2026"
                  value={newWritNo}
                  onValueChange={setNewWritNo}
                  isRequired
                />
                <Input
                  size="sm"
                  label="CNR Number (If Available)"
                  labelPlacement="outside"
                  placeholder="e.g. UPHC010040252026"
                  value={newCnrNo}
                  onValueChange={setNewCnrNo}
                />
                <Input
                  size="sm"
                  label="Petitioner Name"
                  labelPlacement="outside"
                  placeholder="e.g. Surendra Pratap & Ors"
                  value={newPetitioner}
                  onValueChange={setNewPetitioner}
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isAttaching}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isAttaching}
                  onClick={handleAttachWrit}
                >
                  Tag to Docket
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}