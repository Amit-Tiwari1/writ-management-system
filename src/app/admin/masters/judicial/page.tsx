"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";

import Link from "next/link";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";

import {
  courtSchema,
  caseTypeSchema,
} from "@/schemas/masterSchema";

import {
  ICourtItem,
  ICaseTypeItem,
} from "@/types/master.types";

import {
  fetchCourts,
  createCourt,
  updateCourt,
  deleteCourt,
  fetchCaseTypes,
  createCaseType,
  updateCaseType,
  deleteCaseType,
} from "@/store/thunks/masterThunks/judicialThunk";

import {
  caseTypeColumns,
  courtColumns,
} from "@/app/admin/components/columns/JudicialColumns";

import JudicialTable from "@/app/admin/components/tables/JudicialTable";

type CourtFormValues = z.infer<typeof courtSchema>;
type CaseTypeFormValues = z.infer<typeof caseTypeSchema>;

type DeleteItem = {
  id: string;
  name: string;
  kind: "COURT" | "CASE_TYPE";
};

const FORUM_TYPES = [
  {
    key: "HIGH_COURT",
    label: "High Court (Principal / Benches)",
  },
  {
    key: "APEX_COURT",
    label: "Supreme Court of India",
  },
  {
    key: "TRIBUNAL",
    label: "State Public Services Tribunal (SPST)",
  },
  {
    key: "SUBORDINATE_COURT",
    label: "District / Sessions Court",
  },
];

const ROWS_PER_PAGE = 5;

const getCourtId = (courtId: unknown): string => {
  if (typeof courtId === "string") {
    return courtId;
  }

  if (
    courtId &&
    typeof courtId === "object" &&
    "_id" in courtId
  ) {
    return String((courtId as { _id: string })._id);
  }

  return "";
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: string }).message || fallback);
  }

  return fallback;
};

