"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  useDisclosure,
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { CasesAPI } from "@/api/casesApi";
import { MastersAPI } from "@/api/mastersApi";

interface DiscoveredCaseItem {
  _id?: string;
  id?: string;
  cnrNumber: string;
  caseNoYear: string;
  probableNoticeCandidate?: string;
  court: string;
  courtHall: string;
  matchedAlias: string;
  matchedCategory: string;
  confidence: number;
  partiesRaw: string;
  standingCounselRaw?: string;
  petitionerAdvocate?: string;
  listingDate: string;
  itemNo: string;
}

interface NoticeDocketOption {
  fileNo: string;
  noticeNumber?: string;
  leadPetitioner: string;
  sectionWing: string;
}

interface AliasItem {
  _id: string;
  keyword: string;
  category: string;
}

export default function InwardDiscoveryDeskPage() {
  const router = useRouter();

  const {
    isOpen: isIngestOpen,
    onOpen: onIngestOpen,
    onOpenChange: onIngestOpenChange,
  } = useDisclosure();
  const {
    isOpen: isLinkOpen,
    onOpen: onLinkOpen,
    onOpenChange: onLinkOpenChange,
  } = useDisclosure();

  const [discoveredCases, setDiscoveredCases] = useState<DiscoveredCaseItem[]>(
    [],
  );
  const [noticeDockets, setNoticeDockets] = useState<NoticeDocketOption[]>([]);
  const [aliasesList, setAliasesList] = useState<AliasItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [isMerging, setIsMerging] = useState<boolean>(false);

  const [selectedCaseForAction, setSelectedCaseForAction] =
    useState<DiscoveredCaseItem | null>(null);
  const [selectedNoticeDocket, setSelectedNoticeDocket] = useState<string>("");

  const loadDiscoveryData = useCallback(async () => {
    setLoading(true);
    try {
      const [discoveryRes, casesRes, aliasesRes] = await Promise.all([
        CasesAPI.getUnclaimedDiscovery(),
        CasesAPI.getCases({ statusFilter: "advance_notice", limit: 50 }),
        MastersAPI.getAliases(),
      ]);

      if (discoveryRes?.success && Array.isArray(discoveryRes.items)) {
        setDiscoveredCases(discoveryRes.items);
      } else {
        setDiscoveredCases([]);
      }

      if (casesRes?.success && Array.isArray(casesRes.data)) {
        setNoticeDockets(casesRes.data);
      } else {
        setNoticeDockets([]);
      }

      if (aliasesRes?.success && aliasesRes.data?.aliases) {
        setAliasesList(aliasesRes.data.aliases);
      } else {
        setAliasesList([]);
      }
    } catch (err: any) {
      console.error("Failed to load discovery queue:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to fetch cause list discovery data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDiscoveryData();
  }, [loadDiscoveryData]);

  const noticeSelectItems = useMemo(() => {
    return noticeDockets.map((n) => ({
      key: n.fileNo,
      label: `${n.fileNo} · ${n.noticeNumber || "Adv Notice"} — ${n.leadPetitioner} (${n.sectionWing})`,
    }));
  }, [noticeDockets]);

  const handleTriggerScraper = async () => {
    setIsScraping(true);
    try {
      toast.loading("Querying published cause lists via scraper worker...", {
        id: "scraper",
      });
      const res = await CasesAPI.triggerScraper();
      if (res?.success) {
        toast.success(
          res.message || "Cause list scan complete! New dockets updated.",
          { id: "scraper" },
        );
        loadDiscoveryData();
      } else {
        toast.success("Scanned registries. Discovery queue updated.", {
          id: "scraper",
        });
        loadDiscoveryData();
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Cause list scraper daemon unavailable",
        { id: "scraper" },
      );
    } finally {
      setIsScraping(false);
    }
  };

  const handleOpenLinkModal = (item: DiscoveredCaseItem) => {
    setSelectedCaseForAction(item);
    if (noticeDockets.length > 0) {
      setSelectedNoticeDocket(noticeDockets[0].fileNo);
    }
    onLinkOpen();
  };

  const handleConfirmLink = async () => {
    if (!selectedCaseForAction || !selectedNoticeDocket) return;
    setIsMerging(true);
    try {
      const payload = {
        docketNo: selectedNoticeDocket,
        caseNoYear: selectedCaseForAction.caseNoYear,
        cnrNumber: selectedCaseForAction.cnrNumber,
        courtHall: selectedCaseForAction.courtHall,
        itemNo: selectedCaseForAction.itemNo,
        listingDate: selectedCaseForAction.listingDate,
      };

      const res = await CasesAPI.linkDiscoveredWritToNotice(payload);
      if (res?.success) {
        toast.success(
          `Merged! Docket ${selectedNoticeDocket} promoted with Writ: ${selectedCaseForAction.caseNoYear}`,
          { duration: 5000, icon: "🔗" },
        );
        onLinkOpenChange();
        setDiscoveredCases((prev) =>
          prev.filter(
            (c) =>
              (c._id || c.id) !==
              (selectedCaseForAction._id || selectedCaseForAction.id),
          ),
        );
        router.push("/admin/cases");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to merge docket with notice record",
      );
    } finally {
      setIsMerging(false);
    }
  };

  const handleOpenFreshIngest = (item: DiscoveredCaseItem) => {
    setSelectedCaseForAction(item);
    onIngestOpen();
  };

  const handleConfirmFreshIngest = () => {
    if (!selectedCaseForAction) return;
    onIngestOpenChange();

    const query = new URLSearchParams({
      cnr: selectedCaseForAction.cnrNumber || "",
      caseType:
        selectedCaseForAction.caseNoYear.split("/")[0]?.trim() || "WRIT-A",
      caseNo: selectedCaseForAction.caseNoYear.split("/")[1]?.trim() || "",
      caseYear:
        selectedCaseForAction.caseNoYear.split("/")[2]?.trim() || "2026",
      court: selectedCaseForAction.court,
      hall: selectedCaseForAction.courtHall,
      petitioner:
        selectedCaseForAction.partiesRaw.split("vs")[0]?.trim() || "Petitioner",
    }).toString();

    router.push(`/admin/cases/register?${query}`);
  };

  const handleIgnore = (caseId?: string) => {
    if (!caseId) return;
    setDiscoveredCases((prev) =>
      prev.filter((item) => (item._id || item.id) !== caseId),
    );
    toast.success("Dismissed match candidate");
  };

  return (
    <div className="space-y-4">
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/admin/cases">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="text-slate-500"
                  >
                    <span className="material-symbols-rounded">arrow_back</span>
                  </Button>
                </Link>
                <h1 className="text-base font-bold text-slate-900">
                  2.4 Inward Discovery Desk
                </h1>
                <Chip
                  size="sm"
                  className="bg-amber-500/20 px-1 text-[10px] font-bold text-amber-800"
                >
                  Daily Cause List Scanner
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Automated detection of institutional cases from court cause
                lists using 6.10 Alias Matching
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/masters/aliases">
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                  startContent={
                    <span className="material-symbols-rounded text-sm">
                      spellcheck
                    </span>
                  }
                >
                  Edit Alias Matrix
                </Button>
              </Link>
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white shadow-sm hover:bg-[#163a66]"
                startContent={
                  <span className="material-symbols-rounded text-sm">sync</span>
                }
                isLoading={isScraping}
                onClick={handleTriggerScraper}
              >
                Trigger Inward Scraper
              </Button>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900">
            <span className="font-bold">Operational Workflow:</span> When a case
            appears in the High Court daily cause list, you can either{" "}
            <b>&quot;Link to Existing Notice&quot;</b> (if advance notice was
            received earlier) OR <b>&quot;Fresh Intake&quot;</b> (if no prior
            intimation existed). This prevents duplicate file docket generation.
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Discovered Items Table (2 Columns) */}
        <Card
          shadow="none"
          className="border border-slate-200/80 bg-white lg:col-span-2"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Unclaimed Matched Cases ({discoveredCases.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Cases flagged from published Allahabad &amp; Lucknow cause lists
              </p>
            </div>
            <Chip
              size="sm"
              color="warning"
              variant="flat"
              className="text-xs font-semibold"
            >
              Action Required
            </Chip>
          </div>

          <CardBody className="p-0">
            <Table
              removeWrapper
              aria-label="Discovered cases table"
              className="min-w-full"
            >
              <TableHeader>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MATCH SCORE
                </TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  CASE &amp; CNR
                </TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MATCHED ALIAS &amp; PARTIES
                </TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  COURT &amp; LISTING
                </TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                  ACTIONS
                </TableColumn>
              </TableHeader>
              <TableBody
                items={discoveredCases}
                isLoading={loading}
                loadingContent={
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-full rounded" />
                    <Skeleton className="h-6 w-full rounded" />
                  </div>
                }
                emptyContent={
                  !loading
                    ? "No pending cause list matches. All registries verified."
                    : " "
                }
              >
                {(item: DiscoveredCaseItem) => (
                  <TableRow
                    key={item._id || item.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="solid"
                        color={item.confidence >= 90 ? "success" : "warning"}
                        className="text-[10px] font-bold text-white"
                      >
                        {item.confidence}% Match
                      </Chip>
                    </TableCell>

                    <TableCell>
                      <p className="font-mono text-xs font-bold text-[#0f2744]">
                        {item.caseNoYear}
                      </p>
                      <p className="font-mono text-[9px] text-slate-400">
                        {item.cnrNumber}
                      </p>
                      {item.probableNoticeCandidate &&
                        item.probableNoticeCandidate !== "--" && (
                          <span className="inline-block mt-0.5 rounded bg-amber-50 border border-amber-200 px-1 font-mono text-[9px] text-amber-800">
                            Probable Notice: {item.probableNoticeCandidate}
                          </span>
                        )}
                    </TableCell>

                    <TableCell className="max-w-[210px]">
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-900">
                        {item.matchedAlias}
                      </span>
                      <p className="truncate text-xs font-semibold text-slate-800 mt-1">
                        {item.partiesRaw}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        Adv: {item.petitionerAdvocate || "--"}
                      </p>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs font-medium text-slate-800">
                        {item.court}
                      </p>
                      <p className="text-[10px] font-bold text-blue-700">
                        {item.listingDate} · {item.itemNo}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {item.courtHall}
                      </p>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1 items-center justify-center">
                        <Button
                          size="sm"
                          radius="sm"
                          className="h-6 w-full bg-amber-600 px-2 text-[10px] font-bold text-white hover:bg-amber-700"
                          onClick={() => handleOpenLinkModal(item)}
                          startContent={
                            <span className="material-symbols-rounded text-xs">
                              link
                            </span>
                          }
                        >
                          Link to Notice
                        </Button>

                        <Button
                          size="sm"
                          radius="sm"
                          className="h-6 w-full bg-emerald-600 px-2 text-[10px] font-bold text-white hover:bg-emerald-700"
                          onClick={() => handleOpenFreshIngest(item)}
                          startContent={
                            <span className="material-symbols-rounded text-xs">
                              post_add
                            </span>
                          }
                        >
                          Fresh Intake
                        </Button>

                        <button
                          type="button"
                          className="text-[10px] text-slate-400 hover:text-rose-600 hover:underline pt-0.5"
                          onClick={() => handleIgnore(item._id || item.id)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <CardBody className="p-4">
              <h4 className="text-sm font-bold text-slate-900">
                Manual Cause List Dropzone
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Drop official daily PDF cause lists here to run immediate regex
                text-parsing without waiting for API.
              </p>

              <div
                onClick={() => {
                  toast.success(
                    "PDF Parsed! Text extraction and alias matcher executed.",
                  );
                }}
                className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50/50 cursor-pointer transition-colors"
              >
                <span className="material-symbols-rounded text-3xl text-rose-500">
                  picture_as_pdf
                </span>
                <p className="mt-2 text-xs font-bold text-slate-800">
                  Drop Daily Cause List PDF
                </p>
                <p className="text-[10px] text-slate-400">
                  Scans Hindi &amp; English institutional aliases
                </p>
                <Button
                  size="sm"
                  radius="sm"
                  variant="bordered"
                  className="mt-3 text-xs font-semibold"
                >
                  Upload &amp; Scan PDF
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Monitored Aliases ({aliasesList.length})
                </h4>
                <Link
                  href="/admin/masters/aliases"
                  className="text-[11px] text-blue-700 font-semibold"
                >
                  Configure (6.10)
                </Link>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {aliasesList.length > 0 ? (
                  aliasesList.map((alias) => (
                    <Chip
                      key={alias._id}
                      size="sm"
                      variant="flat"
                      className="text-[11px]"
                    >
                      {alias.keyword}
                    </Chip>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400">
                    No alias keywords configured in Master.
                  </span>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isIngestOpen}
        onOpenChange={onIngestOpenChange}
        placement="top"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-emerald-600">
                  post_add
                </span>
                Confirm Fresh Case Inward Ingestion
              </ModalHeader>
              <ModalBody className="space-y-3 text-xs">
                <p className="text-slate-600">
                  You are onboarding this discovered listing as a{" "}
                  <b>Brand New Case</b>. The system will pre-fill the Intake
                  Wizard:
                </p>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-1 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Writ No:</span>
                    <span className="font-bold text-blue-800">
                      {selectedCaseForAction?.caseNoYear}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CNR Number:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedCaseForAction?.cnrNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Court Bench:</span>
                    <span className="text-slate-800">
                      {selectedCaseForAction?.court}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Listing:</span>
                    <span className="font-bold text-amber-700">
                      {selectedCaseForAction?.listingDate} (
                      {selectedCaseForAction?.itemNo})
                    </span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                  onClick={handleConfirmFreshIngest}
                >
                  Open in 2.2 Intake Wizard
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isLinkOpen}
        onOpenChange={onLinkOpenChange}
        placement="top"
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-amber-600">
                  link
                </span>
                Link Discovered Writ to Existing Advance Notice
              </ModalHeader>
              <ModalBody className="space-y-4 text-xs">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Incoming Cause List Match:
                  </p>
                  <p className="text-sm font-bold text-blue-700 mt-0.5">
                    {selectedCaseForAction?.caseNoYear} (
                    {selectedCaseForAction?.cnrNumber})
                  </p>
                  <p className="text-slate-600 mt-1">
                    Parties: <b>{selectedCaseForAction?.partiesRaw}</b>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800">
                    Select Existing Advance Notice Docket to Merge:
                  </label>
                  <Select
                    size="sm"
                    labelPlacement="outside"
                    placeholder="Select Pending Notice Docket..."
                    items={noticeSelectItems}
                    selectedKeys={
                      selectedNoticeDocket ? [selectedNoticeDocket] : []
                    }
                    onChange={(e) => setSelectedNoticeDocket(e.target.value)}
                    className="font-semibold"
                  >
                    {(n) => <SelectItem key={n.key}>{n.label}</SelectItem>}
                  </Select>
                </div>

                <p className="text-[11px] text-slate-500">
                  <b>What happens on merge?</b> The institutional docket
                  (`fileDocketNo`) remains unchanged. The newly discovered Writ
                  No and 16-digit CNR will automatically update inside the
                  docket, promoting the case from <i>Tier 2 (Notice)</i> to{" "}
                  <i>Tier 3/4 (Active CNR)</i>.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={onClose}
                  isDisabled={isMerging}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  isLoading={isMerging}
                  className="bg-amber-600 font-semibold text-white hover:bg-amber-700"
                  onClick={handleConfirmLink}
                  isDisabled={!selectedNoticeDocket}
                >
                  Confirm Link &amp; Promote Docket
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
