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
  Tabs,
  Tab,
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";

import { MastersAPI } from "@/api/mastersApi";
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
import { z } from "zod";

type CategoryFormValues = z.infer<typeof categorySchema>;
type SubCategoryFormValues = z.infer<typeof subCategorySchema>;
type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SelectOption {
  key: string;
  label: string;
}

export default function TaxonomyMasterPage() {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const reduxUsers = useSelector((state: RootState) => {
    const userSlice = (state as any).users;
    return (userSlice?.users as StaffUserItem[]) || [];
  });

  // Local fallback state to ensure dropdown never stays empty if Redux delays
  const [directUsers, setDirectUsers] = useState<StaffUserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>("sub_categories");
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [categories, setCategories] = useState<ICategoryItem[]>([]);
  const [subCategories, setSubCategories] = useState<ISubCategoryItem[]>([]);
  const [subjects, setSubjects] = useState<ISubjectItem[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: "CAT" | "SUBCAT" | "SUB" } | null>(null);

  // 1. Tier 1 Form
  const {
    control: catControl,
    handleSubmit: handleCatSubmit,
    reset: resetCatForm,
    formState: { errors: catErrors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: { categoryName: "", description: "", order: 1 },
  });

  // 2. Tier 2 Form
  const {
    control: subCatControl,
    handleSubmit: handleSubCatSubmit,
    reset: resetSubCatForm,
    formState: { errors: subCatErrors },
  } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategorySchema) as any,
    defaultValues: { categoryId: "", subCategoryName: "", defaultOfficerName: "" },
  });

  // 3. Tier 3 Form
  const {
    control: subjectControl,
    handleSubmit: handleSubjectSubmit,
    watch: watchSubjectForm,
    setValue: setSubjectValue,
    reset: resetSubjectForm,
    formState: { errors: subjectErrors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema) as any,
    defaultValues: { categoryId: "", subCategoryId: "", subjectTitle: "" },
  });

  const selectedSubjectCatId = watchSubjectForm("categoryId");

  // Load Users directly + via Redux to guarantee availability
  const loadUsersDirectory = useCallback(async () => {
    setLoadingUsers(true);
    try {
      dispatch(fetchStaffUsers());
      const res = await AdminAPI.getUsersList({ limit: 100, status: "ACTIVE" });
      if (res?.success && Array.isArray(res.data)) {
        setDirectUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to load staff users directory:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [dispatch]);

  const loadTaxonomyData = useCallback(async () => {
    setLoading(true);
    try {
      const [resCats, resSubCats, resSubjects] = await Promise.all([
        MastersAPI.getCategories({ limit: 100 }),
        MastersAPI.getSubCategories({
          limit: 200,
          categoryId: selectedCategoryFilter !== "ALL" ? selectedCategoryFilter : undefined,
        }),
        MastersAPI.getSubjects({
          limit: 300,
          categoryId: selectedCategoryFilter !== "ALL" ? selectedCategoryFilter : undefined,
        }),
      ]);

      if (resCats?.success) setCategories(resCats.data || []);
      if (resSubCats?.success) setSubCategories(resSubCats.data || []);
      if (resSubjects?.success) setSubjects(resSubjects.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load taxonomy records");
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryFilter]);

  useEffect(() => {
    loadTaxonomyData();
    loadUsersDirectory();
  }, [loadTaxonomyData, loadUsersDirectory]);

  // Merge users from local fetch and redux state safely
  const staffUsers: StaffUserItem[] = useMemo(() => {
    if (directUsers.length > 0) return directUsers;
    if (Array.isArray(reduxUsers) && reduxUsers.length > 0) return reduxUsers;
    return [];
  }, [directUsers, reduxUsers]);

  const categoryFilterItems: SelectOption[] = useMemo(() => {
    return [
      { key: "ALL", label: "All Categories" },
      ...categories.map((c) => ({
        key: c._id,
        label: c.categoryName,
      })),
    ];
  }, [categories]);

  const categorySelectItems: SelectOption[] = useMemo(() => {
    return categories.map((c) => ({
      key: c._id,
      label: c.categoryName,
    }));
  }, [categories]);

  const availableSubCategories: SelectOption[] = useMemo(() => {
    if (!selectedSubjectCatId) return [];
    return subCategories
      .filter((sc) => {
        const catId = typeof sc.categoryId === "object" ? (sc.categoryId as any)?._id : sc.categoryId;
        return catId === selectedSubjectCatId;
      })
      .map((sc) => ({
        key: sc._id,
        label: sc.subCategoryName,
      }));
  }, [subCategories, selectedSubjectCatId]);

  const officerSelectItems: SelectOption[] = useMemo(() => {
    return staffUsers.map((u) => {
      const designation = u.designationAndWing?.designation || u.assignedRole || "Staff";
      return {
        key: u.officerName,
        label: `${u.officerName} (${designation})`,
      };
    });
  }, [staffUsers]);

  const handleOpenAdd = () => {
    const firstCat = categories[0]?._id || "";
    const firstOfficer = officerSelectItems[0]?.key || "";

    if (activeTab === "categories") {
      resetCatForm({ categoryName: "", description: "", order: categories.length + 1 });
    } else if (activeTab === "sub_categories") {
      resetSubCatForm({
        categoryId: firstCat,
        subCategoryName: "",
        defaultOfficerName: firstOfficer,
      });
    } else {
      resetSubjectForm({
        categoryId: firstCat,
        subCategoryId: "",
        subjectTitle: "",
      });
    }
    onAddOpen();
  };

  const onAddCategory = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await MastersAPI.createCategory({
        categoryName: values.categoryName.trim(),
        order: Number(values.order) || categories.length + 1,
      });
      if (res?.success) {
        toast.success("Category added successfully!");
        onAddOpenChange();
        loadTaxonomyData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAddSubCategory = async (values: SubCategoryFormValues) => {
    setIsSubmitting(true);
    try {
      const selectedUser = staffUsers.find((u) => u.officerName === values.defaultOfficerName);
      const res = await MastersAPI.createSubCategory({
        categoryId: values.categoryId,
        subCategoryName: values.subCategoryName.trim(),
        defaultOfficerName: values.defaultOfficerName?.trim() || "--",
        defaultOfficerId: selectedUser?._id,
      });
      if (res?.success) {
        toast.success("Sub-Category registered successfully!");
        onAddOpenChange();
        loadTaxonomyData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save subcategory");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAddSubject = async (values: SubjectFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await MastersAPI.createSubject({
        categoryId: values.categoryId,
        subCategoryId: values.subCategoryId,
        subjectTitle: values.subjectTitle.trim(),
      });
      if (res?.success) {
        toast.success("Granular Subject Node created successfully!");
        onAddOpenChange();
        loadTaxonomyData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save subject issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      if (itemToDelete.type === "SUB") {
        setSubjects((prev) => prev.filter((s) => s._id !== itemToDelete.id));
      } else if (itemToDelete.type === "SUBCAT") {
        setSubCategories((prev) => prev.filter((s) => s._id !== itemToDelete.id));
      } else {
        setCategories((prev) => prev.filter((s) => s._id !== itemToDelete.id));
      }
      toast.success(`${itemToDelete.name} removed from active view.`);
      onDeleteOpenChange();
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove node");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter((item) => {
      const catName = typeof item.categoryId === "object" ? (item.categoryId as any)?.categoryName || "" : "";
      const catId = typeof item.categoryId === "object" ? (item.categoryId as any)?._id : item.categoryId;
      const subCatName = typeof item.subCategoryId === "object" ? (item.subCategoryId as any)?.subCategoryName || "" : "";
      const subjectText = item.subjectTitle || "";

      const matchesCategory = selectedCategoryFilter === "ALL" || catId === selectedCategoryFilter || catName === selectedCategoryFilter;
      const matchesSearch =
        subjectText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subCatName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [subjects, selectedCategoryFilter, searchQuery]);

  const filteredSubCategories = useMemo(() => {
    return subCategories.filter((item) => {
      const catName = typeof item.categoryId === "object" ? (item.categoryId as any)?.categoryName || "" : "";
      const catId = typeof item.categoryId === "object" ? (item.categoryId as any)?._id : item.categoryId;
      const matchesCategory = selectedCategoryFilter === "ALL" || catId === selectedCategoryFilter || catName === selectedCategoryFilter;
      const matchesSearch =
        item.subCategoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.defaultOfficerName && item.defaultOfficerName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [subCategories, selectedCategoryFilter, searchQuery]);

  const filteredCategories = useMemo(() => {
    return categories.filter((item) =>
      item.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const currentTabCount = useMemo(() => {
    if (activeTab === "subjects") return filteredSubjects.length;
    if (activeTab === "sub_categories") return filteredSubCategories.length;
    return filteredCategories.length;
  }, [activeTab, filteredSubjects, filteredSubCategories, filteredCategories]);

  const totalPages = Math.ceil(currentTabCount / rowsPerPage) || 1;

  const paginatedSubjects = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredSubjects.slice(start, start + rowsPerPage);
  }, [filteredSubjects, page, rowsPerPage]);

  const paginatedSubCategories = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredSubCategories.slice(start, start + rowsPerPage);
  }, [filteredSubCategories, page, rowsPerPage]);

  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredCategories.slice(start, start + rowsPerPage);
  }, [filteredCategories, page, rowsPerPage]);

  return (
    <div className="space-y-4">
      {/* 1. Header Information Bar */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/admin/masters">
                  <Button isIconOnly size="sm" variant="light" className="text-slate-500">
                    <span className="material-symbols-rounded">arrow_back</span>
                  </Button>
                </Link>
                <h1 className="text-base font-bold text-slate-900">
                  7.6 Case Category, Sub Category &amp; Subject Tree
                </h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  3-Tier Tabular Hierarchy
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Independent Categories &rarr; Sub-Category / Exam Cycles (Mapped to Staff) &rarr; Granular Issue Subjects
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={handleOpenAdd}
            >
              Add New {activeTab === "categories" ? "Category" : activeTab === "sub_categories" ? "Sub-Category" : "Subject"}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <Tabs
              aria-label="Taxonomy Levels"
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
                tabContent: "group-data-[selected=true]:text-[#0f2744] text-slate-500",
              }}
            >
              <Tab key="sub_categories" title={`2. Sub-Categories / Exams (${subCategories.length})`} />
              <Tab key="subjects" title={`3. Granular Subjects (${subjects.length})`} />
              <Tab key="categories" title={`1. Master Categories (${categories.length})`} />
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
                    onChange={(e) => {
                      setSelectedCategoryFilter(e.target.value || "ALL");
                      setPage(1);
                    }}
                    className="bg-slate-50 font-semibold"
                  >
                    {(item: SelectOption) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                  </Select>
                </div>
              )}
              <div className="w-64">
                <Input
                  size="sm"
                  radius="sm"
                  placeholder="Search active view..."
                  value={searchQuery}
                  onValueChange={(val) => {
                    setSearchQuery(val);
                    setPage(1);
                  }}
                  startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
                  className="bg-slate-50"
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Tables View */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          {activeTab === "sub_categories" && (
            <Table
              removeWrapper
              aria-label="Sub Categories Table"
              className="min-w-full"
              bottomContent={
                totalPages > 1 ? (
                  <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Showing {(page - 1) * rowsPerPage + 1} to{" "}
                      {Math.min(page * rowsPerPage, filteredSubCategories.length)} of {filteredSubCategories.length}
                    </span>
                    <Pagination
                      isCompact
                      showControls
                      color="primary"
                      page={page}
                      total={totalPages}
                      onChange={(p) => setPage(p)}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">PARENT CATEGORY</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">SUB-CATEGORY / EXAM CYCLE</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">ASSIGNED NODAL OFFICER</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
              </TableHeader>
              <TableBody
                items={paginatedSubCategories}
                emptyContent={loading ? <div className="py-6 flex justify-center items-center gap-2 text-slate-500"><Spinner size="sm" /> Loading...</div> : "No sub-categories found."}
              >
                {(item) => {
                  const itemIndex = (page - 1) * rowsPerPage + paginatedSubCategories.indexOf(item) + 1;
                  const catName = typeof item.categoryId === "object" ? (item.categoryId as any)?.categoryName : "--";
                  return (
                    <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <TableCell className="text-xs font-bold text-slate-400">{itemIndex}</TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="secondary" className="text-[10px] font-bold">{catName}</Chip>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900">{item.subCategoryName}</TableCell>
                      <TableCell className="text-xs font-medium text-blue-900">
                        {item.defaultOfficerName || "Dealing Officer"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-slate-400 hover:text-rose-600"
                          onPress={() => { setItemToDelete({ id: item._id, name: item.subCategoryName, type: "SUBCAT" }); onDeleteOpen(); }}
                        >
                          <span className="material-symbols-rounded text-sm">delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          )}

          {activeTab === "subjects" && (
            <Table
              removeWrapper
              aria-label="Subjects Table"
              className="min-w-full"
              bottomContent={
                totalPages > 1 ? (
                  <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Showing {(page - 1) * rowsPerPage + 1} to{" "}
                      {Math.min(page * rowsPerPage, filteredSubjects.length)} of {filteredSubjects.length}
                    </span>
                    <Pagination
                      isCompact
                      showControls
                      color="primary"
                      page={page}
                      total={totalPages}
                      onChange={(p) => setPage(p)}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">MASTER CATEGORY</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">SUB-CATEGORY / EXAM</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">GRANULAR SUBJECT ISSUE</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
              </TableHeader>
              <TableBody
                items={paginatedSubjects}
                emptyContent={loading ? <div className="py-6 flex justify-center items-center gap-2 text-slate-500"><Spinner size="sm" /> Loading...</div> : "No subjects found."}
              >
                {(item) => {
                  const itemIndex = (page - 1) * rowsPerPage + paginatedSubjects.indexOf(item) + 1;
                  const catName = typeof item.categoryId === "object" ? (item.categoryId as any)?.categoryName : "--";
                  const subCatName = typeof item.subCategoryId === "object" ? (item.subCategoryId as any)?.subCategoryName : "--";
                  return (
                    <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <TableCell className="text-xs font-bold text-slate-400">{itemIndex}</TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="primary" className="text-[10px] font-bold">{catName}</Chip>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-900">{subCatName}</TableCell>
                      <TableCell className="text-xs text-slate-700 font-medium">{item.subjectTitle}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-slate-400 hover:text-rose-600"
                          onPress={() => { setItemToDelete({ id: item._id, name: item.subjectTitle, type: "SUB" }); onDeleteOpen(); }}
                        >
                          <span className="material-symbols-rounded text-sm">delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          )}

          {activeTab === "categories" && (
            <Table
              removeWrapper
              aria-label="Categories Table"
              className="min-w-full"
              bottomContent={
                totalPages > 1 ? (
                  <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Showing {(page - 1) * rowsPerPage + 1} to{" "}
                      {Math.min(page * rowsPerPage, filteredCategories.length)} of {filteredCategories.length}
                    </span>
                    <Pagination
                      isCompact
                      showControls
                      color="primary"
                      page={page}
                      total={totalPages}
                      onChange={(p) => setPage(p)}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">MASTER CATEGORY NAME</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">DISPLAY ORDER</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
              </TableHeader>
              <TableBody
                items={paginatedCategories}
                emptyContent={loading ? <div className="py-6 flex justify-center items-center gap-2 text-slate-500"><Spinner size="sm" /> Loading...</div> : "No master categories found."}
              >
                {(item) => {
                  const itemIndex = (page - 1) * rowsPerPage + paginatedCategories.indexOf(item) + 1;
                  return (
                    <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <TableCell className="text-xs font-bold text-slate-400">{itemIndex}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-900">{item.categoryName}</TableCell>
                      <TableCell className="text-xs font-mono font-semibold text-slate-600">{item.order || 1}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-slate-400 hover:text-rose-600"
                          onPress={() => { setItemToDelete({ id: item._id, name: item.categoryName, type: "CAT" }); onDeleteOpen(); }}
                        >
                          <span className="material-symbols-rounded text-sm">delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* 3. Add Modal (Upgraded to size="2xl" for comfortable layout) */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="center" size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100">
                <span className="material-symbols-rounded text-blue-700">account_tree</span>
                Add {activeTab === "categories" ? "Master Category" : activeTab === "sub_categories" ? "Sub-Category / Exam" : "Granular Subject"}
              </ModalHeader>
              <ModalBody className="py-4 space-y-4">
                {activeTab === "categories" && (
                  <form id="cat-form" onSubmit={handleCatSubmit(onAddCategory)} className="space-y-4">
                    <Controller
                      name="categoryName"
                      control={catControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Category Name <span className="text-red-500">*</span>
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
                      name="order"
                      control={catControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">Display Sort Order</label>
                          <Input
                            size="sm"
                            type="number"
                            value={String(field.value || 1)}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </div>
                      )}
                    />
                  </form>
                )}

                {activeTab === "sub_categories" && (
                  <form id="subcat-form" onSubmit={handleSubCatSubmit(onAddSubCategory)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                        name="categoryId"
                        control={subCatControl}
                        render={({ field }) => (
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Select Parent Category <span className="text-red-500">*</span>
                            </label>
                            <Select
                              size="sm"
                              items={categorySelectItems}
                              selectedKeys={field.value ? [field.value] : []}
                              onChange={(e) => field.onChange(e.target.value)}
                              isInvalid={!!subCatErrors.categoryId}
                              errorMessage={subCatErrors.categoryId?.message}
                              placeholder="Choose category..."
                            >
                              {(cat: SelectOption) => <SelectItem key={cat.key}>{cat.label}</SelectItem>}
                            </Select>
                          </div>
                        )}
                      />

                      <Controller
                        name="defaultOfficerName"
                        control={subCatControl}
                        render={({ field }) => (
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Assigned Nodal Officer (Staff Directory) <span className="text-red-500">*</span>
                            </label>
                            <Select
                              size="sm"
                              isLoading={loadingUsers}
                              placeholder={staffUsers.length === 0 ? "Loading active officers..." : "Select Active Staff Member"}
                              items={officerSelectItems}
                              selectedKeys={field.value ? [field.value] : []}
                              onChange={(e) => field.onChange(e.target.value)}
                              isInvalid={!!subCatErrors.defaultOfficerName}
                              errorMessage={subCatErrors.defaultOfficerName?.message}
                              isDisabled={officerSelectItems.length === 0}
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

                    <Controller
                      name="subCategoryName"
                      control={subCatControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Sub-Category / Exam Cycle Full Title <span className="text-red-500">*</span>
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

                {activeTab === "subjects" && (
                  <form id="subject-form" onSubmit={handleSubjectSubmit(onAddSubject)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                        name="categoryId"
                        control={subjectControl}
                        render={({ field }) => (
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Parent Category (Tier 1) <span className="text-red-500">*</span>
                            </label>
                            <Select
                              size="sm"
                              items={categorySelectItems}
                              selectedKeys={field.value ? [field.value] : []}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                setSubjectValue("subCategoryId", "");
                              }}
                              isInvalid={!!subjectErrors.categoryId}
                              errorMessage={subjectErrors.categoryId?.message}
                              placeholder="Select Category..."
                            >
                              {(cat: SelectOption) => <SelectItem key={cat.key}>{cat.label}</SelectItem>}
                            </Select>
                          </div>
                        )}
                      />

                      <Controller
                        name="subCategoryId"
                        control={subjectControl}
                        render={({ field }) => (
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Parent Sub-Category / Exam (Tier 2) <span className="text-red-500">*</span>
                            </label>
                            <Select
                              size="sm"
                              items={availableSubCategories}
                              selectedKeys={field.value ? [field.value] : []}
                              onChange={(e) => field.onChange(e.target.value)}
                              isInvalid={!!subjectErrors.subCategoryId}
                              errorMessage={subjectErrors.subCategoryId?.message}
                              isDisabled={availableSubCategories.length === 0}
                              placeholder={availableSubCategories.length === 0 ? "Select category first" : "Choose Sub-Category"}
                            >
                              {(sc: SelectOption) => <SelectItem key={sc.key}>{sc.label}</SelectItem>}
                            </Select>
                          </div>
                        )}
                      />
                    </div>

                    <Controller
                      name="subjectTitle"
                      control={subjectControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Granular Subject Matter / Issue (Tier 3) <span className="text-red-500">*</span>
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
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  form={activeTab === "categories" ? "cat-form" : activeTab === "sub_categories" ? "subcat-form" : "subject-form"}
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                >
                  Save Record
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 4. Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} placement="center" size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">warning</span>
                Confirm Deletion
              </ModalHeader>
              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove <b>{itemToDelete?.name}</b>?
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  onClick={handleConfirmDelete}
                  isLoading={isSubmitting}
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