export default function JudicialMasterPage() {
  const dispatch = useDispatch<any>();

 
const courtsState = useSelector(
  (state: any) => state.judicial.courts,
);

const caseTypesState = useSelector(
  (state: any) => state.judicial.caseTypes,
);

  const courts: ICourtItem[] = courtsState.list.data || [];
  const courtOptions: ICourtItem[] = courtsState.options.data || [];

  const caseTypes: ICaseTypeItem[] = caseTypesState.list.data || [];

  // =====================================================
  // LOCAL STATE
  // =====================================================

  const [activeTab, setActiveTab] = useState<string>("case_types");

  const [selectedCourtId, setSelectedCourtId] =
    useState<string>("ALL");

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [page, setPage] = useState<number>(1);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [editingCourt, setEditingCourt] =
    useState<ICourtItem | null>(null);

  const [editingCaseType, setEditingCaseType] =
    useState<ICaseTypeItem | null>(null);

  const [itemToDelete, setItemToDelete] =
    useState<DeleteItem | null>(null);

  // =====================================================
  // MODALS
  // =====================================================

  const {
    isOpen: isAddCourtOpen,
    onOpen: onAddCourtOpen,
    onOpenChange: onAddCourtOpenChange,
    onClose: onAddCourtClose,
  } = useDisclosure();

  const {
    isOpen: isAddTypeOpen,
    onOpen: onAddTypeOpen,
    onOpenChange: onAddTypeOpenChange,
    onClose: onAddTypeClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
    onClose: onDeleteClose,
  } = useDisclosure();

  // =====================================================
  // CASE TYPE FORM
  // =====================================================

  const {
    control: caseTypeControl,
    handleSubmit: handleCaseTypeSubmit,
    reset: resetCaseTypeForm,
    formState: { errors: caseTypeErrors },
  } = useForm<CaseTypeFormValues>({
    resolver: zodResolver(caseTypeSchema) as any,
    defaultValues: {
      courtId: "",
      caseTypeName: "",
      shortName: "",
    },
  });

  // =====================================================
  // COURT FORM
  // =====================================================

  const {
    control: courtControl,
    handleSubmit: handleCourtSubmit,
    reset: resetCourtForm,
    formState: { errors: courtErrors },
  } = useForm<CourtFormValues>({
    resolver: zodResolver(courtSchema) as any,
    defaultValues: {
      courtName: "",
      shortCode: "",
      courtType: "HIGH_COURT",
      location: "",
    },
  });

  // =====================================================
  // DROPDOWN OPTIONS
  // =====================================================

  const courtFilterItems = useMemo(() => {
    return [
      {
        key: "ALL",
        label: "All Judicial Establishments",
      },
      ...courtOptions.map((court) => ({
        key: court._id,
        label: `${court.courtName} (${court.shortCode})`,
      })),
    ];
  }, [courtOptions]);

  const courtSelectItems = useMemo(() => {
    return courtOptions.map((court) => ({
      key: court._id,
      label: `${court.courtName} (${court.shortCode})`,
    }));
  }, [courtOptions]);

  // =====================================================
  // FETCH COURT OPTIONS
  // =====================================================

  useEffect(() => {
    dispatch(
      fetchCourts({
        view: "options",
        limit: 100,
      }),
    );
  }, [dispatch]);

  // =====================================================
  // FETCH ACTIVE TAB DATA
  // =====================================================

  useEffect(() => {
    if (activeTab === "case_types") {
      dispatch(
        fetchCaseTypes({
          view: "list",
          page,
          limit: ROWS_PER_PAGE,
          search: searchQuery.trim() || undefined,
          courtId:
            selectedCourtId !== "ALL"
              ? selectedCourtId
              : undefined,
        }),
      );
    } else {
      dispatch(
        fetchCourts({
          view: "list",
          page,
          limit: ROWS_PER_PAGE,
          search: searchQuery.trim() || undefined,
        }),
      );
    }
  }, [
    dispatch,
    activeTab,
    page,
    searchQuery,
    selectedCourtId,
  ]);

  // =====================================================
  // TABLE DATA
  // =====================================================

  const activeLoading =
    activeTab === "case_types"
      ? caseTypesState.list.loading
      : courtsState.list.loading;

  const activeTotalCount =
    activeTab === "case_types"
      ? caseTypesState.list.totalCount
      : courtsState.list.totalCount;

  const activePagination =
    activeTab === "case_types"
      ? caseTypesState.list.pagination
      : courtsState.list.pagination;

  const totalPages =
    activePagination?.pages ||
    Math.max(1, Math.ceil(activeTotalCount / ROWS_PER_PAGE));

  // =====================================================
  // REFRESH HELPERS
  // =====================================================

  const refreshCourtOptions = () => {
    dispatch(
      fetchCourts({
        view: "options",
        limit: 100,
      }),
    );
  };

  const refreshActiveList = () => {
    if (activeTab === "case_types") {
      dispatch(
        fetchCaseTypes({
          view: "list",
          page,
          limit: ROWS_PER_PAGE,
          search: searchQuery.trim() || undefined,
          courtId:
            selectedCourtId !== "ALL"
              ? selectedCourtId
              : undefined,
        }),
      );
    } else {
      dispatch(
        fetchCourts({
          view: "list",
          page,
          limit: ROWS_PER_PAGE,
          search: searchQuery.trim() || undefined,
        }),
      );
    }
  };

  // =====================================================
  // OPEN ADD / EDIT CASE TYPE
  // =====================================================

  const handleOpenAddType = () => {
    setEditingCaseType(null);

    resetCaseTypeForm({
      courtId: courtOptions[0]?._id || "",
      caseTypeName: "",
      shortName: "",
    });

    onAddTypeOpen();
  };

  const handleOpenEditType = (item: ICaseTypeItem) => {
    setEditingCaseType(item);

    resetCaseTypeForm({
      courtId: getCourtId(item.courtId),
      caseTypeName: item.caseTypeName || "",
      shortName: item.shortName || "",
    });

    onAddTypeOpen();
  };

  // =====================================================
  // OPEN ADD / EDIT COURT
  // =====================================================

  const handleOpenAddCourt = () => {
    setEditingCourt(null);

    resetCourtForm({
      courtName: "",
      shortCode: "",
      courtType: "HIGH_COURT",
      location: "",
    });

    onAddCourtOpen();
  };

  const handleOpenEditCourt = (item: ICourtItem) => {
    setEditingCourt(item);

    resetCourtForm({
      courtName: item.courtName || "",
      shortCode: item.shortCode || "",
      courtType: item.courtType || "HIGH_COURT",
      location: item.location || "",
    });

    onAddCourtOpen();
  };

  // =====================================================
  // SAVE CASE TYPE
  // =====================================================

  const onSaveCaseType = async (values: CaseTypeFormValues) => {
    setIsSubmitting(true);

    try {
      const payload = {
        courtId: values.courtId,
        caseTypeName: values.caseTypeName.trim(),
        shortName: values.shortName.trim().toUpperCase(),
      };

      if (editingCaseType) {
        await dispatch(
          updateCaseType({
            id: editingCaseType._id,
            payload,
          }),
        ).unwrap();

        toast.success("Case Type updated successfully!");
      } else {
        await dispatch(createCaseType(payload)).unwrap();

        toast.success(
          `Case Type ${payload.shortName} registered successfully!`,
        );
      }

      onAddTypeClose();
      setEditingCaseType(null);

      refreshActiveList();
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to save case type"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // SAVE COURT
  // =====================================================

  const onSaveCourt = async (values: CourtFormValues) => {
    setIsSubmitting(true);

    try {
      const payload = {
        courtName: values.courtName.trim(),
        shortCode: values.shortCode.trim().toUpperCase(),
        courtType: values.courtType,
        location: values.location.trim(),
      };

      if (editingCourt) {
        await dispatch(
          updateCourt({
            id: editingCourt._id,
            payload,
          }),
        ).unwrap();

        toast.success("Court updated successfully!");
      } else {
        await dispatch(createCourt(payload)).unwrap();

        toast.success(
          `Court ${payload.shortCode} registered successfully!`,
        );
      }

      onAddCourtClose();
      setEditingCourt(null);

      refreshCourtOptions();
      refreshActiveList();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Failed to register court establishment",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // OPEN DELETE CONFIRMATION
  // =====================================================

  const handleOpenDelete = (item: DeleteItem) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsSubmitting(true);

    try {
      if (itemToDelete.kind === "CASE_TYPE") {
        await dispatch(
          deleteCaseType(itemToDelete.id),
        ).unwrap();

        toast.success("Case Type removed.");
      } else {
        await dispatch(
          deleteCourt(itemToDelete.id),
        ).unwrap();

        toast.success("Court establishment removed.");

        refreshCourtOptions();
      }

      onDeleteClose();
      setItemToDelete(null);

      // If the last record on this page was deleted,
      // move to the previous page.
      if (
        activeTotalCount > 0 &&
        (page - 1) * ROWS_PER_PAGE >= activeTotalCount - 1 &&
        page > 1
      ) {
        setPage((current) => current - 1);
      } else {
        refreshActiveList();
      }
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Cannot delete: Record in active use",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // TABLE CELL RENDERING
  // =====================================================

  const renderCaseTypeCell = (
    item: ICaseTypeItem,
    columnKey: string,
    index: number,
  ) => {
    switch (columnKey) {
      case "serial":
        return (
          <span className="text-xs font-bold text-slate-400">
            {(page - 1) * ROWS_PER_PAGE + index + 1}
          </span>
        );

      case "court":
        return (
          <span className="text-xs font-semibold text-slate-800">
            {typeof item.courtId === "object"
              ? (item.courtId as any)?.courtName || "--"
              : courtOptions.find(
                  (court) => court._id === item.courtId,
                )?.courtName || "--"}
          </span>
        );

      case "caseTypeName":
        return (
          <span className="text-xs font-bold text-slate-900">
            {item.caseTypeName}
          </span>
        );

      case "shortName":
        return (
          <span className="font-mono text-xs font-bold text-blue-700">
            {item.shortName}
          </span>
        );

      case "actions":
        return (
          <div className="flex justify-center items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-400 hover:text-blue-700"
              onPress={() => handleOpenEditType(item)}
              aria-label="Edit case type"
            >
              <span className="material-symbols-rounded text-sm">
                edit
              </span>
            </Button>

            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-400 hover:text-rose-600"
              onPress={() =>
                handleOpenDelete({
                  id: item._id,
                  name: item.shortName,
                  kind: "CASE_TYPE",
                })
              }
              aria-label="Delete case type"
            >
              <span className="material-symbols-rounded text-sm">
                delete
              </span>
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderCourtCell = (
    item: ICourtItem,
    columnKey: string,
    index: number,
  ) => {
    switch (columnKey) {
      case "serial":
        return (
          <span className="text-xs font-bold text-slate-400">
            {(page - 1) * ROWS_PER_PAGE + index + 1}
          </span>
        );

      case "courtName":
        return (
          <span className="text-xs font-bold text-slate-900">
            {item.courtName}
          </span>
        );

      case "shortCode":
        return (
          <span className="font-mono text-xs font-bold text-blue-700">
            {item.shortCode}
          </span>
        );

      case "courtType":
        return (
          <span className="text-xs text-slate-600">
            {item.courtType}
          </span>
        );

      case "location":
        return (
          <span className="text-xs text-slate-700 font-medium">
            {item.location}
          </span>
        );

      case "actions":
        return (
          <div className="flex justify-center items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-400 hover:text-blue-700"
              onPress={() => handleOpenEditCourt(item)}
              aria-label="Edit court"
            >
              <span className="material-symbols-rounded text-sm">
                edit
              </span>
            </Button>

            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-400 hover:text-rose-600"
              onPress={() =>
                handleOpenDelete({
                  id: item._id,
                  name: item.courtName,
                  kind: "COURT",
                })
              }
              aria-label="Delete court"
            >
              <span className="material-symbols-rounded text-sm">
                delete
              </span>
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-4">
      {/* =================================================
          1. HEADER INFORMATION BAR
      ================================================= */}

      <Card
        shadow="none"
        className="border border-slate-200/80 bg-white"
      >
        <CardBody className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/admin/masters">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="text-slate-500"
                  >
                    <span className="material-symbols-rounded">
                      arrow_back
                    </span>
                  </Button>
                </Link>

                <h1 className="text-base font-bold text-slate-900">
                  7.5 Judicial Courts & Case Types Master
                </h1>

                <Chip
                  size="sm"
                  className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700"
                >
                  eCourts CIS Mapped
                </Chip>
              </div>

              <p className="text-xs text-slate-500 ml-9">
                Configure judicial forums, benches, jurisdiction,
                and official eCourts/CIS case classification codes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                startContent={
                  <span className="material-symbols-rounded text-sm">
                    add
                  </span>
                }
                onPress={handleOpenAddCourt}
              >
                Add Court
              </Button>

              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
                startContent={
                  <span className="material-symbols-rounded text-sm">
                    add
                  </span>
                }
                onPress={handleOpenAddType}
              >
                Add Case Type
              </Button>
            </div>
          </div>

          {/* =================================================
              TABS + FILTERS
          ================================================= */}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <Tabs
              aria-label="Judicial Master Tabs"
              selectedKey={activeTab}
              onSelectionChange={(key) => {
                setActiveTab(key as string);
                setSearchQuery("");
                setPage(1);
              }}
              color="primary"
              variant="underlined"
              classNames={{
                tabList: "gap-6 p-0 border-b-0",
                cursor: "w-full bg-[#0f2744]",
                tab: "max-w-fit px-0 h-8 text-xs font-semibold",
                tabContent:
                  "group-data-[selected=true]:text-[#0f2744] text-slate-500",
              }}
            >
              <Tab
                key="case_types"
                title={`Case Types (${caseTypesState.list.totalCount})`}
              />

              <Tab
                key="courts"
                title={`Court Establishments (${courtsState.list.totalCount})`}
              />
            </Tabs>

            <div className="flex items-center gap-3">
              {activeTab === "case_types" && (
                <div className="w-64">
                  <Select
                    size="sm"
                    radius="sm"
                    aria-label="Filter by Court Establishment"
                    placeholder="Filter by Court"
                    items={courtFilterItems}
                    selectedKeys={[selectedCourtId]}
                    onChange={(e) => {
                      setSelectedCourtId(e.target.value || "ALL");
                      setPage(1);
                    }}
                    className="bg-slate-50 font-semibold"
                  >
                    {(item) => (
                      <SelectItem key={item.key}>
                        {item.label}
                      </SelectItem>
                    )}
                  </Select>
                </div>
              )}

              <div className="w-64">
                <Input
                  size="sm"
                  radius="sm"
                  placeholder="Search active view..."
                  value={searchQuery}
                  onValueChange={(value) => {
                    setSearchQuery(value);
                    setPage(1);
                  }}
                  startContent={
                    <span className="material-symbols-rounded text-sm text-slate-400">
                      search
                    </span>
                  }
                  className="bg-slate-50"
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* =================================================
          2. MAIN TABLES VIEW
      ================================================= */}

      <Card
        shadow="none"
        className="border border-slate-200/80 bg-white"
      >
        <CardBody className="p-0">
          {activeTab === "case_types" && (
            <JudicialTable<ICaseTypeItem>
              ariaLabel="Case Types Table"
              columns={caseTypeColumns}
              items={caseTypes}
              loading={caseTypesState.list.loading}
              loadingText="Loading case types..."
              emptyText="No case types match the selected criteria."
              page={page}
              totalPages={totalPages}
              totalCount={caseTypesState.list.totalCount}
              rowsPerPage={ROWS_PER_PAGE}
              onPageChange={setPage}
              renderCell={renderCaseTypeCell}
            />
          )}

          {activeTab === "courts" && (
            <JudicialTable<ICourtItem>
              ariaLabel="Courts Table"
              columns={courtColumns}
              items={courts}
              loading={courtsState.list.loading}
              loadingText="Loading court establishments..."
              emptyText="No court establishments configured."
              page={page}
              totalPages={totalPages}
              totalCount={courtsState.list.totalCount}
              rowsPerPage={ROWS_PER_PAGE}
              onPageChange={setPage}
              renderCell={renderCourtCell}
            />
          )}
        </CardBody>
      </Card>

      {/* =================================================
          3. ADD / EDIT CASE TYPE MODAL
      ================================================= */}

      <Modal
        isOpen={isAddTypeOpen}
        onOpenChange={onAddTypeOpenChange}
        placement="top"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleCaseTypeSubmit(onSaveCaseType)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">
                  gavel
                </span>

                {editingCaseType
                  ? "Edit Case Type Master"
                  : "Add Case Type Master"}
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Controller
                  name="courtId"
                  control={caseTypeControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Court Establishment{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        placeholder="Select Court Establishment"
                        items={courtSelectItems}
                        selectedKeys={
                          field.value ? [field.value] : []
                        }
                        onChange={(e) =>
                          field.onChange(e.target.value)
                        }
                        isInvalid={!!caseTypeErrors.courtId}
                        errorMessage={caseTypeErrors.courtId?.message}
                      >
                        {(court) => (
                          <SelectItem key={court.key}>
                            {court.label}
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="caseTypeName"
                  control={caseTypeControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Case Type Full Name{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. WRIT - A (Civil Services)"
                        isInvalid={!!caseTypeErrors.caseTypeName}
                        errorMessage={
                          caseTypeErrors.caseTypeName?.message
                        }
                      />
                    </div>
                  )}
                />

                <Controller
                  name="shortName"
                  control={caseTypeControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Short Acronym / Code{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. WRIT-A"
                        isInvalid={!!caseTypeErrors.shortName}
                        errorMessage={
                          caseTypeErrors.shortName?.message
                        }
                      />
                    </div>
                  )}
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={onClose}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                >
                  {editingCaseType
                    ? "Update Case Type"
                    : "Save Case Type"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* =================================================
          4. ADD / EDIT COURT MODAL
      ================================================= */}

      <Modal
        isOpen={isAddCourtOpen}
        onOpenChange={onAddCourtOpenChange}
        placement="top"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleCourtSubmit(onSaveCourt)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">
                  account_balance
                </span>

                {editingCourt
                  ? "Edit Court Establishment"
                  : "Add Court Establishment"}
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Controller
                  name="courtName"
                  control={courtControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Court Establishment Name{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. High Court Allahabad"
                        isInvalid={!!courtErrors.courtName}
                        errorMessage={courtErrors.courtName?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="shortCode"
                  control={courtControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Short Acronym Code{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. HC-ALD"
                        isInvalid={!!courtErrors.shortCode}
                        errorMessage={courtErrors.shortCode?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="courtType"
                  control={courtControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Forum Classification{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={FORUM_TYPES}
                        selectedKeys={[
                          field.value || "HIGH_COURT",
                        ]}
                        onChange={(e) =>
                          field.onChange(e.target.value)
                        }
                        isInvalid={!!courtErrors.courtType}
                        errorMessage={courtErrors.courtType?.message}
                      >
                        {(item) => (
                          <SelectItem key={item.key}>
                            {item.label}
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="location"
                  control={courtControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Bench / Seat Location{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Principal Bench (Prayagraj)"
                        isInvalid={!!courtErrors.location}
                        errorMessage={courtErrors.location?.message}
                      />
                    </div>
                  )}
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={onClose}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                >
                  {editingCourt ? "Update Court" : "Save Court"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* =================================================
          5. DELETE CONFIRMATION MODAL
      ================================================= */}

      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        placement="center"
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">
                  warning
                </span>

                Confirm Deletion
              </ModalHeader>

              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove{" "}
                <b>{itemToDelete?.name}</b>? Linked dockets or case
                types in active litigation might be affected.
              </ModalBody>

              <ModalFooter>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={onClose}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  radius="sm"
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  isLoading={isSubmitting}
                  onPress={handleConfirmDelete}
                >
                  Delete Record
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}