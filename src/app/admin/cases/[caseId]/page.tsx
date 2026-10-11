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
  useDisclosure,
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axiosClient from "@/api/axiosClient";
import { CasesAPI } from "@/api/casesApi";

export default function CaseDossier360Page() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.caseId as string;
  const { isOpen: isAttachOpen, onOpen: onAttachOpen, onOpenChange: onAttachOpenChange } = useDisclosure();

  const [caseData, setCaseData] = useState<any>(null);
  const [petitioners, setPetitioners] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAttaching, setIsAttaching] = useState<boolean>(false);

  const [newWritNo, setNewWritNo] = useState("");
  const [newCnrNo, setNewCnrNo] = useState("");
  const [newPetitioner, setNewPetitioner] = useState("");

  const fetchCaseDossier = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      const res = await CasesAPI.getCaseById(caseId);
      if (res?.success) {
        setCaseData(res.case);
        setPetitioners(res.petitioners || []);
      }
    } catch (err: any) {
      console.error("Failed to load case dossier:", err);
      toast.error(err.response?.data?.message || "Failed to load case dossier");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchCaseDossier();
  }, [fetchCaseDossier]);

  // 2. Attach a connected writ to this live dossier in DB
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

            <div className="flex items-center gap-2">
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Owning Wing</span>
              <p className="text-xs font-bold text-[#0f2744] mt-0.5 truncate">{caseData.sectionWing}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned OIC</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{caseData.assignedOIC}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <Tabs
            aria-label="Case Dossier Tabs"
            variant="underlined"
            classNames={{ tabList: "gap-6", cursor: "bg-[#0f2744]", tab: "max-w-fit px-0 h-9 text-xs font-semibold" }}
          >
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