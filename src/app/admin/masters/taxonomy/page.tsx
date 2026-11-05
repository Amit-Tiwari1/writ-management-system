"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
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
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

import { AdminAPI } from "@/api/userApi";
import { fetchStaffUsers } from "@/store/slices/usersSlice";
import { RootState, AppDispatch } from "@/store";

import {
  categorySchema,
  subCategorySchema,
  subjectSchema,
} from "@/schemas/masterSchema";

import {
  ICategoryItem,
  ISubCategoryItem,
  ISubjectItem,
} from "@/types/master.types";

import { StaffUserItem } from "@/types/user.types";

import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/store/thunks/masterThunks/taxonomyThunks";

import {
  subCategoryColumns,
  subjectColumns,
  categoryColumns,
} from "@/app/admin/components/columns/TaxonomyColumns";

import TaxonomyTable from "@/app/admin/components/tables/TaxonomyTable";

type CategoryFormInput = z.input<typeof categorySchema>;
type CategoryFormValues = z.output<typeof categorySchema>;
type SubCategoryFormInput = z.input<typeof subCategorySchema>;
type SubCategoryFormValues = z.output<typeof subCategorySchema>;

type SubjectFormInput = z.input<typeof subjectSchema>;
type SubjectFormValues = z.output<typeof subjectSchema>;

type ActiveTab = "categories" | "sub_categories" | "subjects";

type DeleteType = "CAT" | "SUBCAT" | "SUB";

interface SelectOption {
  key: string;
  label: string;
}

interface DeleteItem {
  id: string;
  name: string;
  type: DeleteType;
}

const ROWS_PER_PAGE = 5;
const getReferenceId = (
  reference: string | { _id?: string } | null | undefined,
): string => {
  if (!reference) return "";

  return typeof reference === "object" ? reference._id || "" : reference;
};

const getCategoryName = (
  reference: string | { categoryName?: string } | null | undefined,
): string => {
  if (!reference || typeof reference !== "object") {
    return "--";
  }

  return reference.categoryName || "--";
};

const getSubCategoryName = (
  reference: string | { subCategoryName?: string } | null | undefined,
): string => {
  if (!reference || typeof reference !== "object") {
    return "--";
  }

  return reference.subCategoryName || "--";
};

