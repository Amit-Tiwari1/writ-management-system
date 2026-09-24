"use client";

import React, { useMemo } from "react";
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
} from "@nextui-org/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CaseDossier360Page() {
  const params = useParams();
  const rawId = params?.caseId as string;

  // Master database mapping simulation
  const casesDB: Record<string, any> = {
    "1": {
      cnrNumber: "UPHC010029312026",
      caseNoYear: "WRIT-A / 4012 / 2026",
      internalFileNo: "PRPB-R/938/2026",
      court: "High Court of Judicature at Allahabad",
      bench: "Principal Bench (Court No. 34)",
      filingDate: "12 Aug 2026",
      registrationDate: "14 Aug 2026",
      category: "Recruitment Matters",
      subCategory: "Appointment under Dying in Harness Rules - SICP",
      subject: "Challenging rejection of claim for appointment on compassionate grounds",
      petitioner: "Abhay Gupta & 4 Others",
      petitionerAdvocate: "R.K. Ojha, Senior Advocate (Mob: 9876543210)",
      respondent: "State of U.P. through Principal Secretary (Home) & Chairman UPPRPB",
      oic: "Superintendent of Police (Legal)",
      pairokar: "Shanu Pratap Singh (HC Allahabad Liaison)",
      ndoh: "22 Sep 2026",
      ndohDays: "In 6 Days",
      stage: "Counter Affidavit Filing (Final Opportunity)",
      isStay: false,
      isContempt: false,
      syncStatus: "🟢 Synced with CIS (2 hours ago)",
      hearings: [
        { id: "h1", date: "14 Aug 2026", coram: "Hon'ble Justice M.C. Tripathi", business: "Fresh Admission", nextDate: "28 Aug 2026", stage: "Notice Issued to CSC" },
        { id: "h2", date: "28 Aug 2026", coram: "Hon'ble Justice M.C. Tripathi", business: "Time granted for Counter", nextDate: "12 Sep 2026", stage: "Instructions Awaited" },
        { id: "h3", date: "12 Sep 2026", coram: "Hon'ble Justice Saurabh Shyam", business: "Final Opportunity for CA", nextDate: "22 Sep 2026", stage: "PWC / CA Filing" },
      ],
    },
    "2": {
      cnrNumber: "UPHC020011402026",
      caseNoYear: "WRIT-A / 4021 / 2026",
      internalFileNo: "PRPB-R/942/2026",
      court: "High Court Lucknow Bench",
      bench: "Court No. 18 (Single Bench)",
      filingDate: "20 Aug 2026",
      registrationDate: "22 Aug 2026",
      category: "Recruitment Matters",
      subCategory: "Constable Civil Police Rec. 2023",
      subject: "Height measurement re-examination dispute in Physical Standard Test",
      petitioner: "Vikas Kumar Yadav",
      petitionerAdvocate: "G.S. Nigam, Advocate",
      respondent: "Chairman UPPRPB & Ors",
      oic: "Swahleen Ahmad (SI)",
      pairokar: "Dashrath Lal",
      ndoh: "18 Sep 2026",
      ndohDays: "In 2 Days",
      stage: "Counter Filed - Awaiting Petitioner Rejoinder",
      isStay: false,
      isContempt: true,
      syncStatus: "🟢 Synced with CIS",
      hearings: [
        { id: "h1", date: "22 Aug 2026", coram: "Hon'ble Justice Alok Mathur", business: "Notice Issued", nextDate: "05 Sep 2026", stage: "Counter Due" },
        { id: "h2", date: "05 Sep 2026", coram: "Hon'ble Justice Alok Mathur", business: "Counter Affidavit Filed by State", nextDate: "18 Sep 2026", stage: "Rejoinder" },
      ],
    },
    "3": {
      cnrNumber: "UPHC010089212025",
      caseNoYear: "WRIT-A / 7100 / 2025",
      internalFileNo: "PRPB-R/812/2025",
      court: "High Court Allahabad",
      bench: "Principal Bench (Court No. 12)",
      filingDate: "10 Jul 2025",
      registrationDate: "15 Jul 2025",
      category: "Promotion Matters",
      subCategory: "Constable PAC Recruitment",
      subject: "Stay on declaration of final selection list regarding cutoff marks",
      petitioner: "Rohit Kumar",
      petitionerAdvocate: "Amit Jaiswal, Advocate",
      respondent: "DGP Headquarters & Board",
      oic: "DySP Promotion",
      pairokar: "Shanu Pratap Singh",
      ndoh: "30 Sep 2026",
      ndohDays: "In 14 Days",
      stage: "Interim Stay in Effect - Vacation of Stay Pending",
      isStay: true,
      isContempt: false,
      syncStatus: "🔴 Discrepancy Detected",
      hearings: [
        { id: "h1", date: "12 Aug 2026", coram: "Hon'ble Justice M.C. Tripathi", business: "Interim Stay Granted", nextDate: "30 Sep 2026", stage: "Vacation Motion" },
      ],
    },
  };

  const caseData = useMemo(() => {
    return casesDB[rawId] || casesDB["1"];
  }, [rawId]);

  const attachedFiles = [
    { id: "doc-1", name: `Original_Writ_Petition_${caseData.caseNoYear.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`, category: "01_Petitions", size: "4.2 MB", hash: "sha256:9f83...419c" },
    { id: "doc-2", name: "Order_Sheet_Latest_Hearing.pdf", category: "04_Court_Orders", size: "1.4 MB", hash: "sha256:55ee...99bb" },
    { id: "doc-3", name: "Draft_PWC_Instructions.pdf", category: "02_Internal_Notings", size: "750 KB", hash: "sha256:1199...bc34" },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
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
                <h1 className="text-base font-bold text-slate-900">{caseData.caseNoYear}</h1>
                <Chip size="sm" color="primary" variant="flat" className="text-xs font-mono font-bold">
                  {caseData.cnrNumber}
                </Chip>
                <Chip size="sm" variant="solid" className="bg-[#0f2744] text-[10px] font-bold text-white">
                  {caseData.internalFileNo}
                </Chip>
              </div>
              <p className="mt-1 text-xs text-slate-500 ml-9">
                {caseData.court} · {caseData.bench}
              </p>
            </div>

            {/* Cross-Module Navigation Links */}
            <div className="flex items-center gap-2">
              <Link href={`/admin/documents?caseId=${rawId}`}>
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
              <Link href={`/admin/communications/notings?caseId=${rawId}`}>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-emerald-700 text-xs font-semibold text-white hover:bg-emerald-800 shadow-sm"
                  startContent={<span className="material-symbols-rounded text-sm">edit_note</span>}
                >
                  Green Sheet Noting
                </Button>
              </Link>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 md:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Hearing (NDOH)</span>
              <p className="text-xs font-bold text-amber-700 mt-0.5">{caseData.ndoh} ({caseData.ndohDays})</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Stage</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{caseData.stage}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned OIC</span>
              <p className="text-xs font-bold text-blue-900 mt-0.5">{caseData.oic}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CIS Polling Status</span>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">{caseData.syncStatus}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. 360 Information Tabs */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <Tabs
            aria-label="Case Dossier Tabs"
            variant="underlined"
            classNames={{ tabList: "gap-6", cursor: "bg-[#0f2744]", tab: "max-w-fit px-0 h-9 text-xs font-semibold" }}
          >
            {/* TAB 1: OVERVIEW & PARTIES */}
            <Tab key="overview" title="Case Overview & Parties">
              <div className="mt-4 space-y-6 text-xs">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Litigant Parties & Advocates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 border border-slate-200/60">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Petitioner(s)</span>
                      <p className="font-bold text-slate-900 mt-1 text-sm">{caseData.petitioner}</p>
                      <p className="text-slate-500 mt-1">Counsel: {caseData.petitionerAdvocate}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Respondent(s)</span>
                      <p className="font-bold text-slate-900 mt-1 text-sm">{caseData.respondent}</p>
                      <p className="text-blue-700 font-semibold mt-1">Institutional Unit: Uttar Pradesh Police Recruitment Board</p>
                    </div>
                  </div>
                </div>

                <Divider />

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Subject Matter & Taxonomy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Category</span>
                      <p className="font-bold text-slate-800 mt-0.5">{caseData.category}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Sub-Category (Exam/Matter)</span>
                      <p className="font-bold text-slate-800 mt-0.5">{caseData.subCategory}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Pairokar Liaison</span>
                      <p className="font-bold text-slate-800 mt-0.5">{caseData.pairokar}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded bg-blue-50/50 p-3 border border-blue-100 text-slate-700 leading-relaxed font-serif">
                    <b>Issue Claim:</b> {caseData.subject}
                  </div>
                </div>
              </div>
            </Tab>

            {/* TAB 2: eCOURTS CIS TIMELINE */}
            <Tab key="timeline" title="eCourts CIS Timeline">
              <div className="mt-4">
                <Table removeWrapper aria-label="Hearing history table" className="min-w-full">
                  <TableHeader>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">HEARING DATE</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">CORAM BENCH JUDGE</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">DAILY BUSINESS RECORDED</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">NEXT DATE (NDOH)</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">STAGE</TableColumn>
                  </TableHeader>
                  <TableBody items={caseData.hearings}>
                    {(h: any) => (
                      <TableRow key={h.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <TableCell className="font-bold text-xs text-slate-900">{h.date}</TableCell>
                        <TableCell className="text-xs text-slate-700 font-medium">{h.coram}</TableCell>
                        <TableCell className="text-xs text-slate-800 font-serif">{h.business}</TableCell>
                        <TableCell className="font-bold text-xs text-amber-700">{h.nextDate}</TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" color="primary" className="text-[10px] font-bold">
                            {h.stage}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Tab>

            {/* TAB 3: CASE DOCUMENTS */}
            <Tab key="files" title="Case Documents">
              <div className="mt-4 space-y-3">
                <Table removeWrapper aria-label="Attached files table" className="min-w-full">
                  <TableHeader>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">FILE NAME</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">FOLDER CATEGORY</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">FILE SIZE</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">SHA-256 HASH</TableColumn>
                    <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
                  </TableHeader>
                  <TableBody items={attachedFiles}>
                    {(f: any) => (
                      <TableRow key={f.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-rounded text-rose-500">picture_as_pdf</span>
                            <span className="font-bold text-xs text-slate-900">{f.name}</span>
                          </div>
                        </TableCell>
                        <TableCell><Chip size="sm" variant="flat" className="text-[10px] font-bold">{f.category}</Chip></TableCell>
                        <TableCell className="text-xs text-slate-500">{f.size}</TableCell>
                        <TableCell className="font-mono text-[10px] text-slate-400">{f.hash}</TableCell>
                        <TableCell className="text-center">
                          <Button size="sm" radius="sm" variant="light" className="text-xs font-semibold text-blue-700">
                            Download
                          </Button>
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
    </div>
  );
}