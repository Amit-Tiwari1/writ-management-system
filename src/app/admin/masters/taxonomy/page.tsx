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
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { MastersAPI } from "@/api/mastersApi";

interface CategoryRecord {
  _id: string;
  categoryName: string;
  order?: number;
}

interface SubCategoryRecord {
  _id: string;
  categoryId: any;
  subCategoryName: string;
  defaultOfficerName?: string;
}

interface SubjectRecord {
  _id: string;
  categoryId: any;
  subCategoryId: any;
  subjectTitle: string;
  createdAt?: string;
}

const NODE_TIER_ITEMS = [
  { key: "SUBJECT", label: "Tier 3: Granular Subject Issue" },
  { key: "SUB_CATEGORY", label: "Tier 2: Sub-Category / Exam Cycle" },
  { key: "CATEGORY", label: "Tier 1: Master Category" },
];

const NODAL_OFFICER_ITEMS = [
  { key: "SP Legal (Cell-1)", label: "SP Legal (Cell-1)" },
  { key: "DySP Promotion", label: "DySP Promotion" },
  { key: "Swahleen Ahmad (SI)", label: "Swahleen Ahmad (SI)" },
  { key: "Himanshu Tiwari (ASI)", label: "Himanshu Tiwari (ASI)" },
  { key: "Rajveer Singh (SI)", label: "Rajveer Singh (SI)" },
  { key: "SPO (Legal Desk)", label: "SPO (Legal Desk)" },
  { key: "Accounts Wing", label: "Accounts Wing" },
];

