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

interface CustodianRecord {
  _id: string;
  categoryId?: {
    _id: string;
    categoryName: string;
  };
  subjectId?: {
    _id: string;
    subjectTitle: string;
  };
  officerName: string;
  designation: string;
  createdAt?: string;
}

interface CategoryOption {
  _id: string;
  categoryName: string;
}

interface SubjectOption {
  _id: string;
  subjectTitle: string;
}

const DESIGNATION_OPTIONS = [
  { key: "Superintendent of Police (Legal)", label: "Superintendent of Police (Legal)" },
  { key: "Deputy SP (Legal)", label: "Deputy SP (Legal)" },
  { key: "Dy.SP (Promotion)", label: "Dy.SP (Promotion)" },
  { key: "Senior Prosecuting Officer", label: "Senior Prosecuting Officer" },
  { key: "Senior Accounts Officer", label: "Senior Accounts Officer" },
  { key: "Inspector / SPO", label: "Inspector / SPO" },
];

export default function CustodianMappingPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [custodians, setCustodians] = useState<CustodianRecord[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    categoryId: "",
    subjectId: "",
    officerName: "",
    designation: "Superintendent of Police (Legal)",
  });

  const [itemToDelete, setItemToDelete] = useState<CustodianRecord | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resCustodians, resCategories] = await Promise.all([
        MastersAPI.getCustodians(),
        MastersAPI.getCategories(),
      ]);

      if (resCustodians?.success) {
        setCustodians(resCustodians.data || []);
      }
      if (resCategories?.success) {
        setCategories(resCategories.data || []);
      }
    } catch (err: any) {
      console.error("[CustodiansMaster] Error loading data:", err);
      toast.error(err.response?.data?.message || "Failed to load custodian mappings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategoryChange = async (categoryId: string) => {
    setFormData((prev) => ({ ...prev, categoryId, subjectId: "" }));
    if (!categoryId) {
      setSubjects([]);
      return;
    }
    try {
      const res = await MastersAPI.getSubjects({ categoryId });
      if (res?.success) {
        setSubjects(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load subjects:", err);
    }
  };

  const handleOpenAdd = () => {
    const initialCatId = categories[0]?._id || "";
    setFormData({
      categoryId: initialCatId,
      subjectId: "",
      officerName: "",
      designation: "Superintendent of Police (Legal)",
    });
    if (initialCatId) {
      handleCategoryChange(initialCatId);
    }
    onAddOpen();
  };

  const handleAdd = async () => {
    if (!formData.categoryId || !formData.subjectId || !formData.officerName.trim()) {
      toast.error("Please select Category, Subject, and enter Officer Name");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        categoryId: formData.categoryId,
        subjectId: formData.subjectId,
        officerName: formData.officerName.trim(),
        designation: formData.designation,
      };

      const res = await MastersAPI.createCustodian(payload);
      if (res?.success) {
        toast.success("Subject-Custodian rule mapped successfully!");
        onAddOpenChange();
        loadData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save custodian rule");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (item: CustodianRecord) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    toast.success("Rule unassigned successfully");
    onDeleteOpenChange();
    setItemToDelete(null);
  };

  const categoryFilterItems = useMemo(() => {
    return [
      { key: "ALL", label: "All Categories" },
      ...categories.map((c) => ({
        key: c.categoryName,
        label: c.categoryName,
      })),
    ];
  }, [categories]);

  const filteredMappings = useMemo(() => {
    return custodians.filter((item) => {
      const catName = item.categoryId?.categoryName || "";
      const subTitle = item.subjectId?.subjectTitle || "";
      const offName = item.officerName || "";
      const desig = item.designation || "";

      const matchesCategory =
        selectedCategoryFilter === "ALL" || catName === selectedCategoryFilter;

      const matchesSearch =
        subTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desig.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [custodians, selectedCategoryFilter, searchQuery]);

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
                  6.7 Subject-Wise Officer Custodian Mapping
                </h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  Automated Assignment
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Maps incoming writ subjects directly to the designated officer and administrative designation
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={handleOpenAdd}
            >
              Assign New Custodian
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search subject, custodian officer or designation..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50 sm:col-span-2"
            />
            <Select
              size="sm"
              radius="sm"
              aria-label="Filter by Category"
              placeholder="Filter by Category"
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

      {/* 2. Main Mappings Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Subject-Officer Bindings ({filteredMappings.length} Rules)
          </h3>
          <span className="text-[11px] text-slate-400">Auto-routes incoming matters on Case Intake</span>
        </div>

        <CardBody className="p-0">
          <Table removeWrapper aria-label="Custodian Mapping Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                S.NO
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CATEGORY
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                LITIGATION SUBJECT MATTER
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                OFFICIAL DESIGNATION
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CUSTODIAN OFFICER NAME
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                ACTION
              </TableColumn>
            </TableHeader>
            <TableBody
              items={filteredMappings}
              isLoading={loading}
              loadingContent={
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              }
              emptyContent={!loading ? "No custodian rules match the selected filter." : " "}
            >
              {(item) => {
                const index = custodians.findIndex((c) => c._id === item._id) + 1;
                const catName = item.categoryId?.categoryName || "--";
                const subTitle = item.subjectId?.subjectTitle || "--";

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
                    <TableCell className="text-xs font-bold text-slate-900 max-w-[280px]">
                      {subTitle}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-blue-700">
                      {item.designation}
                    </TableCell>
                    <TableCell className="text-xs text-slate-800 font-medium">
                      {item.officerName}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-400 hover:text-rose-600"
                        onClick={() => handleOpenDelete(item)}
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

      {/* MODAL: Add New Custodian Rule */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">person_add</span>
                Map Subject to Legal Custodian
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Select
                  size="sm"
                  label="Select Case Category"
                  items={categories}
                  selectedKeys={formData.categoryId ? [formData.categoryId] : []}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  isRequired
                >
                  {(c) => <SelectItem key={c._id}>{c.categoryName}</SelectItem>}
                </Select>

                <Select
                  size="sm"
                  label="Select Litigation Subject Matter"
                  items={subjects}
                  selectedKeys={formData.subjectId ? [formData.subjectId] : []}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  isRequired
                  isDisabled={subjects.length === 0}
                >
                  {(s) => <SelectItem key={s._id}>{s.subjectTitle}</SelectItem>}
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    size="sm"
                    label="Custodian Designation"
                    items={DESIGNATION_OPTIONS}
                    selectedKeys={[formData.designation]}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    isRequired
                  >
                    {(d) => <SelectItem key={d.key}>{d.label}</SelectItem>}
                  </Select>

                  <Input
                    size="sm"
                    label="Custodian Officer Name"
                    placeholder="e.g. Swahleen Ahmad (SI)"
                    value={formData.officerName}
                    onValueChange={(v) => setFormData({ ...formData, officerName: v })}
                    isRequired
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                  onClick={handleAdd}
                >
                  Save Mapping
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
                Are you sure you want to remove the custodian rule for{" "}
                <b>{itemToDelete?.subjectId?.subjectTitle || "this subject"}</b>? Newly registered petitions on this issue will not be auto-routed.
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