"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import {
  Card,
  CardBody,
  Button,
  Select,
  SelectItem,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Textarea,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function DocumentDMSContent() {
  const searchParams = useSearchParams();
  const queryCaseId = searchParams.get("caseId");

  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onOpenChange: onUploadOpenChange } = useDisclosure();
  const { isOpen: isFullScreenOpen, onOpen: onFullScreenOpen, onOpenChange: onFullScreenOpenChange } = useDisclosure();
  const { isOpen: isAnnotateOpen, onOpen: onAnnotateOpen, onOpenChange: onAnnotateOpenChange } = useDisclosure();

  // Master case directory mapping
  const casesDB: Record<string, { label: string; caseNoYear: string; cnr: string; petitioner: string; court: string }> = {
    "1": {
      label: "WRIT-A / 4012 / 2026 — Abhay Gupta (High Court Allahabad)",
      caseNoYear: "WRIT-A / 4012 / 2026",
      cnr: "UPHC010029312026",
      petitioner: "Abhay Gupta & 4 Others",
      court: "High Court Allahabad (Principal Bench)",
    },
    "2": {
      label: "WRIT-A / 4021 / 2026 — Vikas Kumar Yadav (High Court Lucknow)",
      caseNoYear: "WRIT-A / 4021 / 2026",
      cnr: "UPHC020011402026",
      petitioner: "Vikas Kumar Yadav",
      court: "High Court Lucknow Bench",
    },
    "3": {
      label: "WRIT-A / 7100 / 2025 — Rohit Kumar (High Court Allahabad)",
      caseNoYear: "WRIT-A / 7100 / 2025",
      cnr: "UPHC010089212025",
      petitioner: "Rohit Kumar",
      court: "High Court Allahabad (Bench 12)",
    },
    "4": {
      label: "WRIT-A / 2025 / 19 — Sujit Yadav (High Court Allahabad)",
      caseNoYear: "WRIT-A / 2025 / 19",
      cnr: "UPHC010041122025",
      petitioner: "Sujit Yadav",
      court: "High Court Allahabad (Bench 34)",
    },
  };

  const [selectedCaseKey, setSelectedCaseKey] = useState<string>("1");
  const [activeFolder, setActiveFolder] = useState<string>("01_petitions");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sync with URL query parameter (?caseId=...)
  useEffect(() => {
    if (queryCaseId && casesDB[queryCaseId]) {
      setSelectedCaseKey(queryCaseId);
    }
  }, [queryCaseId]);

  const activeCase = useMemo(() => {
    return casesDB[selectedCaseKey] || casesDB["1"];
  }, [selectedCaseKey]);

  // Standard 5-tier E-file directory folders
  const folderCategories = [
    { key: "01_petitions", label: "01 Petitions & Annexures", icon: "description" },
    { key: "02_notings", label: "02 Internal Notings & PWC", icon: "edit_note" },
    { key: "03_counters", label: "03 Counter Affidavits Filed", icon: "verified" },
    { key: "04_orders", label: "04 Court Orders & Judgments", icon: "gavel" },
    { key: "05_compliance", label: "05 Compliance Proofs", icon: "task_alt" },
  ];

  // Case-specific file repository
  const [caseFilesRepository, setCaseFilesRepository] = useState<Record<string, Record<string, any[]>>>({
    "1": {
      "01_petitions": [
        { id: "f1-1", name: "Original_Writ_Petition_Filed_4012_2026.pdf", size: "4.2 MB", version: "v1.0", date: "15 Sep 2026", hash: "sha256:9f83ab...419c", status: "VERIFIED" },
        { id: "f1-2", name: "Annexure_P1_Exam_Admit_Card.pdf", size: "1.1 MB", version: "v1.0", date: "15 Sep 2026", hash: "sha256:3e41dd...009a", status: "VERIFIED" },
        { id: "f1-3", name: "CSC_Advance_Notice_Copy.pdf", size: "890 KB", version: "v1.0", date: "16 Sep 2026", hash: "sha256:aa8912...77ff", status: "VERIFIED" },
      ],
      "02_notings": [
        { id: "f1-4", name: "PWC_Draft_Comments_SP_Legal.pdf", size: "750 KB", version: "v2.1", date: "16 Sep 2026", hash: "sha256:1199ab...bc34", status: "VERIFIED" },
        { id: "f1-5", name: "Secretary_Approval_Minutes.pdf", size: "540 KB", version: "v1.0", date: "16 Sep 2026", hash: "sha256:ff7722...11aa", status: "VERIFIED" },
      ],
      "03_counters": [
        { id: "f1-6", name: "Counter_Affidavit_Draft_v1.pdf", size: "2.1 MB", version: "v1.0", date: "16 Sep 2026", hash: "sha256:cc3344...8899", status: "DRAFT" },
        { id: "f1-7", name: "Final_Sworn_Counter_Affidavit_High_Court.pdf", size: "3.5 MB", version: "v2.0", date: "16 Sep 2026", hash: "sha256:88aa11...5566", status: "VERIFIED" },
      ],
      "04_orders": [
        { id: "f1-8", name: "Interim_Order_Dated_12_Sep_2026_High_Court.pdf", size: "1.4 MB", version: "v1.0", date: "13 Sep 2026", hash: "sha256:55ee11...99bb", status: "API_SYNCED" },
        { id: "f1-9", name: "Notice_Listing_Order_Bench_34.pdf", size: "980 KB", version: "v1.0", date: "15 Sep 2026", hash: "sha256:77aa33...44cc", status: "API_SYNCED" },
      ],
      "05_compliance": [
        { id: "f1-10", name: "Compliance_Affidavit_Decision_Copy.pdf", size: "1.8 MB", version: "v1.0", date: "16 Sep 2026", hash: "sha256:22ff44...66aa", status: "VERIFIED" },
      ],
    },
    "2": {
      "01_petitions": [
        { id: "f2-1", name: "Writ_Petition_4021_2026_Vikas_Yadav.pdf", size: "3.8 MB", version: "v1.0", date: "20 Aug 2026", hash: "sha256:55ab77...9921", status: "VERIFIED" },
      ],
      "02_notings": [
        { id: "f2-2", name: "CMO_Medical_Board_Report_Noting.pdf", size: "920 KB", version: "v1.0", date: "28 Aug 2026", hash: "sha256:66cc11...00aa", status: "VERIFIED" },
      ],
      "03_counters": [
        { id: "f2-3", name: "Counter_Affidavit_Filed_By_State.pdf", size: "2.9 MB", version: "v1.0", date: "05 Sep 2026", hash: "sha256:bb7711...33ee", status: "VERIFIED" },
      ],
      "04_orders": [
        { id: "f2-4", name: "High_Court_Lucknow_Notice_Order.pdf", size: "1.2 MB", version: "v1.0", date: "22 Aug 2026", hash: "sha256:11ff33...88bb", status: "API_SYNCED" },
      ],
      "05_compliance": [],
    },
    "3": {
      "01_petitions": [
        { id: "f3-1", name: "Stay_Writ_Petition_7100_2025.pdf", size: "5.1 MB", version: "v1.0", date: "10 Jul 2025", hash: "sha256:77dd22...11ff", status: "VERIFIED" },
      ],
      "02_notings": [
        { id: "f3-2", name: "Vacation_of_Stay_Legal_Comments.pdf", size: "1.1 MB", version: "v1.0", date: "14 Aug 2026", hash: "sha256:99bb44...66cc", status: "VERIFIED" },
      ],
      "03_counters": [],
      "04_orders": [
        { id: "f3-3", name: "Interim_Stay_Order_Dated_12_Aug_2026.pdf", size: "2.2 MB", version: "v1.0", date: "12 Aug 2026", hash: "sha256:aa2288...44dd", status: "API_SYNCED" },
      ],
      "05_compliance": [],
    },
    "4": {
      "01_petitions": [
        { id: "f4-1", name: "Writ_Petition_2025_19_Sujit_Yadav.pdf", size: "2.4 MB", version: "v1.0", date: "15 Jan 2025", hash: "sha256:33ee99...11cc", status: "VERIFIED" },
      ],
      "02_notings": [
        { id: "f4-2", name: "Appointment_Order_Notings.pdf", size: "620 KB", version: "v1.0", date: "10 Aug 2026", hash: "sha256:88aa22...55ee", status: "VERIFIED" },
      ],
      "03_counters": [
        { id: "f4-3", name: "Sworn_Compliance_Affidavit_HC.pdf", size: "1.9 MB", version: "v1.0", date: "20 Aug 2026", hash: "sha256:44bb11...99aa", status: "VERIFIED" },
      ],
      "04_orders": [
        { id: "f4-4", name: "Final_Disposal_Judgment_Order.pdf", size: "1.5 MB", version: "v1.0", date: "02 Aug 2026", hash: "sha256:00ff66...22dd", status: "API_SYNCED" },
      ],
      "05_compliance": [
        { id: "f4-5", name: "Sub_Inspector_Appointment_Letter_Copy.pdf", size: "840 KB", version: "v1.0", date: "25 Aug 2026", hash: "sha256:77cc33...88bb", status: "VERIFIED" },
      ],
    },
  });

  // Current preview document
  const [previewDoc, setPreviewDoc] = useState<any>({
    title: "Original_Writ_Petition_Filed_4012_2026.pdf",
    folder: "01 Petitions & Annexures",
    size: "4.2 MB",
    hash: "sha256:9f83ab...419c",
    uploadedBy: "Registry Office (CSC Inward)",
    uploadedAt: "15 Sep 2026, 11:20 AM",
  });

  // Keep preview synced when switching case or folder
  useEffect(() => {
    const currentList = caseFilesRepository[selectedCaseKey]?.[activeFolder] || [];
    if (currentList.length > 0) {
      setPreviewDoc({
        title: currentList[0].name,
        folder: folderCategories.find((c) => c.key === activeFolder)?.label,
        size: currentList[0].size,
        hash: currentList[0].hash,
        uploadedBy: "Registry Officer / High Court API",
        uploadedAt: `${currentList[0].date} 11:00 AM`,
      });
    }
  }, [selectedCaseKey, activeFolder, caseFilesRepository]);

  // Upload modal state
  const [newUploadName, setNewUploadName] = useState("");
  const [newUploadFolder, setNewUploadFolder] = useState("01_petitions");

  // Marginal Annotation state
  const [annotationNote, setAnnotationNote] = useState("");
  const [annotationPara, setAnnotationPara] = useState("Para 14 (Grounds of Challenge)");

  const handleUploadSubmit = () => {
    if (!newUploadName) return;
    const newDoc = {
      id: `f-${Date.now()}`,
      name: newUploadName.endsWith(".pdf") ? newUploadName : `${newUploadName}.pdf`,
      size: "1.6 MB",
      version: "v1.0",
      date: "Today",
      hash: "sha256:22bb99...77aa",
      status: "VERIFIED",
    };

    setCaseFilesRepository((prev) => {
      const currentCase = prev[selectedCaseKey] || {};
      const currentFolderFiles = currentCase[newUploadFolder] || [];
      return {
        ...prev,
        [selectedCaseKey]: {
          ...currentCase,
          [newUploadFolder]: [newDoc, ...currentFolderFiles],
        },
      };
    });

    setPreviewDoc({
      title: newDoc.name,
      folder: folderCategories.find((c) => c.key === newUploadFolder)?.label,
      size: newDoc.size,
      hash: newDoc.hash,
      uploadedBy: "V. Sharma (Legal Cell Desk)",
      uploadedAt: "Just now",
    });

    setNewUploadName("");
    onUploadOpenChange();
  };

  const handleSaveAnnotation = () => {
    if (!annotationNote.trim()) return;
    alert(`Marginal Note recorded on ${annotationPara}! This comment is now available in 4.0 Green Sheet Notings.`);
    setAnnotationNote("");
    onAnnotateOpenChange();
  };

  const handleDownloadFile = (fileName: string) => {
    alert(`Initiating secure direct download from MinIO S3 for: ${fileName}`);
  };

  const currentFiles = useMemo(() => {
    const list = caseFilesRepository[selectedCaseKey]?.[activeFolder] || [];
    if (!searchQuery) return list;
    return list.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [caseFilesRepository, selectedCaseKey, activeFolder, searchQuery]);

  return (
    <div className="space-y-4">
      {/* 1. Header Bar */}
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
                <h1 className="text-base font-bold text-slate-900">3.0 Legal Document Repository (Case DMS)</h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  MinIO / S3 Storage
                </Chip>
              </div>
              <p className="mt-1 text-xs text-slate-500 ml-9">
                Viewing Digital Dossier for: <b className="text-slate-900">{activeCase.caseNoYear}</b> ({activeCase.cnr}) · {activeCase.court}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/admin/cases/${selectedCaseKey}`}>
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
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white shadow-sm hover:bg-[#163a66]"
                startContent={<span className="material-symbols-rounded text-sm">upload_file</span>}
                onPress={onUploadOpen}
              >
                Upload Document
              </Button>
            </div>
          </div>

          {/* Writ Selector Bar & Full-Text OCR Search */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Select
              size="sm"
              radius="sm"
              label="Select Case Matter E-File"
              labelPlacement="outside"
              selectedKeys={[selectedCaseKey]}
              onChange={(e) => setSelectedCaseKey(e.target.value)}
              className="bg-slate-50 font-semibold"
            >
              {Object.entries(casesDB).map(([k, val]) => (
                <SelectItem key={k}>{val.label}</SelectItem>
              ))}
            </Select>

            <Input
              size="sm"
              radius="sm"
              label="OCR Full-Text Search in Attached PDFs"
              labelPlacement="outside"
              placeholder="Search words inside scanned court orders & petitions..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50 sm:col-span-2"
            />
          </div>
        </CardBody>
      </Card>

      {/* 2. 5-Folder Directory Tabs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {folderCategories.map((f) => {
          const count = caseFilesRepository[selectedCaseKey]?.[f.key]?.length || 0;
          const isSelected = activeFolder === f.key;
          return (
            <div
              key={f.key}
              onClick={() => setActiveFolder(f.key)}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${
                isSelected
                  ? "border-blue-700 bg-blue-50/50 shadow-sm"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`material-symbols-rounded text-xl ${isSelected ? "text-blue-700" : "text-slate-400"}`}>
                  {f.icon}
                </span>
                <Chip size="sm" variant="flat" className="h-4 px-1 text-[10px] font-bold">
                  {count} Files
                </Chip>
              </div>
              <p className="mt-2 text-xs font-bold text-slate-800 truncate">{f.label}</p>
            </div>
          );
        })}
      </div>

      {/* 3. Split-Screen Viewport */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Directory File Explorer Table (7 Cols) */}
        <Card shadow="none" className="border border-slate-200/80 bg-white lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Directory: {folderCategories.find((c) => c.key === activeFolder)?.label}
              </h3>
              <p className="text-[11px] text-slate-400">Tamper-proof encrypted S3 storage ledger</p>
            </div>
            <span className="font-mono text-xs text-slate-400">{currentFiles.length} items</span>
          </div>

          <CardBody className="p-0">
            <Table removeWrapper aria-label="Case documents table" className="min-w-full">
              <TableHeader>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">FILE NAME</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">VERSION</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">SIZE</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">STATUS</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
              </TableHeader>
              <TableBody items={currentFiles} emptyContent="No documents uploaded in this folder tier yet.">
                {(item: any) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 cursor-pointer"
                    onClick={() =>
                      setPreviewDoc({
                        title: item.name,
                        folder: folderCategories.find((c) => c.key === activeFolder)?.label,
                        size: item.size,
                        hash: item.hash,
                        uploadedBy: "Registry Officer / API",
                        uploadedAt: `${item.date} 10:30 AM`,
                      })
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-rounded text-lg text-rose-500">picture_as_pdf</span>
                        <div className="max-w-[230px]">
                          <p className="truncate text-xs font-bold text-slate-800">{item.name}</p>
                          <p className="font-mono text-[10px] text-slate-400">{item.hash}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700">{item.version}</TableCell>
                    <TableCell className="text-xs text-slate-500">{item.size}</TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={item.status === "API_SYNCED" ? "secondary" : item.status === "VERIFIED" ? "success" : "warning"}
                        className="text-[9px] font-bold"
                      >
                        {item.status}
                      </Chip>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip content="Preview in Workspace">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-slate-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewDoc({
                                title: item.name,
                                folder: folderCategories.find((c) => c.key === activeFolder)?.label,
                                size: item.size,
                                hash: item.hash,
                                uploadedBy: "Registry Officer / API",
                                uploadedAt: `${item.date} 10:30 AM`,
                              });
                            }}
                          >
                            <span className="material-symbols-rounded text-sm">visibility</span>
                          </Button>
                        </Tooltip>
                        <Tooltip content="Download Copy">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-slate-500 hover:text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(item.name);
                            }}
                          >
                            <span className="material-symbols-rounded text-sm">download</span>
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Right: High-Resolution Viewer & Annotator (5 Cols) */}
        <Card shadow="none" className="border border-slate-200/80 bg-white lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Split-Screen In-App Viewer</h3>
              <p className="truncate text-xs font-bold text-slate-900 max-w-[240px]">{previewDoc.title}</p>
            </div>
            <Chip size="sm" color="success" variant="flat" className="text-[10px] font-bold">
              Verified Copy
            </Chip>
          </div>

          <CardBody className="p-4 space-y-3">
            {/* Metadata Bar */}
            <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1 border border-slate-200/60">
              <div className="flex justify-between text-slate-500">
                <span>Folder Tier:</span>
                <span className="font-semibold text-slate-800">{previewDoc.folder}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>File Size:</span>
                <span className="font-semibold text-slate-800">{previewDoc.size}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>SHA-256 Hash:</span>
                <span className="font-mono text-[10px] font-bold text-slate-700">{previewDoc.hash}</span>
              </div>
            </div>

            {/* Document Canvas Preview */}
            <div className="flex h-[360px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-100/50 p-6 text-center">
              <span className="material-symbols-rounded text-5xl text-rose-500">picture_as_pdf</span>
              <p className="mt-2 text-xs font-bold text-slate-800 truncate max-w-[280px]">{previewDoc.title}</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">
                High Court Certified Web Copy with Digital Timestamp & Coram Signature.
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] text-xs font-semibold text-white hover:bg-[#163a66]"
                  startContent={<span className="material-symbols-rounded text-sm">fullscreen</span>}
                  onClick={onFullScreenOpen}
                >
                  Full Screen
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  variant="bordered"
                  className="border-slate-300 text-xs font-semibold hover:border-slate-400"
                  startContent={<span className="material-symbols-rounded text-sm">draw</span>}
                  onClick={onAnnotateOpen}
                >
                  Annotate Margin
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 1. Upload Document Modal */}
      <Modal isOpen={isUploadOpen} onOpenChange={onUploadOpenChange} placement="top" size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">upload_file</span>
                Upload E-File Document
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Select
                  size="sm"
                  label="Select Folder Tier"
                  labelPlacement="outside"
                  selectedKeys={[newUploadFolder]}
                  onChange={(e) => setNewUploadFolder(e.target.value)}
                  isRequired
                >
                  {folderCategories.map((c) => (
                    <SelectItem key={c.key}>{c.label}</SelectItem>
                  ))}
                </Select>

                <Input
                  size="sm"
                  label="Document Title / Name"
                  labelPlacement="outside"
                  placeholder="e.g. Sworn_Counter_Affidavit_Final.pdf"
                  value={newUploadName}
                  onValueChange={setNewUploadName}
                  isRequired
                />

                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50/50 cursor-pointer">
                  <span className="material-symbols-rounded text-3xl text-slate-400">cloud_upload</span>
                  <p className="mt-2 text-xs font-bold text-slate-800">Drop PDF here to upload</p>
                  <p className="text-[10px] text-slate-400">Automatic cryptographic SHA-256 hash generation</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  onClick={handleUploadSubmit}
                >
                  Save & Ingest
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 2. Full Screen Document Viewer Modal */}
      <Modal isOpen={isFullScreenOpen} onOpenChange={onFullScreenOpenChange} placement="center" size="5xl">
        <ModalContent className="max-h-[90vh]">
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-slate-100 flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-rose-500">picture_as_pdf</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{previewDoc.title}</h3>
                    <p className="text-[10px] text-slate-400">{previewDoc.folder} · {previewDoc.size} · {previewDoc.hash}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mr-6">
                  <Button
                    size="sm"
                    variant="bordered"
                    radius="sm"
                    className="text-xs h-7"
                    startContent={<span className="material-symbols-rounded text-sm">download</span>}
                    onClick={() => handleDownloadFile(previewDoc.title)}
                  >
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="bordered"
                    radius="sm"
                    className="text-xs h-7"
                    startContent={<span className="material-symbols-rounded text-sm">print</span>}
                    onClick={() => window.print()}
                  >
                    Print
                  </Button>
                </div>
              </ModalHeader>
              <ModalBody className="p-4 overflow-y-auto">
                <div className="bg-slate-800 rounded-lg p-6 min-h-[500px] flex flex-col items-center justify-center text-white">
                  <div className="bg-white text-slate-900 w-full max-w-2xl min-h-[460px] p-8 rounded shadow-lg text-xs leading-relaxed space-y-4 font-serif">
                    <div className="text-center border-b pb-3 border-slate-200">
                      <p className="font-bold text-sm tracking-wide uppercase">In the High Court of Judicature at Allahabad</p>
                      <p className="text-[11px] text-slate-500">Civil Miscellaneous Writ Petition No. 4012 of 2026</p>
                    </div>
                    <div className="flex justify-between text-[11px] font-sans font-semibold text-slate-700">
                      <span>Abhay Gupta & Others ... Petitioners</span>
                      <span>Versus</span>
                      <span>State of U.P. & Others ... Respondents</span>
                    </div>
                    <div className="space-y-3 pt-2 text-justify">
                      <p>
                        <b>1.</b> That the present petition under Article 226 of the Constitution of India is preferred challenging the impugned administrative rejection communication dated 10-02-2025.
                      </p>
                      <p>
                        <b>2.</b> That the petitioner was a bona fide aspirant and claimed appointment under the statutory Dying-in-Harness Rules upon the demise of his father who was serving as Head Constable in UP Police.
                      </p>
                      <p className="bg-amber-50 p-2 border-l-2 border-amber-500 font-sans text-[11px] text-amber-900">
                        [Annotated Paragraph]: Board counsel directed to submit certified roster copy by NDOH.
                      </p>
                      <p>
                        <b>3.</b> Hon&apos;ble Court pleases to grant four weeks time to Standing Counsel to file counter affidavit. Rejoinder, if any, within two weeks thereafter. List on date fixed.
                      </p>
                    </div>
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

      {/* 3. Annotate Margin Modal */}
      <Modal isOpen={isAnnotateOpen} onOpenChange={onAnnotateOpenChange} placement="top" size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">draw</span>
                Add Marginal Annotation to Document
              </ModalHeader>
              <ModalBody className="space-y-3 text-xs">
                <div className="rounded-lg bg-blue-50/60 p-3 border border-blue-200 text-blue-950 font-medium">
                  Document: <b className="font-bold">{previewDoc.title}</b>
                </div>

                <Input
                  size="sm"
                  label="Target Paragraph / Section Reference"
                  labelPlacement="outside"
                  value={annotationPara}
                  onValueChange={setAnnotationPara}
                  isRequired
                />

                <Textarea
                  size="sm"
                  label="Legal Marginal Note / Officer Comments"
                  labelPlacement="outside"
                  minRows={4}
                  placeholder="Record confidential remarks, instructions to CSC, or factual inconsistencies..."
                  value={annotationNote}
                  onValueChange={setAnnotationNote}
                  isRequired
                />

                <p className="text-[10px] text-slate-400">
                  Annotated notes are encrypted and directly linked to <b>4.0 Green Sheet Notings</b> for formal departmental consideration.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  onClick={handleSaveAnnotation}
                >
                  Save Annotation
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function DocumentDMSPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500">Loading Legal DMS E-File Repository...</div>}>
      <DocumentDMSContent />
    </Suspense>
  );
}