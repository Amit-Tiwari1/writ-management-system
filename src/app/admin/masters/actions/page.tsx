
"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Switch,
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

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  fetchActionMappings,
  createActionMapping,
  updateActionMapping,
  deleteActionMapping,
} from "@/store/thunks/masterThunks/actionMappingsThunks";

import {
  actionMappingSchema,
  ActionMappingFormValues,
} from "@/schemas/masterSchema";

import { IActionMappingItem } from "@/types/master.types";

const COMPLIANCE_FILTER_ITEMS = [
  { key: "ALL", label: "All Decision Outcomes" },
  { key: "TIME_BOUND", label: "Time-Bound (Contempt Risk)" },
  { key: "NO_DEADLINE", label: "Non-Time Bound / Closed" },
];

const DEFAULT_FORM_VALUES: ActionMappingFormValues = {
  courtDecision: "",
  actionStatus: "",
  actionNotTaken: "",
  requiresComplianceDeadline: false,
  defaultDeadlineDays: 0,
  impactScope: "Standard Workflow",
};

export default function ActionTakenMasterPage() {
  const dispatch = useAppDispatch();

  // Redux State
  const {
    data: actionsList,
    loading,
    error: fetchError,
  } = useAppSelector((state) => state.actionMappings.list);

  const {
    createLoading,
    updateLoading,
    deleteLoading,
    mutationError,
  } = useAppSelector((state) => state.actionMappings);

  const submitting = createLoading || updateLoading || deleteLoading;

  // Modal Controls
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  // Local UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeadlineFilter, setSelectedDeadlineFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [editingItem, setEditingItem] =
    useState<IActionMappingItem | null>(null);

  const [itemToDelete, setItemToDelete] =
    useState<IActionMappingItem | null>(null);

  // Add Form
  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    watch: watchAddForm,
    setValue: setAddValue,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<ActionMappingFormValues>({
    resolver: zodResolver(actionMappingSchema) as any,
    defaultValues: DEFAULT_FORM_VALUES,
  });

  // Edit Form
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    watch: watchEditForm,
    setValue: setEditValue,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<ActionMappingFormValues>({
    resolver: zodResolver(actionMappingSchema) as any,
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const addRequiresDeadline = watchAddForm("requiresComplianceDeadline");
  const editRequiresDeadline = watchEditForm("requiresComplianceDeadline");

  // Fetch Action Mapping Rules
  useEffect(() => {
    dispatch(fetchActionMappings({ limit: 100 }));
  }, [dispatch]);

  // Display Fetch Error
  useEffect(() => {
    if (fetchError) {
      toast.error(fetchError);
    }
  }, [fetchError]);

  // Display Mutation Error
  useEffect(() => {
    if (mutationError) {
      toast.error(mutationError);
    }
  }, [mutationError]);

  // Submit Add
  const onAddRule = async (values: ActionMappingFormValues) => {
    const payload: ActionMappingFormValues = {
      ...values,
      defaultDeadlineDays: values.requiresComplianceDeadline
        ? Number(values.defaultDeadlineDays) || 30
        : 0,
    };

    try {
      const res = await dispatch(createActionMapping(payload)).unwrap();

      toast.success(
        res.message || "Action mapping rule created successfully"
      );

      resetAddForm(DEFAULT_FORM_VALUES);
      onAddClose();

      await dispatch(fetchActionMappings({ limit: 100 })).unwrap();
      setPage(1);
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Error creating legal action mapping rule"
      );
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: IActionMappingItem) => {
    setEditingItem(item);

    resetEditForm({
      courtDecision: item.courtDecision,
      actionStatus: item.actionStatus,
      actionNotTaken: item.actionNotTaken,
      requiresComplianceDeadline: Boolean(item.requiresComplianceDeadline),
      defaultDeadlineDays: item.defaultDeadlineDays || 0,
      impactScope: item.impactScope || "Standard Workflow",
    });

    onEditOpen();
  };

  // Submit Edit
  const onUpdateRule = async (values: ActionMappingFormValues) => {
    if (!editingItem) return;

    const updatedPayload: ActionMappingFormValues = {
      ...values,
      defaultDeadlineDays: values.requiresComplianceDeadline
        ? Number(values.defaultDeadlineDays) || 30
        : 0,
    };

    try {
      const res = await dispatch(
        updateActionMapping({
          id: editingItem._id,
          payload: updatedPayload,
        })
      ).unwrap();

      toast.success(
        res.message || "Action mapping rule updated successfully"
      );

      onEditClose();
      setEditingItem(null);

      await dispatch(fetchActionMappings({ limit: 100 })).unwrap();
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Failed to update action rule"
      );
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (item: IActionMappingItem) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await dispatch(
        deleteActionMapping(itemToDelete._id)
      ).unwrap();

      toast.success(
        res.message || "Action mapping rule deleted successfully"
      );

      onDeleteClose();
      setItemToDelete(null);

      await dispatch(fetchActionMappings({ limit: 100 })).unwrap();

      // Prevent the page number from remaining out of range.
      setPage((currentPage) => Math.max(1, currentPage));
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Failed to remove action mapping rule"
      );
    }
  };

  // Search & Status Filter
  const filteredActions = useMemo(() => {
    return actionsList.filter((item) => {
      const normalizedSearch = searchQuery.toLowerCase();

      const matchesSearch =
        item.courtDecision?.toLowerCase().includes(normalizedSearch) ||
        item.actionStatus?.toLowerCase().includes(normalizedSearch) ||
        item.actionNotTaken?.toLowerCase().includes(normalizedSearch) ||
        (item.impactScope &&
          item.impactScope.toLowerCase().includes(normalizedSearch));

      const matchesDeadline =
        selectedDeadlineFilter === "ALL" ||
        (selectedDeadlineFilter === "TIME_BOUND" &&
          item.requiresComplianceDeadline) ||
        (selectedDeadlineFilter === "NO_DEADLINE" &&
          !item.requiresComplianceDeadline);

      return matchesSearch && matchesDeadline;
    });
  }, [actionsList, searchQuery, selectedDeadlineFilter]);

  const totalPages = Math.ceil(filteredActions.length / rowsPerPage) || 1;

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredActions.slice(start, start + rowsPerPage);
  }, [filteredActions, page, rowsPerPage]);

  // Keep page valid when filtering or deleting records.
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
                  7.9 Legal Action Taken Mapping Master
                </h1>

                <Chip
                  size="sm"
                  className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700"
                >
                  {actionsList.length} Judicial-to-Board Rules
                </Chip>
              </div>

              <p className="text-xs text-slate-500 ml-9">
                Maps judicial outcomes to institutional action statuses and
                automated compliance deadlines
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
              onPress={() => {
                resetAddForm(DEFAULT_FORM_VALUES);
                onAddOpen();
              }}
            >
              Add Action Rule
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search judicial decision, status or impact scope..."
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
              aria-label="Filter by Compliance Type"
              placeholder="Filter by Compliance Type"
              items={COMPLIANCE_FILTER_ITEMS}
              selectedKeys={[selectedDeadlineFilter]}
              onChange={(e) => {
                setSelectedDeadlineFilter(e.target.value || "ALL");
                setPage(1);
              }}
              className="bg-slate-50 font-semibold"
            >
              {(item) => (
                <SelectItem key={item.key}>{item.label}</SelectItem>
              )}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Rules Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Configured Judicial-To-Administrative State Machine (
            {filteredActions.length} Rules)
          </h3>

          <span className="text-[11px] text-slate-400">
            Drives 5.0 Directives, Stays &amp; Contempt Engine
          </span>
        </div>

        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="Action Taken Master Table"
            className="min-w-full"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Showing {(page - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(
                      page * rowsPerPage,
                      filteredActions.length
                    )}{" "}
                    of {filteredActions.length}
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
                COURT DECISION / OUTCOME
              </TableColumn>

              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                BOARD ACTION TAKEN STATUS
              </TableColumn>

              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ACTION NOT TAKEN ALERT TEXT
              </TableColumn>

              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                COMPLIANCE DEADLINE
              </TableColumn>

              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                ACTION
              </TableColumn>
            </TableHeader>

            <TableBody
              items={paginatedItems}
              emptyContent={
                loading ? (
                  <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                    <Spinner size="sm" />
                    Loading state machine rules...
                  </div>
                ) : (
                  "No action rules match your filter."
                )
              }
            >
              {(item) => {
                const itemIndex =
                  (page - 1) * rowsPerPage +
                  paginatedItems.indexOf(item) +
                  1;

                return (
                  <TableRow
                    key={item._id}
                    className="border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    <TableCell className="text-xs font-bold text-slate-400">
                      {itemIndex}
                    </TableCell>

                    <TableCell>
                      <p className="text-xs font-bold text-slate-900">
                        {item.courtDecision}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {item.impactScope || "Standard Workflow"}
                      </p>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color="success"
                        className="text-xs font-semibold"
                      >
                        {item.actionStatus}
                      </Chip>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color="danger"
                        className="text-xs font-semibold"
                      >
                        {item.actionNotTaken}
                      </Chip>
                    </TableCell>

                    <TableCell>
                      {item.requiresComplianceDeadline ? (
                        <Chip
                          size="sm"
                          variant="solid"
                          color="warning"
                          className="text-[10px] font-bold text-slate-900"
                        >
                          {item.defaultDeadlineDays} Days Statutory
                        </Chip>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not Applicable
                        </span>
                      )}
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

      {/* MODAL 1: Add Action Rule */}
      <Modal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        placement="top"
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAddSubmit(onAddRule)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">
                  rule
                </span>
                Add Legal Action Mapping Rule
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Controller
                  name="courtDecision"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Court Order Decision Outcome{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Allowed with Costs / Speaking Order"
                        isInvalid={!!addErrors.courtDecision}
                        errorMessage={addErrors.courtDecision?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="actionStatus"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Board Action Taken Text (Complied Green Path){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Cost Deposited & Order Complied"
                        isInvalid={!!addErrors.actionStatus}
                        errorMessage={addErrors.actionStatus?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="actionNotTaken"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Action Not Taken Alert Text (Non-Complied Red Path){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Compliance Overdue / Contempt Imminent"
                        isInvalid={!!addErrors.actionNotTaken}
                        errorMessage={addErrors.actionNotTaken?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="impactScope"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Institutional Impact Scope{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Requires departmental compliance within statutory window"
                        isInvalid={!!addErrors.impactScope}
                        errorMessage={addErrors.impactScope?.message}
                      />
                    </div>
                  )}
                />

                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Requires Time-Bound Compliance?
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Triggers countdown clock on 5.2 Contempt Radar
                    </p>
                  </div>

                  <Controller
                    name="requiresComplianceDeadline"
                    control={addControl}
                    render={({ field }) => (
                      <Switch
                        size="sm"
                        isSelected={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          if (!val) {
                            setAddValue("defaultDeadlineDays", 0);
                          }
                        }}
                      />
                    )}
                  />
                </div>

                {addRequiresDeadline && (
                  <Controller
                    name="defaultDeadlineDays"
                    control={addControl}
                    render={({ field }) => (
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Default Statutory Deadline (Days){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          size="sm"
                          type="number"
                          value={
                            field.value !== undefined
                              ? String(field.value)
                              : "30"
                          }
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          isInvalid={!!addErrors.defaultDeadlineDays}
                          errorMessage={addErrors.defaultDeadlineDays?.message}
                        />
                      </div>
                    )}
                  />
                )}
              </ModalBody>

              <ModalFooter>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={onClose}
                  isDisabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  isLoading={createLoading}
                  isDisabled={submitting}
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                >
                  Save Action Rule
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: Edit Action Rule */}
      <Modal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        placement="top"
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleEditSubmit(onUpdateRule)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">
                  edit
                </span>
                Edit Action Rule: {editingItem?.courtDecision}
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Controller
                  name="courtDecision"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Court Decision Outcome{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.courtDecision}
                        errorMessage={editErrors.courtDecision?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="actionStatus"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Board Action Taken Text{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.actionStatus}
                        errorMessage={editErrors.actionStatus?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="actionNotTaken"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Action Not Taken Alert Text{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.actionNotTaken}
                        errorMessage={editErrors.actionNotTaken?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="impactScope"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Institutional Impact Scope{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.impactScope}
                        errorMessage={editErrors.impactScope?.message}
                      />
                    </div>
                  )}
                />

                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Requires Time-Bound Compliance?
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Triggers countdown clock on 5.2 Contempt Radar
                    </p>
                  </div>

                  <Controller
                    name="requiresComplianceDeadline"
                    control={editControl}
                    render={({ field }) => (
                      <Switch
                        size="sm"
                        isSelected={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          if (!val) {
                            setEditValue("defaultDeadlineDays", 0);
                          }
                        }}
                      />
                    )}
                  />
                </div>

                {editRequiresDeadline && (
                  <Controller
                    name="defaultDeadlineDays"
                    control={editControl}
                    render={({ field }) => (
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Default Deadline (Days){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          size="sm"
                          type="number"
                          value={
                            field.value !== undefined
                              ? String(field.value)
                              : "30"
                          }
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          isInvalid={!!editErrors.defaultDeadlineDays}
                          errorMessage={editErrors.defaultDeadlineDays?.message}
                        />
                      </div>
                    )}
                  />
                )}
              </ModalBody>

              <ModalFooter>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={onClose}
                  isDisabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  isLoading={updateLoading}
                  isDisabled={submitting}
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 3: Delete Confirmation */}
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
                Confirm Rule Deletion
              </ModalHeader>

              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove the rule for{" "}
                <b>{itemToDelete?.courtDecision}</b>? Compliance state
                automation and contempt clock calculations for this outcome
                will be disabled.
              </ModalBody>

              <ModalFooter>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={onClose}
                  isDisabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  radius="sm"
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  isLoading={deleteLoading}
                  isDisabled={submitting}
                  onPress={handleConfirmDelete}
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
