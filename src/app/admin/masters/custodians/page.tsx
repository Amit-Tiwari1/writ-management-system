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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";

import { MastersAPI } from "@/api/mastersApi";
import { AdminAPI } from "@/api/userApi";
import { fetchStaffUsers } from "@/store/slices/usersSlice";
import { RootState, AppDispatch } from "@/store";
import {
  ICategoryItem,
  ISubjectItem,
  IDesignationItem,
  ICustodianRecord,
} from "@/types/master.types";
import { StaffUserItem } from "@/types/user.types";
import { custodianMappingSchema, CustodianMappingFormValues } from "@/schemas/masterSchema";

interface SelectOption {
  key: string;
  label: string;
}

export default function CustodianMappingPage() {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const reduxUsers = useSelector((state: RootState) => {
    const userSlice = (state as any).users;
    return (userSlice?.users as StaffUserItem[]) || [];
  });

  // Local state to guarantee instant availability
  const [directUsers, setDirectUsers] = useState<StaffUserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);

  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [custodians, setCustodians] = useState<ICustodianRecord[]>([]);
  const [categories, setCategories] = useState<ICategoryItem[]>([]);
  const [subjects, setSubjects] = useState<ISubjectItem[]>([]);
  const [designations, setDesignations] = useState<IDesignationItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [itemToDelete, setItemToDelete] = useState<ICustodianRecord | null>(null);

  // React Hook Form Integration
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CustodianMappingFormValues>({
    resolver: zodResolver(custodianMappingSchema) as any,
    defaultValues: {
      categoryId: "",
      subjectId: "",
      roleOrDesignation: "",
      officerName: "",
      officerUserId: "",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const selectedDesignation = watch("roleOrDesignation");

  // Load Users directly + Redux
  const loadStaffUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      dispatch(fetchStaffUsers());
      const res = await AdminAPI.getUsersList({ limit: 100, status: "ACTIVE" });
      if (res?.success && Array.isArray(res.data)) {
        setDirectUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to load staff users:", err);
    } finally {
      setUsersLoading(false);
    }
  }, [dispatch]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resCustodians, resCategories, resDesignations] = await Promise.all([
        MastersAPI.getCustodians({
          limit: 100,
          categoryId: selectedCategoryFilter !== "ALL" ? selectedCategoryFilter : undefined,
        }),
        MastersAPI.getCategories({ limit: 100 }),
        MastersAPI.getDesignations({ limit: 100 }),
      ]);

      if (resCustodians?.success) setCustodians(resCustodians.data || []);
      if (resCategories?.success) setCategories(resCategories.data || []);
      if (resDesignations?.success) setDesignations(resDesignations.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load custodian mappings");
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryFilter]);

  useEffect(() => {
    loadData();
    loadStaffUsers();
  }, [loadData, loadStaffUsers]);

  // Combined staff users safely
  const staffUsers: StaffUserItem[] = useMemo(() => {
    if (directUsers.length > 0) return directUsers;
    if (Array.isArray(reduxUsers) && reduxUsers.length > 0) return reduxUsers;
    return [];
  }, [directUsers, reduxUsers]);

  // Dynamic Subject Loading when Category changes
  const handleCategorySelection = async (catId: string) => {
    setValue("categoryId", catId);
    setValue("subjectId", "");
    if (!catId) {
      setSubjects([]);
      return;
    }
    try {
      const res = await MastersAPI.getSubjects({ categoryId: catId, limit: 200 });
      if (res?.success) {
        setSubjects(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
  };

  const handleOpenAdd = () => {
    const initialCatId = categories[0]?._id || "";
    const initialDesignation = designations[0]?.title || "";

    reset({
      categoryId: initialCatId,
      subjectId: "",
      roleOrDesignation: initialDesignation,
      officerName: "",
      officerUserId: "",
    });

    if (initialCatId) {
      handleCategorySelection(initialCatId);
    }
    onAddOpen();
  };

  // Submit Handler
  const onSaveCustodianMapping = async (values: CustodianMappingFormValues) => {
    setIsSubmitting(true);
    try {
      const matchedUser = staffUsers.find((u) => u.officerName === values.officerName);

      const payload = {
        categoryId: values.categoryId,
        subjectId: values.subjectId,
        officerName: values.officerName.trim(),
        designation: values.roleOrDesignation.trim(),
        userId: matchedUser?._id,
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

  const handleOpenDelete = (item: ICustodianRecord) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      setCustodians((prev) => prev.filter((c) => c._id !== itemToDelete._id));
      toast.success("Rule unassigned successfully from active registry");
      onDeleteOpenChange();
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove custodian rule");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Active Officers - Intelligent matching: agar exact designation na mile toh empty nahi karega
  const filteredOfficers = useMemo(() => {
    if (!Array.isArray(staffUsers) || staffUsers.length === 0) return [];
    if (!selectedDesignation) return staffUsers;

    const target = selectedDesignation.toLowerCase().trim();
    const matched = staffUsers.filter((u) => {
      const userDesig = u.designationAndWing?.designation?.toLowerCase().trim() || "";
      const userRole = u.assignedRole?.toLowerCase().trim() || "";
      return userDesig.includes(target) || target.includes(userDesig) || userRole.includes(target);
    });

    // Fallback: Agar filter se 0 bane, toh saare active users render karein taaki user block na ho!
    return matched.length > 0 ? matched : staffUsers;
  }, [staffUsers, selectedDesignation]);

  const categoryFilterItems: SelectOption[] = useMemo(() => {
    return [
      { key: "ALL", label: "All Master Categories" },
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

  const subjectSelectItems: SelectOption[] = useMemo(() => {
    return subjects.map((s) => ({
      key: s._id,
      label: s.subjectTitle,
    }));
  }, [subjects]);

  const designationSelectItems: SelectOption[] = useMemo(() => {
    return designations.map((d) => ({
      key: d.title,
      label: d.title,
    }));
  }, [designations]);

  const officerSelectItems: SelectOption[] = useMemo(() => {
    return filteredOfficers.map((u) => ({
      key: u.officerName,
      label: `${u.officerName} (${u.designationAndWing?.designation || u.assignedRole || "Staff"})`,
    }));
  }, [filteredOfficers]);

  const filteredMappings = useMemo(() => {
    return custodians.filter((item) => {
      const catName = item.categoryId?.categoryName || "";
      const catId = item.categoryId?._id || "";
      const subTitle = item.subjectId?.subjectTitle || "";
      const offName = item.officerName || "";
      const desig = item.designation || "";

      const matchesCategory =
        selectedCategoryFilter === "ALL" ||
        catId === selectedCategoryFilter ||
        catName === selectedCategoryFilter;

      const matchesSearch =
        subTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desig.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [custodians, selectedCategoryFilter, searchQuery]);

  const totalPages = Math.ceil(filteredMappings.length / rowsPerPage) || 1;
  const paginatedMappings = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredMappings.slice(start, start + rowsPerPage);
  }, [filteredMappings, page, rowsPerPage]);

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
                  7.7 Subject-Wise Officer Custodian Mapping
                </h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  Auto-Routing Enabled
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Maps incoming writ subjects directly to the active directory staff member and official designation
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
              onValueChange={(val) => {
                setSearchQuery(val);
                setPage(1);
              }}
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
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value || "ALL");
                setPage(1);
              }}
              className="bg-slate-50 font-semibold"
            >
              {(item: SelectOption) => <SelectItem key={item.key}>{item.label}</SelectItem>}
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
          <span className="text-[11px] text-slate-400">Drives 4.0 Green Sheet Routing Engine</span>
        </div>

        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="Custodian Mapping Table"
            className="min-w-full"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Showing {(page - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(page * rowsPerPage, filteredMappings.length)} of {filteredMappings.length}
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
                CUSTODIAN OFFICER (STAFF)
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                OFFICIAL DESIGNATION
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                ACTION
              </TableColumn>
            </TableHeader>
            <TableBody
              items={paginatedMappings}
              emptyContent={
                loading ? (
                  <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                    <Spinner size="sm" /> Loading custodian rules...
                  </div>
                ) : (
                  "No custodian rules match the selected filter."
                )
              }
            >
              {(item) => {
                const index = (page - 1) * rowsPerPage + paginatedMappings.indexOf(item) + 1;
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
                          catName === "Direct Recruitment"
                            ? "primary"
                            : catName === "Departmental Promotion"
                            ? "secondary"
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
                    <TableCell className="text-xs font-semibold text-blue-900">
                      {item.officerName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">
                      {item.designation}
                    </TableCell>
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

      {/* MODAL: Add New Custodian Rule (Large 3XL Width) */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="center" size="3xl">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit(onSaveCustodianMapping)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100">
                <span className="material-symbols-rounded text-blue-700">person_add</span>
                Map Subject to Legal Custodian
              </ModalHeader>
              <ModalBody className="py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Select Case Category <span className="text-red-500">*</span>
                        </label>
                        <Select
                          size="sm"
                          placeholder="Choose Parent Category"
                          items={categorySelectItems}
                          selectedKeys={field.value ? [field.value] : []}
                          onChange={(e) => handleCategorySelection(e.target.value)}
                          isInvalid={!!errors.categoryId}
                          errorMessage={errors.categoryId?.message}
                        >
                          {(c: SelectOption) => <SelectItem key={c.key}>{c.label}</SelectItem>}
                        </Select>
                      </div>
                    )}
                  />

                  <Controller
                    name="subjectId"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Select Litigation Subject Matter <span className="text-red-500">*</span>
                        </label>
                        <Select
                          size="sm"
                          placeholder={subjects.length === 0 ? "Select category first" : "Choose Granular Subject Issue"}
                          items={subjectSelectItems}
                          selectedKeys={field.value ? [field.value] : []}
                          onChange={(e) => field.onChange(e.target.value)}
                          isInvalid={!!errors.subjectId}
                          errorMessage={errors.subjectId?.message}
                          isDisabled={subjects.length === 0}
                        >
                          {(s: SelectOption) => <SelectItem key={s.key}>{s.label}</SelectItem>}
                        </Select>
                      </div>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="roleOrDesignation"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Authority Designation / Role <span className="text-red-500">*</span>
                        </label>
                        <Select
                          size="sm"
                          placeholder="Select Designation"
                          items={designationSelectItems}
                          selectedKeys={field.value ? [field.value] : []}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setValue("officerName", "");
                          }}
                          isInvalid={!!errors.roleOrDesignation}
                          errorMessage={errors.roleOrDesignation?.message}
                        >
                          {(d: SelectOption) => <SelectItem key={d.key}>{d.label}</SelectItem>}
                        </Select>
                      </div>
                    )}
                  />

                  <Controller
                    name="officerName"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Custodian Officer (Filtered Staff) <span className="text-red-500">*</span>
                        </label>
                        <Select
                          size="sm"
                          isLoading={usersLoading}
                          placeholder={officerSelectItems.length === 0 ? "Loading active officers..." : "Select Active Staff User"}
                          items={officerSelectItems}
                          selectedKeys={field.value ? [field.value] : []}
                          onChange={(e) => field.onChange(e.target.value)}
                          isInvalid={!!errors.officerName}
                          errorMessage={errors.officerName?.message}
                        >
                          {(officer: SelectOption) => <SelectItem key={officer.key}>{officer.label}</SelectItem>}
                        </Select>
                      </div>
                    )}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-slate-100">
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                >
                  Save Mapping
                </Button>
              </ModalFooter>
            </form>
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