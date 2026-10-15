"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense, useRef } from "react";
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
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { DmsAPI, ICaseDocumentItem } from "@/api/dmsApi";
import { CasesAPI, CaseItem } from "@/api/casesApi";

type FolderCategoryKey =
  | "01_petitions"
  | "02_notings"
  | "03_counter_affidavits"
  | "04_orders"
  | "05_compliance_proofs";

const FOLDER_CATEGORIES: Array<{ key: FolderCategoryKey; label: string; icon: string }> = [
  { key: "01_petitions", label: "01 Petitions & Annexures", icon: "description" },
  { key: "02_notings", label: "02 Internal Notings & PWC", icon: "edit_note" },
  { key: "03_counter_affidavits", label: "03 Counter Affidavits Filed", icon: "verified" },
  { key: "04_orders", label: "04 Court Orders & Judgments", icon: "gavel" },
  { key: "05_compliance_proofs", label: "05 Compliance Proofs", icon: "task_alt" },
];

function DocumentDMSContent() {
  const searchParams = useSearchParams();
  const queryCaseId = searchParams.get("caseId");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onOpenChange: onUploadOpenChange } = useDisclosure();
  const { isOpen: isFullScreenOpen, onOpen: onFullScreenOpen, onOpenChange: onFullScreenOpenChange } = useDisclosure();
  const { isOpen: isAnnotateOpen, onOpen: onAnnotateOpen, onOpenChange: onAnnotateOpenChange } = useDisclosure();

  const [casesList, setCasesList] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [loadingCases, setLoadingCases] = useState<boolean>(true);

  const [activeFolder, setActiveFolder] = useState<FolderCategoryKey>("01_petitions");
  const [foldersData, setFoldersData] = useState<Record<FolderCategoryKey, ICaseDocumentItem[]>>({
    "01_petitions": [],
    "02_notings": [],
    "03_counter_affidavits": [],
    "04_orders": [],
    "05_compliance_proofs": [],
  });
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [previewDoc, setPreviewDoc] = useState<ICaseDocumentItem | null>(null);

  const [uploadFolder, setUploadFolder] = useState<FolderCategoryKey>("01_petitions");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [annotationNote, setAnnotationNote] = useState<string>("");
  const [annotationPage, setAnnotationPage] = useState<number>(1);
  const [isAnnotating, setIsAnnotating] = useState<boolean>(false);

  useEffect(() => {
    async function loadCases() {
      setLoadingCases(true);
      try {
        const res = await CasesAPI.getCases({ limit: 100 });
        if (res?.success && Array.isArray(res.data)) {
          setCasesList(res.data);
          if (res.data.length > 0) {
            const initialId = queryCaseId && res.data.some((c) => c._id === queryCaseId)
              ? queryCaseId
              : res.data[0]._id;
            setSelectedCaseId(initialId);
          }
        }
      } catch (err: any) {
        console.error("Failed to load cases:", err);
        toast.error("Failed to load case matters");
      } finally {
        setLoadingCases(false);
      }
    }
    loadCases();
  }, [queryCaseId]);

  const fetchCaseDocuments = useCallback(async (caseId: string) => {
    if (!caseId) return;
    setLoadingDocs(true);
    try {
      const res = await DmsAPI.getCaseDocuments(caseId);
      if (res?.success && res.data) {
        setFoldersData(res.data);
        const currentList = res.data[activeFolder] || [];
        const firstFile = currentList[0] || Object.values(res.data).flat()[0] || null;
        setPreviewDoc(firstFile);
      }
    } catch (err: any) {
      console.error("Failed to load case documents:", err);
      toast.error(err.response?.data?.message || "Failed to load documents ledger");
    } finally {
      setLoadingDocs(false);
    }
  }, [activeFolder]);

  useEffect(() => {
    if (selectedCaseId) {
      fetchCaseDocuments(selectedCaseId);
    }
  }, [selectedCaseId, fetchCaseDocuments]);

  const activeCase = useMemo(() => {
    return casesList.find((c) => c._id === selectedCaseId);
  }, [casesList, selectedCaseId]);

  const caseSelectItems = useMemo(() => {
    return casesList.map((c) => ({
      key: c._id,
      label: `${c.fileNo} · ${c.writNumber || "Notice"} — ${c.leadPetitioner}`,
    }));
  }, [casesList]);

  const currentFiles = useMemo(() => {
    const list = foldersData[activeFolder] || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (f) =>
        f.fileName.toLowerCase().includes(q) ||
        f.originalName.toLowerCase().includes(q) ||
        (f.ocrTextContent && f.ocrTextContent.toLowerCase().includes(q))
    );
  }, [foldersData, activeFolder, searchQuery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }
    if (!selectedCaseId) {
      toast.error("No active case docket selected.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folderCategory", uploadFolder);

      const res = await DmsAPI.uploadDocument(selectedCaseId, formData);
      if (res?.success) {
        toast.success(`Document "${selectedFile.name}" archived to S3!`, { icon: "🔒" });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onUploadOpenChange();
        fetchCaseDocuments(selectedCaseId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed. Verify storage config.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAnnotation = async () => {
    if (!annotationNote.trim() || !previewDoc) return;
    setIsAnnotating(true);
    try {
      const res = await DmsAPI.addAnnotation(previewDoc._id, {
        pageNumber: Number(annotationPage) || 1,
        comment: annotationNote.trim(),
      });
      if (res?.success) {
        toast.success("Marginal annotation encrypted and linked to Green Sheet!", { icon: "✍️" });
        setAnnotationNote("");
        onAnnotateOpenChange();
        fetchCaseDocuments(selectedCaseId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to pin annotation");
    } finally {
      setIsAnnotating(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getPdfUrl = (url?: string) => {
    if (!url) return "";
    return url;
  };

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
                Viewing Digital Dossier for: <b className="text-slate-900">{activeCase?.fileNo || "--"}</b> ·{" "}
                <span className="text-blue-700 font-semibold">{activeCase?.writNumber || "Advance Notice"}</span> ·{" "}
                {activeCase?.court || "--"}
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
              items={caseSelectItems}
              selectedKeys={selectedCaseId ? [selectedCaseId] : []}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              isLoading={loadingCases}
              className="bg-slate-50 font-semibold"
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
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
        {FOLDER_CATEGORIES.map((f) => {
          const count = foldersData[f.key]?.length || 0;
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
                Directory: {FOLDER_CATEGORIES.find((c) => c.key === activeFolder)?.label}
              </h3>
              <p className="text-[11px] text-slate-400">Tamper-proof encrypted S3 storage ledger</p>
            </div>
            <span className="font-mono text-xs text-slate-400">{currentFiles.length} items</span>
          </div>

          <CardBody className="p-0">
            <Table removeWrapper aria-label="Case documents table" className="min-w-full">
              <TableHeader>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  FILE NAME
                </TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  VERSION
                </TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  SIZE
                </TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  STATUS
                </TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                  ACTION
                </TableColumn>
              </TableHeader>
              <TableBody
                items={currentFiles}
                isLoading={loadingDocs}
                loadingContent={
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-full rounded" />
                    <Skeleton className="h-6 w-full rounded" />
                  </div>
                }
                emptyContent={!loadingDocs ? "No documents uploaded in this folder tier yet." : " "}
              >
                {(item: ICaseDocumentItem) => (
                  <TableRow
                    key={item._id}
                    className={`border-b border-slate-100 hover:bg-slate-50/70 cursor-pointer ${
                      previewDoc?._id === item._id ? "bg-blue-50/40" : ""
                    }`}
                    onClick={() => setPreviewDoc(item)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-rounded text-lg text-rose-500">picture_as_pdf</span>
                        <div className="max-w-[230px]">
                          <p className="truncate text-xs font-bold text-slate-800">{item.fileName}</p>
                          <p className="font-mono text-[10px] text-slate-400 truncate">
                            {item.sha256Hash ? `sha256:${item.sha256Hash.slice(0, 12)}...` : "--"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700">{item.version}</TableCell>
                    <TableCell className="text-xs text-slate-500">{formatFileSize(item.fileSize)}</TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={item.isVerifiedCopy ? "success" : "warning"}
                        className="text-[9px] font-bold"
                      >
                        {item.isVerifiedCopy ? "VERIFIED" : "DRAFT"}
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
                              setPreviewDoc(item);
                            }}
                          >
                            <span className="material-symbols-rounded text-sm">visibility</span>
                          </Button>
                        </Tooltip>
                        <Tooltip content="Open In New Window">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-slate-500 hover:text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.s3Bucket) {
                                window.open(item.s3Bucket, "_blank");
                              } else {
                                toast.error("File download link unavailable");
                              }
                            }}
                          >
                            <span className="material-symbols-rounded text-sm">open_in_new</span>
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
              <p className="truncate text-xs font-bold text-slate-900 max-w-[240px]">
                {previewDoc?.fileName || "Select a document to preview"}
              </p>
            </div>
            {previewDoc && (
              <Chip size="sm" color="success" variant="flat" className="text-[10px] font-bold">
                {previewDoc.isVerifiedCopy ? "Verified Copy" : "Draft"}
              </Chip>
            )}
          </div>

          <CardBody className="p-4 space-y-3">
            {previewDoc ? (
              <>
                {/* Metadata Bar */}
                <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1 border border-slate-200/60">
                  <div className="flex justify-between text-slate-500">
                    <span>Folder Tier:</span>
                    <span className="font-semibold text-slate-800">{previewDoc.folderCategory}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>File Size:</span>
                    <span className="font-semibold text-slate-800">{formatFileSize(previewDoc.fileSize)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>SHA-256 Hash:</span>
                    <span className="font-mono text-[10px] font-bold text-slate-700 truncate max-w-[200px]">
                      {previewDoc.sha256Hash}
                    </span>
                  </div>
                </div>

                {/* Document Canvas Preview */}
                <div className="flex h-[360px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-100/50 p-6 text-center">
                  <span className="material-symbols-rounded text-5xl text-rose-500">picture_as_pdf</span>
                  <p className="mt-2 text-xs font-bold text-slate-800 truncate max-w-[280px]">
                    {previewDoc.fileName}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">
                    Uploaded by {previewDoc.uploadedBy} on {new Date(previewDoc.createdAt).toLocaleDateString()}
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
                      Annotate Margin ({previewDoc.annotations?.length || 0})
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                <span className="material-symbols-rounded text-4xl text-slate-300 mb-2">folder_open</span>
                No document selected. Click any document on the left panel to preview.
              </div>
            )}
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
                  items={FOLDER_CATEGORIES}
                  selectedKeys={[uploadFolder]}
                  onChange={(e) => setUploadFolder(e.target.value as FolderCategoryKey)}
                  isRequired
                >
                  {(c) => <SelectItem key={c.key}>{c.label}</SelectItem>}
                </Select>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50/50 cursor-pointer transition-colors"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="hidden"
                  />
                  <span className="material-symbols-rounded text-3xl text-slate-400">cloud_upload</span>
                  {selectedFile ? (
                    <div className="mt-2 text-xs font-bold text-blue-700">
                      ✓ {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 text-xs font-bold text-slate-800">Click to select PDF Document</p>
                      <p className="text-[10px] text-slate-400">Automatic cryptographic SHA-256 seal generation</p>
                    </>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isUploading}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isUploading}
                  onClick={handleUploadSubmit}
                >
                  Upload & Audit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isFullScreenOpen} onOpenChange={onFullScreenOpenChange} placement="center" size="5xl">
        <ModalContent className="max-h-[92vh]">
          {(onClose) => {
            const pdfSrc = previewDoc?.s3Bucket || "";
            const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfSrc)}&embedded=true`;

            return (
              <>
                <ModalHeader className="border-b border-slate-100 flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-rose-500">picture_as_pdf</span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{previewDoc?.fileName}</h3>
                      <p className="text-[10px] text-slate-400">
                        {previewDoc?.folderCategory} · {previewDoc ? formatFileSize(previewDoc.fileSize) : "--"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mr-6">
                    <Button
                      size="sm"
                      variant="bordered"
                      radius="sm"
                      className="text-xs h-7 border-slate-200"
                      startContent={<span className="material-symbols-rounded text-sm">open_in_new</span>}
                      onClick={() => {
                        if (pdfSrc) window.open(pdfSrc, "_blank");
                      }}
                    >
                      Open in New Tab
                    </Button>
                    <Button
                      size="sm"
                      variant="bordered"
                      radius="sm"
                      className="text-xs h-7 border-slate-200"
                      startContent={<span className="material-symbols-rounded text-sm">download</span>}
                      onClick={() => {
                        if (pdfSrc) window.open(pdfSrc, "_blank");
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </ModalHeader>
                <ModalBody className="p-0 overflow-hidden bg-slate-900 flex items-center justify-center min-h-[580px]">
                  {pdfSrc ? (
                    <div className="w-full h-[620px] relative">
                      {/* Dual Layer: Google Docs Viewer iframe for cloud-hosted PDFs with direct fallback */}
                      <iframe
                        src={viewerUrl}
                        title={previewDoc?.fileName || "PDF Viewer"}
                        className="w-full h-full border-0 bg-white"
                        onError={() => {
                          toast.error("Cloud preview restricted. Use 'Open in New Tab' to view.");
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-12 text-center text-xs text-slate-400">
                      <span className="material-symbols-rounded text-4xl mb-2 text-slate-500">error</span>
                      <p>Document source link is unavailable.</p>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter className="border-t border-slate-100 py-2.5">
                  <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                    Close Viewer
                  </Button>
                </ModalFooter>
              </>
            );
          }}
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
                  Document: <b className="font-bold">{previewDoc?.fileName}</b>
                </div>

                <Input
                  size="sm"
                  label="Target Page Number"
                  labelPlacement="outside"
                  type="number"
                  value={annotationPage.toString()}
                  onChange={(e) => setAnnotationPage(parseInt(e.target.value) || 1)}
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

                {previewDoc?.annotations && previewDoc.annotations.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="font-bold text-slate-700">Existing Notes on this File:</p>
                    {previewDoc.annotations.map((ann, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px]">
                        <span className="font-bold text-blue-800">Page {ann.pageNumber}:</span> {ann.comment}
                        <p className="text-[9px] text-slate-400 mt-0.5">By {ann.authorName} ({ann.authorDesignation})</p>
                      </div>
                    ))}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isAnnotating}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isAnnotating}
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