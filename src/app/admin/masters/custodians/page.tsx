
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
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
  Pagination,
  Spinner,
} from "@nextui-org/react";

import Link from "next/link";
import toast from "react-hot-toast";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "@/store";

import {
  fetchSubjectCustodians,
  createCustodian,
  updateCustodian,
  deleteCustodian,
} from "@/store/thunks/masterThunks/custodiansThunks";

import {
  fetchCategories,
  fetchSubjects,
} from "@/store/thunks/masterThunks/taxonomyThunks";

import {
  fetchDesignations,
} from "@/store/thunks/masterThunks/designationThunk";

import {
  ICategoryItem,
  ISubjectItem,
  IDesignationItem,
  ICustodianRecord,
} from "@/types/master.types";

import { StaffUserItem } from "@/types/user.types";

import {
  custodianMappingSchema,
  CustodianMappingFormValues,
} from "@/schemas/masterSchema";

interface SelectOption {
  key: string;
  label: string;
}

const ROWS_PER_PAGE = 5;

// =========================================================
// RELATION HELPERS
// =========================================================

const getRelationId = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "_id" in value) {
    const id = (value as { _id?: unknown })._id;
    return typeof id === "string" ? id : "";
  }

  return "";
};

const getRelationLabel = (
  value: unknown,
  fields: string[],
): string => {
  if (!value || typeof value !== "object") {
    return "--";
  }

  const record = value as Record<string, unknown>;

  for (const field of fields) {
    const fieldValue = record[field];

    if (
      typeof fieldValue === "string" &&
      fieldValue.trim()
    ) {
      return fieldValue;
    }
  }

  return "--";
};

// =========================================================
// COMPONENT
// =========================================================