const getOfficerName = (
  reference: ISubCategoryItem["defaultOfficerId"],
): string => {
  if (!reference || typeof reference !== "object") {
    return "--";
  }

  return reference.name || reference.username || "--";
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default function TaxonomyMasterPage() {
  const dispatch = useDispatch<AppDispatch>();

  const taxonomy = useSelector((state: RootState) => state.taxonomy);
  const reduxUsers = useSelector((state: RootState) => {
    const userSlice = (state as any).users;

    return (userSlice?.users as StaffUserItem[]) || [];
  });

  const categoryList = taxonomy.categories.list;
  const categoryOptions = taxonomy.categories.options;
  const subCategoryList = taxonomy.subCategories.list;
  const subCategoryOptions = taxonomy.subCategories.options;
  const subjectList = taxonomy.subjects.list;

  const [activeTab, setActiveTab] = useState<ActiveTab>("categories");

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");

  const [page, setPage] = useState(1);

  const [refreshKey, setRefreshKey] = useState(0);

  const [directUsers, setDirectUsers] = useState<StaffUserItem[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [itemToDelete, setItemToDelete] = useState<DeleteItem | null>(null);

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

  const {
    control: catControl,
    handleSubmit: handleCatSubmit,
    reset: resetCatForm,
    formState: { errors: catErrors },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categorySchema),

    defaultValues: {
      categoryName: "",
      description: "",
      order: 1,
    },
  });

  const {
    control: subCatControl,
    handleSubmit: handleSubCatSubmit,
    reset: resetSubCatForm,
    formState: { errors: subCatErrors },
  } = useForm<SubCategoryFormInput, unknown, SubCategoryFormValues>({
    resolver: zodResolver(subCategorySchema),

    defaultValues: {
      categoryId: "",
      subCategoryName: "",
      defaultOfficerId: "",
    },
  });

  const {
    control: subjectControl,
    handleSubmit: handleSubjectSubmit,
    watch: watchSubjectForm,
    setValue: setSubjectValue,
    reset: resetSubjectForm,
    formState: { errors: subjectErrors },
  } = useForm<SubjectFormInput, unknown, SubjectFormValues>({
    resolver: zodResolver(subjectSchema),

    mode: "onChange",
    reValidateMode: "onChange",

    defaultValues: {
      categoryId: "",
      subCategoryId: "",
      subjectTitle: "",
    },
  });

  const selectedSubjectCatId = watchSubjectForm("categoryId");
  const fetchTaxonomyLists = useCallback(() => {
    const commonParams = {
      page,
      limit: ROWS_PER_PAGE,
      search: searchQuery.trim() || undefined,
      view: "list" as const,
    };
    dispatch(fetchCategories(commonParams));
    dispatch(
      fetchSubCategories({
        ...commonParams,

        categoryId:
          selectedCategoryFilter !== "ALL" ? selectedCategoryFilter : undefined,
      }),
    );

    // Subjects

    dispatch(
      fetchSubjects({
        ...commonParams,

        categoryId:
          selectedCategoryFilter !== "ALL" ? selectedCategoryFilter : undefined,
      }),
    );
  }, [dispatch, page, searchQuery, selectedCategoryFilter]);

  // =====================================================
  // FETCH DROPDOWN OPTIONS
  // =====================================================

  const fetchTaxonomyOptions = useCallback(() => {
    // Category options

    dispatch(
      fetchCategories({
        page: 1,
        limit: 100,
        view: "options",
      }),
    );

    // Sub-category options for selected subject category

    dispatch(
      fetchSubCategories({
        page: 1,
        limit: 100,
        view: "options",
        categoryId: selectedSubjectCatId || undefined,
      }),
    );
  }, [dispatch, selectedSubjectCatId]);

  useEffect(() => {
    fetchTaxonomyLists();
  }, [fetchTaxonomyLists, refreshKey]);

  useEffect(() => {
    fetchTaxonomyOptions();
  }, [fetchTaxonomyOptions, refreshKey]);

  // =====================================================
  // STAFF DIRECTORY
  // =====================================================

  const loadUsersDirectory = useCallback(async () => {
    setLoadingUsers(true);

    try {
      dispatch(fetchStaffUsers());

      const response = await AdminAPI.getUsersList({
        limit: 100,
        status: "ACTIVE",
      });

      if (response?.success && Array.isArray(response.data)) {
        setDirectUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to load staff users directory:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadUsersDirectory();
  }, [loadUsersDirectory]);

  const staffUsers: StaffUserItem[] = useMemo(() => {
    if (directUsers.length > 0) {
      return directUsers;
    }

    if (Array.isArray(reduxUsers) && reduxUsers.length > 0) {
      return reduxUsers;
    }

    return [];
  }, [directUsers, reduxUsers]);

  // =====================================================
  // DROPDOWN OPTIONS
  // =====================================================

  const categories = categoryOptions.data;

  const subCategories = subCategoryOptions.data;

  // Category filter options

  const categoryFilterItems: SelectOption[] = useMemo(
    () => [
      {
        key: "ALL",
        label: "All Categories",
      },

      ...categories.map((category) => ({
        key: category._id,
        label: category.categoryName,
      })),
    ],
    [categories],
  );

  // Category select options

  const categorySelectItems: SelectOption[] = useMemo(
    () =>
      categories.map((category) => ({
        key: category._id,
        label: category.categoryName,
      })),
    [categories],
  );

  // Sub-category select options.
  // Main list filtering remains backend-side.
  // This filter is only for dropdown options.

  const availableSubCategories: SelectOption[] = useMemo(() => {
    if (!selectedSubjectCatId) {
      return [];
    }

    return subCategories
      .filter(
        (item) => getReferenceId(item.categoryId) === selectedSubjectCatId,
      )
      .map((item) => ({
        key: item._id,
        label: item.subCategoryName,
      }));
  }, [subCategories, selectedSubjectCatId]);

  const officerSelectItems: SelectOption[] = useMemo(
    () =>
      staffUsers
        .filter((user) => Boolean(user._id))
        .map((user) => {
          const designation =
            user.designationAndWing?.designation ||
            user.assignedRole ||
            "Staff";

          return {
            key: user._id,
            label: `${user.officerName || "Staff"} (${designation})`,
          };
        }),
    [staffUsers],
  );
  const currentItems = useMemo(() => {
    if (activeTab === "categories") {
      return categoryList.data;
    }
    if (activeTab === "sub_categories") {
      return subCategoryList.data;
    }
    return subjectList.data;
  }, [activeTab, categoryList.data, subCategoryList.data, subjectList.data]);

  const currentTotalCount = useMemo(() => {
    if (activeTab === "categories") {
      return categoryList.totalCount;
    }

    if (activeTab === "sub_categories") {
      return subCategoryList.totalCount;
    }

    return subjectList.totalCount;
  }, [
    activeTab,
    categoryList.totalCount,
    subCategoryList.totalCount,
    subjectList.totalCount,
  ]);

  const currentError = useMemo(() => {
    if (activeTab === "categories") {
      return categoryList.error;
    }

    if (activeTab === "sub_categories") {
      return subCategoryList.error;
    }

    return subjectList.error;
  }, [activeTab, categoryList.error, subCategoryList.error, subjectList.error]);

  const totalPages = Math.max(1, Math.ceil(currentTotalCount / ROWS_PER_PAGE));

  const handleTabChange = (key: React.Key) => {
    setActiveTab(key as ActiveTab);
    setSearchQuery("");
    setSelectedCategoryFilter("ALL");
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleCategoryFilterChange = (value: string) => {
    setSelectedCategoryFilter(value || "ALL");
    setPage(1);
  };

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const handleOpenAdd = () => {
    setEditingId(null);

    const firstCategory = categories[0]?._id || "";

    if (activeTab === "categories") {
      resetCatForm({
        categoryName: "",
        description: "",
        order: categoryList.totalCount + 1,
      });
    } else if (activeTab === "sub_categories") {
      resetSubCatForm({
        categoryId: firstCategory,
        subCategoryName: "",
        defaultOfficerId: "",
      });
    } else {
      resetSubjectForm({
        categoryId: firstCategory,
        subCategoryId: "",
        subjectTitle: "",
      });
    }

    onAddOpen();
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const handleEditCategory = (item: ICategoryItem) => {
    setEditingId(item._id);

    resetCatForm({
      categoryName: item.categoryName || "",
      description: item.description || "",
      order: item.order || 1,
    });

    onAddOpen();
  };

  const handleEditSubCategory = (item: ISubCategoryItem) => {
    setEditingId(item._id);

    resetSubCatForm({
      categoryId: getReferenceId(item.categoryId),
      subCategoryName: item.subCategoryName || "",

      // Store the actual user ID in the form.
      defaultOfficerId: getReferenceId(item.defaultOfficerId),
    });

    onAddOpen();
  };

  const handleEditSubject = (item: ISubjectItem) => {
    setEditingId(item._id);

    resetSubjectForm({
      categoryId: getReferenceId(item.categoryId),
      subCategoryId: getReferenceId(item.subCategoryId),
      subjectTitle: item.subjectTitle || "",
    });

    onAddOpen();
  };

  const handleFormModalChange = (open: boolean) => {
    if (open) {
      onAddOpen();
    } else {
      onAddClose();
      setEditingId(null);
    }
  };

  const onSubmitCategory = async (values: CategoryFormValues) => {
    try {
      const payload = {
        categoryName: values.categoryName.trim(),
        description: values.description?.trim() || "",
        order: Number(values.order) || categoryList.totalCount + 1,
      };

      if (editingId) {
        await dispatch(
          updateCategory({
            id: editingId,
            payload,
          }),
        ).unwrap();

        toast.success("Category updated successfully!");
      } else {
        await dispatch(createCategory(payload)).unwrap();

        toast.success("Category added successfully!");
      }

      onAddClose();
      setEditingId(null);
      setPage(1);
      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save category"));
    }
  };

  // =====================================================
  // SUB-CATEGORY CREATE / UPDATE
  // =====================================================

  const onSubmitSubCategory = async (values: SubCategoryFormValues) => {
    try {
      // IMPORTANT:
      // defaultOfficerId is already the selected user's ID.
      // No officer-name lookup is required.

      const payload = {
        categoryId: values.categoryId,
        subCategoryName: values.subCategoryName.trim(),
        defaultOfficerId: values.defaultOfficerId || null,
      };

      if (editingId) {
        await dispatch(
          updateSubCategory({
            id: editingId,
            payload,
          }),
        ).unwrap();

        toast.success("Sub-Category updated successfully!");
      } else {
        await dispatch(createSubCategory(payload)).unwrap();

        toast.success("Sub-Category registered successfully!");
      }

      onAddClose();
      setEditingId(null);
      setPage(1);
      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save sub-category"));
    }
  };

  // =====================================================
  // SUBJECT CREATE / UPDATE
  // =====================================================

  const onSubmitSubject = async (values: SubjectFormValues) => {
    try {
      const payload = {
        categoryId: values.categoryId,
        subCategoryId: values.subCategoryId,
        subjectTitle: values.subjectTitle.trim(),
      };

      if (editingId) {
        await dispatch(
          updateSubject({
            id: editingId,
            payload,
          }),
        ).unwrap();

        toast.success("Subject updated successfully!");
      } else {
        await dispatch(createSubject(payload)).unwrap();

        toast.success("Granular Subject Node created successfully!");
      }

      onAddClose();
      setEditingId(null);
      setPage(1);
      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save subject"));
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleOpenDelete = (id: string, name: string, type: DeleteType) => {
    setItemToDelete({
      id,
      name,
      type,
    });

    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) {
      return;
    }

    try {
      if (itemToDelete.type === "CAT") {
        await dispatch(deleteCategory(itemToDelete.id)).unwrap();
      } else if (itemToDelete.type === "SUBCAT") {
        await dispatch(deleteSubCategory(itemToDelete.id)).unwrap();
      } else {
        await dispatch(deleteSubject(itemToDelete.id)).unwrap();
      }
      toast.success(`${itemToDelete.name} deleted successfully!`);
      onDeleteClose();
      setItemToDelete(null);

      if (currentItems.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      }

      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete record"));
    }
  };

  // =====================================================
  // TABLE CELL RENDERERS
  // =====================================================

  const renderSubCategoryCell = (
    item: ISubCategoryItem,
    columnKey: string,
    index: number,
  ) => {
    switch (columnKey) {
      case "serial":
        return (
          <span className="text-xs font-bold text-slate-400">{index}</span>
        );

      case "category":
        return (
          <Chip
            size="sm"
            variant="flat"
            color="secondary"
            className="text-[10px] font-bold"
          >
            {getCategoryName(item.categoryId)}
          </Chip>
        );

      case "subCategoryName":
        return (
          <span className="text-xs font-bold text-slate-900">
            {item.subCategoryName}
          </span>
        );

      // Column key remains unchanged for existing TaxonomyColumns.
      // The actual value comes from defaultOfficerId.

      case "defaultOfficerName":
        return (
          <span className="text-xs font-medium text-blue-900">
            {getOfficerName(item.defaultOfficerId)}
          </span>
        );

      case "actions":
        return (
          <div className="flex justify-center items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-400 hover:text-blue-600"
              onPress={() => handleEditSubCategory(item)}
              aria-label="Edit sub-category"
            >
              <span className="material-symbols-rounded text-sm">edit</span>
            </Button>

            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-400 hover:text-rose-600"
              onPress={() =>
                handleOpenDelete(item._id, item.subCategoryName, "SUBCAT")
              }
              aria-label="Delete sub-category"
            >
              <span className="material-symbols-rounded text-sm">delete</span>
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSubjectCell = (
    item: ISubjectItem,
    columnKey: string,
    index: number,
  ) => {
    switch (columnKey) {
      case "serial":
        return (
          <span className="text-xs font-bold text-slate-400">{index}</span>
        );

      case "category":
        return (
          <Chip
            size="sm"
            variant="flat"
            color="primary"
            className="text-[10px] font-bold"
          >
            {getCategoryName(item.categoryId)}
          </Chip>
        );

      case "subCategory":
        return (
          <span className="text-xs font-semibold text-slate-900">
            {getSubCategoryName(item.subCategoryId)}
          </span>
        );

      case "subjectTitle":
        return (
          <span className="text-xs text-slate-700 font-medium">
            {item.subjectTitle}
          </span>
        );

      case "actions":
        return (
          <div className="flex justify-center items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-400 hover:text-blue-600"
              onPress={() => handleEditSubject(item)}
              aria-label="Edit subject"
            >
              <span className="material-symbols-rounded text-sm">edit</span>
            </Button>

            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-400 hover:text-rose-600"
              onPress={() =>
                handleOpenDelete(item._id, item.subjectTitle, "SUB")
              }
              aria-label="Delete subject"
            >
              <span className="material-symbols-rounded text-sm">delete</span>
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderCategoryCell = (
    item: ICategoryItem,
    columnKey: string,
    index: number,
  ) => {
    switch (columnKey) {
      case "serial":
        return (
          <span className="text-xs font-bold text-slate-400">{index}</span>
        );

      case "categoryName":
        return (
          <span className="text-xs font-bold text-slate-900">
            {item.categoryName}
          </span>
        );

      case "order":
        return (
          <span className="text-xs font-mono font-semibold text-slate-600">
            {item.order || 1}
          </span>
        );

      case "actions":
        return (
          <div className="flex justify-center items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-400 hover:text-blue-600"
              onPress={() => handleEditCategory(item)}
              aria-label="Edit category"
            >
              <span className="material-symbols-rounded text-sm">edit</span>
            </Button>

            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-400 hover:text-rose-600"
              onPress={() =>
                handleOpenDelete(item._id, item.categoryName, "CAT")
              }
              aria-label="Delete category"
            >
              <span className="material-symbols-rounded text-sm">delete</span>
            </Button>
          </div>
        );

      default:
        return null;
    }
  };
  const isSubmitting =
    taxonomy.categories.createLoading ||
    taxonomy.categories.updateLoading ||
    taxonomy.subCategories.createLoading ||
    taxonomy.subCategories.updateLoading ||
    taxonomy.subjects.createLoading ||
    taxonomy.subjects.updateLoading;

  const isDeleting =
    taxonomy.categories.deleteLoading ||
    taxonomy.subCategories.deleteLoading ||
    taxonomy.subjects.deleteLoading;

  const modalTitle = editingId ? "Edit " : "Add ";

  return (
    <div className="space-y-4">
      <Card shadow="none" className="border border-slate-200/80 bg-white">
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
                    <span className="material-symbols-rounded">arrow_back</span>
                  </Button>
                </Link>

                <h1 className="text-base font-bold text-slate-900">
                  7.6 Case Category, Sub Category &amp; Subject Tree
                </h1>

                <Chip
                  size="sm"
                  className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700"
                >
                  3-Tier Tabular Hierarchy
                </Chip>
              </div>

              <p className="text-xs text-slate-500 ml-9">
                Independent Categories &rarr; Sub-Category / Exam Cycles (Mapped
                to Staff) &rarr; Granular Issue Subjects
              </p>
            </div>

            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={
                <span className="material-symbols-rounded text-sm">add</span>
              }
              onPress={handleOpenAdd}
            >
              Add New{" "}
              {activeTab === "categories"
                ? "Category"
                : activeTab === "sub_categories"
                  ? "Sub-Category"
                  : "Subject"}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <Tabs
              aria-label="Taxonomy Levels"
              selectedKey={activeTab}
              onSelectionChange={handleTabChange}
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
                key="subjects"
                title={`3. Case Subjects (${subjectList.totalCount})`}
              />

              <Tab
                key="sub_categories"
                title={`2. Case Sub-Categories (${subCategoryList.totalCount})`}
              />

              <Tab
                key="categories"
                title={`1. Case Categories (${categoryList.totalCount})`}
              />
            </Tabs>

            <div className="flex items-center gap-2">
              {activeTab !== "categories" && (
                <div className="w-52">
                  <Select
                    size="sm"
                    radius="sm"
                    aria-label="Filter by Category"
                    placeholder="Filter Category"
                    items={categoryFilterItems}
                    selectedKeys={[selectedCategoryFilter]}
                    onChange={(event) =>
                      handleCategoryFilterChange(event.target.value)
                    }
                    className="bg-slate-50 font-semibold"
                  >
                    {(item: SelectOption) => (
                      <SelectItem key={item.key}>{item.label}</SelectItem>
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
                  onValueChange={handleSearchChange}
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

      {/* ================================================
          2. MAIN TABLES VIEW
      ================================================ */}

      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          {currentError && (
            <div className="px-4 pt-3 text-xs text-rose-600">
              {currentError}
            </div>
          )}

          {/* SUB-CATEGORIES */}

          {activeTab === "sub_categories" && (
            <TaxonomyTable<ISubCategoryItem>
              ariaLabel="Sub Categories Table"
              columns={subCategoryColumns}
              items={subCategoryList.data}
              loading={subCategoryList.loading}
              emptyText="No sub-categories found."
              page={page}
              totalPages={totalPages}
              totalCount={subCategoryList.totalCount}
              rowsPerPage={ROWS_PER_PAGE}
              onPageChange={setPage}
              renderCell={renderSubCategoryCell}
            />
          )}

          {/* SUBJECTS */}

          {activeTab === "subjects" && (
            <TaxonomyTable<ISubjectItem>
              ariaLabel="Subjects Table"
              columns={subjectColumns}
              items={subjectList.data}
              loading={subjectList.loading}
              emptyText="No subjects found."
              page={page}
              totalPages={totalPages}
              totalCount={subjectList.totalCount}
              rowsPerPage={ROWS_PER_PAGE}
              onPageChange={setPage}
              renderCell={renderSubjectCell}
            />
          )}

          {/* CATEGORIES */}

          {activeTab === "categories" && (
            <TaxonomyTable<ICategoryItem>
              ariaLabel="Categories Table"
              columns={categoryColumns}
              items={categoryList.data}
              loading={categoryList.loading}
              emptyText="No master categories found."
              page={page}
              totalPages={totalPages}
              totalCount={categoryList.totalCount}
              rowsPerPage={ROWS_PER_PAGE}
              onPageChange={setPage}
              renderCell={renderCategoryCell}
            />
          )}
        </CardBody>
      </Card>

      {/* ================================================
          3. ADD / EDIT MODAL
      ================================================ */}

      <Modal
        isOpen={isAddOpen}
        onOpenChange={handleFormModalChange}
        placement="center"
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100">
                <span className="material-symbols-rounded text-blue-700">
                  account_tree
                </span>

                {modalTitle}

                {activeTab === "categories"
                  ? "Master Category"
                  : activeTab === "sub_categories"
                    ? "Sub-Category / Exam"
                    : "Granular Subject"}
              </ModalHeader>

              <ModalBody className="py-4 space-y-4">
                {/* ======================================
                    CATEGORY FORM
                ====================================== */}

                {activeTab === "categories" && (
                  <form
                    id="cat-form"
                    onSubmit={handleCatSubmit(onSubmitCategory)}
                    className="space-y-4"
                  >
                    <Controller
                      name="categoryName"
                      control={catControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Category Name{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Input
                            {...field}
                            size="sm"
                            placeholder="e.g. Direct Recruitment"
                            isInvalid={!!catErrors.categoryName}
                            errorMessage={catErrors.categoryName?.message}
                          />
                        </div>
                      )}
                    />

                    <Controller
                      name="description"
                      control={catControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Description
                          </label>

                          <Textarea
                            {...field}
                            size="sm"
                            minRows={2}
                            placeholder="Enter category description (optional)"
                          />
                        </div>
                      )}
                    />

                    <Controller
                      name="order"
                      control={catControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Display Sort Order
                          </label>

                          <Input
                            size="sm"
                            type="number"
                            value={String(field.value ?? "")}
                            onChange={(event) => {
                              const value = event.target.value;

                              field.onChange(
                                value === "" ? undefined : Number(value),
                              );
                            }}
                            onBlur={field.onBlur}
                            isInvalid={!!catErrors.order}
                            errorMessage={catErrors.order?.message}
                          />
                        </div>
                      )}
                    />
                  </form>
                )}

                {/* ======================================
                    SUB-CATEGORY FORM
                ====================================== */}

                {activeTab === "sub_categories" && (
                  <form
                    id="subcat-form"
                    onSubmit={handleSubCatSubmit(onSubmitSubCategory)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* PARENT CATEGORY */}

                      <Controller
                        name="categoryId"
                        control={subCatControl}
                        render={({ field }) => (
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Select Parent Category{" "}
                              <span className="text-red-500">*</span>
                            </label>

                            <Select
                              size="sm"
                              items={categorySelectItems}
                              selectedKeys={field.value ? [field.value] : []}
                              onChange={(event) =>
                                field.onChange(event.target.value)
                              }
                              onBlur={field.onBlur}
                              isInvalid={!!subCatErrors.categoryId}
                              errorMessage={subCatErrors.categoryId?.message}
                              placeholder="Choose category..."
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

                      {/* DEFAULT OFFICER */}

                      <Controller
                        name="defaultOfficerId"
                        control={subCatControl}
                        render={({ field }) => (
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Assigned Nodal Officer (Staff Directory)
                            </label>

                            <Select
                              size="sm"
                              isLoading={loadingUsers}
                              placeholder={
                                loadingUsers
                                  ? "Loading active officers..."
                                  : officerSelectItems.length === 0
                                    ? "No active officers available"
                                    : "Select Active Staff Member (Optional)"
                              }
                              items={officerSelectItems}
                              selectedKeys={field.value ? [field.value] : []}
                              onChange={(event) =>
                                field.onChange(event.target.value)
                              }
                              onBlur={field.onBlur}
                              isInvalid={!!subCatErrors.defaultOfficerId}
                              errorMessage={
                                subCatErrors.defaultOfficerId?.message
                              }
                              isDisabled={
                                loadingUsers || officerSelectItems.length === 0
                              }
                            >
                              {(officer: SelectOption) => (
                                <SelectItem key={officer.key}>
                                  {officer.label}
                                </SelectItem>
                              )}
                            </Select>

                            <p className="text-[10px] text-slate-400 mt-1">
                              Optional. The selected officer's user ID will be
                              saved.
                            </p>
                          </div>
                        )}
                      />
                    </div>

                    {/* SUB-CATEGORY NAME */}

                    <Controller
                      name="subCategoryName"
                      control={subCatControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Sub-Category / Exam Cycle Full Title{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Input
                            {...field}
                            size="sm"
                            placeholder="e.g. Constable Civil Police & PAC Exam 2023-24"
                            isInvalid={!!subCatErrors.subCategoryName}
                            errorMessage={subCatErrors.subCategoryName?.message}
                          />
                        </div>
                      )}
                    />
                  </form>
                )}

                {/* ======================================
                    SUBJECT FORM
                ====================================== */}

                {activeTab === "subjects" && (
                  <form
                    id="subject-form"
                    onSubmit={handleSubjectSubmit(onSubmitSubject)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* PARENT CATEGORY */}

                      <Controller
                        name="categoryId"
                        control={subjectControl}
                        render={({ field }) => (
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Parent Category (Tier 1){" "}
                              <span className="text-red-500">*</span>
                            </label>

                            <Select
                              size="sm"
                              items={categorySelectItems}
                              selectedKeys={field.value ? [field.value] : []}
                              onChange={(event) => {
                                field.onChange(event.target.value);

                                // Reset dependent sub-category.

                                setSubjectValue("subCategoryId", "", {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                              }}
                              onBlur={field.onBlur}
                              isInvalid={!!subjectErrors.categoryId}
                              errorMessage={subjectErrors.categoryId?.message}
                              placeholder="Select Category..."
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

                      {/* PARENT SUB-CATEGORY */}

                      <Controller
                        name="subCategoryId"
                        control={subjectControl}
                        render={({ field }) => (
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Parent Sub-Category / Exam (Tier 2){" "}
                              <span className="text-red-500">*</span>
                            </label>

                            <Select
                              size="sm"
                              items={availableSubCategories}
                              selectedKeys={field.value ? [field.value] : []}
                              onChange={(event) =>
                                field.onChange(event.target.value)
                              }
                              onBlur={field.onBlur}
                              isInvalid={!!subjectErrors.subCategoryId}
                              errorMessage={
                                subjectErrors.subCategoryId?.message
                              }
                              isDisabled={
                                !selectedSubjectCatId ||
                                availableSubCategories.length === 0
                              }
                              placeholder={
                                !selectedSubjectCatId
                                  ? "Select category first"
                                  : availableSubCategories.length === 0
                                    ? "No sub-categories available"
                                    : "Choose Sub-Category"
                              }
                            >
                              {(subCategory: SelectOption) => (
                                <SelectItem key={subCategory.key}>
                                  {subCategory.label}
                                </SelectItem>
                              )}
                            </Select>
                          </div>
                        )}
                      />
                    </div>

                    {/* SUBJECT TITLE */}

                    <Controller
                      name="subjectTitle"
                      control={subjectControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Granular Subject Matter / Issue{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Input
                            {...field}
                            size="sm"
                            placeholder="e.g. Normalization / Percentile Method Dispute"
                            isInvalid={!!subjectErrors.subjectTitle}
                            errorMessage={subjectErrors.subjectTitle?.message}
                          />
                        </div>
                      )}
                    />
                  </form>
                )}
              </ModalBody>

              <ModalFooter className="border-t border-slate-100">
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
                  form={
                    activeTab === "categories"
                      ? "cat-form"
                      : activeTab === "sub_categories"
                        ? "subcat-form"
                        : "subject-form"
                  }
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                >
                  {editingId ? "Update Record" : "Save Record"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ================================================
          4. DELETE CONFIRMATION MODAL
      ================================================ */}

      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={(open) => {
          if (open) {
            onDeleteOpen();
          } else {
            onDeleteClose();
          }
        }}
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
                Are you sure you want to remove <b>{itemToDelete?.name}</b>?
              </ModalBody>

              <ModalFooter>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={onClose}
                  isDisabled={isDeleting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  radius="sm"
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  onPress={handleConfirmDelete}
                  isLoading={isDeleting}
                  isDisabled={isDeleting}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
