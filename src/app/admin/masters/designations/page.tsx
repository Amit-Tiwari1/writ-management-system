"use client";

import React, { useEffect, useState } from "react";
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
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/store";
import { designationSchema } from "@/schemas/masterSchema";
import type { IDesignationItem } from "@/types/master.types";

import {
  fetchDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "@/store/thunks/masterThunks/designationThunk";

import {
  clearDesignationMutationMessages,
} from "@/store/slices/masterSlice/designationsSlice";

import { designationColumns } from "@/app/admin/components/columns/DesignationColumns";

type DesignationFormValues = z.infer<typeof designationSchema>;

const AUTHORITY_TIERS = [
  { key: "Apex Board Authority", label: "Apex Board Authority" },
  { key: "Senior Administrative", label: "Senior Administrative" },
  { key: "Head of Legal Cell", label: "Head of Legal Cell" },
  { key: "Wing Head", label: "Wing Head" },
  { key: "Division Head", label: "Division Head" },
  { key: "Judicial Advisory", label: "Judicial Advisory" },
  { key: "Legal Desk Operator", label: "Legal Desk Operator" },
];

const AUTHORITY_FILTER_ITEMS = [
  { key: "ALL", label: "All Authority Tiers" },
  ...AUTHORITY_TIERS,
];

const DEFAULT_ROLES = [
  { key: "Executive Head", label: "Executive Head" },
  { key: "Operational Head", label: "Operational Head" },
  { key: "Officer-in-Charge (OIC)", label: "Officer-in-Charge (OIC)" },
  { key: "OIC & PWC Authority", label: "OIC & PWC Authority" },
  { key: "Recruitment Custodian", label: "Recruitment Custodian" },
  { key: "Promotion Custodian", label: "Promotion Custodian" },
  { key: "Legal Vetting Officer", label: "Legal Vetting Officer" },
  { key: "Noting / Filing Desk", label: "Noting / Filing Desk" },
];

const DEFAULT_FORM_VALUES: DesignationFormValues = {
  title: "",
  authorityLevel: "Legal Desk Operator",
  defaultRole: "Noting / Filing Desk",
  canSignPWC: false,
  canForwardFiles: true,
};

export default function DesignationMasterPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    list: designationList,
    createLoading,
    updateLoading,
    deleteLoading,
  } = useSelector((state: RootState) => state.designations);

  const designations = designationList.data;
  const loading = designationList.loading;
  const totalCount = designationList.totalCount;

  const isSubmitting = createLoading || updateLoading || deleteLoading;

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
    onClose: onAddClose,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTierFilter, setSelectedTierFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [editingItem, setEditingItem] = useState<IDesignationItem | null>(
    null,
  );
  const [itemToDelete, setItemToDelete] = useState<IDesignationItem | null>(
    null,
  );

  // Add Form
  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<DesignationFormValues>({
    resolver: zodResolver(designationSchema) as any,
    defaultValues: DEFAULT_FORM_VALUES,
  });

  // Edit Form
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<DesignationFormValues>({
    resolver: zodResolver(designationSchema) as any,
    defaultValues: DEFAULT_FORM_VALUES,
  });

  // Server-side list, search, filter and pagination
  useEffect(() => {
    dispatch(
      fetchDesignations({
        view: "list",
        search: searchQuery.trim() || undefined,
        authorityLevel:
          selectedTierFilter !== "ALL" ? selectedTierFilter : undefined,
        page,
        limit: rowsPerPage,
      }),
    );
  }, [dispatch, searchQuery, selectedTierFilter, page]);

  // Clear old mutation messages when page mounts
  useEffect(() => {
    dispatch(clearDesignationMutationMessages());
  }, [dispatch]);

  const totalPages =
    designationList.pagination?.pages ||
    Math.ceil(totalCount / rowsPerPage) ||
    1;

  const handleOpenAdd = () => {
    resetAddForm(DEFAULT_FORM_VALUES);
    onAddOpen();
  };

  // CREATE
  const onAddDesignation = async (values: DesignationFormValues) => {
    const payload = {
      title: values.title.trim(),
      authorityLevel: values.authorityLevel,
      defaultRole: values.defaultRole || "Officer-in-Charge (OIC)",
      canSignPWC:
        values.authorityLevel.includes("Head") ||
        values.authorityLevel.includes("Apex"),
      canForwardFiles: true,
    };

    try {
      await dispatch(createDesignation(payload)).unwrap();

      toast.success(`Designation "${payload.title}" created successfully!`);

      onAddClose();
      resetAddForm(DEFAULT_FORM_VALUES);
      setPage(1);

      dispatch(
        fetchDesignations({
          view: "list",
          search: searchQuery.trim() || undefined,
          authorityLevel:
            selectedTierFilter !== "ALL" ? selectedTierFilter : undefined,
          page: 1,
          limit: rowsPerPage,
        }),
      );
    } catch (error: any) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to create designation",
      );
    }
  };

  // OPEN EDIT MODAL
  const handleOpenEdit = (item: IDesignationItem) => {
    setEditingItem(item);

    resetEditForm({
      title: item.title,
      authorityLevel: item.authorityLevel,
      defaultRole: item.defaultRole || "Officer-in-Charge (OIC)",
      canSignPWC: Boolean(item.canSignPWC),
      canForwardFiles: item.canForwardFiles ?? true,
    });

    onEditOpen();
  };

  // UPDATE
  const onSaveEdit = async (values: DesignationFormValues) => {
    if (!editingItem) return;

    const payload = {
      title: values.title.trim(),
      authorityLevel: values.authorityLevel,
      defaultRole: values.defaultRole || "Officer-in-Charge (OIC)",
      canSignPWC:
        values.authorityLevel.includes("Head") ||
        values.authorityLevel.includes("Apex"),
      canForwardFiles: values.canForwardFiles ?? true,
    };

    try {
      await dispatch(
        updateDesignation({
          id: editingItem._id,
          payload,
        }),
      ).unwrap();

      toast.success(`Updated designation: ${payload.title}`);

      onEditClose();
      setEditingItem(null);

      dispatch(
        fetchDesignations({
          view: "list",
          search: searchQuery.trim() || undefined,
          authorityLevel:
            selectedTierFilter !== "ALL" ? selectedTierFilter : undefined,
          page,
          limit: rowsPerPage,
        }),
      );
    } catch (error: any) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to update designation",
      );
    }
  };

  // OPEN DELETE MODAL
  const handleOpenDelete = (item: IDesignationItem) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  // DELETE
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await dispatch(deleteDesignation(itemToDelete._id)).unwrap();

      toast.success(`Designation "${itemToDelete.title}" removed.`);

      onDeleteClose();

      const nextPage =
        designations.length === 1 && page > 1 ? page - 1 : page;

      setItemToDelete(null);
      setPage(nextPage);

      dispatch(
        fetchDesignations({
          view: "list",
          search: searchQuery.trim() || undefined,
          authorityLevel:
            selectedTierFilter !== "ALL" ? selectedTierFilter : undefined,
          page: nextPage,
          limit: rowsPerPage,
        }),
      );
    } catch (error: any) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to delete designation",
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Information Bar */}
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
                    <span className="material-symbols-rounded">
                      arrow_back
                    </span>
                  </Button>
                </Link>

                <h1 className="text-base font-bold text-slate-900">
                  7.4 Designation & Administrative Roles Master
                </h1>

                <Chip
                  size="sm"
                  className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700"
                >
                  {totalCount} Designations Mapped
                </Chip>
              </div>

              <p className="text-xs text-slate-500 ml-9">
                Official hierarchy designations, signing authorities & reporting tiers
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
              Add Designation
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search designation title or role..."
              value={searchQuery}
              onValueChange={(val) => {
                setSearchQuery(val);
                setPage(1);
              }}
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
              aria-label="Filter by Authority Tier"
              placeholder="Filter by Authority Tier"
              items={AUTHORITY_FILTER_ITEMS}
              selectedKeys={[selectedTierFilter]}
              onChange={(e) => {
                setSelectedTierFilter(e.target.value || "ALL");
                setPage(1);
              }}
              className="bg-slate-50 font-semibold"
            >
              {(tier) => (
                <SelectItem key={tier.key}>{tier.label}</SelectItem>
              )}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Rules Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="Designation Master Table"
            className="min-w-full"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Showing{" "}
                    {totalCount === 0 ? 0 : (page - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(page * rowsPerPage, totalCount)} of {totalCount}
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
              {designationColumns.map((column) => (
                <TableColumn
                  key={column.key}
                  className={`bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 ${
                    column.key === "canSignPWC" || column.key === "actions"
                      ? "text-center"
                      : ""
                  }`}
                >
                  {column.label}
                </TableColumn>
              ))}
            </TableHeader>

            <TableBody
              items={designations}
              isLoading={loading}
              loadingContent={
                <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                  <Spinner size="sm" />
                  Loading designations...
                </div>
              }
              emptyContent={
                loading ? (
                  <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                    <Spinner size="sm" />
                    Loading designations...
                  </div>
                ) : (
                  "No administrative designations match the specified criteria."
                )
              }
            >
              {(item) => {
                const itemIndex =
                  (page - 1) * rowsPerPage + designations.indexOf(item) + 1;

                return (
                  <TableRow
                    key={item._id}
                    className="border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    <TableCell className="text-xs font-bold text-slate-400">
                      {itemIndex}
                    </TableCell>

                    <TableCell className="text-xs font-bold text-slate-900">
                      {item.title}
                    </TableCell>

                    <TableCell className="text-xs text-slate-700 font-medium">
                      {item.authorityLevel}
                    </TableCell>

                    <TableCell className="text-xs text-blue-700 font-semibold">
                      {item.defaultRole || "--"}
                    </TableCell>

                    <TableCell className="text-center">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={item.canSignPWC ? "success" : "default"}
                        className="text-[10px] font-bold"
                      >
                        {item.canSignPWC ? "Authorized" : "Not Authorized"}
                      </Chip>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-slate-400 hover:text-slate-700"
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

      {/* MODAL 1: Add Designation Modal */}
      <Modal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        placement="top"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAddSubmit(onAddDesignation)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">
                  badge
                </span>
                Add Official Designation
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Controller
                  name="title"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Official Designation Title{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Chief Law Officer (CLO)"
                        isInvalid={!!addErrors.title}
                        errorMessage={addErrors.title?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="authorityLevel"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Authority Level / Signing Tier{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={AUTHORITY_TIERS}
                        selectedKeys={field.value ? [field.value] : []}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!addErrors.authorityLevel}
                        errorMessage={addErrors.authorityLevel?.message}
                      >
                        {(tier) => (
                          <SelectItem key={tier.key}>{tier.label}</SelectItem>
                        )}
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="defaultRole"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Default Case Management Role{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={DEFAULT_ROLES}
                        selectedKeys={
                          field.value
                            ? [field.value]
                            : ["Noting / Filing Desk"]
                        }
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!addErrors.defaultRole}
                        errorMessage={addErrors.defaultRole?.message}
                      >
                        {(role) => (
                          <SelectItem key={role.key}>{role.label}</SelectItem>
                        )}
                      </Select>
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
                  isLoading={createLoading}
                >
                  Save Designation
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: Edit Designation Modal */}
      <Modal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        placement="top"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleEditSubmit(onSaveEdit)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">
                  edit
                </span>
                Edit Designation: {editingItem?.title}
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Controller
                  name="title"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Designation Title{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.title}
                        errorMessage={editErrors.title?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="authorityLevel"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Authority Level{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={AUTHORITY_TIERS}
                        selectedKeys={field.value ? [field.value] : []}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!editErrors.authorityLevel}
                        errorMessage={editErrors.authorityLevel?.message}
                      >
                        {(tier) => (
                          <SelectItem key={tier.key}>{tier.label}</SelectItem>
                        )}
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="defaultRole"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Default Case Role{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={DEFAULT_ROLES}
                        selectedKeys={
                          field.value
                            ? [field.value]
                            : ["Noting / Filing Desk"]
                        }
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!editErrors.defaultRole}
                        errorMessage={editErrors.defaultRole?.message}
                      >
                        {(role) => (
                          <SelectItem key={role.key}>{role.label}</SelectItem>
                        )}
                      </Select>
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
                  isLoading={updateLoading}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 3: Delete Confirmation Modal */}
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
                <b>{itemToDelete?.title}</b>? Any officer profile assigned to
                this designation will need reconfiguration.
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
                  isLoading={deleteLoading}
                >
                  Delete Designation
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}