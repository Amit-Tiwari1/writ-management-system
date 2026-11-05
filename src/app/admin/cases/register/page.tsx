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
  officerId?: string;
}

interface SubjectOption extends KeyLabelOption {
  id?: string;
}

const getObjectId = (value: any): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && value._id) {
    return String(value._id);
  }
  return "";
};
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS: KeyLabelOption[] = Array.from(
  { length: CURRENT_YEAR - 2000 + 1 },
  (_, i) => {
    const y = (CURRENT_YEAR - i).toString();
    return { key: y, label: y };
  },
);

export default function CaseIntakeWizardPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [dropdowns, setDropdowns] = useState<IntakeDropdownBundle | null>(null);
  const [staffUsers, setStaffUsers] = useState<StaffUserItem[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState<boolean>(true);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [subCategoryOptions, setSubCategoryOptions] = useState<
    SubCategoryOption[]
  >([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);

  const [petitionersList, setPetitionersList] = useState<
    PetitionerItemFormValues[]
  >([]);
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
      setSubjectOptions([]);
      setValue("disputeSubject", "");
      setValue("subjectId", "");

      if (!subCategoryId) return;

      try {
        const res = await MastersAPI.getSubjects({
          subCategoryId,
          limit: 100,
        });

        if (res?.success && Array.isArray(res.data)) {
          const mapped: SubjectOption[] = res.data
            .filter((item: any) => item?._id && item?.subjectTitle)
            .map((item: any) => ({
              key: String(item.subjectTitle),
              label: String(item.subjectTitle),
              id: String(item._id),
            }));

          setSubjectOptions(mapped);

          if (mapped.length === 1) {
            setValue("disputeSubject", mapped[0].key);
            setValue("subjectId", mapped[0].id || "");
          }
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
        toast.error("Unable to load subjects for selected subcategory.");
      }
    },
    [setValue],
  );

  const fetchSubCategories = useCallback(
    async (categoryId: string) => {
      setSubCategoryOptions([]);
      setSubjectOptions([]);

      setValue("subCategory", "");
      setValue("subCategoryId", "");
      setValue("disputeSubject", "");
      setValue("subjectId", "");

      if (!categoryId) return;

      try {
        const res = await MastersAPI.getSubCategories({
          categoryId,
          limit: 100,
        });

        if (res?.success && Array.isArray(res.data)) {
          const mapped: SubCategoryOption[] = res.data
            .filter((item: any) => item?._id && item?.subCategoryName)
            .map((item: any) => ({
              key: String(item.subCategoryName),
              label: String(item.subCategoryName),
              id: String(item._id),
              officerId: getObjectId(item.defaultOfficerId),
            }));

          setSubCategoryOptions(mapped);

          // Automatically select only when exactly one option exists.
          if (mapped.length === 1) {
            const firstSub = mapped[0];

            setValue("subCategory", firstSub.key);
            setValue("subCategoryId", firstSub.id || "");

            if (firstSub.officerId) {
              setValue("assignedOIC", firstSub.officerId);
            }

            if (firstSub.id) {
              await fetchSubjects(firstSub.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load subcategories:", err);
        toast.error("Unable to load subcategories for selected category.");
      }
    },
    [fetchSubjects, setValue],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoadingDropdowns(true);

      try {
        const [mastersRes, usersRes] = await Promise.all([
          MastersAPI.getIntakeDropdowns(),
          AdminAPI.getUsersList({
            limit: 100,
            status: "ACTIVE",
          }),
        ]);

        if (!isMounted) return;

        if (mastersRes?.success && mastersRes.data) {
          const masters = mastersRes.data;

          setDropdowns(masters);

          // Default Court
          const firstCourt = masters.courts?.find((item: any) => item?._id);

          if (firstCourt) {
            const courtId = String(firstCourt._id);

            setValue("court", firstCourt.courtName);
            setValue("courtId", courtId);
            setValue("courtCode", firstCourt.shortCode || "");

            const location = String(firstCourt.location || "").toLowerCase();

            setValue(
              "benchLocation",
              location.includes("lucknow")
                ? "Lucknow"
                : location.includes("new delhi")
                  ? "New Delhi"
                  : "Allahabad",
            );

            // Select a case type belonging to the selected court.
            const firstCaseType = masters.caseTypes?.find(
              (item: any) => item?._id && getObjectId(item.courtId) === courtId,
            );

            if (firstCaseType) {
              setValue(
                "caseType",
                firstCaseType.shortName || firstCaseType.caseTypeName,
              );
              setValue("caseTypeId", String(firstCaseType._id));
            } else {
              setValue("caseTypeId", "");
            }
          }

          // Default Category
          const firstCategory = masters.categories?.find(
            (item: any) => item?._id,
          );

          if (firstCategory) {
            setValue("category", firstCategory.categoryName);
            setValue("categoryId", String(firstCategory._id));

            await fetchSubCategories(String(firstCategory._id));
          }
        }

        if (usersRes?.success && Array.isArray(usersRes.data)) {
          const validUsers = usersRes.data.filter(
            (user: any) => user?._id && user?.officerName,
          );

          setStaffUsers(validUsers);

          // Do not select the same person automatically for both roles.
          if (validUsers.length > 0) {
            setValue("assignedOIC", String(validUsers[0]._id));
          }

          if (validUsers.length > 1) {
            setValue("assignedPairokar", String(validUsers[1]._id));
          }
        }
      } catch (err) {
        console.error("Failed to load intake dependencies:", err);
        toast.error("Unable to load master data or active staff.");
      } finally {
        if (isMounted) {
          setLoadingDropdowns(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchSubCategories, setValue]);

  const selectedCourtId = watch("courtId");

  const oicOptions: KeyLabelOption[] = useMemo(() => {
    return staffUsers
      .filter((user: any) => user?._id && user?.officerName)
      .map((user: any) => {
        const designation =
          user.designationAndWing?.designation || user.assignedRole || "Staff";

        return {
          key: String(user._id),
          label: `${user.officerName} (${designation})`,
        };
      });
  }, [staffUsers]);

  const courtOptions: CourtOption[] = useMemo(() => {
    return (dropdowns?.courts || [])
      .filter((court: any) => court?._id && court?.courtName)
      .map((court: any) => {
        const location = String(court.location || "").toLowerCase();

        const bench: CourtOption["bench"] = location.includes("lucknow")
          ? "Lucknow"
          : location.includes("new delhi")
            ? "New Delhi"
            : "Allahabad";

        return {
          key: String(court.courtName),
          label: `${court.courtName} (${court.shortCode || ""})`,
          code: court.shortCode || "",
          bench,
          id: String(court._id),
        };
      });
  }, [dropdowns]);

  const caseTypeOptions: CaseTypeOption[] = useMemo(() => {
    if (!selectedCourtId) return [];

    return (dropdowns?.caseTypes || [])
      .filter(
        (item: any) =>
          item?._id && getObjectId(item.courtId) === selectedCourtId,
      )
      .map((item: any) => ({
        key: item.shortName || item.caseTypeName,
        label: `${item.caseTypeName} (${item.shortName || ""})`,
        id: String(item._id),
      }));
  }, [dropdowns, selectedCourtId]);

  const wingOptions: WingOption[] = useMemo(() => {
    return (dropdowns?.departments || [])
      .filter((item: any) => item?._id && item?.unitName)
      .map((item: any) => ({
        key: item.unitName,
        label: item.unitName,
        id: String(item._id),
      }));
  }, [dropdowns]);

  const categoryOptions: CategoryOption[] = useMemo(() => {
    return (dropdowns?.categories || [])
      .filter((item: any) => item?._id && item?.categoryName)
      .map((item: any) => ({
        key: item.categoryName,
        label: item.categoryName,
        id: String(item._id),
      }));
  }, [dropdowns]);

  const districtOptions: KeyLabelOption[] = useMemo(() => {
    return (dropdowns?.districts || [])
      .filter((item: any) => item?._id && item?.districtName)
      .map((item: any) => ({
        key: item.districtName,
        label: item.districtName,
      }));
  }, [dropdowns]);

  const handleResolveData = async () => {
    setIsResolving(true);

    try {
      if (watchMode === "CNR") {
        const cnr = (watchCnrNumber || "").trim().toUpperCase();

        if (!/^[A-Z0-9]{16}$/.test(cnr)) {
          toast.error("Please enter a valid 16-character CNR number.");
          return;
        }

        const res = await CasesAPI.mockVerifyCNR(cnr);

        if (res?.success && res.details) {
          const d = res.details;

          setValue("court", d.court || "");
          setValue("courtCode", d.courtCode || "");
          setValue("benchLocation", d.benchLocation as any);
          setValue("caseType", d.caseType || "");
          setValue("caseNumber", d.caseNumber || "");
          setValue("caseYear", Number(d.caseYear) || CURRENT_YEAR);
          setValue("leadPetitioner", d.leadPetitioner || "");
          setValue("petitionerAdvocate", d.petitionerAdvocate || "");
          setValue("courtRoomNo", d.courtRoomNo || "--");
          setValue("coramBench", d.coramBench || "--");
          setValue(
            "ndoh",
            d.ndoh ? new Date(d.ndoh).toISOString().split("T")[0] : null,
          );

          toast.success(
            "Mock CNR lookup completed. Please verify the populated details manually.",
          );
        } else {
          toast.error(res?.message || "CNR details could not be resolved.");
        }

        return;
      }

      if (watchMode === "WRIT") {
        if (!watchCaseNumber?.trim()) {
          toast.error("Please provide the Court Case Number.");
          return;
        }

        toast(
          "No live WRIT verification is configured. Please enter and verify the case details manually.",
        );

        return;
      }

      if (watchMode === "NOTICE") {
        if (!watchNoticeNumber?.trim()) {
          toast.error("Please enter Advance Notice / Diary Number.");
          return;
        }

        toast(
          "Notice number entered. Duplicate checking will run before proceeding.",
        );
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Verification service unavailable. Please verify the details manually.",
      );
    } finally {
      setIsResolving(false);
    }
  };

  const handleProceedToStep2 = async () => {
    const isValidStep1 = await trigger([
      "court",
      "courtId",
      "caseType",
      "caseTypeId",
      "caseYear",
      ...(watchMode === "CNR" ? (["cnrNumber"] as const) : []),
      ...(watchMode === "WRIT" ? (["caseNumber"] as const) : []),
      ...(watchMode === "NOTICE"
        ? (["noticeNumber", "noticeYear"] as const)
        : []),
    ]);

    if (!isValidStep1) {
      toast.error("Please fill all mandatory (*) fields in Step 1.");
      return;
    }

    if (!selectedCourtId || !watch("caseTypeId")) {
      toast.error("Please select a valid Court and Case Type.");
      return;
    }

    const duplicatePayload: {
      noticeNumber?: string;
      writNumber?: string;
      cnrNumber?: string;
    } = {};

    if (watchMode === "NOTICE") {
      duplicatePayload.noticeNumber = `${(watchNoticeNumber ?? "").trim()}/${watchNoticeYear}`;
    } else if (watchMode === "WRIT") {
      duplicatePayload.writNumber = `${watchCaseType} / ${(watchCaseNumber ?? "").trim()} / ${watchCaseYear}`;
    } else if (watchMode === "CNR") {
      duplicatePayload.cnrNumber = (watchCnrNumber ?? "").trim().toUpperCase();
    }

    setIsCheckingDuplicate(true);

    try {
      const res = await CasesAPI.checkDuplicate(duplicatePayload);

      if (!res?.success) {
        toast.error("Duplicate verification failed. Please try again.");
        return;
      }

      if (res.exists) {
        toast.error(
          `Duplicate Alert! File Docket ${res.matchedCase?.fileNo || ""} already exists.`,
          { duration: 6000 },
        );
        return;
      }

      setActiveStep(2);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Unable to check duplicate records. Please try again.",
      );
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleAddPetitioner = () => {
    if (!newPetitioner.rollNo.trim() || !newPetitioner.name.trim()) {
      toast.error("Candidate Roll No and Name are mandatory.");
      return;
    }

    const normalizedRollNo = newPetitioner.rollNo.trim().toLowerCase();
    const alreadyExists = petitionersList.some(
      (item) => item.rollNo.trim().toLowerCase() === normalizedRollNo,
    );

    if (alreadyExists) {
      toast.error("This Roll Number is already present in the roster.");
      return;
    }

    setPetitionersList((prev) => [
      ...prev,
      {
        ...newPetitioner,
        rollNo: newPetitioner.rollNo.trim(),
        name: newPetitioner.name.trim(),
        fatherName: (newPetitioner.fatherName ?? "").trim(),
        role: "Co-Petitioner",
      },
    ]);

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

    toast.success("Co-petitioner added to roster.");
  };

  const handleRemovePetitioner = (index: number) => {
    setPetitionersList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const onRegisterSubmit = async (values: CaseIntakeFormValues) => {
    setIsSubmitting(true);

    try {
      // Validate State and District
      if (!values.state?.trim() || !values.district?.trim()) {
        toast.error("Please select a valid State and District.");
        return;
      }

      const selectedState = (dropdowns?.states || []).find(
        (item: any) => item.stateName === values.state,
      );

      const selectedDistrict = (dropdowns?.districts || []).find(
        (item: any) =>
          item.districtName === values.district &&
          (!selectedState?._id ||
            getObjectId(item.stateId) === String(selectedState._id)),
      );

      if (!selectedState || !selectedDistrict) {
        toast.error("Selected State or District is invalid.");
        return;
      }

      // Validate Court and Case Type
      if (!values.courtId || !values.caseTypeId) {
        toast.error("Valid Court and Case Type selection is required.");
        return;
      }

      // Validate Category, Subcategory and Subject
      if (!values.categoryId || !values.subCategoryId || !values.subjectId) {
        toast.error("Please select a valid Category, Subcategory and Subject.");
        return;
      }

      // Validate OIC and Pairokar
      if (!values.assignedOIC || !values.assignedPairokar) {
        toast.error("Please select both OIC and Court Pairokar.");
        return;
      }

      const selectedOIC = staffUsers.some(
        (user: any) => String(user._id) === values.assignedOIC,
      );

      const selectedPairokar = staffUsers.some(
        (user: any) => String(user._id) === values.assignedPairokar,
      );

      if (!selectedOIC || !selectedPairokar) {
        toast.error(
          "Selected OIC or Pairokar is not a valid active staff member.",
        );
        return;
      }

      // Validate Lead Petitioner
      if (
        !values.leadPetitioner?.trim() ||
        !values.leadPetitionerRollNo?.trim()
      ) {
        toast.error("Lead Petitioner name and roll number are required.");
        return;
      }

      // Prepare API Payload
      const payload = {
        mode: values.mode,

        noticeNumber: (values.noticeNumber ?? "").trim(),
        writNumber: (values.caseNumber ?? "").trim(),
        cnrNumber: (values.cnrNumber ?? "").trim(),

        // Court
        court: values.court,
        courtId: values.courtId,
        courtCode: values.courtCode,

        // Case Type
        caseType: values.caseType,
        caseTypeId: values.caseTypeId,
        caseNumber: values.caseNumber?.trim() || "",
        caseYear: Number(values.caseYear),

        benchLocation: values.benchLocation,
        courtRoomNo: values.courtRoomNo?.trim() || "--",
        coramBench: values.coramBench?.trim() || "--",

        // Lead Petitioner
        leadPetitioner: values.leadPetitioner.trim(),
        leadPetitionerRollNo: values.leadPetitionerRollNo.trim(),
        leadPetitionerFatherName:
          values.leadPetitionerFatherName?.trim() || "--",

        // State and District
        state: values.state.trim(),
        district: values.district.trim(),

        // Respondent
        respondentString: values.respondentString.trim(),
        petitionerAdvocate: values.petitionerAdvocate?.trim() || "--",
        stateCounsel:
          values.stateCounsel?.trim() || "Chief Standing Counsel (CSC)",

        // Staff and Wing
        assignedOIC: values.assignedOIC,
        assignedPairokar: values.assignedPairokar,
        sectionWing: values.sectionWing,

        // Category
        category: values.category,
        categoryId: values.categoryId,

        subCategory: values.subCategory,
        subCategoryId: values.subCategoryId,

        disputeSubject: values.disputeSubject,
        subjectId: values.subjectId,

        // Additional Details
        examCycle: values.examCycle?.trim() || "",
        hasActiveStay: Boolean(values.hasActiveStay),
        stayScope: values.stayScope?.trim() || "",
        isContemptNotice: Boolean(values.isContemptNotice),

        ndoh: values.ndoh
          ? new Date(`${values.ndoh}T00:00:00`).toISOString()
          : null,

        remarks: values.remarks?.trim() || "",

        // Co-Petitioners
        petitioners: petitionersList.map((item) => {
          const petitionerState = (dropdowns?.states || []).find(
            (state: any) => state.stateName === item.state,
          );

          const petitionerDistrict = (dropdowns?.districts || []).find(
            (district: any) =>
              district.districtName === item.district &&
              (!petitionerState?._id ||
                getObjectId(district.stateId) === String(petitionerState._id)),
          );

          if (!petitionerState || !petitionerDistrict) {
            throw new Error(
              `Invalid State or District for petitioner: ${item.name}`,
            );
          }

          return {
            role: "Co-Petitioner" as const,
            rollNo: item.rollNo.trim(),
            registrationNo: item.registrationNo?.trim() || "",
            name: item.name.trim(),
            fatherName: item.fatherName?.trim() || "--",
            state: item.state.trim(),
            district: item.district.trim(),
            categoryClaimed: item.categoryClaimed || "General",
            postClaimed: item.postClaimed || "Constable Civil Police",
          };
        }),
      };

      // Submit Case
      const res = await CasesAPI.createCaseIntake(payload);

      if (!res?.success) {
        toast.error(res?.message || "Case registration failed.");
        return;
      }

      toast.success(
        `Case Dossier ${res.case?.fileNo || ""} successfully registered!`,
        {
          icon: "📁",
          duration: 5000,
        },
      );

      router.push("/admin/cases");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to register case intake docket.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            2.2 Case Intake Wizard (Adaptive 4-Identifier Engine)
          </h1>
          <p className="text-xs text-slate-500">
            Intake cases via Advance Notice No., Court Case No., or 16-Digit CNR
            (Synchronized with 7.0 Masters)
          </p>
        </div>
        <Link href="/admin/cases">
          <Button
            size="sm"
            variant="bordered"
            radius="sm"
            className="border-slate-200 bg-white text-xs font-semibold"
            startContent={
              <span className="material-symbols-rounded text-sm">
                arrow_back
              </span>
            }
          >
            Back to Register
          </Button>
        </Link>
      </div>

      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-3.5">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-2 cursor-pointer ${
                activeStep === 1
                  ? "text-blue-700 font-bold"
                  : "text-slate-500 font-medium"
              }`}
              onClick={() => setActiveStep(1)}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  activeStep === 1
                    ? "bg-[#0f2744] text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                1
              </div>
              <span className="text-xs">4-Identifier Identification</span>
            </div>

            <div className="h-px w-16 bg-slate-200" />

            <div
              className={`flex items-center gap-2 cursor-pointer ${
                activeStep === 2
                  ? "text-blue-700 font-bold"
                  : "text-slate-500 font-medium"
              }`}
              onClick={() => {
                if (activeStep >= 2) setActiveStep(2);
              }}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  activeStep === 2
                    ? "bg-[#0f2744] text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                2
              </div>
              <span className="text-xs">Litigants, Roster &amp; Routing</span>
            </div>

            <div className="h-px w-16 bg-slate-200" />

            <div
              className={`flex items-center gap-2 cursor-pointer ${
                activeStep === 3
                  ? "text-blue-700 font-bold"
                  : "text-slate-500 font-medium"
              }`}
              onClick={() => {
                if (activeStep >= 3) setActiveStep(3);
              }}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  activeStep === 3
                    ? "bg-[#0f2744] text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                3
              </div>
              <span className="text-xs">Initial DMS &amp; Docket Commit</span>
            </div>
          </div>
        </CardBody>
      </Card>
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
                  <Chip
                    size="sm"
                    variant="flat"
                    color="primary"
                    className="text-[10px] font-bold"
                  >
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
                    <Radio
                      value="NEW"
                      classNames={{ label: "text-xs font-semibold" }}
                    >
                      Fresh Ingestion
                    </Radio>
                    <Radio
                      value="OLD"
                      classNames={{ label: "text-xs font-semibold" }}
                    >
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
                      {(y: KeyLabelOption) => (
                        <SelectItem key={y.key}>{y.label}</SelectItem>
                      )}
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
                          <span className="material-symbols-rounded text-sm">
                            mark_email_unread
                          </span>
                          <span>Mode 1: Advance Notice / Diary No.</span>
                        </div>
                      }
                    />
                    <Tab
                      key="WRIT"
                      title={
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-rounded text-sm">
                            gavel
                          </span>
                          <span>Mode 2: Court Writ No. (Type/No/Year)</span>
                        </div>
                      }
                    />
                    <Tab
                      key="CNR"
                      title={
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-rounded text-sm">
                            qr_code_2
                          </span>
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
                <p className="text-xs font-bold text-amber-950">
                  Pre-Registration Advance Notice Mode
                </p>
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
                        {(y: KeyLabelOption) => (
                          <SelectItem key={y.key}>{y.label}</SelectItem>
                        )}
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
                <p className="text-xs font-bold text-blue-950">
                  Formal Court Case Number Mode
                </p>
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
                        selectedKeys={field.value ? [field.value] : []}
                        onChange={(e) => {
                          const selected = caseTypeOptions.find(
                            (item) => item.key === e.target.value,
                          );

                          if (!selected?.id) {
                            toast.error("Please select a valid case type.");
                            return;
                          }

                          field.onChange(selected.key);
                          setValue("caseTypeId", selected.id);
                        }}
                        isDisabled={
                          !selectedCourtId || caseTypeOptions.length === 0
                        }
                        isRequired
                        className="bg-white"
                      >
                        {(item: CaseTypeOption) => (
                          <SelectItem key={item.key}>{item.label}</SelectItem>
                        )}
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
                        onChange={(e) =>
                          field.onChange(
                            parseInt(e.target.value, 10) || CURRENT_YEAR,
                          )
                        }
                        className="bg-white"
                      >
                        {(y: KeyLabelOption) => (
                          <SelectItem key={y.key}>{y.label}</SelectItem>
                        )}
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
                <p className="text-xs font-bold text-emerald-950">
                  16-Digit National CNR Mode
                </p>
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
                    selectedKeys={field.value ? [field.value] : []}
                    onChange={(e) => {
                      const selected = courtOptions.find(
                        (court) => court.key === e.target.value,
                      );

                      if (!selected?.id) {
                        toast.error("Please select a valid court.");
                        return;
                      }

                      field.onChange(selected.key);

                      setValue("courtId", selected.id);
                      setValue("courtCode", selected.code);
                      setValue("benchLocation", selected.bench);

                      // Reset old case type reference when court changes.
                      setValue("caseType", "");
                      setValue("caseTypeId", "");

                      const matchingCaseType = (
                        dropdowns?.caseTypes || []
                      ).find(
                        (item: any) =>
                          item?._id &&
                          getObjectId(item.courtId) === selected.id,
                      );

                      if (matchingCaseType) {
                        setValue(
                          "caseType",
                          matchingCaseType.shortName ||
                            matchingCaseType.caseTypeName,
                        );
                        setValue("caseTypeId", String(matchingCaseType._id));
                      }
                    }}
                    isRequired
                    isLoading={loadingDropdowns}
                    isDisabled={loadingDropdowns || courtOptions.length === 0}
                  >
                    {(court: CourtOption) => (
                      <SelectItem key={court.key}>{court.label}</SelectItem>
                    )}
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
                      label="Roll No. / PNO *"
                      labelPlacement="outside"
                      placeholder="e.g. 2401892"
                      isRequired
                      isInvalid={!!errors.leadPetitionerRollNo}
                      errorMessage={errors.leadPetitionerRollNo?.message}
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
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="text-[10px] font-bold"
                >
                  {petitionersList.length} Candidates Added
                </Chip>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                <Input
                  size="sm"
                  label="Roll No."
                  placeholder="e.g. 2401892"
                  value={newPetitioner.rollNo}
                  onValueChange={(val) =>
                    setNewPetitioner({ ...newPetitioner, rollNo: val })
                  }
                  className="bg-white"
                />
                <Input
                  size="sm"
                  label="Registration No."
                  placeholder="e.g. REG-9182"
                  value={newPetitioner.registrationNo}
                  onValueChange={(val) =>
                    setNewPetitioner({ ...newPetitioner, registrationNo: val })
                  }
                  className="bg-white"
                />
                <Input
                  size="sm"
                  label="Candidate Name"
                  placeholder="Candidate Name"
                  value={newPetitioner.name}
                  onValueChange={(val) =>
                    setNewPetitioner({ ...newPetitioner, name: val })
                  }
                  className="bg-white"
                />
                <Input
                  size="sm"
                  label="Father Name"
                  placeholder="Father Name"
                  value={newPetitioner.fatherName}
                  onValueChange={(val) =>
                    setNewPetitioner({ ...newPetitioner, fatherName: val })
                  }
                  className="bg-white"
                />
                <Select
                  size="sm"
                  label="District"
                  items={districtOptions}
                  selectedKeys={[newPetitioner.district]}
                  onChange={(e) =>
                    setNewPetitioner({
                      ...newPetitioner,
                      district: e.target.value,
                    })
                  }
                  className="bg-white"
                >
                  {(dist: KeyLabelOption) => (
                    <SelectItem key={dist.key}>{dist.label}</SelectItem>
                  )}
                </Select>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] text-xs font-semibold text-white hover:bg-[#163a66]"
                  startContent={
                    <span className="material-symbols-rounded text-sm">
                      person_add
                    </span>
                  }
                  onClick={handleAddPetitioner}
                >
                  Add Petitioner to Roster
                </Button>
              </div>

              {petitionersList.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <Table
                    removeWrapper
                    aria-label="Added Petitioners Table"
                    className="min-w-full"
                  >
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
                          <TableRow
                            key={idx}
                            className="border-b border-slate-100"
                          >
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
                                <span className="material-symbols-rounded text-sm">
                                  delete
                                </span>
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
                Internal Department Routing &amp; Taxonomy (7.6 &amp; 8.1
                Masters)
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
                      {(wing: WingOption) => (
                        <SelectItem key={wing.key}>{wing.label}</SelectItem>
                      )}
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
                      {(oic: KeyLabelOption) => (
                        <SelectItem key={oic.key}>{oic.label}</SelectItem>
                      )}
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
                      {(p: KeyLabelOption) => (
                        <SelectItem key={p.key}>{p.label}</SelectItem>
                      )}
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
                      selectedKeys={field.value ? [field.value] : []}
                      onChange={(e) => {
                        const selected = categoryOptions.find(
                          (item) => item.key === e.target.value,
                        );

                        if (!selected?.id) {
                          toast.error("Please select a valid category.");
                          return;
                        }

                        field.onChange(selected.key);
                        setValue("categoryId", selected.id);

                        // Clear dependent selections before loading new options.
                        setValue("subCategory", "");
                        setValue("subCategoryId", "");
                        setValue("disputeSubject", "");
                        setValue("subjectId", "");

                        setSubCategoryOptions([]);
                        setSubjectOptions([]);

                        fetchSubCategories(selected.id);
                      }}
                      isRequired
                      isDisabled={
                        loadingDropdowns || categoryOptions.length === 0
                      }
                    >
                      {(cat: CategoryOption) => (
                        <SelectItem key={cat.key}>{cat.label}</SelectItem>
                      )}
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
                        const selected = subCategoryOptions.find(
                          (item) => item.key === e.target.value,
                        );

                        if (!selected?.id) {
                          toast.error("Please select a valid subcategory.");
                          return;
                        }

                        field.onChange(selected.key);
                        setValue("subCategoryId", selected.id);

                        // Use the actual User ObjectId from defaultOfficerId.
                        if (selected.officerId) {
                          setValue("assignedOIC", selected.officerId);
                        }

                        setValue("disputeSubject", "");
                        setValue("subjectId", "");
                        setSubjectOptions([]);

                        fetchSubjects(selected.id);
                      }}
                      isRequired
                      isDisabled={
                        !watch("categoryId") || subCategoryOptions.length === 0
                      }
                    >
                      {(item: SubCategoryOption) => (
                        <SelectItem key={item.key}>{item.label}</SelectItem>
                      )}
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
                        const selected = subjectOptions.find(
                          (item) => item.key === e.target.value,
                        );

                        if (!selected?.id) {
                          toast.error("Please select a valid subject.");
                          return;
                        }

                        field.onChange(selected.key);
                        setValue("subjectId", selected.id);
                      }}
                      isRequired
                      isDisabled={
                        !watch("subCategoryId") || subjectOptions.length === 0
                      }
                    >
                      {(item: SubjectOption) => (
                        <SelectItem key={item.key}>{item.label}</SelectItem>
                      )}
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
                  <Switch
                    size="sm"
                    isSelected={field.value}
                    onValueChange={field.onChange}
                  >
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
                  <Switch
                    size="sm"
                    isSelected={field.value}
                    onValueChange={field.onChange}
                  >
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
              <Button
                size="sm"
                radius="sm"
                variant="bordered"
                onClick={() => setActiveStep(1)}
              >
                ← Previous
              </Button>
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
                onClick={handleSubmit(onRegisterSubmit)}
              >
                {isSubmitting
                  ? "Registering Case..."
                  : "Submit & Register Case →"}
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
                Initial Document Attachment (MinIO / Cloudinary Folder
                01_Petitions)
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                Upload scanned advocate notice or petition copy. System
                generates cryptographic SHA-256 seal automatically.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:bg-slate-50/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <span className="material-symbols-rounded text-2xl">
                  cloud_upload
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-900">
                Notice / Petition PDF Attachment
              </p>
              <p className="text-[10px] text-slate-400">
                PDF documents will be automatically organized under 01_Petitions
                in 3.0 DMS
              </p>
              <Button
                size="sm"
                radius="sm"
                variant="bordered"
                className="mt-3 text-xs font-semibold"
              >
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
              <p className="font-extrabold text-slate-900">
                4-Identifier Hierarchy Verification:
              </p>
              <div className="grid grid-cols-2 gap-3 text-slate-700 sm:grid-cols-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400">
                    1. FILE DOCKET NO
                  </span>
                  <p className="font-mono font-bold text-[#0f2744]">
                    {provisionalFileNo}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400">
                    2. ADVOCATE NOTICE NO
                  </span>
                  <p className="font-mono font-bold text-amber-700">
                    {watchNoticeNumber
                      ? `${watchNoticeNumber}/${watchNoticeYear}`
                      : "--"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400">
                    3. COURT WRIT NO
                  </span>
                  <p className="font-bold text-blue-700">
                    {watchCaseNumber
                      ? `${watchCaseType} / ${watchCaseNumber} / ${watchCaseYear}`
                      : "--"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400">
                    4. CNR NUMBER
                  </span>
                  <p className="font-mono text-slate-600">
                    {watchCnrNumber || "Pending Allotment"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-4">
              <Button
                size="sm"
                radius="sm"
                variant="bordered"
                onClick={() => setActiveStep(1)}
              >
                ← Previous
              </Button>

              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                onClick={async () => {
                  const isValid = await trigger([
                    "leadPetitioner",
                    "leadPetitionerRollNo",
                    "respondentString",
                    "sectionWing",
                    "assignedOIC",
                    "assignedPairokar",
                    "category",
                    "categoryId",
                    "subCategory",
                    "subCategoryId",
                    "disputeSubject",
                    "subjectId",
                  ]);

                  if (!isValid) {
                    toast.error(
                      "Please complete all mandatory fields in Step 2.",
                    );
                    return;
                  }

                  if (
                    !watch("leadPetitioner")?.trim() ||
                    !watch("leadPetitionerRollNo")?.trim() ||
                    !watch("respondentString")?.trim() ||
                    !watch("sectionWing")?.trim() ||
                    !watch("categoryId") ||
                    !watch("subCategoryId") ||
                    !watch("subjectId") ||
                    !watch("assignedOIC") ||
                    !watch("assignedPairokar")
                  ) {
                    toast.error(
                      "Please complete all mandatory fields and valid master/staff selections.",
                    );
                    return;
                  }

                  setActiveStep(3);
                }}
              >
                Next: Document Attachment &amp; Commit →
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
