"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  RadioGroup,
  Radio,
  Switch,
  Textarea,
  Divider,
  Chip,
  Spinner,
} from "@nextui-org/react";
import Link from "next/link";

export default function CaseIntakeWizardPage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [regMode, setRegMode] = useState<string>("NEW"); // NEW vs OLD (Backlog)
  const [cnrLoading, setCnrLoading] = useState<boolean>(false);
  const [cnrSuccess, setCnrSuccess] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    cnrNumber: "",
    prevRegistrationNo: "",
    previousYear: "",
    court: "High Court Allahabad",
    bench: "Principal Bench",
    caseType: "WRIT-A",
    caseNo: "4012",
    caseYear: "2026",
    noticeNo: "67186",
    noticeYear: "2026",
    primaryPetitioner: "Abhay Gupta",
    petitionerAdvocate: "R.K. Ojha, Senior Advocate",
    petitionerPhone: "9876543210",
    respondentName: "State of U.P. through Principal Secretary (Home)",
    respondentGroup: "BHARTI BOARD",
    owningDepartment: "Recruitment Wing",
    officerInCharge: "Superintendent of Police (Legal)",
    pairokar: "Shanu Pratap Singh",
    caseCategory: "Recruitment",
    caseSubCategory: "Appointment under Dying in Harness Rules - SICP",
    subjectMatter: "Not Selected in Physical Efficiency Test (PET)",
    priority: "HIGH",
    isStayInForce: false,
    isContemptImminent: false,
    remarks: "Advance notice received from Chief Standing Counsel office.",
  });

  const handleCnrFetch = () => {
    if (!formData.cnrNumber) return;
    setCnrLoading(true);
    // Simulate eCourts NAPIX Background API resolution
    setTimeout(() => {
      setCnrLoading(false);
      setCnrSuccess(true);
      setFormData((prev) => ({
        ...prev,
        court: "High Court Allahabad",
        bench: "Principal Bench",
        caseType: "WRIT-A",
        caseNo: "4012",
        caseYear: "2026",
        primaryPetitioner: "Abhay Gupta & 4 Others",
        petitionerAdvocate: "R.K. Ojha, Senior Advocate",
      }));
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Wizard Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900">2.2 Case Intake Wizard</h1>
          <p className="text-xs text-slate-500">
            Register newly filed petitions or backdated legacy cases into the institutional DMS
          </p>
        </div>
        <Link href="/admin/cases">
          <Button
            size="sm"
            variant="bordered"
            radius="sm"
            className="border-slate-200 bg-white text-xs font-semibold"
            startContent={<span className="material-symbols-rounded text-sm">arrow_back</span>}
          >
            Back to Register
          </Button>
        </Link>
      </div>

      {/* Stepper Indicator */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-2 cursor-pointer ${
                activeStep === 1 ? "text-blue-700 font-bold" : "text-slate-500 font-medium"
              }`}
              onClick={() => setActiveStep(1)}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  activeStep === 1 ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                1
              </div>
              <span className="text-xs">Judicial Discovery (CNR)</span>
            </div>

            <div className="h-px w-16 bg-slate-200" />

            <div
              className={`flex items-center gap-2 cursor-pointer ${
                activeStep === 2 ? "text-blue-700 font-bold" : "text-slate-500 font-medium"
              }`}
              onClick={() => setActiveStep(2)}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  activeStep === 2 ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                2
              </div>
              <span className="text-xs">Parties & Internal Attribution</span>
            </div>

            <div className="h-px w-16 bg-slate-200" />

            <div
              className={`flex items-center gap-2 cursor-pointer ${
                activeStep === 3 ? "text-blue-700 font-bold" : "text-slate-500 font-medium"
              }`}
              onClick={() => setActiveStep(3)}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  activeStep === 3 ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                3
              </div>
              <span className="text-xs">Document E-File & Submission</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* STEP 1: JUDICIAL IDENTIFICATION */}
      {activeStep === 1 && (
        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-6 space-y-6">
            {/* New vs Old Toggle */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold text-slate-900">Registration Mode</p>
                <p className="text-[11px] text-slate-500">
                  Select whether this is a freshly received court case or archival backfilling
                </p>
              </div>
              <RadioGroup
                orientation="horizontal"
                value={regMode}
                onValueChange={setRegMode}
                classNames={{ wrapper: "gap-4" }}
              >
                <Radio value="NEW" classNames={{ label: "text-xs font-semibold" }}>Fresh E-Filing</Radio>
                <Radio value="OLD" classNames={{ label: "text-xs font-semibold" }}>Legacy / Backlog Case</Radio>
              </RadioGroup>
            </div>

            {/* Backlog Reference Row */}
            {regMode === "OLD" && (
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
                <Input
                  size="sm"
                  label="Previous Registration Number"
                  labelPlacement="outside"
                  placeholder="e.g. PRPB-R/124/2019"
                  value={formData.prevRegistrationNo}
                  onValueChange={(val) => setFormData({ ...formData, prevRegistrationNo: val })}
                />
                <Input
                  size="sm"
                  label="Previous Year"
                  labelPlacement="outside"
                  placeholder="e.g. 2019"
                  value={formData.previousYear}
                  onValueChange={(val) => setFormData({ ...formData, previousYear: val })}
                />
              </div>
            )}

            {/* 16-Digit CNR Discovery Box */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-950">Auto-Fetch via 16-Digit CNR Number</p>
                  <p className="text-[11px] text-blue-700">
                    Entering the Case Natural Record (CNR) query-resolves High Court registries instantly
                  </p>
                </div>
                {cnrSuccess && (
                  <Chip size="sm" color="success" variant="solid" className="text-[10px] font-bold">
                    ✓ High Court CIS Verified
                  </Chip>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  size="sm"
                  radius="sm"
                  placeholder="e.g. UPHC010029312026 (Case Natural Record)"
                  value={formData.cnrNumber}
                  onValueChange={(val) => setFormData({ ...formData, cnrNumber: val.toUpperCase() })}
                  className="bg-white font-mono"
                />
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-blue-700 font-semibold text-white hover:bg-blue-800"
                  isLoading={cnrLoading}
                  onClick={handleCnrFetch}
                >
                  Fetch via eCourts
                </Button>
              </div>
            </div>

            {/* Core Court Metadata Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Select
                size="sm"
                label="Court Establishment"
                labelPlacement="outside"
                selectedKeys={[formData.court]}
                onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                isRequired
              >
                <SelectItem key="High Court Allahabad">High Court Allahabad</SelectItem>
                <SelectItem key="High Court Lucknow">High Court Lucknow</SelectItem>
                <SelectItem key="Supreme Court of India">Supreme Court of India</SelectItem>
              </Select>

              <Input
                size="sm"
                label="Bench / Court Room"
                labelPlacement="outside"
                value={formData.bench}
                onValueChange={(val) => setFormData({ ...formData, bench: val })}
              />

              <Select
                size="sm"
                label="Case Type"
                labelPlacement="outside"
                selectedKeys={[formData.caseType]}
                onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                isRequired
              >
                <SelectItem key="WRIT-A">WRIT-A (Service Matters)</SelectItem>
                <SelectItem key="WRIT-C">WRIT-C (Civil Matters)</SelectItem>
                <SelectItem key="CONTEMPT">CONTEMPT APPLICATION</SelectItem>
                <SelectItem key="SPECIAL_APPEAL">SPECIAL APPEAL DEFECTIVE</SelectItem>
              </Select>

              <Input
                size="sm"
                label="Writ / Case Number"
                labelPlacement="outside"
                placeholder="4012"
                value={formData.caseNo}
                onValueChange={(val) => setFormData({ ...formData, caseNo: val })}
                isRequired
              />

              <Input
                size="sm"
                label="Filing / Case Year"
                labelPlacement="outside"
                placeholder="2026"
                value={formData.caseYear}
                onValueChange={(val) => setFormData({ ...formData, caseYear: val })}
                isRequired
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  size="sm"
                  label="Notice No."
                  labelPlacement="outside"
                  value={formData.noticeNo}
                  onValueChange={(val) => setFormData({ ...formData, noticeNo: val })}
                />
                <Input
                  size="sm"
                  label="Notice Year"
                  labelPlacement="outside"
                  value={formData.noticeYear}
                  onValueChange={(val) => setFormData({ ...formData, noticeYear: val })}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                onClick={() => setActiveStep(2)}
              >
                Next: Parties & Routing
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* STEP 2: PARTIES & INSTITUTIONAL ATTRIBUTION */}
      {activeStep === 2 && (
        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-6 space-y-6">
            {/* Litigants */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Parties & Counsels
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  size="sm"
                  label="Primary Petitioner Name"
                  labelPlacement="outside"
                  value={formData.primaryPetitioner}
                  onValueChange={(val) => setFormData({ ...formData, primaryPetitioner: val })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Petitioner Counsel / Advocate"
                  labelPlacement="outside"
                  value={formData.petitionerAdvocate}
                  onValueChange={(val) => setFormData({ ...formData, petitionerAdvocate: val })}
                />
                <Input
                  size="sm"
                  label="Petitioner Counsel Mobile"
                  labelPlacement="outside"
                  value={formData.petitionerPhone}
                  onValueChange={(val) => setFormData({ ...formData, petitionerPhone: val })}
                />
              </div>
            </div>

            <Divider />

            {/* Respondent Tagging */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Respondent & Office Linking
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  size="sm"
                  label="Respondent Group (Master)"
                  labelPlacement="outside"
                  selectedKeys={[formData.respondentGroup]}
                  onChange={(e) => setFormData({ ...formData, respondentGroup: e.target.value })}
                >
                  <SelectItem key="BHARTI BOARD">BHARTI BOARD (Recruitment Board)</SelectItem>
                  <SelectItem key="DGP_HQ">DGP / PHQ HEAD QUARTER</SelectItem>
                  <SelectItem key="UP_GOVT">UP GOVERNMENT (Home Dept)</SelectItem>
                  <SelectItem key="DISTRICT_MAGISTRATE">DISTRICT MAGISTRATE</SelectItem>
                </Select>

                <Input
                  size="sm"
                  label="Full Respondent String"
                  labelPlacement="outside"
                  value={formData.respondentName}
                  onValueChange={(val) => setFormData({ ...formData, respondentName: val })}
                />
              </div>
            </div>

            <Divider />

            {/* Institutional Internal Ownership */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Internal Department Routing & Custodians
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Select
                  size="sm"
                  label="Owning Wing / Department"
                  labelPlacement="outside"
                  selectedKeys={[formData.owningDepartment]}
                  onChange={(e) => setFormData({ ...formData, owningDepartment: e.target.value })}
                  isRequired
                >
                  <SelectItem key="Recruitment Wing">Recruitment Wing</SelectItem>
                  <SelectItem key="Promotion Wing">Promotion Wing</SelectItem>
                  <SelectItem key="Establishment Wing">Establishment Wing</SelectItem>
                  <SelectItem key="Training Directorate">Training Directorate</SelectItem>
                </Select>

                <Select
                  size="sm"
                  label="Officer-in-Charge (OIC)"
                  labelPlacement="outside"
                  selectedKeys={[formData.officerInCharge]}
                  onChange={(e) => setFormData({ ...formData, officerInCharge: e.target.value })}
                  isRequired
                >
                  <SelectItem key="Superintendent of Police (Legal)">Superintendent of Police (Legal)</SelectItem>
                  <SelectItem key="Additional Secretary (Recruitment)">Additional Secretary (Recruitment)</SelectItem>
                  <SelectItem key="DySP (Promotion)">DySP (Promotion)</SelectItem>
                </Select>

                <Select
                  size="sm"
                  label="Designated Pairokar"
                  labelPlacement="outside"
                  selectedKeys={[formData.pairokar]}
                  onChange={(e) => setFormData({ ...formData, pairokar: e.target.value })}
                >
                  <SelectItem key="Shanu Pratap Singh">Shanu Pratap Singh (HC Allahabad)</SelectItem>
                  <SelectItem key="Dashrath Lal">Dashrath Lal (HC Lucknow)</SelectItem>
                </Select>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Select
                  size="sm"
                  label="Case Category"
                  labelPlacement="outside"
                  selectedKeys={[formData.caseCategory]}
                  onChange={(e) => setFormData({ ...formData, caseCategory: e.target.value })}
                >
                  <SelectItem key="Recruitment">Recruitment</SelectItem>
                  <SelectItem key="Promotion">Promotion</SelectItem>
                  <SelectItem key="Establishment">Establishment</SelectItem>
                  <SelectItem key="Others">Others</SelectItem>
                </Select>

                <Input
                  size="sm"
                  label="Sub Category"
                  labelPlacement="outside"
                  value={formData.caseSubCategory}
                  onValueChange={(val) => setFormData({ ...formData, caseSubCategory: val })}
                />

                <Input
                  size="sm"
                  label="Granular Subject"
                  labelPlacement="outside"
                  value={formData.subjectMatter}
                  onValueChange={(val) => setFormData({ ...formData, subjectMatter: val })}
                />
              </div>
            </div>

            <Divider />

            {/* Urgency Switches */}
            <div className="flex items-center gap-6">
              <Switch
                size="sm"
                isSelected={formData.isStayInForce}
                onValueChange={(val) => setFormData({ ...formData, isStayInForce: val })}
              >
                <span className="text-xs font-semibold text-rose-600">Interim Stay in Effect</span>
              </Switch>

              <Switch
                size="sm"
                isSelected={formData.isContemptImminent}
                onValueChange={(val) => setFormData({ ...formData, isContemptImminent: val })}
              >
                <span className="text-xs font-semibold text-amber-600">Contempt Imminent Warning</span>
              </Switch>
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-4">
              <Button size="sm" radius="sm" variant="bordered" onClick={() => setActiveStep(1)}>
                Previous
              </Button>
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                onClick={() => setActiveStep(3)}
              >
                Next: Document Attachment
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* STEP 3: E-FILE DOCUMENT PROVISIONING & SUBMISSION */}
      {activeStep === 3 && (
        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Initial Petition & Notice Upload (MinIO S3)
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                Attach certified or advance copy received from court registry. SHA-256 integrity hash is computed automatically.
              </p>
            </div>

            {/* File Dropzone */}
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:bg-slate-50/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <span className="material-symbols-rounded text-2xl">cloud_upload</span>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-900">Drag & Drop raw petition PDF</p>
              <p className="text-[10px] text-slate-400">PDF up to 50MB · Automatic background OCR text indexing</p>
              <Button size="sm" radius="sm" variant="bordered" className="mt-3 text-xs font-semibold">
                Browse Files
              </Button>
            </div>

            {/* Initial Remark / Kruti Dev or Unicode Noting */}
            <div>
              <Textarea
                label="Registration Remarks / Legal Cell Directions"
                labelPlacement="outside"
                placeholder="Type initial directions or note..."
                value={formData.remarks}
                onValueChange={(val) => setFormData({ ...formData, remarks: val })}
                className="text-xs"
              />
            </div>

            {/* Case Submission Summary Confirmation */}
            <div className="rounded-lg bg-slate-50 p-4 text-xs space-y-2">
              <p className="font-bold text-slate-900">Summary Verification:</p>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <span>Writ: <b>{formData.caseType}/{formData.caseNo}/{formData.caseYear}</b></span>
                <span>Petitioner: <b>{formData.primaryPetitioner}</b></span>
                <span>Owning Department: <b>{formData.owningDepartment}</b></span>
                <span>Officer in Charge: <b>{formData.officerInCharge}</b></span>
              </div>
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-4">
              <Button size="sm" radius="sm" variant="bordered" onClick={() => setActiveStep(2)}>
                Previous
              </Button>
              <Button
                size="sm"
                radius="sm"
                className="bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700"
                onClick={() => {
                  alert("Case Registered successfully! Generating internal file number PRPB-R/945/2026.");
                }}
              >
                Confirm & Issue File Number
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}