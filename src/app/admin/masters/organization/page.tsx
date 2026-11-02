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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { MastersAPI } from "@/api/mastersApi";
import { departmentSchema } from "@/schemas/masterSchema";
import { IDepartmentItem } from "@/types/master.types";
import { z } from "zod";

type DepartmentFormValues = z.infer<typeof departmentSchema>;

const PARENT_FORMATIONS = [
  { key: "State Police Headquarter", label: "State Police Headquarter" },
  { key: "Recruitment Board", label: "Recruitment Board" },
  { key: "Vigilance Wing", label: "Vigilance Wing" },
  { key: "Director General Office", label: "Director General Office" },
  { key: "Special Wing", label: "Special Wing" },
];

const PARENT_FORMATION_FILTER_ITEMS = [
  { key: "ALL", label: "All Parent Formations" },
  ...PARENT_FORMATIONS,
];

export default function OrganizationMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [departments, setDepartments] = useState<IDepartmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParentFilter, setSelectedParentFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [editingDept, setEditingDept] = useState<IDepartmentItem | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<IDepartmentItem | null>(null);

  // 1. Add Form
  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema) as any,
    defaultValues: {
      unitName: "",
      unitCode: "",
      parentFormation: "State Police Headquarter",
      headquarters: "Lucknow",
    },
  });

  // 2. Edit Form
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema) as any,
    defaultValues: {
      unitName: "",
      unitCode: "",
      parentFormation: "State Police Headquarter",
      headquarters: "Lucknow",
    },
  });

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MastersAPI.getDepartments({
        limit: 100,
        parentFormation: selectedParentFilter !== "ALL" ? selectedParentFilter : undefined,
      });
      if (res?.success) {
        setDepartments(res.data || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load departments list");
    } finally {
      setLoading(false);
    }
  }, [selectedParentFilter]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleOpenAdd = () => {
    resetAddForm({
      unitName: "",
      unitCode: "",
      parentFormation: "State Police Headquarter",
      headquarters: "Lucknow",
    });
    onAddOpen();
  };

  const onAddDepartment = async (values: DepartmentFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        unitName: values.unitName.trim(),
        unitCode: values.unitCode.trim().toUpperCase(),
        parentFormation: values.parentFormation,
        headquarters: values.headquarters?.trim() || "Lucknow",
      };

      const res = await MastersAPI.createDepartment(payload);
      if (res?.success) {
        toast.success(`Department ${payload.unitCode} added successfully!`);
        onAddOpenChange();
        fetchDepartments();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to register department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (item: IDepartmentItem) => {
    setEditingDept(item);
    resetEditForm({
      unitName: item.unitName,
      unitCode: item.unitCode,
      parentFormation: item.parentFormation || "State Police Headquarter",
      headquarters: item.headquarters || "Lucknow",
    });
    onEditOpen();
  };

  const onSaveEdit = async (values: DepartmentFormValues) => {
    if (!editingDept) return;
    setIsSubmitting(true);
    try {
      const payload = {
        _id: editingDept._id,
        unitName: values.unitName.trim(),
        unitCode: values.unitCode.trim().toUpperCase(),
        parentFormation: values.parentFormation,
        headquarters: values.headquarters?.trim() || "Lucknow",
      };

      await MastersAPI.createDepartment(payload);
      toast.success(`Updated ${payload.unitCode}`);
      onEditOpenChange();
      setEditingDept(null);
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (item: IDepartmentItem) => {
    setDeptToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;
    setIsSubmitting(true);
    try {
      setDepartments((prev) => prev.filter((d) => d._id !== deptToDelete._id));
      toast.success(`Unit ${deptToDelete.unitCode} removed.`);
      onDeleteOpenChange();
      setDeptToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter((item) => {
      const matchesSearch =
        item.unitName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.unitCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.parentFormation?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesParent =
        selectedParentFilter === "ALL" || item.parentFormation === selectedParentFilter;

      return matchesSearch && matchesParent;
    });
  }, [departments, searchQuery, selectedParentFilter]);

  const totalPages = Math.ceil(filteredDepartments.length / rowsPerPage) || 1;
  const paginatedDepartments = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredDepartments.slice(start, start + rowsPerPage);
  }, [filteredDepartments, page, rowsPerPage]);

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
                  7.2 Department & Institutional Units Master
                </h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  {departments.length} Units Active
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Institutional directorates, police wings, sections & internal administrative units
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={handleOpenAdd}
            >
              Add Department Unit
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search by unit name or code..."
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
              aria-label="Filter by Parent Formation"
              placeholder="Filter by Parent Formation"
              items={PARENT_FORMATION_FILTER_ITEMS}
              selectedKeys={[selectedParentFilter]}
              onChange={(e) => {
                setSelectedParentFilter(e.target.value || "ALL");
                setPage(1);
              }}
              className="bg-slate-50 font-semibold"
            >
              {(parent) => <SelectItem key={parent.key}>{parent.label}</SelectItem>}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Rules Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="Department Master Table"
            className="min-w-full"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Showing {(page - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(page * rowsPerPage, filteredDepartments.length)} of {filteredDepartments.length}
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
                DEPARTMENT / UNIT NAME
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                UNIT CODE
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PARENT FORMATION
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                HEADQUARTERS
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                LINKED WRITS
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                ACTION
              </TableColumn>
            </TableHeader>
            <TableBody
              items={paginatedDepartments}
              emptyContent={
                loading ? (
                  <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                    <Spinner size="sm" /> Loading institutional units...
                  </div>
                ) : (
                  "No institutional units match your search."
                )
              }
            >
              {(item) => {
                const itemIndex = (page - 1) * rowsPerPage + paginatedDepartments.indexOf(item) + 1;
                return (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-bold text-slate-400">{itemIndex}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-900">{item.unitName}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-blue-700">
                      {item.unitCode}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{item.parentFormation}</TableCell>
                    <TableCell className="text-xs text-slate-500">{item.headquarters || "Lucknow"}</TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="primary" className="text-[10px] font-bold">
                        {item.activeWritsCount || 0} Writs
                      </Chip>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-slate-400 hover:text-slate-700"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <span className="material-symbols-rounded text-sm">edit</span>
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-slate-400 hover:text-rose-600"
                          onClick={() => handleOpenDelete(item)}
                        >
                          <span className="material-symbols-rounded text-sm">delete</span>
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

      {/* MODAL 1: Add Department Modal */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAddSubmit(onAddDepartment)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">corporate_fare</span>
                Add Institutional Department Unit
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Controller
                  name="unitName"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Department / Unit Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Special Task Force (STF)"
                        isInvalid={!!addErrors.unitName}
                        errorMessage={addErrors.unitName?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="unitCode"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Unit Short Code <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. STF"
                        isInvalid={!!addErrors.unitCode}
                        errorMessage={addErrors.unitCode?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="parentFormation"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Parent Formation <span className="text-red-500">*</span>
                      </label>
                      <Select
                        size="sm"
                        items={PARENT_FORMATIONS}
                        selectedKeys={[field.value]}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!addErrors.parentFormation}
                        errorMessage={addErrors.parentFormation?.message}
                      >
                        {(parent) => <SelectItem key={parent.key}>{parent.label}</SelectItem>}
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="headquarters"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Headquarters
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Lucknow"
                        isInvalid={!!addErrors.headquarters}
                        errorMessage={addErrors.headquarters?.message}
                      />
                    </div>
                  )}
                />
              </ModalBody>
              <ModalFooter>
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
                  Save Department
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: Edit Department Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleEditSubmit(onSaveEdit)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit</span>
                Edit Department: {editingDept?.unitCode}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Controller
                  name="unitName"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Department Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.unitName}
                        errorMessage={editErrors.unitName?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="unitCode"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Unit Code <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.unitCode}
                        errorMessage={editErrors.unitCode?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="parentFormation"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Parent Formation <span className="text-red-500">*</span>
                      </label>
                      <Select
                        size="sm"
                        items={PARENT_FORMATIONS}
                        selectedKeys={[field.value]}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!editErrors.parentFormation}
                        errorMessage={editErrors.parentFormation?.message}
                      >
                        {(parent) => <SelectItem key={parent.key}>{parent.label}</SelectItem>}
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="headquarters"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Headquarters
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.headquarters}
                        errorMessage={editErrors.headquarters?.message}
                      />
                    </div>
                  )}
                />
              </ModalBody>
              <ModalFooter>
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
                  Save Changes
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 3: Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} placement="center" size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">warning</span>
                Confirm Deletion
              </ModalHeader>
              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove <b>{deptToDelete?.unitName}</b> ({deptToDelete?.unitCode})?
                {(deptToDelete?.activeWritsCount || 0) > 0 && (
                  <p className="mt-2 text-rose-600 font-semibold">
                    Warning: There are {deptToDelete?.activeWritsCount} active writ petitions currently linked to this unit.
                  </p>
                )}
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
                  Delete Unit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}