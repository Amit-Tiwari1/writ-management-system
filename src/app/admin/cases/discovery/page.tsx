"use client";

import React, { useState } from "react";
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
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InwardDiscoveryDeskPage() {
  const router = useRouter();
  const { isOpen: isIngestOpen, onOpen: onIngestOpen, onOpenChange: onIngestOpenChange } = useDisclosure();
  
  const [isScraping, setIsScraping] = useState(false);
  const [selectedCaseForIngest, setSelectedCaseForIngest] = useState<any>(null);

  // Sample data captured by background cause-list matcher
  const [discoveredCases, setDiscoveredCases] = useState([
    {
      id: "d1",
      cnrNumber: "UPHC020044192026",
      caseNoYear: "WRIT-C / 1092 / 2026",
      court: "High Court Lucknow Bench",
      courtHall: "Court No. 18 (Bench of Hon'ble Justice Alok)",
      matchedAlias: "Bharti Board",
      matchedCategory: "Home Department",
      confidence: 94,
      partiesRaw: 'Alok Singh & 12 Ors vs. "State of UP through Secy & Bharti Board"',
      standingCounselRaw: "CSC (High Court Lucknow)",
      listingDate: "24 Sep 2026",
      itemNo: "Item #14",
    },
    {
      id: "d2",
      cnrNumber: "UPHC010078122026",
      caseNoYear: "CONTEMPT / 88 / 2026",
      court: "High Court Allahabad",
      courtHall: "Court No. 34 (Single Bench)",
      matchedAlias: "Police Recruitment Board",
      matchedCategory: "Recruitment Matters",
      confidence: 89,
      partiesRaw: 'Manoj Yadav vs. "Secy Police Recruitment Board"',
      standingCounselRaw: "CSC (HC Allahabad)",
      listingDate: "25 Sep 2026",
      itemNo: "Item #08",
    },
    {
      id: "d3",
      cnrNumber: "UPHC010091102026",
      caseNoYear: "SPECIAL APPEAL / 14 / 2026",
      court: "High Court Allahabad",
      courtHall: "Court No. 01 (Chief Justice Division Bench)",
      matchedAlias: "UPPRPB",
      matchedCategory: "Service Writs",
      confidence: 98,
      partiesRaw: 'Rakesh Sharma vs. "UPPRPB through Member Secy"',
      standingCounselRaw: "CSC / Board Panel Lawyer",
      listingDate: "26 Sep 2026",
      itemNo: "Item #02",
    },
  ]);

  const handleOpenIngestModal = (item: any) => {
    setSelectedCaseForIngest(item);
    onIngestOpen();
  };

  const handleConfirmIngest = () => {
    if (!selectedCaseForIngest) return;
    setDiscoveredCases((prev) => prev.filter((item) => item.id !== selectedCaseForIngest.id));
    onIngestOpenChange();
    // Redirecting to 2.2 Case Intake Wizard with CNR pre-filled
    router.push(`/admin/cases/register?cnr=${selectedCaseForIngest.cnrNumber}`);
  };

  const handleIgnore = (caseId: string) => {
    setDiscoveredCases((prev) => prev.filter((item) => item.id !== caseId));
  };

  const handleTriggerScraper = () => {
    setIsScraping(true);
    setTimeout(() => {
      setIsScraping(false);
      alert("Cause-list scraper executed successfully! 3 court registries checked (Allahabad & Lucknow).");
    }, 1200);
  };

  const handleSimulatePdfUpload = () => {
    const newDiscovered = {
      id: `d-${Date.now()}`,
      cnrNumber: "UPHC010099882026",
      caseNoYear: "WRIT-A / 5120 / 2026",
      court: "High Court Allahabad",
      courtHall: "Court No. 12 (Service Bench)",
      matchedAlias: "उत्तर प्रदेश पुलिस भर्ती",
      matchedCategory: "Recruitment Matters",
      confidence: 96,
      partiesRaw: 'Surendra Kumar & Ors vs. "State of UP & उत्तर प्रदेश पुलिस भर्ती बोर्ड"',
      standingCounselRaw: "CSC (HC Allahabad)",
      listingDate: "28 Sep 2026",
      itemNo: "Item #22",
    };
    setDiscoveredCases((prev) => [newDiscovered, ...prev]);
    alert("Cause List PDF Parsed! Found 1 new matching petition with keyword: उत्तर प्रदेश पुलिस भर्ती");
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
                <h1 className="text-base font-bold text-slate-900">2.4 Inward Discovery Desk</h1>
                <Chip size="sm" className="bg-amber-500/20 px-1 text-[10px] font-bold text-amber-700">
                  Daily Cause List Scanner
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Automated detection of institutional cases from court cause lists using fuzzy alias matching
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/masters/aliases">
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                  startContent={<span className="material-symbols-rounded text-sm">spellcheck</span>}
                >
                  Edit Alias Matrix
                </Button>
              </Link>
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white shadow-sm hover:bg-[#163a66]"
                startContent={<span className="material-symbols-rounded text-sm">sync</span>}
                isLoading={isScraping}
                onClick={handleTriggerScraper}
              >
                Trigger Inward Scraper
              </Button>
            </div>
          </div>

          {/* Quick Explanation Banner */}
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900">
            <span className="font-bold">How Discovery Works:</span> Litigants frequently misspell or abbreviate board
            names (e.g. <i>&quot;Bharti Board&quot;</i>, <i>&quot;UP Police Board&quot;</i>, <i>&quot;उत्तर प्रदेश पुलिस भर्ती&quot;</i>).
            Background workers scan High Court cause lists against your <b>6.10 Institution Alias Matrix</b> and flag
            probable cases here before physical notices reach the secretariat.
          </div>
        </CardBody>
      </Card>

      {/* Main Content: Split View between Discovered Feed and Manual Cause List Dropzone */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Discovered Items Table (2 Columns) */}
        <Card shadow="none" className="border border-slate-200/80 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Unclaimed Matched Cases ({discoveredCases.length})</h3>
              <p className="text-[11px] text-slate-400">Cases flagged from today&apos;s published daily cause lists</p>
            </div>
            <Chip size="sm" color="warning" variant="flat" className="text-xs font-semibold">
              Needs Review
            </Chip>
          </div>

          <CardBody className="p-0">
            <Table removeWrapper aria-label="Discovered cases table" className="min-w-full">
              <TableHeader>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MATCH SCORE
                </TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  CASE DETAILS
                </TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MATCHED KEYWORD & PARTIES
                </TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  COURT & LISTING
                </TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                  ACTIONS
                </TableColumn>
              </TableHeader>
              <TableBody items={discoveredCases} emptyContent="No unverified inward cases. All cause lists cleared.">
                {(item: any) => (
                  <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
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
                      <p className="font-mono text-xs font-bold text-slate-900">{item.caseNoYear}</p>
                      <p className="font-mono text-[10px] text-slate-400">{item.cnrNumber}</p>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-900">
                          {item.matchedAlias}
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-700">{item.partiesRaw}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-medium text-slate-800">{item.court}</p>
                      <p className="text-[10px] text-blue-700 font-bold">
                        {item.listingDate} · {item.itemNo}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          radius="sm"
                          className="bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 h-7 px-2"
                          onClick={() => handleOpenIngestModal(item)}
                        >
                          Accept & Register
                        </Button>
                        <Button
                          size="sm"
                          radius="sm"
                          variant="light"
                          className="text-xs text-slate-400 hover:text-rose-600 h-7 px-2"
                          onClick={() => handleIgnore(item.id)}
                        >
                          Ignore
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Right Side: Manual Cause List Dropzone */}
        <div className="space-y-4">
          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <CardBody className="p-4">
              <h4 className="text-sm font-bold text-slate-900">Manual Cause List Dropzone</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Drop official High Court daily PDF cause lists here to run immediate local parsing without API access.
              </p>

              <div
                onClick={handleSimulatePdfUpload}
                className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50/50 cursor-pointer transition-colors"
              >
                <span className="material-symbols-rounded text-3xl text-rose-500">picture_as_pdf</span>
                <p className="mt-2 text-xs font-bold text-slate-800">Drop Daily Cause List PDF</p>
                <p className="text-[10px] text-slate-400">Parses text layers against configured aliases</p>
                <Button size="sm" radius="sm" variant="bordered" className="mt-3 text-xs font-semibold">
                  Upload & Scan PDF
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Active Aliases Monitored */}
          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Monitored Keywords
                </h4>
                <Link href="/admin/masters/aliases" className="text-[11px] text-blue-700 font-semibold">
                  Manage
                </Link>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip size="sm" variant="flat" className="text-[11px]">UPPRPB</Chip>
                <Chip size="sm" variant="flat" className="text-[11px]">Bharti Board</Chip>
                <Chip size="sm" variant="flat" className="text-[11px]">Police Recruitment</Chip>
                <Chip size="sm" variant="flat" className="text-[11px]">उत्तर प्रदेश पुलिस भर्ती</Chip>
                <Chip size="sm" variant="flat" className="text-[11px]">Promotion Board</Chip>
                <Chip size="sm" variant="flat" className="text-[11px]">CSC Panel (Home)</Chip>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Confirmation & Ingest Modal */}
      <Modal isOpen={isIngestOpen} onOpenChange={onIngestOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-emerald-600">verified</span>
                Confirm Inward Case Ingestion
              </ModalHeader>
              <ModalBody className="space-y-3 text-xs">
                <p className="text-slate-600">
                  You are accepting this discovered listing into the institutional docket. The system will pre-fill the Intake Wizard with the following court metadata:
                </p>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-1 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Case No:</span>
                    <span className="font-bold text-slate-800">{selectedCaseForIngest?.caseNoYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CNR Number:</span>
                    <span className="font-mono font-bold text-blue-700">{selectedCaseForIngest?.cnrNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Court Bench:</span>
                    <span className="text-slate-800">{selectedCaseForIngest?.court}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Listing Date:</span>
                    <span className="font-bold text-amber-700">{selectedCaseForIngest?.listingDate} ({selectedCaseForIngest?.itemNo})</span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                  onClick={handleConfirmIngest}
                >
                  Proceed to Intake Wizard
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}