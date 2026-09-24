"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
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
} from "@nextui-org/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function GreenSheetNotingsContent() {
  const searchParams = useSearchParams();
  const queryCaseId = searchParams.get("caseId");

  const { isOpen: isVerifyOpen, onOpen: onVerifyOpen, onOpenChange: onVerifyOpenChange } = useDisclosure();
  const { isOpen: isPrintPreviewOpen, onOpen: onPrintPreviewOpen, onOpenChange: onPrintPreviewOpenChange } = useDisclosure();

  const [activeSignData, setActiveSignData] = useState<any>(null);

  // Multi-case master directory
  const casesDB: Record<
    string,
    {
      caseNoYear: string;
      cnr: string;
      title: string;
      court: string;
      bench: string;
      ndoh: string;
      ndohDays: string;
      stage: string;
      oic: string;
      isStay: boolean;
      isContempt: boolean;
    }
  > = {
    "1": {
      caseNoYear: "WRIT-A / 4012 / 2026",
      cnr: "UPHC010029312026",
      title: "Abhay Gupta & 4 Others vs State of UP & Chairman UPPRPB",
      court: "High Court of Judicature at Allahabad",
      bench: "Principal Bench (Court No. 34)",
      ndoh: "22-Sep-2026",
      ndohDays: "In 6 Days",
      stage: "Counter Affidavit Filing (Final Opportunity)",
      oic: "Superintendent of Police (Legal)",
      isStay: false,
      isContempt: false,
    },
    "2": {
      caseNoYear: "WRIT-A / 4021 / 2026",
      cnr: "UPHC020011402026",
      title: "Vikas Kumar Yadav vs Chairman UPPRPB & Ors",
      court: "High Court of Judicature at Allahabad",
      bench: "Lucknow Bench (Court No. 18)",
      ndoh: "18-Sep-2026",
      ndohDays: "In 2 Days",
      stage: "Counter Filed - Rejoinder Awaited",
      oic: "Swahleen Ahmad (SI)",
      isStay: false,
      isContempt: true,
    },
    "3": {
      caseNoYear: "WRIT-A / 7100 / 2025",
      cnr: "UPHC010089212025",
      title: "Rohit Kumar vs DGP Headquarters & Board",
      court: "High Court of Judicature at Allahabad",
      bench: "Principal Bench (Court No. 12)",
      ndoh: "30-Sep-2026",
      ndohDays: "In 14 Days",
      stage: "Stay in Effect - Vacation of Stay Pending",
      oic: "DySP Promotion",
      isStay: true,
      isContempt: false,
    },
    "4": {
      caseNoYear: "WRIT-A / 2025 / 19",
      cnr: "UPHC010041122025",
      title: "Sujit Yadav vs State of UP",
      court: "High Court of Judicature at Allahabad",
      bench: "Principal Bench",
      ndoh: "05-Oct-2026",
      ndohDays: "In 19 Days",
      stage: "Disposed / Compliance Order Issued",
      oic: "Swahleen Ahmad (SI)",
      isStay: false,
      isContempt: false,
    },
  };

  const [selectedCaseKey, setSelectedCaseKey] = useState<string>("1");

  // Sync with URL query parameter (?caseId=...)
  useEffect(() => {
    if (queryCaseId && casesDB[queryCaseId]) {
      setSelectedCaseKey(queryCaseId);
    }
  }, [queryCaseId]);

  const activeCase = useMemo(() => {
    return casesDB[selectedCaseKey] || casesDB["1"];
  }, [selectedCaseKey]);

  // Case-wise minutes record
  const [notingsStore, setNotingsStore] = useState<Record<string, any[]>>({
    "1": [
      {
        minuteNo: 1,
        author: "Swahleen Ahmad",
        designation: "Sub Inspector (Legal Desk)",
        timestamp: "15 Sep 2026, 02:30 PM",
        type: "Initial Receipt & File Opening",
        content:
          "माननीय उच्च न्यायालय से रिट याचिका संख्या WRIT-A/4012/2026 अभय गुप्ता बनाम उ०प्र० राज्य व अन्य की अग्रिम प्रति मुख्य स्थाई अधिवक्ता (CSC) कार्यालय के माध्यम से प्राप्त हुई। पत्रावली परीक्षण हेतु प्रस्तुत है।",
        isSigned: true,
        signHash: "DSP-SIG-88129",
        certSerial: "UP-DSC-2026-992144-LEGAL",
      },
      {
        minuteNo: 2,
        author: "Rakesh Sharma",
        designation: "Deputy Superintendent of Police (Legal)",
        timestamp: "16 Sep 2026, 10:15 AM",
        type: "Direction to Section",
        content:
          "संबंधित भर्ती अनुभाग तत्काल अभ्यर्थी के पीईटी (PET) परीक्षा परिणाम एवं अभिलेखों की प्रमाणित प्रति 2 दिवस के अंदर विधिक प्रकोष्ठ को उपलब्ध कराना सुनिश्चित करें।",
        isSigned: true,
        signHash: "DSP-SIG-99014",
        certSerial: "UP-DSC-2026-441098-POLICE",
      },
      {
        minuteNo: 3,
        author: "Superintendent of Police (Legal)",
        designation: "SP (Legal / OIC)",
        timestamp: "16 Sep 2026, 11:45 AM",
        type: "Para-Wise Comments (PWC) Approval",
        content:
          "भर्ती अनुभाग द्वारा प्रस्तुत आख्या के आधार पर ड्राफ्ट प्रतिशपथपत्र (Draft Counter Affidavit) तैयार कर लिया गया है। अनुमोदन उपरांत शासकीय अधिवक्ता को प्रेषित किया जाना उचित होगा।",
        isSigned: true,
        signHash: "SP-LEGAL-7721",
        certSerial: "UP-DSC-2026-118832-APEX",
      },
    ],
    "2": [
      {
        minuteNo: 1,
        author: "Swahleen Ahmad",
        designation: "Sub Inspector (Legal Desk)",
        timestamp: "21 Aug 2026, 11:00 AM",
        type: "Notice Ingestion",
        content:
          "माननीय उच्च न्यायालय लखनऊ खंडपीठ से शारीरिक मानक परीक्षण (PST) में ऊंचाई विवाद के संबंध में नोटिस प्राप्त हुआ। सीएमओ मेडिकल बोर्ड रिपोर्ट तलब की गई।",
        isSigned: true,
        signHash: "SI-LEGAL-2219",
        certSerial: "UP-DSC-2026-773322-LEGAL",
      },
      {
        minuteNo: 2,
        author: "Padmaja Chauhan",
        designation: "Additional Secretary",
        timestamp: "04 Sep 2026, 04:30 PM",
        type: "Counter Clearance",
        content:
          "सीएमओ लखनऊ की संयुक्त मेडिकल बोर्ड आख्या संलग्न करते हुए प्रतिशपथपत्र पर हस्ताक्षर किए गए। मुख्य स्थायी अधिवक्ता कार्यालय को फाइल प्रेषित।",
        isSigned: true,
        signHash: "ASECR-SIG-4401",
        certSerial: "UP-DSC-2026-990011-BOARD",
      },
    ],
    "3": [
      {
        minuteNo: 1,
        author: "DySP Promotion",
        designation: "Division Head",
        timestamp: "13 Aug 2026, 09:30 AM",
        type: "Interim Stay Intimation",
        content:
          "माननीय न्यायालय द्वारा कट-ऑफ अंकों के संबंध में अंतिम चयन परिणाम पर अंतरिम रोक (Interim Stay) पारित की गई है। अनुच्छेद 226(3) के अंतर्गत स्थगन आदेश निरस्तीकरण (Vacation of Stay) हेतु प्रार्थना पत्र तैयार किया जाए।",
        isSigned: true,
        signHash: "DYSP-PROM-1102",
        certSerial: "UP-DSC-2026-334411-PROM",
      },
    ],
    "4": [
      {
        minuteNo: 1,
        author: "SP Legal (Cell-1)",
        designation: "OIC",
        timestamp: "12 Aug 2026, 03:15 PM",
        type: "Compliance Order",
        content:
          "मृतक आश्रित नियमावली के अंतर्गत अभ्यर्थी की पात्रता सही पाई गई। उपनिरीक्षक पद पर नियुक्ति पत्र जारी कर अनुपालन शपथ-पत्र माननीय न्यायालय में दाखिल कराया जाए।",
        isSigned: true,
        signHash: "SP-COMP-9912",
        certSerial: "UP-DSC-2026-554433-LEGAL",
      },
    ],
  });

  const currentNotings = useMemo(() => {
    return notingsStore[selectedCaseKey] || [];
  }, [notingsStore, selectedCaseKey]);

  // Drafting inputs
  const [notingType, setNotingType] = useState("PWC_LEGAL_OPINION");
  const [fontType, setFontType] = useState("UNICODE");
  const [destinationOfficer, setDestinationOfficer] = useState("member_secretary");
  const [urgency, setUrgency] = useState("HIGH");
  const [dueDate, setDueDate] = useState("2026-09-20");
  const [notingText, setNotingText] = useState(
    "कृपया उपरोक्त रिट याचिका का संदर्भ ग्रहण करने का कष्ट करें। माननीय उच्च न्यायालय द्वारा प्रतिशपथपत्र दाखिल करने हेतु अंतिम तिथि नियत है। संबंधित आख्या संलग्न कर अनुमोदनार्थ प्रस्तुत है।"
  );

  const handleSignAndForward = () => {
    if (!notingText.trim()) return;

    const nextMinuteNo = currentNotings.length + 1;
    const newMinute = {
      minuteNo: nextMinuteNo,
      author: "V. Sharma",
      designation: "Registry Officer (OIC Legal Desk)",
      timestamp: "Just now (Digital Stamp)",
      type: notingType.replace(/_/g, " "),
      content: notingText,
      isSigned: true,
      signHash: `DIGI-SIGN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      certSerial: `UP-DSC-2026-${Math.floor(100000 + Math.random() * 900000)}-VERIFIED`,
    };

    setNotingsStore((prev) => ({
      ...prev,
      [selectedCaseKey]: [...(prev[selectedCaseKey] || []), newMinute],
    }));

    alert(
      `Minute #${nextMinuteNo} successfully digitally signed and forwarded to ${destinationOfficer.replace(
        /_/g,
        " "
      ).toUpperCase()}.`
    );

    setNotingText("");
  };

  const openSignatureModal = (minute: any) => {
    setActiveSignData(minute);
    onVerifyOpen();
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
                <h1 className="text-base font-bold text-slate-900">4.0 Green Sheet Notings & File Movement</h1>
                <Chip size="sm" className="bg-emerald-500/20 px-1 text-[10px] font-bold text-emerald-800">
                  Secretariat Digital Ledger
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Viewing Official File Movement & PWC Minutes for: <b className="text-slate-900">{activeCase.caseNoYear}</b>
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
              <Link href={`/admin/documents?caseId=${selectedCaseKey}`}>
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
                onClick={onPrintPreviewOpen}
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
              selectedKeys={[selectedCaseKey]}
              onChange={(e) => setSelectedCaseKey(e.target.value)}
              className="bg-slate-50 font-semibold"
            >
              {Object.entries(casesDB).map(([k, val]) => (
                <SelectItem key={k}>
                  {val.caseNoYear} — {val.title.substring(0, 32)}...
                </SelectItem>
              ))}
            </Select>

            <div className="rounded-lg bg-slate-50 p-2 text-xs border border-slate-200 sm:col-span-2 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 truncate max-w-md">{activeCase.title}</p>
                <p className="text-slate-500 text-[11px]">
                  {activeCase.court} · {activeCase.bench} | NDOH: <b className="text-slate-800">{activeCase.ndoh}</b>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {activeCase.isContempt && (
                  <Chip size="sm" color="danger" variant="solid" className="font-bold text-[9px] h-5">
                    CONTEMPT
                  </Chip>
                )}
                {activeCase.isStay && (
                  <Chip size="sm" color="danger" variant="solid" className="font-bold text-[9px] h-5">
                    STAY
                  </Chip>
                )}
                <Chip size="sm" color="warning" variant="flat" className="font-bold text-[10px]">
                  {activeCase.ndohDays}
                </Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Workspace Split: Left (Green Sheet Ledger) + Right (Drafting Desk) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Traditional Green Sheet Chronological Ledger (7 Columns) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Noting Sheet Ledger (Immutable History)
            </h3>
            <span className="text-[11px] text-slate-400">Total Minutes: {currentNotings.length}</span>
          </div>

          <div className="space-y-3">
            {currentNotings.map((n) => (
              <Card key={n.minuteNo} shadow="none" className="border border-emerald-200/70 bg-emerald-50/30">
                <CardBody className="p-4 space-y-3">
                  {/* Minute Header */}
                  <div className="flex items-center justify-between border-b border-emerald-200/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white">
                        {n.minuteNo}
                      </span>
                      <p className="text-xs font-bold text-emerald-950">
                        Minute #{n.minuteNo} — {n.type}
                      </p>
                    </div>
                    {n.isSigned && (
                      <Chip
                        size="sm"
                        color="success"
                        variant="solid"
                        className="h-4 text-[9px] px-1 font-bold cursor-pointer hover:bg-emerald-600 transition-colors"
                        onClick={() => openSignatureModal(n)}
                      >
                        ✓ DIGITALLY SIGNED
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
                      <span className="font-bold text-slate-700">{n.author}</span> · {n.designation}
                    </div>
                    <div>
                      {n.timestamp}{" "}
                      <span
                        className="font-mono text-[9px] text-emerald-800 cursor-pointer underline hover:text-emerald-950"
                        onClick={() => openSignatureModal(n)}
                      >
                        ({n.signHash})
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: New Minute Drafting & File Routing Panel (5 Columns) */}
        <div className="space-y-4 lg:col-span-5">
          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <div className="border-b border-slate-100 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Draft New Minute #{currentNotings.length + 1}
              </h3>
              <p className="text-[11px] text-slate-400">Compose institutional remarks and route the legal file</p>
            </div>

            <CardBody className="p-4 space-y-4">
              {/* Noting Purpose & Font Type */}
              <div className="grid grid-cols-2 gap-3">
                <Select
                  size="sm"
                  label="Noting Purpose"
                  labelPlacement="outside"
                  selectedKeys={[notingType]}
                  onChange={(e) => setNotingType(e.target.value)}
                  isRequired
                >
                  <SelectItem key="PWC_LEGAL_OPINION">PWC / Legal Opinion</SelectItem>
                  <SelectItem key="APPROVAL_FOR_COUNTER">Approval for Counter</SelectItem>
                  <SelectItem key="DIRECTION_TO_SECTION">Direction to Section</SelectItem>
                  <SelectItem key="COMPLIANCE_ORDER">Compliance Order</SelectItem>
                </Select>

                <div>
                  <p className="text-[11px] font-bold text-slate-700 mb-1">Font Normalization</p>
                  <RadioGroup
                    orientation="horizontal"
                    value={fontType}
                    onValueChange={setFontType}
                    classNames={{ wrapper: "gap-3" }}
                  >
                    <Radio value="UNICODE" classNames={{ label: "text-xs font-semibold" }}>
                      Unicode
                    </Radio>
                    <Radio value="KRUTI_DEV" classNames={{ label: "text-xs font-semibold" }}>
                      Kruti Dev 14
                    </Radio>
                  </RadioGroup>
                </div>
              </div>

              {/* Hindi / English Typing Editor Box */}
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
                  label="Forward To Officer"
                  labelPlacement="outside"
                  selectedKeys={[destinationOfficer]}
                  onChange={(e) => setDestinationOfficer(e.target.value)}
                  isRequired
                >
                  <SelectItem key="member_secretary">Member Secretary / ADG</SelectItem>
                  <SelectItem key="chairman_dg">Chairman / Director General</SelectItem>
                  <SelectItem key="standing_counsel">Chief Standing Counsel (High Court)</SelectItem>
                  <SelectItem key="accounts_officer">Senior Accounts Officer</SelectItem>
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    size="sm"
                    label="Turnaround Due Date"
                    labelPlacement="outside"
                    type="date"
                    value={dueDate}
                    onValueChange={setDueDate}
                    isRequired
                  />
                  <Select
                    size="sm"
                    label="File Urgency"
                    labelPlacement="outside"
                    selectedKeys={[urgency]}
                    onChange={(e) => setUrgency(e.target.value)}
                  >
                    <SelectItem key="HIGH">High Priority (NDOH)</SelectItem>
                    <SelectItem key="NORMAL">Normal Routine</SelectItem>
                    <SelectItem key="STAY">Urgent (Stay Motion)</SelectItem>
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
                  onClick={() => alert("Draft noting saved temporarily in local session.")}
                >
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-emerald-700 font-semibold text-white shadow hover:bg-emerald-800 text-xs"
                  startContent={<span className="material-symbols-rounded text-sm">verified</span>}
                  onClick={handleSignAndForward}
                >
                  Sign & Forward File
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
                    <span className="font-bold text-sm">Legal Validity: VALID & TAMPER-EVIDENT</span>
                    <Chip size="sm" color="success" variant="solid" className="text-[9px] font-bold">
                      SHA-256
                    </Chip>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Complies with Information Technology Act, 2000 & Secretariat Electronic Noting Protocols.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signer Officer:</span>
                    <span className="font-bold text-slate-800">{activeSignData?.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Designation / Role:</span>
                    <span className="text-slate-800">{activeSignData?.designation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signing Timestamp:</span>
                    <span className="font-mono text-slate-800">{activeSignData?.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Certificate Serial:</span>
                    <span className="font-mono text-[11px] text-blue-700">{activeSignData?.certSerial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cryptographic Hash:</span>
                    <span className="font-mono text-[11px] text-slate-700">{activeSignData?.signHash}</span>
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
                      Official Green Sheet Print Preview — {activeCase.caseNoYear}
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
                {/* Formal Green Sheet Authentic Canvas */}
                <div className="mx-auto w-full max-w-2xl bg-[#ebf7ee] border-2 border-emerald-300 p-8 rounded shadow-sm text-xs leading-relaxed space-y-6 font-serif">
                  {/* Top Seal & Heading */}
                  <div className="text-center border-b border-emerald-400/60 pb-4">
                    <p className="font-bold text-sm tracking-wider uppercase text-emerald-950">
                      उत्तर प्रदेश पुलिस भर्ती एवं प्रोन्नति बोर्ड, लखनऊ
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      तुलसी गंगा कॉम्पलेक्स, 19-सी विधान सभा मार्ग, लखनऊ (विधिक प्रकोष्ठ)
                    </p>
                    <div className="mt-2 inline-block bg-white/70 px-3 py-1 rounded border border-emerald-300 text-[11px] font-sans font-bold text-emerald-900">
                      नोटिंग पत्रावली (Green Noting Sheet) · {activeCase.caseNoYear}
                    </div>
                  </div>

                  {/* Litigant Details Header */}
                  <div className="bg-white/60 p-3 rounded border border-emerald-200 font-sans text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">याचिका / वाद:</span>
                      <span className="font-bold text-slate-800">{activeCase.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">न्यायालय:</span>
                      <span className="text-slate-800">{activeCase.court} ({activeCase.bench})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">अग्रिम नियत तिथि (NDOH):</span>
                      <span className="font-bold text-amber-800">{activeCase.ndoh}</span>
                    </div>
                  </div>

                  {/* Sequential Minutes Ledger */}
                  <div className="space-y-4 pt-2">
                    {currentNotings.map((m: any) => (
                      <div key={m.minuteNo} className="border-b border-emerald-300/80 pb-4 space-y-2">
                        <div className="flex justify-between font-sans text-[11px] font-bold text-emerald-950">
                          <span>टिप्पणी संख्या (Minute #{m.minuteNo}) — {m.type}</span>
                          <span className="text-[10px] text-emerald-800 font-normal">{m.timestamp}</span>
                        </div>
                        <p className="text-slate-900 text-xs leading-relaxed text-justify whitespace-pre-wrap">
                          {m.content}
                        </p>
                        <div className="flex justify-end pt-2 text-[10px] font-sans text-slate-700">
                          <div className="text-right">
                            <p className="font-bold text-emerald-950">{m.author}</p>
                            <p className="text-slate-600">{m.designation}</p>
                            <p className="font-mono text-[9px] text-emerald-800">[ह० प्रमाणित: {m.signHash}]</p>
                          </div>
                        </div>
                      </div>
                    ))}
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