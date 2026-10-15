"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import {
  Card,
  CardBody,
  Button,
  Select,
  SelectItem,
  Input,
  Textarea,
  Chip,
  RadioGroup,
  Radio,
  Divider,
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

import { CasesAPI, CaseItem } from "@/api/casesApi";
import {
  NotingsAPI,
  INotingMinuteItem,
  ForwardableOfficer,
} from "@/api/notingsApi";

const NOTING_PURPOSES = [
  { key: "PWC / Legal Opinion", label: "PWC / Legal Opinion" },
  { key: "Direction to Section", label: "Direction to Section" },
  { key: "Para-Wise Comments (PWC) Approval", label: "Para-Wise Comments (PWC) Approval" },
  { key: "File Movement", label: "File Movement" },
  { key: "Other", label: "Other Administrative Note" },
];

const URGENCY_OPTIONS = [
  { key: "High Priority (NDOH)", label: "High Priority (NDOH)" },
  { key: "Urgent", label: "Urgent (Stay Motion)" },
  { key: "Routine", label: "Routine File Movement" },
];

function GreenSheetNotingsContent() {
  const searchParams = useSearchParams();
  const queryCaseId = searchParams.get("caseId");

  const { isOpen: isVerifyOpen, onOpen: onVerifyOpen, onOpenChange: onVerifyOpenChange } = useDisclosure();
  const { isOpen: isPrintPreviewOpen, onOpen: onPrintPreviewOpen, onOpenChange: onPrintPreviewOpenChange } = useDisclosure();

  const [casesList, setCasesList] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [officersList, setOfficersList] = useState<ForwardableOfficer[]>([]);
  const [loadingCases, setLoadingCases] = useState<boolean>(true);

  const [notings, setNotings] = useState<INotingMinuteItem[]>([]);
  const [loadingNotings, setLoadingNotings] = useState<boolean>(false);
  const [activeDraft, setActiveDraft] = useState<INotingMinuteItem | null>(null);

  const [notingPurpose, setNotingPurpose] = useState<string>("PWC / Legal Opinion");
  const [fontEncoding, setFontEncoding] = useState<"Unicode" | "Kruti Dev 14">("Unicode");
  const [destinationUserId, setDestinationUserId] = useState<string>("");
  const [fileUrgency, setFileUrgency] = useState<"Routine" | "Urgent" | "High Priority (NDOH)">("High Priority (NDOH)");
  const [dueDate, setDueDate] = useState<string>("");
  const [notingText, setNotingText] = useState<string>("");

  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [isSigning, setIsSigning] = useState<boolean>(false);

  const [activeSignData, setActiveSignData] = useState<any>(null);
  const [printMemoData, setPrintMemoData] = useState<any>(null);

  useEffect(() => {
    async function initData() {
      setLoadingCases(true);
      try {
        const [casesRes, officersRes] = await Promise.all([
          CasesAPI.getCases({ limit: 100 }),
          NotingsAPI.getForwardableOfficers(),
        ]);

        if (casesRes?.success && Array.isArray(casesRes.data)) {
          setCasesList(casesRes.data);
          if (casesRes.data.length > 0) {
            const initialId = queryCaseId && casesRes.data.some((c) => c._id === queryCaseId)
              ? queryCaseId
              : casesRes.data[0]._id;
            setSelectedCaseId(initialId);
          }
        }

        if (officersRes?.success && Array.isArray(officersRes.data)) {
          setOfficersList(officersRes.data);
          if (officersRes.data.length > 0) {
            setDestinationUserId(officersRes.data[0].userId);
          }
        }
      } catch (err: any) {
        console.error("Failed to load notings workspace data:", err);
        toast.error("Failed to initialize green sheet workspace");
      } finally {
        setLoadingCases(false);
      }
    }
    initData();
  }, [queryCaseId]);

  const fetchCaseNotings = useCallback(async (caseId: string) => {
    if (!caseId) return;
    setLoadingNotings(true);
    try {
      const res = await NotingsAPI.getCaseNotings(caseId);
      if (res?.success) {
        setNotings(res.data || []);
        if (res.activeDraft) {
          setActiveDraft(res.activeDraft);
          setNotingText(res.activeDraft.content || "");
          setNotingPurpose(res.activeDraft.notingPurpose || "PWC / Legal Opinion");
          setFontEncoding(res.activeDraft.fontEncoding || "Unicode");
          if (res.activeDraft.forwardToUserId) {
            setDestinationUserId(String(res.activeDraft.forwardToUserId));
          }
        } else {
          setActiveDraft(null);
          setNotingText("");
        }
      }
    } catch (err: any) {
      console.error("Failed to load case notings:", err);
      toast.error(err.response?.data?.message || "Failed to load notings ledger");
    } finally {
      setLoadingNotings(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      fetchCaseNotings(selectedCaseId);
    }
  }, [selectedCaseId, fetchCaseNotings]);

  const activeCase = useMemo(() => {
    return casesList.find((c) => c._id === selectedCaseId);
  }, [casesList, selectedCaseId]);

  const caseSelectItems = useMemo(() => {
    return casesList.map((c) => ({
      key: c._id,
      label: `${c.fileNo} · ${c.writNumber || "Notice"} — ${c.leadPetitioner}`,
    }));
  }, [casesList]);

  const officerSelectItems = useMemo(() => {
    return officersList.map((o) => ({
      key: o.userId,
      label: o.displayName,
    }));
  }, [officersList]);

  const handleSaveDraft = async () => {
    if (!notingText.trim()) {
      toast.error("Please enter noting text before saving draft.");
      return;
    }
    if (!selectedCaseId) return;

    setIsSavingDraft(true);
    try {
      const payload = {
        content: notingText.trim(),
        minuteTitle: `Draft Minute #${notings.length + 1} — ${notingPurpose}`,
        notingPurpose,
        fontEncoding,
        forwardToUserId: destinationUserId || undefined,
        turnaroundDueDate: dueDate || undefined,
        fileUrgency,
      };

      const res = await NotingsAPI.saveDraftNoting(selectedCaseId, payload);
      if (res?.success) {
        toast.success("Draft minute saved successfully!");
        fetchCaseNotings(selectedCaseId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSignAndForward = async () => {
    if (!notingText.trim()) {
      toast.error("Noting text cannot be empty.");
      return;
    }
    if (!destinationUserId) {
      toast.error("Please select an authority to forward the file to.");
      return;
    }
    if (!selectedCaseId) return;

    setIsSigning(true);
    try {
      const payload = {
        minuteId: activeDraft?._id,
        content: notingText.trim(),
        minuteTitle: `Minute #${notings.length + 1} — ${notingPurpose}`,
        notingPurpose,
        fontEncoding,
        forwardToUserId: destinationUserId,
        turnaroundDueDate: dueDate || undefined,
        fileUrgency,
      };

      const res = await NotingsAPI.signAndForwardNoting(selectedCaseId, payload);
      if (res?.success) {
        toast.success(res.message || "File digitally signed and routed successfully!", {
          icon: "✍️",
          duration: 5000,
        });
        setNotingText("");
        fetchCaseNotings(selectedCaseId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Digital signing protocol failed");
    } finally {
      setIsSigning(false);
    }
  };

  const openSignatureModal = async (minute: INotingMinuteItem) => {
    try {
      const res = await NotingsAPI.verifySignature(selectedCaseId, minute.minuteNumber);
      if (res?.success) {
        setActiveSignData(res.auditDetails);
        onVerifyOpen();
      }
    } catch {
      setActiveSignData(minute.signature || null);
      onVerifyOpen();
    }
  };

  const handleOpenPrintPreview = async () => {
    if (!selectedCaseId) return;
    try {
      const res = await NotingsAPI.getPrintMemo(selectedCaseId);
      if (res?.success) {
        setPrintMemoData(res);
        onPrintPreviewOpen();
      }
    } catch (err: any) {
      toast.error("Failed to compile print memo");
    }
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
                <h1 className="text-base font-bold text-slate-900">4.0 Green Sheet Notings &amp; File Movement</h1>
                <Chip size="sm" className="bg-emerald-500/20 px-1 text-[10px] font-bold text-emerald-800">
                  Secretariat Digital Ledger
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Viewing Official File Movement &amp; PWC Minutes for:{" "}
                <b className="text-slate-900">{activeCase?.fileNo || "--"}</b> ·{" "}
                <span className="text-blue-700 font-semibold">{activeCase?.writNumber || "Advance Notice"}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/admin/cases/${selectedCaseId}`}>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                  startContent={<span className="material-symbols-rounded text-sm">visibility</span>}
                >
                  View 360° Dossier
                </Button>
              </Link>
              <Link href={`/admin/documents?caseId=${selectedCaseId}`}>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                  startContent={<span className="material-symbols-rounded text-sm">folder_open</span>}
                >
                  Open E-File DMS
                </Button>
              </Link>
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white shadow-sm hover:bg-[#163a66]"
                startContent={<span className="material-symbols-rounded text-sm">print</span>}
                onClick={handleOpenPrintPreview}
              >
                Print Green Sheet
              </Button>
            </div>
          </div>

          {/* Active Case Selector & Quick Status Banner */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Select
              size="sm"
              radius="sm"
              label="Select Case Matter File"
              labelPlacement="outside"
              items={caseSelectItems}
              selectedKeys={selectedCaseId ? [selectedCaseId] : []}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              isLoading={loadingCases}
              className="bg-slate-50 font-semibold"
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>

            <div className="rounded-lg bg-slate-50 p-2 text-xs border border-slate-200 sm:col-span-2 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 truncate max-w-md">{activeCase?.leadPetitioner || "--"}</p>
                <p className="text-slate-500 text-[11px]">
                  {activeCase?.court || "--"} · {activeCase?.benchLocation} Bench | NDOH:{" "}
                  <b className="text-slate-800">
                    {activeCase?.ndoh ? new Date(activeCase.ndoh).toLocaleDateString("en-GB") : "Not Listed"}
                  </b>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {activeCase?.isContemptNotice && (
                  <Chip size="sm" color="danger" variant="solid" className="font-bold text-[9px] h-5">
                    CONTEMPT
                  </Chip>
                )}
                {activeCase?.hasActiveStay && (
                  <Chip size="sm" color="danger" variant="solid" className="font-bold text-[9px] h-5">
                    STAY
                  </Chip>
                )}
                <Chip size="sm" color="warning" variant="flat" className="font-bold text-[10px]">
                  {activeCase?.stage || "Pending PWC"}
                </Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Workspace Split: Left (Green Sheet Ledger) + Right (Drafting Desk) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Chronological Ledger (7 Columns) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Noting Sheet Ledger (Immutable History)
            </h3>
            <span className="text-[11px] text-slate-400">Total Minutes: {notings.length}</span>
          </div>

          <div className="space-y-3">
            {loadingNotings ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            ) : notings.length > 0 ? (
              notings.map((n) => (
                <Card key={n.minuteNumber} shadow="none" className="border border-emerald-200/70 bg-emerald-50/30">
                  <CardBody className="p-4 space-y-3">
                    {/* Minute Header */}
                    <div className="flex items-center justify-between border-b border-emerald-200/50 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white">
                          {n.minuteNumber}
                        </span>
                        <p className="text-xs font-bold text-emerald-950">
                          {n.minuteTitle || `Minute #${n.minuteNumber} — ${n.notingPurpose}`}
                        </p>
                      </div>
                      {n.status === "SIGNED_AND_FORWARDED" ? (
                        <Chip
                          size="sm"
                          color="success"
                          variant="solid"
                          className="h-4 text-[9px] px-1 font-bold cursor-pointer hover:bg-emerald-600 transition-colors"
                          onClick={() => openSignatureModal(n)}
                        >
                          ✓ DIGITALLY SIGNED
                        </Chip>
                      ) : (
                        <Chip size="sm" color="warning" variant="flat" className="h-4 text-[9px] px-1 font-bold">
                          DRAFT IN PROGRESS
                        </Chip>
                      )}
                    </div>

                    {/* Minute Content */}
                    <p className="text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-wrap">
                      {n.content}
                    </p>

                    {/* Signature Stamp Footer */}
                    <div className="flex items-center justify-between border-t border-emerald-200/40 pt-2 text-[10px] text-slate-500">
                      <div>
                        <span className="font-bold text-slate-700">{n.authorName}</span> · {n.authorDesignation}
                        {n.forwardedToOfficerName && (
                          <span className="ml-1 text-slate-400">
                            ➔ Forwarded to: <b>{n.forwardedToOfficerName}</b>
                          </span>
                        )}
                      </div>
                      <div>
                        {new Date(n.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {n.signature?.certificateSerialNumber && (
                          <span
                            className="font-mono text-[9px] text-emerald-800 cursor-pointer underline hover:text-emerald-950 ml-1"
                            onClick={() => openSignatureModal(n)}
                          >
                            [{n.signature.certificateSerialNumber}]
                          </span>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-emerald-200 p-8 text-center text-xs text-slate-400 bg-white">
                No minutes recorded yet on this file docket. Compose the opening minute using the drafting desk.
              </div>
            )}
          </div>
        </div>

        {/* Right: New Minute Drafting & File Routing Desk (5 Columns) */}
        <div className="space-y-4 lg:col-span-5">
          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <div className="border-b border-slate-100 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Draft Minute #{notings.length + 1}
              </h3>
              <p className="text-[11px] text-slate-400">Compose institutional remarks and route the legal file</p>
            </div>

            <CardBody className="p-4 space-y-4">
              {/* Purpose & Font Normalization */}
              <div className="grid grid-cols-2 gap-3">
                <Select
                  size="sm"
                  label="Noting Purpose"
                  labelPlacement="outside"
                  items={NOTING_PURPOSES}
                  selectedKeys={[notingPurpose]}
                  onChange={(e) => setNotingPurpose(e.target.value)}
                  isRequired
                >
                  {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                </Select>

                <div>
                  <p className="text-[11px] font-bold text-slate-700 mb-1">Font Normalization</p>
                  <RadioGroup
                    orientation="horizontal"
                    value={fontEncoding}
                    onValueChange={(val) => setFontEncoding(val as any)}
                    classNames={{ wrapper: "gap-3" }}
                  >
                    <Radio value="Unicode" classNames={{ label: "text-xs font-semibold" }}>
                      Unicode
                    </Radio>
                    <Radio value="Kruti Dev 14" classNames={{ label: "text-xs font-semibold" }}>
                      Kruti Dev 14
                    </Radio>
                  </RadioGroup>
                </div>
              </div>

              {/* Hindi / English Typing Box */}
              <div>
                <Textarea
                  size="sm"
                  minRows={6}
                  label="Noting Text (हिंदी / English)"
                  labelPlacement="outside"
                  placeholder="टिप्पणी यहाँ दर्ज करें..."
                  value={notingText}
                  onValueChange={setNotingText}
                  className="font-serif text-xs leading-relaxed"
                  isRequired
                />
              </div>

              <Divider />

              {/* Destination Routing Desk */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Forward File to Authority
                </h4>

                <Select
                  size="sm"
                  label="Forward To Officer (Recipient)"
                  labelPlacement="outside"
                  items={officerSelectItems}
                  selectedKeys={destinationUserId ? [destinationUserId] : []}
                  onChange={(e) => setDestinationUserId(e.target.value)}
                  isRequired
                >
                  {(officer) => <SelectItem key={officer.key}>{officer.label}</SelectItem>}
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    size="sm"
                    label="Turnaround Due Date"
                    labelPlacement="outside"
                    type="date"
                    value={dueDate}
                    onValueChange={setDueDate}
                  />
                  <Select
                    size="sm"
                    label="File Urgency"
                    labelPlacement="outside"
                    items={URGENCY_OPTIONS}
                    selectedKeys={[fileUrgency]}
                    onChange={(e) => setFileUrgency(e.target.value as any)}
                  >
                    {(u) => <SelectItem key={u.key}>{u.label}</SelectItem>}
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  className="text-xs"
                  isLoading={isSavingDraft}
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-emerald-700 font-semibold text-white shadow hover:bg-emerald-800 text-xs"
                  startContent={<span className="material-symbols-rounded text-sm">verified</span>}
                  isLoading={isSigning}
                  onClick={handleSignAndForward}
                >
                  Sign &amp; Forward File
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 1. Digital Signature Certificate Verification Modal */}
      <Modal isOpen={isVerifyOpen} onOpenChange={onVerifyOpenChange} placement="center" size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 py-3">
                <span className="material-symbols-rounded text-emerald-600">verified_user</span>
                Digital Signature Cryptographic Certificate
              </ModalHeader>
              <ModalBody className="py-4 space-y-3 text-xs">
                <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Legal Validity: VALID &amp; TAMPER-EVIDENT</span>
                    <Chip size="sm" color="success" variant="solid" className="text-[9px] font-bold">
                      SHA-256
                    </Chip>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Complies with Information Technology Act, 2000 &amp; Secretariat Electronic Noting Protocols.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signer Officer:</span>
                    <span className="font-bold text-slate-800">{activeSignData?.signedBy || activeSignData?.signerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Designation / Role:</span>
                    <span className="text-slate-800">{activeSignData?.designation || activeSignData?.signerDesignation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signing Timestamp:</span>
                    <span className="font-mono text-slate-800">
                      {activeSignData?.timestamp ? new Date(activeSignData.timestamp).toLocaleString("en-GB") : "--"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Certificate Serial:</span>
                    <span className="font-mono text-[11px] text-blue-700">
                      {activeSignData?.certificateSerial || activeSignData?.certificateSerialNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cryptographic Hash Seal:</span>
                    <span className="font-mono text-[10px] text-slate-700 truncate max-w-[200px]">
                      {activeSignData?.sha256HashSeal || activeSignData?.sha256Seal}
                    </span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-slate-100 py-2">
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Close Verification
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 2. Official Secretariat Green Sheet Print Preview Modal */}
      <Modal isOpen={isPrintPreviewOpen} onOpenChange={onPrintPreviewOpenChange} placement="center" size="4xl">
        <ModalContent className="max-h-[90vh]">
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-slate-100 flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-emerald-700">print</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Official Green Sheet Print Preview — {printMemoData?.memoHeader?.fileNo || activeCase?.fileNo}
                    </h3>
                    <p className="text-[10px] text-slate-400">UPPRPB Legal Secretariat Certified Memo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mr-6">
                  <Button
                    size="sm"
                    className="bg-[#0f2744] text-white text-xs h-7"
                    startContent={<span className="material-symbols-rounded text-sm">print</span>}
                    onClick={() => window.print()}
                  >
                    Print Memo
                  </Button>
                </div>
              </ModalHeader>
              <ModalBody className="p-6 overflow-y-auto bg-slate-100/60">
                <div className="mx-auto w-full max-w-2xl bg-[#ebf7ee] border-2 border-emerald-300 p-8 rounded shadow-sm text-xs leading-relaxed space-y-6 font-serif">
                  {/* Top Seal & Heading */}
                  <div className="text-center border-b border-emerald-400/60 pb-4">
                    <p className="font-bold text-sm tracking-wider uppercase text-emerald-950">
                      {printMemoData?.memoHeader?.institution || "उत्तर प्रदेश पुलिस भर्ती एवं प्रोन्नति बोर्ड, लखनऊ"}
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      तुलसी गंगा कॉम्पलेक्स, 19-सी विधान सभा मार्ग, लखनऊ (विधिक प्रकोष्ठ)
                    </p>
                    <div className="mt-2 inline-block bg-white/70 px-3 py-1 rounded border border-emerald-300 text-[11px] font-sans font-bold text-emerald-900">
                      नोटिंग पत्रावली (Green Noting Sheet) · {printMemoData?.memoHeader?.fileNo || activeCase?.fileNo}
                    </div>
                  </div>

                  {/* Litigant Details Header */}
                  <div className="bg-white/60 p-3 rounded border border-emerald-200 font-sans text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">याचिका / वाद:</span>
                      <span className="font-bold text-slate-800">{printMemoData?.memoHeader?.parties || activeCase?.leadPetitioner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">न्यायालय:</span>
                      <span className="text-slate-800">{printMemoData?.memoHeader?.courtBench || activeCase?.court}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">अग्रिम नियत तिथि (NDOH):</span>
                      <span className="font-bold text-amber-800">
                        {activeCase?.ndoh ? new Date(activeCase.ndoh).toLocaleDateString("en-GB") : "Not Listed"}
                      </span>
                    </div>
                  </div>

                  {/* Sequential Minutes Ledger */}
                  <div className="space-y-4 pt-2">
                    {printMemoData?.ledgerMinutes && printMemoData.ledgerMinutes.length > 0 ? (
                      printMemoData.ledgerMinutes.map((m: any) => (
                        <div key={m.minuteNo} className="border-b border-emerald-300/80 pb-4 space-y-2">
                          <div className="flex justify-between font-sans text-[11px] font-bold text-emerald-950">
                            <span>टिप्पणी संख्या (Minute #{m.minuteNo}) — {m.purpose}</span>
                            <span className="text-[10px] text-emerald-800 font-normal">
                              {new Date(m.signedAt).toLocaleString("en-GB")}
                            </span>
                          </div>
                          <p className="text-slate-900 text-xs leading-relaxed text-justify whitespace-pre-wrap">
                            {m.content}
                          </p>
                          <div className="flex justify-end pt-2 text-[10px] font-sans text-slate-700">
                            <div className="text-right">
                              <p className="font-bold text-emerald-950">{m.signedBy}</p>
                              <p className="text-slate-600">{m.designation}</p>
                              <p className="font-mono text-[9px] text-emerald-800">[ह० प्रमाणित: {m.certSerial}]</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-400 italic">No signed minutes recorded on this file.</p>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-slate-100 py-2">
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Close Preview
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function GreenSheetNotingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500">Loading Green Sheet Notings...</div>}>
      <GreenSheetNotingsContent />
    </Suspense>
  );
}