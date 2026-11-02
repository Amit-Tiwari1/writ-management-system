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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { CasesAPI } from "@/api/casesApi";
import { CaseItem } from "@/types/case.types";
import {
  NotingsAPI,
  INotingMinuteItem,
  ForwardableOfficer,
} from "@/api/notingsApi";
import {
  signAndForwardSchema,
  SignAndForwardFormValues,
} from "@/schemas/notingSchema";

interface KeyLabelOption {
  key: string;
  label: string;
}

const NOTING_PURPOSES: KeyLabelOption[] = [
  { key: "PWC / Legal Opinion", label: "PWC / Legal Opinion" },
  { key: "Direction to Section", label: "Direction to Section" },
  { key: "Para-Wise Comments (PWC) Approval", label: "Para-Wise Comments (PWC) Approval" },
  { key: "File Movement", label: "File Movement" },
  { key: "Other", label: "Other Administrative Note" },
];

const URGENCY_OPTIONS: KeyLabelOption[] = [
  { key: "High Priority (NDOH)", label: "High Priority (NDOH)" },
  { key: "Urgent", label: "Urgent (Stay Motion)" },
  { key: "Routine", label: "Routine File Movement" },
];

function GreenSheetNotingsContent() {
  const searchParams = useSearchParams();
  const queryCaseId = searchParams.get("caseId");

  const { isOpen: isVerifyOpen, onOpen: onVerifyOpen, onOpenChange: onVerifyOpenChange } = useDisclosure();

  const [casesList, setCasesList] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [officersList, setOfficersList] = useState<ForwardableOfficer[]>([]);
  const [loadingCases, setLoadingCases] = useState<boolean>(true);

  const [notings, setNotings] = useState<INotingMinuteItem[]>([]);
  const [loadingNotings, setLoadingNotings] = useState<boolean>(false);
  const [activeDraft, setActiveDraft] = useState<INotingMinuteItem | null>(null);

  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const [activeSignData, setActiveSignData] = useState<any>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SignAndForwardFormValues>({
    resolver: zodResolver(signAndForwardSchema) as any,
    defaultValues: {
      minuteTitle: "",
      notingPurpose: "PWC / Legal Opinion",
      fontEncoding: "Unicode",
      content: "",
      forwardToUserId: "",
      turnaroundDueDate: "",
      fileUrgency: "High Priority (NDOH)",
    },
  });

  const watchContent = watch("content");
  const watchPurpose = watch("notingPurpose");
  const watchEncoding = watch("fontEncoding");
  const watchRecipient = watch("forwardToUserId");
  const watchDueDate = watch("turnaroundDueDate");
  const watchUrgency = watch("fileUrgency");

  useEffect(() => {
    async function initData() {
      setLoadingCases(true);
      try {
        const [casesRes, officersRes] = await Promise.all([
          CasesAPI.getCases({ limit: 150 }),
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
            setValue("forwardToUserId", officersRes.data[0].userId);
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
  }, [queryCaseId, setValue]);

  const fetchCaseNotings = useCallback(async (caseId: string) => {
    if (!caseId) return;
    setLoadingNotings(true);
    try {
      const res = await NotingsAPI.getCaseNotings(caseId);
      if (res?.success) {
        setNotings(res.data || []);
        if (res.activeDraft) {
          setActiveDraft(res.activeDraft);
          setValue("content", res.activeDraft.content || "");
          setValue("notingPurpose", (res.activeDraft.notingPurpose as any) || "PWC / Legal Opinion");
          setValue("fontEncoding", res.activeDraft.fontEncoding || "Unicode");
          if (res.activeDraft.forwardToUserId) {
            setValue("forwardToUserId", String(res.activeDraft.forwardToUserId));
          }
          if (res.activeDraft.turnaroundDueDate) {
            setValue("turnaroundDueDate", new Date(res.activeDraft.turnaroundDueDate).toISOString().split("T")[0]);
          }
          if (res.activeDraft.fileUrgency) {
            setValue("fileUrgency", res.activeDraft.fileUrgency);
          }
        } else {
          setActiveDraft(null);
          setValue("content", "");
        }
      }
    } catch (err: any) {
      console.error("Failed to load case notings:", err);
      toast.error(err.response?.data?.message || "Failed to load notings ledger");
    } finally {
      setLoadingNotings(false);
    }
  }, [setValue]);

  useEffect(() => {
    if (selectedCaseId) {
      fetchCaseNotings(selectedCaseId);
    }
  }, [selectedCaseId, fetchCaseNotings]);

  const activeCase = useMemo(() => {
    return casesList.find((c) => c._id === selectedCaseId);
  }, [casesList, selectedCaseId]);

  const caseSelectItems: KeyLabelOption[] = useMemo(() => {
    return casesList.map((c) => ({
      key: c._id,
      label: `${c.fileNo} · ${c.writNumber || c.noticeNumber || "Advance Notice"} — ${c.leadPetitioner}`,
    }));
  }, [casesList]);

  const officerSelectItems: KeyLabelOption[] = useMemo(() => {
    return officersList.map((o) => ({
      key: o.userId,
      label: o.displayName,
    }));
  }, [officersList]);

  const handleSaveDraft = async () => {
    if (!watchContent || !watchContent.trim()) {
      toast.error("Please enter noting text before saving draft.");
      return;
    }
    if (!selectedCaseId) return;

    setIsSavingDraft(true);
    try {
      const payload = {
        content: watchContent.trim(),
        minuteTitle: `Draft Minute #${notings.length + 1} — ${watchPurpose}`,
        notingPurpose: watchPurpose,
        fontEncoding: watchEncoding,
        forwardToUserId: watchRecipient || undefined,
        turnaroundDueDate: watchDueDate || undefined,
        fileUrgency: watchUrgency,
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

  const onSignAndForwardSubmit = async (values: SignAndForwardFormValues) => {
    if (!selectedCaseId) return;

    setIsSigning(true);
    try {
      const payload = {
        minuteId: activeDraft?._id,
        content: values.content.trim(),
        minuteTitle: `Minute #${notings.length + 1} — ${values.notingPurpose}`,
        notingPurpose: values.notingPurpose,
        fontEncoding: values.fontEncoding,
        forwardToUserId: values.forwardToUserId,
        turnaroundDueDate: values.turnaroundDueDate || undefined,
        fileUrgency: values.fileUrgency,
      };

      const res = await NotingsAPI.signAndForwardNoting(selectedCaseId, payload);
      if (res?.success) {
        toast.success(res.message || "File digitally signed and routed successfully!", {
          icon: "✍️",
          duration: 5000,
        });
        reset({
          content: "",
          minuteTitle: "",
          notingPurpose: "PWC / Legal Opinion",
          fontEncoding: "Unicode",
          forwardToUserId: values.forwardToUserId,
          fileUrgency: "High Priority (NDOH)",
        });
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

  const handleDownloadGreenSheetPdf = async () => {
    if (!selectedCaseId) return;
    setIsDownloadingPdf(true);
    const toastId = toast.loading("Compiling Certified Green Sheet PDF...");
    try {
      const htmlContent = await NotingsAPI.downloadPrintMemoPdf(selectedCaseId);

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.dismiss(toastId);
        toast.error("Please allow popups to view the Green Sheet PDF.");
        return;
      }

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success("Green Sheet compiled successfully!", { id: toastId });
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to download print memo.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Information Bar */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4 space-y-3">
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
                <span className="text-blue-700 font-semibold">{activeCase?.writNumber || activeCase?.noticeNumber || "Advance Notice"}</span>
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
                isLoading={isDownloadingPdf}
                onClick={handleDownloadGreenSheetPdf}
              >
                Print Green Sheet
              </Button>
            </div>
          </div>

          {/* Clean Full-Width Case Dropdown */}
          <div className="border-t border-slate-100 pt-3">
            <Select
              size="sm"
              radius="sm"
              label="Select Case Matter E-File Docket"
              labelPlacement="outside"
              placeholder="Search or pick case docket..."
              items={caseSelectItems}
              selectedKeys={selectedCaseId ? [selectedCaseId] : []}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              isLoading={loadingCases}
              className="bg-slate-50 font-semibold w-full"
            >
              {(item: KeyLabelOption) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
          </div>

          {/* Compact Case Context Strip */}
          {activeCase && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900">{activeCase.leadPetitioner}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">{activeCase.court} ({activeCase.benchLocation})</span>
                <span className="text-slate-400">·</span>
                <span className="font-semibold text-amber-800">
                  NDOH: {activeCase.ndoh ? new Date(activeCase.ndoh).toLocaleDateString("en-GB") : "Not Listed"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {activeCase.hasActiveStay && (
                  <Chip size="sm" color="danger" variant="solid" className="font-bold text-[9px] h-5">
                    STAY ACTIVE
                  </Chip>
                )}
                {activeCase.isContemptNotice && (
                  <Chip size="sm" color="danger" variant="solid" className="font-bold text-[9px] h-5">
                    CONTEMPT
                  </Chip>
                )}
                <Chip size="sm" color="primary" variant="flat" className="font-bold text-[10px]">
                  {activeCase.stage || "Active Stage"}
                </Chip>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* 2. Main Workspace Split: Left (Immutable Ledger) + Right (Drafting Desk) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-start">
        {/* Left: Chronological Ledger (7 Cols, Independent Scroll) */}
        <div className="space-y-3 lg:col-span-7">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Noting Sheet Ledger (Immutable Record)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Total Minutes: {notings.length}</span>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {loadingNotings ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            ) : notings.length > 0 ? (
              notings.map((n) => (
                <Card key={n.minuteNumber} shadow="none" className="border border-emerald-200/80 bg-emerald-50/25">
                  <CardBody className="p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200/50 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0f2744] text-[10px] font-bold text-white">
                          {n.minuteNumber}
                        </span>
                        <p className="text-xs font-bold text-slate-900">
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

                    <p
                      className={`text-xs text-slate-900 leading-relaxed whitespace-pre-wrap ${
                        n.fontEncoding === "Kruti Dev 14" ? "font-serif" : "font-sans"
                      }`}
                    >
                      {n.content}
                    </p>

                    <div className="flex items-center justify-between border-t border-emerald-200/40 pt-2 text-[10px] text-slate-500">
                      <div>
                        <span className="font-bold text-slate-800">{n.authorName}</span> · {n.authorDesignation}
                        {n.forwardedToOfficerName && (
                          <span className="ml-1 text-slate-600">
                            ➔ Routed to: <b>{n.forwardedToOfficerName}</b>
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[9px]">
                        {new Date(n.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {n.signature?.certificateSerialNumber && (
                          <span
                            className="text-emerald-800 cursor-pointer underline hover:text-emerald-950 font-bold ml-1"
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

        {/* Right: Drafting & Routing Desk (5 Cols, Sticky) */}
        <div className="space-y-3 lg:col-span-5 sticky top-4">
          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <div className="border-b border-slate-100 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Draft Minute #{notings.length + 1}
              </h3>
              <p className="text-[11px] text-slate-400">Compose institutional remarks and route the legal file</p>
            </div>

            <CardBody className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="notingPurpose"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Noting Purpose *"
                      labelPlacement="outside"
                      items={NOTING_PURPOSES}
                      selectedKeys={[field.value]}
                      onChange={(e) => field.onChange(e.target.value)}
                      isRequired
                    >
                      {(item: KeyLabelOption) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                    </Select>
                  )}
                />

                <div>
                  <p className="text-[11px] font-bold text-slate-700 mb-1">Font Normalization</p>
                  <Controller
                    name="fontEncoding"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        orientation="horizontal"
                        value={field.value}
                        onValueChange={field.onChange}
                        classNames={{ wrapper: "gap-3" }}
                      >
                        <Radio value="Unicode" classNames={{ label: "text-xs font-semibold" }}>
                          Unicode
                        </Radio>
                        <Radio value="Kruti Dev 14" classNames={{ label: "text-xs font-semibold" }}>
                          Kruti Dev
                        </Radio>
                      </RadioGroup>
                    )}
                  />
                </div>
              </div>

              <div>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      size="sm"
                      minRows={7}
                      label="Noting Minute Text (हिंदी / English) *"
                      labelPlacement="outside"
                      placeholder="टिप्पणी यहाँ दर्ज करें (उदा. पैरा-वार टिप्पणी CSC कार्यालय को प्रेषित की जानी है)..."
                      className="font-serif text-xs leading-relaxed"
                      isInvalid={!!errors.content}
                      errorMessage={errors.content?.message}
                      isRequired
                    />
                  )}
                />
              </div>

              <Divider className="my-1" />

              {/* Destination Routing Desk with Fixed Margins & Labels */}
              <div className="space-y-3 pt-1">
                <div className="border-b border-slate-100 pb-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    File Routing &amp; Recipient Officer
                  </h4>
                </div>

                <Controller
                  name="forwardToUserId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Route To Desk *"
                      labelPlacement="outside"
                      placeholder="Select authority to dispatch file..."
                      items={officerSelectItems}
                      selectedKeys={field.value ? [field.value] : []}
                      onChange={(e) => field.onChange(e.target.value)}
                      isInvalid={!!errors.forwardToUserId}
                      errorMessage={errors.forwardToUserId?.message}
                      isRequired
                    >
                      {(officer: KeyLabelOption) => <SelectItem key={officer.key}>{officer.label}</SelectItem>}
                    </Select>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    name="turnaroundDueDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        size="sm"
                        label="Turnaround Due Date"
                        labelPlacement="outside"
                        type="date"
                      />
                    )}
                  />
                  <Controller
                    name="fileUrgency"
                    control={control}
                    render={({ field }) => (
                      <Select
                        size="sm"
                        label="File Urgency"
                        labelPlacement="outside"
                        items={URGENCY_OPTIONS}
                        selectedKeys={[field.value]}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        {(u: KeyLabelOption) => <SelectItem key={u.key}>{u.label}</SelectItem>}
                      </Select>
                    )}
                  />
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
                  startContent={!isSigning && <span className="material-symbols-rounded text-sm">verified</span>}
                  isLoading={isSigning}
                  onClick={handleSubmit(onSignAndForwardSubmit)}
                >
                  Sign &amp; Forward File
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Digital Signature Certificate Verification Modal */}
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
                    <span className="font-bold text-sm">Legal Validity: VALID &amp; TAMPER-PROOF</span>
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
                    <span className="font-mono text-[11px] text-blue-700 font-bold">
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