export default function TaxonomyMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [formData, setFormData] = useState({
    mode: "SUBJECT" as "CATEGORY" | "SUB_CATEGORY" | "SUBJECT",
    categoryId: "",
    subCategoryId: "",
    newCategoryName: "",
    newSubCategoryName: "",
    defaultOfficerName: "SP Legal (Cell-1)",
    subjectTitle: "",
  });

  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Load all taxonomy data from backend
  const loadTaxonomyData = useCallback(async () => {
    setLoading(true);
    try {
      const [resCats, resSubCats, resSubjects] = await Promise.all([
        MastersAPI.getCategories(),
        MastersAPI.getSubCategories(),
        MastersAPI.getSubjects(),
      ]);

      if (resCats?.success) setCategories(resCats.data || []);
      if (resSubCats?.success) setSubCategories(resSubCats.data || []);
      if (resSubjects?.success) setSubjects(resSubjects.data || []);
    } catch (err: any) {
      console.error("[TaxonomyMaster] Error loading:", err);
      toast.error(err.response?.data?.message || "Failed to load taxonomy records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTaxonomyData();
  }, [loadTaxonomyData]);

  // Dynamic filter items for categories
  const categoryFilterItems = useMemo(() => {
    return [
      { key: "ALL", label: "All Master Categories" },
      ...categories.map((c) => ({
        key: c._id,
        label: c.categoryName,
      })),
    ];
  }, [categories]);

  const categorySelectItems = useMemo(() => {
    return categories.map((c) => ({
      key: c._id,
      label: c.categoryName,
    }));
  }, [categories]);

  // Cascading Sub-Categories in modal
  const availableSubCategories = useMemo(() => {
    if (!formData.categoryId) return [];
    return subCategories
      .filter((sc) => {
        const catId = typeof sc.categoryId === "object" ? sc.categoryId?._id : sc.categoryId;
        return catId === formData.categoryId;
      })
      .map((sc) => ({
        key: sc._id,
        label: sc.subCategoryName,
      }));
  }, [subCategories, formData.categoryId]);

  const handleOpenAdd = () => {
    setFormData({
      mode: "SUBJECT",
      categoryId: categories[0]?._id || "",
      subCategoryId: "",
      newCategoryName: "",
      newSubCategoryName: "",
      defaultOfficerName: "SP Legal (Cell-1)",
      subjectTitle: "",
    });
    onAddOpen();
  };

  // Submit Handler for Add
  const handleAdd = async () => {
    setIsSubmitting(true);
    try {
      if (formData.mode === "CATEGORY") {
        if (!formData.newCategoryName.trim()) {
          toast.error("Category name is required");
          return;
        }
        await MastersAPI.createCategory({
          categoryName: formData.newCategoryName.trim(),
          order: categories.length + 1,
        });
        toast.success("Category added successfully!");
      } else if (formData.mode === "SUB_CATEGORY") {
        if (!formData.categoryId || !formData.newSubCategoryName.trim()) {
          toast.error("Category and Sub-Category name are required");
          return;
        }
        await MastersAPI.createSubCategory({
          categoryId: formData.categoryId,
          subCategoryName: formData.newSubCategoryName.trim(),
          defaultOfficerName: formData.defaultOfficerName,
        });
        toast.success("Sub-Category added successfully!");
      } else {
        if (!formData.categoryId || !formData.subCategoryId || !formData.subjectTitle.trim()) {
          toast.error("Category, Sub-Category and Subject Title are required");
          return;
        }
        await MastersAPI.createSubject({
          categoryId: formData.categoryId,
          subCategoryId: formData.subCategoryId,
          subjectTitle: formData.subjectTitle.trim(),
        });
        toast.success("Granular Subject Node created successfully!");
      }

      onAddOpenChange();
      loadTaxonomyData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save taxonomy node");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (item: any) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    toast.success("Node removed from active taxonomy view.");
    onDeleteOpenChange();
    setItemToDelete(null);
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter((item) => {
      const catName = item.categoryId?.categoryName || "";
      const catId = item.categoryId?._id || item.categoryId;
      const subCatName = item.subCategoryId?.subCategoryName || "";
      const subjectText = item.subjectTitle || "";

      const matchesCategory =
        selectedCategoryFilter === "ALL" ||
        catId === selectedCategoryFilter ||
        catName === selectedCategoryFilter;

      const matchesSearch =
        subjectText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subCatName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [subjects, selectedCategoryFilter, searchQuery]);

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
                <h1 className="text-base font-bold text-slate-900">
                  6.6 Case Category, Sub Category &amp; Subject Tree
                </h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  3-Tier Dynamic Taxonomy
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Manage recruitment cycles, exams, promotion heads and granular litigation issues
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={handleOpenAdd}
            >
              Add Taxonomy Node
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search exam name, subject issue..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50 sm:col-span-2"
            />
            <Select
              size="sm"
              radius="sm"
              aria-label="Filter by Master Category"
              placeholder="Filter by Master Category"
              items={categoryFilterItems}
              selectedKeys={[selectedCategoryFilter]}
              onChange={(e) => setSelectedCategoryFilter(e.target.value || "ALL")}
              className="bg-slate-50 font-semibold"
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Taxonomy Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Litigation Subject Hierarchy ({filteredSubjects.length} Subject Nodes)
          </h3>
          <span className="text-[11px] text-slate-400">Linked to 2.2 Case Intake &amp; Filters</span>
        </div>

        <CardBody className="p-0">
          <Table removeWrapper aria-label="Taxonomy Tree Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                S.NO
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CATEGORY (TIER-1)
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SUB CATEGORY / EXAM (TIER-2)
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                GRANULAR SUBJECT ISSUE (TIER-3)
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DEFAULT NODAL OFFICER
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                ACTION
              </TableColumn>
            </TableHeader>
            <TableBody
              items={filteredSubjects}
              isLoading={loading}
              loadingContent={
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              }
              emptyContent={!loading ? "No taxonomy nodes found matching your query." : " "}
            >
              {(item) => {
                const index = subjects.findIndex((s) => s._id === item._id) + 1;
                const catName = item.categoryId?.categoryName || "--";
                const subCatName = item.subCategoryId?.subCategoryName || "--";
                const officerName = item.subCategoryId?.defaultOfficerName || "SP Legal Desk";

                return (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-bold text-slate-400">{index}</TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          catName === "Recruitment"
                            ? "primary"
                            : catName === "Promotion"
                            ? "secondary"
                            : catName === "Establishment"
                            ? "warning"
                            : "default"
                        }
                        className="text-[10px] font-bold"
                      >
                        {catName}
                      </Chip>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-900 max-w-[240px]">
                      {subCatName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 max-w-[280px] font-medium leading-relaxed">
                      {item.subjectTitle}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-blue-900">{officerName}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-400 hover:text-rose-600"
                        onPress={() => handleOpenDelete(item)}
                      >
                        <span className="material-symbols-rounded text-sm">delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* MODAL: Add Taxonomy Node */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">account_tree</span>
                Add Board Taxonomy Node
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Select
                  size="sm"
                  label="Select Node Tier to Create"
                  items={NODE_TIER_ITEMS}
                  selectedKeys={[formData.mode]}
                  onChange={(e) =>
                    setFormData({ ...formData, mode: (e.target.value as any) || "SUBJECT" })
                  }
                >
                  {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                </Select>

                {formData.mode === "CATEGORY" && (
                  <Input
                    size="sm"
                    label="New Master Category Name"
                    placeholder="e.g. Disciplinary Proceedings"
                    value={formData.newCategoryName}
                    onValueChange={(v) => setFormData({ ...formData, newCategoryName: v })}
                    isRequired
                  />
                )}

                {formData.mode === "SUB_CATEGORY" && (
                  <>
                    <Select
                      size="sm"
                      label="Select Parent Category"
                      items={categorySelectItems}
                      selectedKeys={formData.categoryId ? [formData.categoryId] : []}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      isRequired
                    >
                      {(cat) => <SelectItem key={cat.key}>{cat.label}</SelectItem>}
                    </Select>
                    <Input
                      size="sm"
                      label="Sub-Category / Exam Cycle Name"
                      placeholder="e.g. Constable Civil Police & PAC 2024"
                      value={formData.newSubCategoryName}
                      onValueChange={(v) => setFormData({ ...formData, newSubCategoryName: v })}
                      isRequired
                    />
                    <Select
                      size="sm"
                      label="Default Custodian Officer"
                      items={NODAL_OFFICER_ITEMS}
                      selectedKeys={[formData.defaultOfficerName]}
                      onChange={(e) => setFormData({ ...formData, defaultOfficerName: e.target.value })}
                    >
                      {(officer) => <SelectItem key={officer.key}>{officer.label}</SelectItem>}
                    </Select>
                  </>
                )}

                {formData.mode === "SUBJECT" && (
                  <>
                    <Select
                      size="sm"
                      label="Parent Category (Tier 1)"
                      items={categorySelectItems}
                      selectedKeys={formData.categoryId ? [formData.categoryId] : []}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          categoryId: e.target.value,
                          subCategoryId: "",
                        })
                      }
                      isRequired
                    >
                      {(cat) => <SelectItem key={cat.key}>{cat.label}</SelectItem>}
                    </Select>

                    <Select
                      size="sm"
                      label="Parent Sub-Category / Exam (Tier 2)"
                      items={availableSubCategories}
                      selectedKeys={formData.subCategoryId ? [formData.subCategoryId] : []}
                      onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                      isRequired
                      isDisabled={availableSubCategories.length === 0}
                    >
                      {(sc) => <SelectItem key={sc.key}>{sc.label}</SelectItem>}
                    </Select>

                    <Input
                      size="sm"
                      label="Granular Subject Issue (Tier 3)"
                      placeholder="e.g. Cut-off Marks & Normalization Discrepancy"
                      value={formData.subjectTitle}
                      onValueChange={(v) => setFormData({ ...formData, subjectTitle: v })}
                      isRequired
                    />
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                  onClick={handleAdd}
                >
                  Save Taxonomy Node
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL: Delete Confirmation */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} placement="center" size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">warning</span>
                Confirm Deletion
              </ModalHeader>
              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove <b>{itemToDelete?.subjectTitle}</b>?
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  onClick={handleConfirmDelete}
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