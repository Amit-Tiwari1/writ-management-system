"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { CasesAPI } from "@/api/casesApi";
import { MastersAPI, IntakeDropdownBundle } from "@/api/mastersApi";
import { AdminAPI } from "@/api/userApi";
import { StaffUserItem } from "@/types/user.types";
import {
  caseIntakeFormSchema,
  CaseIntakeFormValues,
  PetitionerItemFormValues,
} from "@/schemas/caseIntakeSchema";

interface KeyLabelOption {
  key: string;
  label: string;
}

interface CourtOption extends KeyLabelOption {
  code: string;
  bench: "Allahabad" | "Lucknow" | "New Delhi";
  id?: string;
}

interface CaseTypeOption extends KeyLabelOption {
  id?: string;
}

interface WingOption extends KeyLabelOption {
  id?: string;
}

interface CategoryOption extends KeyLabelOption {
  id?: string;
}

interface SubCategoryOption extends KeyLabelOption {
  id?: string;
  officer?: string;
}

interface SubjectOption extends KeyLabelOption {
  id?: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS: KeyLabelOption[] = Array.from(
  { length: CURRENT_YEAR - 2000 + 1 },
  (_, i) => {
    const y = (CURRENT_YEAR - i).toString();
    return { key: y, label: y };
  }
);

export default function CaseIntakeWizardPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [dropdowns, setDropdowns] = useState<IntakeDropdownBundle | null>(null);
  const [staffUsers, setStaffUsers] = useState<StaffUserItem[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState<boolean>(true);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [subCategoryOptions, setSubCategoryOptions] = useState<SubCategoryOption[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);

  const [petitionersList, setPetitionersList] = useState<PetitionerItemFormValues[]>([]);
  const [newPetitioner, setNewPetitioner] = useState<PetitionerItemFormValues>({
    rollNo: "",
    registrationNo: "",
    name: "",
    fatherName: "",
    role: "Co-Petitioner",
    categoryClaimed: "General",
    postClaimed: "Constable Civil Police",
    state: "Uttar Pradesh",
    district: "Lucknow",
    meritScore: 0,
  });

  const provisionalFileNo = `PRPB-W/${CURRENT_YEAR}/AUTO-GEN`;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CaseIntakeFormValues>({
    resolver: zodResolver(caseIntakeFormSchema),
    defaultValues: {
      mode: "NOTICE",
      regMode: "NEW",
      prevRegistrationNo: "",
      previousYear: String(CURRENT_YEAR),
      noticeNumber: "",
      noticeYear: String(CURRENT_YEAR),
      noticeServiceDate: new Date().toISOString().split("T")[0],
      court: "High Court of Judicature at Allahabad",
      courtCode: "HC-ALD",
      benchLocation: "Allahabad",
      caseType: "WRIT-A",
      caseNumber: "",
      caseYear: CURRENT_YEAR,
      cnrNumber: "",
      courtRoomNo: "--",
      coramBench: "--",
      leadPetitioner: "",
      leadPetitionerRollNo: "",
      leadPetitionerFatherName: "",
      district: "Lucknow",
      state: "Uttar Pradesh",
      petitionerAdvocate: "",
      petitionerPhone: "",
      respondentString: "State of U.P. & Chairman UPPRPB",
      stateCounsel: "Chief Standing Counsel (CSC)",
      sectionWing: "Recruitment Wing",
      assignedOIC: "",
      assignedPairokar: "",
      category: "Direct Recruitment",
      subCategory: "",
      disputeSubject: "",
      examCycle: "2023-24",
      hasActiveStay: false,
      stayScope: "",
      isContemptNotice: false,
      ndoh: null,
      remarks: "Advance notice received. Scrutiny in progress.",
    },
  });

  const watchMode = watch("mode");
  const watchRegMode = watch("regMode");
  const watchCnrNumber = watch("cnrNumber");
  const watchNoticeNumber = watch("noticeNumber");
  const watchNoticeYear = watch("noticeYear");
  const watchCaseType = watch("caseType");
  const watchCaseNumber = watch("caseNumber");
  const watchCaseYear = watch("caseYear");

  const fetchSubjects = useCallback(
    async (subCategoryId: string) => {
      try {
        const res = await MastersAPI.getSubjects({ subCategoryId, limit: 100 });
        if (res?.success && Array.isArray(res.data)) {
          const mapped: SubjectOption[] = res.data.map((item: any) => ({
            key: item.subjectTitle,
            label: item.subjectTitle,
            id: item._id,
          }));
          setSubjectOptions(mapped);
          if (mapped.length > 0) {
            setValue("disputeSubject", mapped[0].key);
            setValue("subjectId", mapped[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
      }
    },
    [setValue]
  );

  const fetchSubCategories = useCallback(
    async (categoryId: string) => {
      try {
        const res = await MastersAPI.getSubCategories({ categoryId, limit: 100 });
        if (res?.success && Array.isArray(res.data)) {
          const mapped: SubCategoryOption[] = res.data.map((item: any) => ({
            key: item.subCategoryName,
            label: item.subCategoryName,
            id: item._id,
            officer: item.defaultOfficerName,
          }));
          setSubCategoryOptions(mapped);
          if (mapped.length > 0) {
            const firstSub = mapped[0];
            setValue("subCategory", firstSub.key);
            setValue("subCategoryId", firstSub.id);
            if (firstSub.officer && firstSub.officer !== "--") {
              setValue("assignedOIC", firstSub.officer);
            }
            if (firstSub.id) {
              fetchSubjects(firstSub.id);
            }
          } else {
            setSubCategoryOptions([]);
            setSubjectOptions([]);
          }
        }
      } catch (err) {
        console.error("Failed to load subcategories:", err);
      }
    },
    [fetchSubjects, setValue]
  );

  useEffect(() => {
    async function loadData() {
      setLoadingDropdowns(true);
      try {
        const [mastersRes, usersRes] = await Promise.all([
          MastersAPI.getIntakeDropdowns(),
          AdminAPI.getUsersList({ limit: 100, status: "ACTIVE" }),
        ]);

        if (mastersRes?.success && mastersRes.data) {
          setDropdowns(mastersRes.data);
          if (mastersRes.data.categories?.length > 0) {
            const firstCat = mastersRes.data.categories[0];
            setValue("category", firstCat.categoryName);
            setValue("categoryId", firstCat._id);
            fetchSubCategories(firstCat._id);
          }
          if (mastersRes.data.courts?.length > 0) {
            const firstCourt = mastersRes.data.courts[0];
            setValue("court", firstCourt.courtName);
            setValue("courtId", firstCourt._id);
            setValue("courtCode", firstCourt.shortCode);
            setValue(
              "benchLocation",
              firstCourt.location?.toLowerCase().includes("lucknow") ? "Lucknow" : "Allahabad"
            );
          }
        }

        if (usersRes?.success && Array.isArray(usersRes.data)) {
          setStaffUsers(usersRes.data);
          if (usersRes.data.length > 0) {
            setValue("assignedOIC", usersRes.data[0].officerName);
            setValue("assignedPairokar", usersRes.data[0].officerName);
          }
        }
      } catch (err) {
        console.error("Failed to load intake dependencies:", err);
      } finally {
        setLoadingDropdowns(false);
      }
    }
    loadData();
  }, [fetchSubCategories, setValue]);

  const oicOptions: KeyLabelOption[] = useMemo(() => {
    if (!staffUsers || staffUsers.length === 0) {
      return [
        { key: "Dr. Arvind Chaturvedi", label: "Dr. Arvind Chaturvedi (Member Secretary / SP Legal)" },
        { key: "Rajeshwar Singh", label: "Rajeshwar Singh (Officer-in-Charge / DySP)" },
      ];
    }
    return staffUsers.map((u: StaffUserItem) => {
      const designation = u.designationAndWing?.designation || u.assignedRole || "Staff";
      return {
        key: u.officerName,
        label: `${u.officerName} (${designation})`,
      };
    });
  }, [staffUsers]);

  const courtOptions: CourtOption[] = useMemo(() => {
    if (!dropdowns?.courts || dropdowns.courts.length === 0) {
      return [
        { key: "High Court of Judicature at Allahabad", label: "High Court Allahabad (HC-ALD)", code: "HC-ALD", bench: "Allahabad", id: "" },
        { key: "High Court Allahabad (Lucknow Bench)", label: "High Court Lucknow (HC-LKO)", code: "HC-LKO", bench: "Lucknow", id: "" },
        { key: "State Public Services Tribunal", label: "Tribunal Lucknow (SPST-LKO)", code: "SPST-LKO", bench: "Lucknow", id: "" },
      ];
    }
    return dropdowns.courts.map((courtItem: any) => ({
      key: courtItem.courtName,
      label: `${courtItem.courtName} (${courtItem.shortCode})`,
      code: courtItem.shortCode,
      bench: courtItem.location?.toLowerCase().includes("lucknow") ? "Lucknow" : "Allahabad",
      id: courtItem._id,
    }));
  }, [dropdowns]);

  const caseTypeOptions: CaseTypeOption[] = useMemo(() => {
    if (!dropdowns?.caseTypes || dropdowns.caseTypes.length === 0) {
      return [
        { key: "WRIT-A", label: "WRIT - A (Service Single Bench)", id: "" },
        { key: "SPL-A", label: "SPECIAL APPEAL (Division Bench)", id: "" },
        { key: "CONT-APP", label: "CONTEMPT APPLICATION (CIVIL)", id: "" },
      ];
    }
    return dropdowns.caseTypes.map((ct: any) => ({
      key: ct.shortName || ct.caseTypeName,
      label: `${ct.caseTypeName} (${ct.shortName || ""})`,
      id: ct._id,
    }));
  }, [dropdowns]);

  const wingOptions: WingOption[] = useMemo(() => {
    if (!dropdowns?.departments || dropdowns.departments.length === 0) {
      return [
        { key: "Recruitment Wing", label: "Recruitment Wing", id: "" },
        { key: "Legal Cell (High Court Wing)", label: "Legal Cell (High Court Wing)", id: "" },
        { key: "PAC Recruitment Wing", label: "PAC Recruitment Wing", id: "" },
      ];
    }
    return dropdowns.departments.map((dep: any) => ({
      key: dep.unitName,
      label: dep.unitName,
      id: dep._id,
    }));
  }, [dropdowns]);

  const categoryOptions: CategoryOption[] = useMemo(() => {
    if (!dropdowns?.categories || dropdowns.categories.length === 0) return [];
    return dropdowns.categories.map((cat: any) => ({
      key: cat.categoryName,
      label: cat.categoryName,
      id: cat._id,
    }));
  }, [dropdowns]);

  const districtOptions: KeyLabelOption[] = useMemo(() => {
    if (!dropdowns?.districts || dropdowns.districts.length === 0) {
      return [
        { key: "Lucknow", label: "Lucknow" },
        { key: "Prayagraj", label: "Prayagraj" },
        { key: "Meerut", label: "Meerut" },
        { key: "Unnao", label: "Unnao" },
        { key: "Pratapgarh", label: "Pratapgarh" },
      ];
    }
    return dropdowns.districts.map((dist: any) => ({
      key: dist.districtName,
      label: dist.districtName,
    }));
  }, [dropdowns]);

  const handleResolveData = async () => {
    setIsResolving(true);
    try {
      if (watchMode === "CNR") {
        if (!watchCnrNumber || watchCnrNumber.trim().length !== 16) {
          toast.error("Please enter a valid 16-Digit CNR Number.");
          return;
        }
        const res = await CasesAPI.mockVerifyCNR(watchCnrNumber.trim().toUpperCase());
        if (res?.success && res.details) {
          const d = res.details;
          setValue("court", d.court);
          setValue("courtCode", d.courtCode);
          setValue("benchLocation", d.benchLocation as any);
          setValue("caseType", d.caseType);
          setValue("caseNumber", d.caseNumber);
          setValue("caseYear", d.caseYear || CURRENT_YEAR);
          setValue("leadPetitioner", d.leadPetitioner);
          setValue("petitionerAdvocate", d.petitionerAdvocate);
          setValue("courtRoomNo", d.courtRoomNo);
          setValue("coramBench", d.coramBench);
          setValue("ndoh", d.ndoh ? new Date(d.ndoh).toISOString().split("T")[0] : null);
          toast.success("eCourts CIS record resolved & form populated!", { icon: "⚖️" });
        }
      } else if (watchMode === "WRIT") {
        if (!watchCaseNumber) {
          toast.error("Please provide the Court Case Number.");
          return;
        }
        const prospectiveCNR = `UPHC0100${watchCaseNumber.padStart(4, "0")}${watchCaseYear}`;
        setValue("cnrNumber", prospectiveCNR);
        toast.success(`CNR prospective seed mapped: ${prospectiveCNR}`);
      } else {
        if (!watchNoticeNumber) {
          toast.error("Please enter Advance Notice / Diary Number.");
          return;
        }
        toast.success("Advance Notice verified against Legal Cell Registry!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification gateway unreachable. Fill manually.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleProceedToStep2 = async () => {
    const isValidStep1 = await trigger([
      "court",
      "caseType",
      "caseYear",
      ...(watchMode === "CNR" ? (["cnrNumber"] as const) : []),
      ...(watchMode === "WRIT" ? (["caseNumber"] as const) : []),
      ...(watchMode === "NOTICE" ? (["noticeNumber", "noticeYear"] as const) : []),
    ]);

    if (!isValidStep1) {
      toast.error("Please fill all mandatory (*) fields in Step 1.");
      return;
    }

    setIsCheckingDuplicate(true);
    try {
      const res = await CasesAPI.checkDuplicate({
        noticeNumber: watchNoticeNumber,
        writNumber: watchCaseNumber ? `${watchCaseType} / ${watchCaseNumber} / ${watchCaseYear}` : undefined,
        cnrNumber: watchCnrNumber,
      });

      if (res?.exists) {
        toast.error(
          `Duplicate Alert! File Docket ${res.matchedCase?.fileNo} already exists for this litigation.`,
          { duration: 6000 }
        );
        return;
      }
      setActiveStep(2);
    } catch {
      setActiveStep(2);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleAddPetitioner = () => {
    if (!newPetitioner.rollNo.trim() || !newPetitioner.name.trim()) {
      toast.error("Candidate Roll No and Name are mandatory (*)");
      return;
    }

    if (petitionersList.length === 0 && !watch("leadPetitioner")) {
      setValue("leadPetitioner", newPetitioner.name.trim());
      setValue("leadPetitionerRollNo", newPetitioner.rollNo.trim());
      setValue("leadPetitionerFatherName", newPetitioner.fatherName || "--");
    }

    setPetitionersList((prev) => [...prev, { ...newPetitioner }]);
    setNewPetitioner({
      rollNo: "",
      registrationNo: "",
      name: "",
      fatherName: "",
      role: "Co-Petitioner",
      categoryClaimed: "General",
      postClaimed: watch("disputeSubject") || "Constable Civil Police",
      state: "Uttar Pradesh",
      district: "Lucknow",
      meritScore: 0,
    });
    toast.success("Petitioner candidate added to docket roster.");
  };

  const handleRemovePetitioner = (index: number) => {
    setPetitionersList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const onRegisterSubmit = async (values: CaseIntakeFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        mode: values.mode,
        noticeNumber: values.noticeNumber
          ? `${values.noticeNumber}/${values.noticeYear}`
          : undefined,
        writNumber: values.caseNumber
          ? `${values.caseType} / ${values.caseNumber} / ${values.caseYear}`
          : undefined,
        cnrNumber: values.cnrNumber ? values.cnrNumber.trim().toUpperCase() : undefined,

        court: values.court,
        courtId: values.courtId,
        courtCode: values.courtCode,
        caseType: values.caseType,
        caseTypeId: values.caseTypeId,
        caseNumber: values.caseNumber,
        caseYear: values.caseYear,
        benchLocation: values.benchLocation,
        courtRoomNo: values.courtRoomNo || "--",
        coramBench: values.coramBench || "--",

        leadPetitioner: values.leadPetitioner.trim(),
        leadPetitionerRollNo: values.leadPetitionerRollNo,
        leadPetitionerFatherName: values.leadPetitionerFatherName,
        district: values.district,
        state: values.state,
        respondentString: values.respondentString.trim(),
        petitionerAdvocate: values.petitionerAdvocate?.trim() || "--",
        stateCounsel: values.stateCounsel || "Chief Standing Counsel (CSC)",

        sectionWing: values.sectionWing,
        assignedOIC: values.assignedOIC,
        assignedPairokar: values.assignedPairokar,

        category: values.category,
        categoryId: values.categoryId,
        subCategory: values.subCategory || "--",
        subCategoryId: values.subCategoryId,
        disputeSubject: values.disputeSubject || "General Service Matter",
        subjectId: values.subjectId,
        examCycle: values.examCycle,

        hasActiveStay: values.hasActiveStay,
        stayScope: values.stayScope,
        isContemptNotice: values.isContemptNotice,
        ndoh: values.ndoh ? new Date(values.ndoh).toISOString() : null,
        remarks: values.remarks,
        petitioners:
          petitionersList.length > 0
            ? petitionersList
            : [
                {
                  rollNo: values.leadPetitionerRollNo || `ROLL-${Date.now().toString().slice(-6)}`,
                  name: values.leadPetitioner,
                  role: "Lead Petitioner" as const,
                  district: values.district || "Lucknow",
                  state: "Uttar Pradesh",
                  meritScore: 0,
                },
              ],
      };

      const res = await CasesAPI.createCaseIntake(payload);

      if (res?.success) {
        toast.success(
          `Case Dossier ${res.case?.fileNo} successfully registered in registry!`,
          { icon: "📁", duration: 5000 }
        );
        router.push("/admin/cases");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to register case intake docket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            2.2 Case Intake Wizard (Adaptive 4-Identifier Engine)
          </h1>
          <p className="text-xs text-slate-500">
            Intake cases via Advance Notice No., Court Case No., or 16-Digit CNR (Synchronized with 7.0 Masters)
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

      {/* 2. Stepper Indicator */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-3.5">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-2 cursor-pointer ${
                activeStep === 1 ? "text-blue-700 font-bold" : "text-slate-500 font-medium"
              }`}
              onClick={() => setActiveStep(1)}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  activeStep === 1 ? "bg-[#0f2744] text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                1
              </div>
              <span className="text-xs">4-Identifier Identification</span>
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
                  activeStep === 2 ? "bg-[#0f2744] text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                2
              </div>
              <span className="text-xs">Litigants, Roster &amp; Routing</span>
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
                  activeStep === 3 ? "bg-[#0f2744] text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                3
              </div>
              <span className="text-xs">Initial DMS &amp; Docket Commit</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* STEP 1: 4-IDENTIFIER DISCOVERY & RESOLUTION */}
      {activeStep === 1 && (
        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Institutional File Docket No. (Internal Secretariat Key)
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-[#0f2744]">
                    {provisionalFileNo}
                  </span>
                  <Chip size="sm" variant="flat" color="primary" className="text-[10px] font-bold">
                    Auto-Provisioned on Commit
                  </Chip>
                </div>
              </div>

              <Controller
                name="regMode"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    orientation="horizontal"
                    value={field.value}
                    onValueChange={field.onChange}
                    classNames={{ wrapper: "gap-4" }}
                  >
                    <Radio value="NEW" classNames={{ label: "text-xs font-semibold" }}>
                      Fresh Ingestion
                    </Radio>
                    <Radio value="OLD" classNames={{ label: "text-xs font-semibold" }}>
                      Backlog / Legacy
                    </Radio>
                  </RadioGroup>
                )}
              />
            </div>

            {watchRegMode === "OLD" && (
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
                <Controller
                  name="prevRegistrationNo"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Previous Physical File No."
                      labelPlacement="outside"
                      placeholder="e.g. PRPB-R/124/2019"
                    />
                  )}
                />
                <Controller
                  name="previousYear"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Previous Filing Year"
                      labelPlacement="outside"
                      items={YEAR_OPTIONS}
                      selectedKeys={field.value ? [field.value] : []}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {(y: KeyLabelOption) => <SelectItem key={y.key}>{y.label}</SelectItem>}
                    </Select>
                  )}
                />
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-800">
                Select Available Information for Case Intake:
              </p>
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <Tabs
                    selectedKey={field.value}
                    onSelectionChange={(k) => field.onChange(k as any)}
                    color="primary"
                    variant="bordered"
                    classNames={{
                      tabList: "w-full border-slate-200 p-1",
                      tab: "text-xs font-bold h-9",
                    }}
                  >
                    <Tab
                      key="NOTICE"
                      title={
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-rounded text-sm">mark_email_unread</span>
                          <span>Mode 1: Advance Notice / Diary No.</span>
                        </div>
                      }
                    />
                    <Tab
                      key="WRIT"
                      title={
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-rounded text-sm">gavel</span>
                          <span>Mode 2: Court Writ No. (Type/No/Year)</span>
                        </div>
                      }
                    />
                    <Tab
                      key="CNR"
                      title={
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-rounded text-sm">qr_code_2</span>
                          <span>Mode 3: 16-Digit CNR Number</span>
                        </div>
                      }
                    />
                  </Tabs>
                )}
              />
            </div>

            {/* Mode 1: Advance Notice */}
            {watchMode === "NOTICE" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                <p className="text-xs font-bold text-amber-950">Pre-Registration Advance Notice Mode</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <Controller
                    name="noticeNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        size="sm"
                        label="Notice / Diary No. *"
                        labelPlacement="outside"
                        placeholder="e.g. ANT-8491"
                        isInvalid={!!errors.noticeNumber}
                        errorMessage={errors.noticeNumber?.message}
                        className="bg-white"
                      />
                    )}
                  />
                  <Controller
                    name="noticeYear"
                    control={control}
                    render={({ field }) => (
                      <Select
                        size="sm"
                        label="Notice Year *"
                        labelPlacement="outside"
                        items={YEAR_OPTIONS}
                        selectedKeys={[field.value]}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="bg-white"
                      >
                        {(y: KeyLabelOption) => <SelectItem key={y.key}>{y.label}</SelectItem>}
                      </Select>
                    )}
                  />
                  <Controller
                    name="noticeServiceDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        size="sm"
                        type="date"
                        label="Date of Service"
                        labelPlacement="outside"
                        className="bg-white"
                      />
                    )}
                  />
                  <div className="flex items-end">
                    <Button
                      size="sm"
                      radius="sm"
                      className="w-full bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                      isLoading={isResolving}
                      onClick={handleResolveData}
                    >
                      Lookup Notice
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Court Writ */}
            {watchMode === "WRIT" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                <p className="text-xs font-bold text-blue-950">Formal Court Case Number Mode</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <Controller
                    name="caseType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        size="sm"
                        label="Case Type *"
                        labelPlacement="outside"
                        items={caseTypeOptions}
                        selectedKeys={[field.value]}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="bg-white"
                      >
                        {(item: CaseTypeOption) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                      </Select>
                    )}
                  />
                  <Controller
                    name="caseNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        size="sm"
                        label="Case Number *"
                        labelPlacement="outside"
                        placeholder="e.g. 10421"
                        isInvalid={!!errors.caseNumber}
                        errorMessage={errors.caseNumber?.message}
                        className="bg-white"
                      />
                    )}
                  />
                  <Controller
                    name="caseYear"
                    control={control}
                    render={({ field }) => (
                      <Select
                        size="sm"
                        label="Filing Year *"
                        labelPlacement="outside"
                        items={YEAR_OPTIONS}
                        selectedKeys={[field.value.toString()]}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || CURRENT_YEAR)}
                        className="bg-white"
                      >
                        {(y: KeyLabelOption) => <SelectItem key={y.key}>{y.label}</SelectItem>}
                      </Select>
                    )}
                  />
                  <div className="flex items-end">
                    <Button
                      size="sm"
                      radius="sm"
                      className="w-full bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                      isLoading={isResolving}
                      onClick={handleResolveData}
                    >
                      Resolve to CNR
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: 16-Digit CNR */}
            {watchMode === "CNR" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                <p className="text-xs font-bold text-emerald-950">16-Digit National CNR Mode</p>
                <div className="flex gap-2">
                  <Controller
                    name="cnrNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        size="sm"
                        radius="sm"
                        placeholder="e.g. UPHC010104212026"
                        isInvalid={!!errors.cnrNumber}
                        errorMessage={errors.cnrNumber?.message}
                        className="bg-white font-mono"
                      />
                    )}
                  />
                  <Button
                    size="sm"
                    radius="sm"
                    className="bg-emerald-700 font-semibold text-white hover:bg-emerald-800"
                    isLoading={isResolving}
                    onClick={handleResolveData}
                  >
                    Fetch via eCourts
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <Controller
                name="court"
                control={control}
                render={({ field }) => (
                  <Select
                    size="sm"
                    label="Court Establishment *"
                    labelPlacement="outside"
                    items={courtOptions}
                    selectedKeys={[field.value]}
                    onChange={(e) => {
                      const sel = courtOptions.find((c: CourtOption) => c.key === e.target.value);
                      field.onChange(e.target.value);
                      if (sel) {
                        setValue("courtCode", sel.code);
                        if (sel.id) setValue("courtId", sel.id);
                        setValue("benchLocation", sel.bench);
                      }
                    }}
                    isRequired
                  >
                    {(court: CourtOption) => <SelectItem key={court.key}>{court.label}</SelectItem>}
                  </Select>
                )}
              />

              <Controller
                name="courtRoomNo"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="sm"
                    label="Court Room / Hall No."
                    labelPlacement="outside"
                    placeholder="e.g. Court No. 32"
                  />
                )}
              />

              <Controller
                name="coramBench"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="sm"
                    label="Coram / Hon'ble Judge"
                    labelPlacement="outside"
                    placeholder="e.g. Hon'ble Justice S.K. Gupta"
                  />
                )}
              />

              <Controller
                name="cnrNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="sm"
                    label="CNR Number (If Available)"
                    labelPlacement="outside"
                    placeholder="e.g. UPHC010104212026"
                    className="font-mono"
                  />
                )}
              />
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                isLoading={isCheckingDuplicate}
                onClick={handleProceedToStep2}
              >
                Next: Litigants &amp; Routing →
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* STEP 2: LITIGANTS & ROUTING */}
      {activeStep === 2 && (
        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Primary Litigant &amp; Advocates
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Controller
                  name="leadPetitioner"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Primary Petitioner Name *"
                      labelPlacement="outside"
                      placeholder="e.g. Amitabh Singh s/o Ramakant Singh"
                      isInvalid={!!errors.leadPetitioner}
                      errorMessage={errors.leadPetitioner?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="leadPetitionerRollNo"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Roll No. / PNO"
                      labelPlacement="outside"
                      placeholder="e.g. 2401892"
                    />
                  )}
                />

                <Controller
                  name="petitionerAdvocate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Petitioner Counsel (Advocate)"
                      labelPlacement="outside"
                      placeholder="e.g. R.K. Ojha, Senior Advocate"
                    />
                  )}
                />

                <Controller
                  name="petitionerPhone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Counsel Contact / Mobile"
                      labelPlacement="outside"
                      placeholder="e.g. 9876543210"
                    />
                  )}
                />
              </div>
            </div>

            <Divider />

            {/* Candidate Roster Grid */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Details of Co-Petitioner(s) Candidate Roster
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add individual applicants with Roll No, Name and District
                  </p>
                </div>
                <Chip size="sm" variant="flat" color="primary" className="text-[10px] font-bold">
                  {petitionersList.length} Candidates Added
                </Chip>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                <Input
                  size="sm"
                  label="Roll No."
                  placeholder="e.g. 2401892"
                  value={newPetitioner.rollNo}
                  onValueChange={(val) => setNewPetitioner({ ...newPetitioner, rollNo: val })}
                  className="bg-white"
                />
                <Input
                  size="sm"
                  label="Registration No."
                  placeholder="e.g. REG-9182"
                  value={newPetitioner.registrationNo}
                  onValueChange={(val) => setNewPetitioner({ ...newPetitioner, registrationNo: val })}
                  className="bg-white"
                />
                <Input
                  size="sm"
                  label="Candidate Name"
                  placeholder="Candidate Name"
                  value={newPetitioner.name}
                  onValueChange={(val) => setNewPetitioner({ ...newPetitioner, name: val })}
                  className="bg-white"
                />
                <Input
                  size="sm"
                  label="Father Name"
                  placeholder="Father Name"
                  value={newPetitioner.fatherName}
                  onValueChange={(val) => setNewPetitioner({ ...newPetitioner, fatherName: val })}
                  className="bg-white"
                />
                <Select
                  size="sm"
                  label="District"
                  items={districtOptions}
                  selectedKeys={[newPetitioner.district]}
                  onChange={(e) => setNewPetitioner({ ...newPetitioner, district: e.target.value })}
                  className="bg-white"
                >
                  {(dist: KeyLabelOption) => <SelectItem key={dist.key}>{dist.label}</SelectItem>}
                </Select>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] text-xs font-semibold text-white hover:bg-[#163a66]"
                  startContent={<span className="material-symbols-rounded text-sm">person_add</span>}
                  onClick={handleAddPetitioner}
                >
                  Add Petitioner to Roster
                </Button>
              </div>

              {petitionersList.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <Table removeWrapper aria-label="Added Petitioners Table" className="min-w-full">
                    <TableHeader>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">
                        ROLL NO
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">
                        NAME
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">
                        FATHER NAME
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400">
                        DISTRICT
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase text-slate-400 text-center">
                        ACTION
                      </TableColumn>
                    </TableHeader>
                    <TableBody items={petitionersList}>
                      {(p) => {
                        const idx = petitionersList.indexOf(p);
                        return (
                          <TableRow key={idx} className="border-b border-slate-100">
                            <TableCell className="font-mono text-xs font-bold text-blue-700">
                              {p.rollNo}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-slate-900">
                              {p.name}
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">
                              {p.fatherName || "--"}
                            </TableCell>
                            <TableCell className="text-xs text-slate-700">
                              {p.district}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-slate-400 hover:text-rose-600"
                                onClick={() => handleRemovePetitioner(idx)}
                              >
                                <span className="material-symbols-rounded text-sm">delete</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      }}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <Divider />

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Government Respondents
              </h3>
              <div className="mt-3">
                <Controller
                  name="respondentString"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Official Respondent String *"
                      labelPlacement="outside"
                      placeholder="State of U.P. through Principal Secretary (Home) & Chairman UPPRPB"
                      isRequired
                    />
                  )}
                />
              </div>
            </div>

            <Divider />

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Internal Department Routing &amp; Taxonomy (7.6 &amp; 8.1 Masters)
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Controller
                  name="sectionWing"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Owning Wing / Department *"
                      labelPlacement="outside"
                      items={wingOptions}
                      selectedKeys={[field.value]}
                      onChange={(e) => field.onChange(e.target.value)}
                      isRequired
                    >
                      {(wing: WingOption) => <SelectItem key={wing.key}>{wing.label}</SelectItem>}
                    </Select>
                  )}
                />

                <Controller
                  name="assignedOIC"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Officer-in-Charge (OIC) *"
                      labelPlacement="outside"
                      items={oicOptions}
                      selectedKeys={field.value ? [field.value] : []}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Select designated OIC..."
                      isRequired
                      isLoading={loadingDropdowns}
                    >
                      {(oic: KeyLabelOption) => <SelectItem key={oic.key}>{oic.label}</SelectItem>}
                    </Select>
                  )}
                />

                <Controller
                  name="assignedPairokar"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Designated Court Pairokar *"
                      labelPlacement="outside"
                      items={oicOptions}
                      selectedKeys={field.value ? [field.value] : []}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Select court pairokar..."
                      isRequired
                      isLoading={loadingDropdowns}
                    >
                      {(p: KeyLabelOption) => <SelectItem key={p.key}>{p.label}</SelectItem>}
                    </Select>
                  )}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Dispute Category (Tier-1) *"
                      labelPlacement="outside"
                      items={categoryOptions}
                      selectedKeys={[field.value]}
                      onChange={(e) => {
                        const sel = categoryOptions.find((catItem: CategoryOption) => catItem.key === e.target.value);
                        field.onChange(e.target.value);
                        if (sel && sel.id) {
                          setValue("categoryId", sel.id);
                          fetchSubCategories(sel.id);
                        }
                      }}
                      isRequired
                    >
                      {(cat: CategoryOption) => <SelectItem key={cat.key}>{cat.label}</SelectItem>}
                    </Select>
                  )}
                />

                <Controller
                  name="subCategory"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Exam Cycle / Bharti (Tier-2) *"
                      labelPlacement="outside"
                      items={subCategoryOptions}
                      selectedKeys={field.value ? [field.value] : []}
                      onChange={(e) => {
                        const sel = subCategoryOptions.find((scItem: SubCategoryOption) => scItem.key === e.target.value);
                        field.onChange(e.target.value);
                        if (sel && sel.id) {
                          setValue("subCategoryId", sel.id);
                          if (sel.officer && sel.officer !== "--") {
                            setValue("assignedOIC", sel.officer);
                          }
                          fetchSubjects(sel.id);
                        }
                      }}
                      isRequired
                    >
                      {(sc: SubCategoryOption) => <SelectItem key={sc.key}>{sc.label}</SelectItem>}
                    </Select>
                  )}
                />

                <Controller
                  name="disputeSubject"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Litigation Subject (Tier-3) *"
                      labelPlacement="outside"
                      items={subjectOptions}
                      selectedKeys={field.value ? [field.value] : []}
                      onChange={(e) => {
                        const sel = subjectOptions.find((sItem: SubjectOption) => sItem.key === e.target.value);
                        field.onChange(e.target.value);
                        if (sel && sel.id) setValue("subjectId", sel.id);
                      }}
                      isRequired
                    >
                      {(sub: SubjectOption) => <SelectItem key={sub.key}>{sub.label}</SelectItem>}
                    </Select>
                  )}
                />
              </div>
            </div>

            <Divider />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-center">
              <Controller
                name="hasActiveStay"
                control={control}
                render={({ field }) => (
                  <Switch size="sm" isSelected={field.value} onValueChange={field.onChange}>
                    <span className="text-xs font-semibold text-rose-600">
                      Interim Stay Motion in Effect
                    </span>
                  </Switch>
                )}
              />

              <Controller
                name="isContemptNotice"
                control={control}
                render={({ field }) => (
                  <Switch size="sm" isSelected={field.value} onValueChange={field.onChange}>
                    <span className="text-xs font-semibold text-amber-600">
                      Contempt Imminent Warning (&lt;3 Days)
                    </span>
                  </Switch>
                )}
              />

              <Controller
                name="ndoh"
                control={control}
                render={({ field }) => (
                  <Input
                    type="date"
                    size="sm"
                    label="Next Date of Hearing (NDOH)"
                    labelPlacement="outside"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    className="bg-white"
                  />
                )}
              />
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-4">
              <Button size="sm" radius="sm" variant="bordered" onClick={() => setActiveStep(1)}>
                ← Previous
              </Button>
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                onClick={() => setActiveStep(3)}
              >
                Next: Document Attachment &amp; Commit →
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* STEP 3: E-FILE DOCUMENT & FINAL COMMIT */}
      {activeStep === 3 && (
        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Initial Document Attachment (MinIO / Cloudinary Folder 01_Petitions)
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                Upload scanned advocate notice or petition copy. System generates cryptographic SHA-256 seal automatically.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:bg-slate-50/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <span className="material-symbols-rounded text-2xl">cloud_upload</span>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-900">Notice / Petition PDF Attachment</p>
              <p className="text-[10px] text-slate-400">
                PDF documents will be automatically organized under 01_Petitions in 3.0 DMS
              </p>
              <Button size="sm" radius="sm" variant="bordered" className="mt-3 text-xs font-semibold">
                Browse File (Optional at Intake)
              </Button>
            </div>

            <div>
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Initial Secretariat Noting / Legal Cell Directions"
                    labelPlacement="outside"
                    placeholder="Type initial directions or note..."
                    className="text-xs"
                  />
                )}
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
              <p className="font-extrabold text-slate-900">4-Identifier Hierarchy Verification:</p>
              <div className="grid grid-cols-2 gap-3 text-slate-700 sm:grid-cols-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400">1. FILE DOCKET NO</span>
                  <p className="font-mono font-bold text-[#0f2744]">{provisionalFileNo}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400">2. ADVOCATE NOTICE NO</span>
                  <p className="font-mono font-bold text-amber-700">
                    {watchNoticeNumber ? `${watchNoticeNumber}/${watchNoticeYear}` : "--"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400">3. COURT WRIT NO</span>
                  <p className="font-bold text-blue-700">
                    {watchCaseNumber ? `${watchCaseType} / ${watchCaseNumber} / ${watchCaseYear}` : "--"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400">4. CNR NUMBER</span>
                  <p className="font-mono text-slate-600">{watchCnrNumber || "Pending Allotment"}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-4">
              <Button size="sm" radius="sm" variant="bordered" onClick={() => setActiveStep(2)}>
                ← Previous
              </Button>
              <Button
                size="sm"
                radius="sm"
                isLoading={isSubmitting}
                className="bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700"
                onClick={handleSubmit(onRegisterSubmit)}
              >
                Confirm &amp; Create Institutional Docket
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}