export default function CustodianMappingPage() {
  const dispatch = useDispatch<AppDispatch>();

  // =======================================================
  // REDUX SELECTORS
  // =======================================================

  const custodiansState = useSelector(
    (state: RootState) => state.custodians,
  );

  const taxonomyState = useSelector(
    (state: RootState) => state.taxonomy,
  );

  const designationsState = useSelector(
    (state: RootState) => state.designations,
  );

  const reduxUsers = useSelector((state: RootState) => {
    return (state.users as any)?.users as StaffUserItem[] || [];
  });

  // Custodians
  const custodianList: ICustodianRecord[] =
    custodiansState.list.data || [];

  const totalCount =
    custodiansState.list.totalCount || 0;

  const loading =
    custodiansState.list.loading || false;

  // Categories
  const categories: ICategoryItem[] =
    taxonomyState.categories.options.data || [];

  const categoriesLoading =
    taxonomyState.categories.options.loading;

  // Subjects
  const subjects: ISubjectItem[] =
    taxonomyState.subjects.options.data || [];

  const subjectsLoading =
    taxonomyState.subjects.options.loading;

  // Designations
  const designations: IDesignationItem[] =
    designationsState.options.data || [];

  const designationsLoading =
    designationsState.options.loading;

  // =======================================================
  // LOCAL STATE
  // =======================================================

  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState("ALL");

  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);

  const [editingItem, setEditingItem] =
    useState<ICustodianRecord | null>(null);

  const [itemToDelete, setItemToDelete] =
    useState<ICustodianRecord | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // =======================================================
  // MODALS
  // =======================================================

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // =======================================================
  // FORM
  // =======================================================

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<CustodianMappingFormValues>({
    resolver: zodResolver(custodianMappingSchema) as any,
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      categoryId: "",
      subjectId: "",
      userId: "",
      designationId: "",
    },
  });

  const selectedCategoryId = watch("categoryId");

  const selectedDesignationId = watch("designationId");

  // =======================================================
  // FETCH CUSTODIANS
  // =======================================================

  const loadCustodians = useCallback(() => {
    dispatch(
      fetchSubjectCustodians({
        page,
        limit: ROWS_PER_PAGE,
        search: searchQuery.trim() || undefined,
        categoryId:
          selectedCategoryFilter !== "ALL"
            ? selectedCategoryFilter
            : undefined,
        view: "list",
      } as any),
    );
  }, [
    dispatch,
    page,
    searchQuery,
    selectedCategoryFilter,
  ]);

  useEffect(() => {
    loadCustodians();
  }, [loadCustodians]);

  // =======================================================
  // FETCH CATEGORY AND DESIGNATION OPTIONS
  // =======================================================

  useEffect(() => {
    dispatch(
      fetchCategories({
        limit: 100,
        view: "options",
      } as any),
    );

    dispatch(
      fetchDesignations({
        limit: 100,
        view: "options",
      } as any),
    );
  }, [dispatch]);

  // =======================================================
  // FETCH STAFF USERS
  // =======================================================

  useEffect(() => {
    // Users are read from the existing Redux users slice.
    // No direct AdminAPI call is made here.
  }, []);

  // =======================================================
  // FETCH SUBJECTS BY CATEGORY
  // =======================================================

  const loadSubjectsByCategory = useCallback(
    (categoryId: string) => {
      if (!categoryId) {
        return;
      }

      dispatch(
        fetchSubjects({
          categoryId,
          limit: 200,
          view: "options",
        } as any),
      );
    },
    [dispatch],
  );

  // =======================================================
  // STAFF USERS
  // =======================================================

  const staffUsers: StaffUserItem[] = useMemo(() => {
    if (Array.isArray(reduxUsers)) {
      return reduxUsers;
    }

    return [];
  }, [reduxUsers]);

  // =======================================================
  // DESIGNATION-WISE STAFF FILTER
  // =======================================================

  const filteredOfficers = useMemo(() => {
    if (!staffUsers.length) {
      return [];
    }

    if (!selectedDesignationId) {
      return staffUsers;
    }

    const selectedDesignation = designations.find(
      (designation) =>
        designation._id === selectedDesignationId,
    );

    const target =
      selectedDesignation?.title?.toLowerCase().trim() || "";

    if (!target) {
      return staffUsers;
    }

    const matched = staffUsers.filter((user) => {
      const userDesignation =
        user.designationAndWing?.designation
          ?.toLowerCase()
          .trim() || "";

      const userRole =
        user.assignedRole?.toLowerCase().trim() || "";

      return (
        userDesignation.includes(target) ||
        target.includes(userDesignation) ||
        userRole.includes(target)
      );
    });

    return matched.length > 0 ? matched : staffUsers;
  }, [
    staffUsers,
    selectedDesignationId,
    designations,
  ]);

  // =======================================================
  // DROPDOWN OPTIONS
  // =======================================================

  const categoryFilterItems: SelectOption[] = useMemo(
    () => [
      {
        key: "ALL",
        label: "All Master Categories",
      },
      ...categories.map((category) => ({
        key: category._id,
        label: category.categoryName,
      })),
    ],
    [categories],
  );

  const categorySelectItems: SelectOption[] = useMemo(
    () =>
      categories.map((category) => ({
        key: category._id,
        label: category.categoryName,
      })),
    [categories],
  );

  const subjectSelectItems: SelectOption[] = useMemo(
    () =>
      subjects.map((subject) => ({
        key: subject._id,
        label: subject.subjectTitle,
      })),
    [subjects],
  );

  const designationSelectItems: SelectOption[] = useMemo(
    () =>
      designations.map((designation) => ({
        key: designation._id,
        label: designation.title,
      })),
    [designations],
  );

  const officerSelectItems: SelectOption[] = useMemo(
    () =>
      filteredOfficers.map((user) => ({
        key: user._id,
        label: `${user.officerName || user.officerName} (${
          user.designationAndWing?.designation ||
          user.assignedRole ||
          "Staff"
        })`,
      })),
    [filteredOfficers],
  );

  // =======================================================
  // CATEGORY SELECTION
  // =======================================================

  const handleCategorySelection = (
    categoryId: string,
    onCategoryChange: (value: string) => void,
  ) => {
    onCategoryChange(categoryId);

    setValue("subjectId", "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (categoryId) {
      loadSubjectsByCategory(categoryId);
    }
  };

  // =======================================================
  // ADD MODAL
  // =======================================================

  const handleOpenAdd = () => {
    setEditingItem(null);

    const initialCategoryId =
      categories[0]?._id || "";

    const initialDesignationId =
      designations[0]?._id || "";

    reset({
      categoryId: initialCategoryId,
      subjectId: "",
      designationId: initialDesignationId,
      userId: "",
    });

    if (initialCategoryId) {
      loadSubjectsByCategory(initialCategoryId);
    }

    onAddOpen();
  };

  // =======================================================
  // EDIT MODAL
  // =======================================================

  const handleOpenEdit = (item: ICustodianRecord) => {
    setEditingItem(item);

    const record =
      item as unknown as Record<string, unknown>;

    const categoryId = getRelationId(record.categoryId);
    const subjectId = getRelationId(record.subjectId);
    const designationId = getRelationId(record.designationId);
    const userId = getRelationId(record.userId);

    reset({
      categoryId,
      subjectId,
      designationId,
      userId,
    });

    if (categoryId) {
      loadSubjectsByCategory(categoryId);
    }

    onAddOpen();
  };

  // =======================================================
  // CLOSE FORM
  // =======================================================

  const handleCloseForm = () => {
    if (isSubmitting) return;

    onAddClose();

    setEditingItem(null);

    reset({
      categoryId: "",
      subjectId: "",
      designationId: "",
      userId: "",
    });
  };

  // =======================================================
  // CREATE / UPDATE CUSTODIAN
  // =======================================================

  const onSaveCustodianMapping: SubmitHandler<
    CustodianMappingFormValues
  > = async (values) => {
    setIsSubmitting(true);

    try {
      const payload = {
        categoryId: values.categoryId,
        subjectId: values.subjectId,
        designationId: values.designationId,
        userId: values.userId,
      };

      if (editingItem) {
        await dispatch(
          updateCustodian({
            id: editingItem._id,
            payload,
          }),
        ).unwrap();

        toast.success(
          "Custodian mapping updated successfully!",
        );
      } else {
        await dispatch(
          createCustodian(payload),
        ).unwrap();

        toast.success(
          "Custodian mapping created successfully!",
        );
      }

      onAddClose();

      setEditingItem(null);

      loadCustodians();
    } catch (error: any) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message ||
            "Failed to save custodian mapping",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =======================================================
  // DELETE CUSTODIAN
  // =======================================================

  const handleOpenDelete = (
    item: ICustodianRecord,
  ) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsSubmitting(true);

    try {
      await dispatch(
        deleteCustodian(itemToDelete._id),
      ).unwrap();

      toast.success(
        "Custodian mapping deleted successfully!",
      );

      onDeleteClose();

      setItemToDelete(null);

      if (
        custodianList.length === 1 &&
        page > 1
      ) {
        setPage((previousPage) => previousPage - 1);
      } else {
        loadCustodians();
      }
    } catch (error: any) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message ||
            "Failed to delete custodian mapping",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =======================================================
  // PAGINATION
  // =======================================================

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / ROWS_PER_PAGE),
  );

  const showingFrom =
    totalCount === 0
      ? 0
      : (page - 1) * ROWS_PER_PAGE + 1;

  const showingTo = Math.min(
    page * ROWS_PER_PAGE,
    totalCount,
  );

  // =======================================================
  // SEARCH AND FILTER
  // =======================================================

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleCategoryFilterChange = (
    value: string,
  ) => {
    setSelectedCategoryFilter(value || "ALL");
    setPage(1);
  };

  // =======================================================
  // TABLE RELATION LABELS
  // =======================================================

  const getOfficerName = (
    item: ICustodianRecord,
  ) => {
    const record =
      item as unknown as Record<string, unknown>;

    const populatedName = getRelationLabel(
      record.userId,
      [
        "officerName",
        "fullName",
        "name",
        "username",
      ],
    );

    if (populatedName !== "--") {
      return populatedName;
    }

    const userId = getRelationId(record.userId);

    const matchedUser = staffUsers.find(
      (user) => user._id === userId,
    );

    return matchedUser?.officerName || "--";
  };

  const getDesignationName = (
    item: ICustodianRecord,
  ) => {
    const record =
      item as unknown as Record<string, unknown>;

    const populatedName = getRelationLabel(
      record.designationId,
      [
        "title",
        "designation",
        "name",
      ],
    );

    if (populatedName !== "--") {
      return populatedName;
    }

    const designationId = getRelationId(
      record.designationId,
    );

    const matchedDesignation = designations.find(
      (designation) =>
        designation._id === designationId,
    );

    return matchedDesignation?.title || "--";
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="space-y-4">

      {/* HEADER AND FILTERS */}

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
                  7.7 Subject-Wise Officer Custodian Mapping
                </h1>

                <Chip
                  size="sm"
                  className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700"
                >
                  Auto-Routing Enabled
                </Chip>

              </div>

              <p className="ml-9 text-xs text-slate-500">
                Maps incoming writ subjects directly to the active
                directory staff member and official designation
              </p>
            </div>

            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={
                <span className="material-symbols-rounded text-sm">
                  add
                </span>
              }
              onPress={handleOpenAdd}
            >
              Assign New Custodian
            </Button>

          </div>

          {/* FILTER BAR */}

          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">

            <Input
              size="sm"
              radius="sm"
              placeholder="Search subject, custodian officer or designation..."
              value={searchQuery}
              onValueChange={handleSearchChange}
              startContent={
                <span className="material-symbols-rounded text-sm text-slate-400">
                  search
                </span>
              }
              className="bg-slate-50 sm:col-span-2"
            />

            <Select
              size="sm"
              radius="sm"
              aria-label="Filter by Category"
              placeholder="Filter by Category"
              items={categoryFilterItems}
              selectedKeys={[selectedCategoryFilter]}
              onChange={(event) =>
                handleCategoryFilterChange(
                  event.target.value,
                )
              }
              className="bg-slate-50 font-semibold"
            >
              {(item: SelectOption) => (
                <SelectItem key={item.key}>
                  {item.label}
                </SelectItem>
              )}
            </Select>

          </div>
        </CardBody>
      </Card>

      {/* MAIN TABLE */}

      <Card
        shadow="none"
        className="border border-slate-200/80 bg-white"
      >

        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center">

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Subject-Officer Bindings ({totalCount} Rules)
          </h3>

          <span className="text-[11px] text-slate-400">
            Drives 4.0 Green Sheet Routing Engine
          </span>

        </div>

        <CardBody className="p-0">

          <Table
            removeWrapper
            aria-label="Custodian Mapping Table"
            className="min-w-full"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full items-center justify-between border-t border-slate-100 p-3">

                  <span className="text-xs text-slate-500">
                    Showing {showingFrom} to {showingTo} of {totalCount}
                  </span>

                  <Pagination
                    isCompact
                    showControls
                    color="primary"
                    page={page}
                    total={totalPages}
                    onChange={setPage}
                  />

                </div>
              ) : null
            }
          >

            <TableHeader>

              <TableColumn>S.NO</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>LITIGATION SUBJECT MATTER</TableColumn>
              <TableColumn>CUSTODIAN OFFICER (STAFF)</TableColumn>
              <TableColumn>OFFICIAL DESIGNATION</TableColumn>
              <TableColumn className="text-center">ACTION</TableColumn>

            </TableHeader>

            <TableBody
              items={custodianList}
              isLoading={loading}
              loadingContent={
                <div className="flex items-center justify-center gap-2 py-6 text-slate-500">
                  <Spinner size="sm" />
                  Loading custodian rules...
                </div>
              }
              emptyContent={
                loading
                  ? " "
                  : "No custodian rules match the selected filter."
              }
            >

              {(item) => {
                const record =
                  item as unknown as Record<string, unknown>;

                const categoryName = getRelationLabel(
                  record.categoryId,
                  ["categoryName"],
                );

                const subjectTitle = getRelationLabel(
                  record.subjectId,
                  ["subjectTitle"],
                );

                const rowIndex =
                  (page - 1) * ROWS_PER_PAGE +
                  custodianList.indexOf(item) +
                  1;

                return (
                  <TableRow
                    key={item._id}
                    className="border-b border-slate-100 hover:bg-slate-50/70"
                  >

                    <TableCell className="text-xs font-bold text-slate-400">
                      {rowIndex}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          categoryName === "Direct Recruitment"
                            ? "primary"
                            : categoryName === "Departmental Promotion"
                              ? "secondary"
                              : "default"
                        }
                        className="text-[10px] font-bold"
                      >
                        {categoryName}
                      </Chip>
                    </TableCell>

                    <TableCell className="max-w-[280px] text-xs font-bold text-slate-900">
                      {subjectTitle}
                    </TableCell>

                    <TableCell className="text-xs font-semibold text-blue-900">
                      {getOfficerName(item)}
                    </TableCell>

                    <TableCell className="text-xs font-medium text-slate-600">
                      {getDesignationName(item)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-1">

                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-slate-400 hover:text-blue-700"
                          aria-label="Edit custodian mapping"
                          onPress={() => handleOpenEdit(item)}
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
                          aria-label="Delete custodian mapping"
                          onPress={() => handleOpenDelete(item)}
                        >
                          <span className="material-symbols-rounded text-sm">
                            delete
                          </span>
                        </Button>

                      </div>
                    </TableCell>

                  </TableRow>
                );
              }}

            </TableBody>
          </Table>

        </CardBody>
      </Card>

      {/* ADD / EDIT MODAL */}

      <Modal
        isOpen={isAddOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseForm();
          }
        }}
        placement="center"
        size="3xl"
        isDismissable={!isSubmitting}
      >

        <ModalContent>

          <form onSubmit={handleSubmit(onSaveCustodianMapping)}>

            <ModalHeader className="flex items-center gap-2 border-b border-slate-100 text-sm font-bold text-slate-900">

              <span className="material-symbols-rounded text-blue-700">
                {editingItem ? "edit" : "person_add"}
              </span>

              {editingItem
                ? "Update Subject Custodian Mapping"
                : "Map Subject to Legal Custodian"}

            </ModalHeader>

            <ModalBody className="space-y-4 py-4">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* CATEGORY */}

                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <div>

                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Select Case Category *
                      </label>

                      <Select
                        size="sm"
                        placeholder="Choose Parent Category"
                        items={categorySelectItems}
                        isLoading={categoriesLoading}
                        selectedKeys={
                          field.value ? [field.value] : []
                        }
                        onChange={(event) =>
                          handleCategorySelection(
                            event.target.value,
                            field.onChange,
                          )
                        }
                        onBlur={field.onBlur}
                        isInvalid={!!errors.categoryId}
                        errorMessage={errors.categoryId?.message}
                      >
                        {(category: SelectOption) => (
                          <SelectItem key={category.key}>
                            {category.label}
                          </SelectItem>
                        )}
                      </Select>

                    </div>
                  )}
                />

                {/* SUBJECT */}

                <Controller
                  name="subjectId"
                  control={control}
                  render={({ field }) => (
                    <div>

                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Select Litigation Subject Matter *
                      </label>

                      <Select
                        size="sm"
                        placeholder={
                          !selectedCategoryId
                            ? "Select category first"
                            : "Choose Granular Subject Issue"
                        }
                        items={subjectSelectItems}
                        isLoading={subjectsLoading}
                        selectedKeys={
                          field.value ? [field.value] : []
                        }
                        onSelectionChange={(keys) => {
                          const selectedValue =
                            keys === "all"
                              ? ""
                              : Array.from(keys)[0]?.toString() || "";

                          field.onChange(selectedValue);
                          trigger("subjectId");
                        }}
                        onBlur={field.onBlur}
                        isInvalid={!!errors.subjectId}
                        errorMessage={errors.subjectId?.message}
                        isDisabled={
                          !selectedCategoryId ||
                          subjectsLoading ||
                          subjects.length === 0
                        }
                      >
                        {(subject: SelectOption) => (
                          <SelectItem key={subject.key}>
                            {subject.label}
                          </SelectItem>
                        )}
                      </Select>

                    </div>
                  )}
                />

              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* DESIGNATION */}

                <Controller
                  name="designationId"
                  control={control}
                  render={({ field }) => (
                    <div>

                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Authority Designation / Role *
                      </label>

                      <Select
                        size="sm"
                        placeholder="Select Designation"
                        items={designationSelectItems}
                        isLoading={designationsLoading}
                        selectedKeys={
                          field.value ? [field.value] : []
                        }
                        onChange={(event) => {
                          field.onChange(event.target.value);

                          setValue("userId", "", {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        onBlur={field.onBlur}
                        isInvalid={!!errors.designationId}
                        errorMessage={errors.designationId?.message}
                      >
                        {(designation: SelectOption) => (
                          <SelectItem key={designation.key}>
                            {designation.label}
                          </SelectItem>
                        )}
                      </Select>

                    </div>
                  )}
                />

                {/* OFFICER */}

                <Controller
                  name="userId"
                  control={control}
                  render={({ field }) => (
                    <div>

                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Custodian Officer (Filtered Staff) *
                      </label>

                      <Select
                        size="sm"
                        placeholder="Select Active Staff User"
                        items={officerSelectItems}
                        selectedKeys={
                          field.value ? [field.value] : []
                        }
                        onChange={(event) => {
                          field.onChange(event.target.value);
                        }}
                        onBlur={field.onBlur}
                        isInvalid={!!errors.userId}
                        errorMessage={errors.userId?.message}
                        isDisabled={!staffUsers.length}
                      >
                        {(officer: SelectOption) => (
                          <SelectItem key={officer.key}>
                            {officer.label}
                          </SelectItem>
                        )}
                      </Select>

                    </div>
                  )}
                />

              </div>

            </ModalBody>

            <ModalFooter className="border-t border-slate-100">

              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                onPress={handleCloseForm}
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
                {editingItem
                  ? "Update Mapping"
                  : "Save Mapping"}
              </Button>

            </ModalFooter>

          </form>

        </ModalContent>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}

      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            onDeleteClose();
            setItemToDelete(null);
          }
        }}
        placement="center"
        size="sm"
        isDismissable={!isSubmitting}
      >

        <ModalContent>

          {(onClose) => (
            <>

              <ModalHeader className="flex items-center gap-2 text-sm font-bold text-slate-900">

                <span className="material-symbols-rounded text-rose-600">
                  warning
                </span>

                Confirm Deletion

              </ModalHeader>

              <ModalBody className="text-xs text-slate-600">

                Are you sure you want to remove the custodian rule for{" "}

                <b>
                  {itemToDelete
                    ? getRelationLabel(
                        (
                          itemToDelete as unknown as Record<
                            string,
                            unknown
                          >
                        ).subjectId,
                        ["subjectTitle"],
                      )
                    : "this subject"}
                </b>

                ? Newly registered petitions on this issue will not be
                auto-routed.

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
                  onPress={handleConfirmDelete}
                  isLoading={isSubmitting}
                >
                  Delete Rule
                </Button>

              </ModalFooter>

            </>
          )}

        </ModalContent>
      </Modal>

    </div>
  );
}
