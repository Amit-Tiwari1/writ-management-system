"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { MastersAPI } from "@/api/mastersApi";
import { z } from "zod";

// Explicit non-defaulted schema for 1:1 React Hook Form resolution
const actionMappingFormSchema = z.object({
  courtDecision: z.string().min(2, "Court decision is required").trim(),
  actionStatus: z.string().min(2, "Action status is required").trim(),
  actionNotTaken: z.string().min(2, "Action not taken text is required").trim(),
  requiresComplianceDeadline: z.boolean(),
  defaultDeadlineDays: z.number().int().min(0),
  impactScope: z.string().min(1, "Impact scope is required"),
});

type ActionMappingFormValues = z.infer<typeof actionMappingFormSchema>;

interface IActionMappingItem {
  _id: string;
  courtDecision: string;
  actionStatus: string;
  actionNotTaken: string;
  requiresComplianceDeadline: boolean;
  defaultDeadlineDays: number;
  impactScope: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ActionTakenMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionsList, setActionsList] = useState<IActionMappingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeadlineFilter, setSelectedDeadlineFilter] = useState("ALL");

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [editingItem, setEditingItem] = useState<IActionMappingItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<IActionMappingItem | null>(null);

  // Hook Form: Add
  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    watch: watchAddForm,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<ActionMappingFormValues>({
    resolver: zodResolver(actionMappingFormSchema),
    defaultValues: {
      courtDecision: "",
      actionStatus: "",
      actionNotTaken: "",
      requiresComplianceDeadline: false,
      defaultDeadlineDays: 0,
      impactScope: "Standard Workflow",
    },
  });

  // Hook Form: Edit
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    watch: watchEditForm,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<ActionMappingFormValues>({
    resolver: zodResolver(actionMappingFormSchema),
    defaultValues: {
      courtDecision: "",
      actionStatus: "",
      actionNotTaken: "",
      requiresComplianceDeadline: false,
      defaultDeadlineDays: 0,
      impactScope: "Standard Workflow",
    },
  });

  const addRequiresDeadline = watchAddForm("requiresComplianceDeadline");
  const editRequiresDeadline = watchEditForm("requiresComplianceDeadline");

  // Fetch from backend API
  const fetchActionMappings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await MastersAPI.getActionMappings();
      if (res && res.success && Array.isArray(res.data)) {
        setActionsList(res.data);
      } else if (Array.isArray(res)) {
        setActionsList(res);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load legal action mapping rules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActionMappings();
  }, [fetchActionMappings]);

  // Handle Add Form Submission
  const onAddRule: SubmitHandler<ActionMappingFormValues> = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        defaultDeadlineDays: values.requiresComplianceDeadline
          ? Number(values.defaultDeadlineDays) || 30
          : 0,
      };

      const res = await MastersAPI.createActionMapping(payload);
      if (res?.success) {
        toast.success(res.message || "Action mapping rule created successfully");
        resetAddForm();
        onAddOpenChange();
        fetchActionMappings();
      } else {
        toast.error(res?.message || "Failed to create rule");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error creating legal action mapping rule");
    } finally {
      setSubmitting(false);
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

  // Handle Edit Save
  const onUpdateRule: SubmitHandler<ActionMappingFormValues> = async (values) => {
    if (!editingItem) return;
    try {
      setSubmitting(true);
      const updatedPayload = {
        ...values,
        defaultDeadlineDays: values.requiresComplianceDeadline
          ? Number(values.defaultDeadlineDays) || 30
          : 0,
      };

      setActionsList((prev) =>
        prev.map((a) => (a._id === editingItem._id ? { ...a, ...updatedPayload } : a))
      );
      toast.success("Action mapping rule updated successfully");
      onEditOpenChange();
      setEditingItem(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update action rule");
    } finally {
      setSubmitting(false);
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
      setSubmitting(true);
      setActionsList((prev) => prev.filter((a) => a._id !== itemToDelete._id));
      toast.success("Rule removed from state machine registry");
      onDeleteOpenChange();
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove action mapping rule");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredActions = useMemo(() => {
    return actionsList.filter((item) => {
      const matchesSearch =
        item.courtDecision?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.actionStatus?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.actionNotTaken?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.impactScope?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDeadline =
        selectedDeadlineFilter === "ALL" ||
        (selectedDeadlineFilter === "TIME_BOUND" && item.requiresComplianceDeadline) ||
        (selectedDeadlineFilter === "NO_DEADLINE" && !item.requiresComplianceDeadline);

      return matchesSearch && matchesDeadline;
    });
  }, [actionsList, searchQuery, selectedDeadlineFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredActions.length / rowsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredActions.slice(start, start + rowsPerPage);
  }, [filteredActions, page, rowsPerPage]);

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
                  6.9 Legal Action Taken Mapping Master
                </h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  {actionsList.length} Judicial-to-Board Rules
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Maps judicial outcomes to institutional action statuses and automated compliance deadlines
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={() => {
                resetAddForm();
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
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50 sm:col-span-2"
            />
            <Select
              size="sm"
              radius="sm"
              aria-label="Filter by Compliance Type"
              placeholder="Filter by Compliance Type"
              selectedKeys={[selectedDeadlineFilter]}
              onChange={(e) => {
                setSelectedDeadlineFilter(e.target.value || "ALL");
                setPage(1);
              }}
              className="bg-slate-50 font-semibold"
            >
              <SelectItem key="ALL">All Decision Outcomes</SelectItem>
              <SelectItem key="TIME_BOUND">Time-Bound (Contempt Risk)</SelectItem>
              <SelectItem key="NO_DEADLINE">Non-Time Bound / Closed</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Rules Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Configured Judicial-To-Administrative State Machine ({filteredActions.length} Rules)
          </h3>
          <span className="text-[11px] text-slate-400">Drives 5.0 Directives, Stays & Contempt Engine</span>
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
                    {Math.min(page * rowsPerPage, filteredActions.length)} of {filteredActions.length}
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
                    <Spinner size="sm" /> Loading state machine rules...
                  </div>
                ) : (
                  "No action rules match your filter."
                )
              }
            >
              {(item) => {
                const itemIndex = (page - 1) * rowsPerPage + paginatedItems.indexOf(item) + 1;
                return (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-bold text-slate-400">{itemIndex}</TableCell>
                    <TableCell>
                      <p className="text-xs font-bold text-slate-900">{item.courtDecision}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">{item.impactScope}</p>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="success" className="text-xs font-semibold">
                        {item.actionStatus}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="danger" className="text-xs font-semibold">
                        {item.actionNotTaken}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {item.requiresComplianceDeadline ? (
                        <Chip size="sm" variant="solid" color="warning" className="text-[10px] font-bold text-slate-900">
                          {item.defaultDeadlineDays} Days Statutory
                        </Chip>
                      ) : (
                        <span className="text-xs text-slate-400">Not Applicable</span>
                      )}
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

      {/* MODAL 1: Add Action Rule */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAddSubmit(onAddRule)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">rule</span>
                Add Legal Action Mapping Rule
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Controller
                  name="courtDecision"
                  control={addControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Court Order Decision Outcome"
                      labelPlacement="outside"
                      placeholder="e.g. Allowed with Costs / Speaking Order"
                      isInvalid={!!addErrors.courtDecision}
                      errorMessage={addErrors.courtDecision?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="actionStatus"
                  control={addControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Board Action Taken Text (Complied Green Path)"
                      labelPlacement="outside"
                      placeholder="e.g. Cost Deposited & Order Complied"
                      isInvalid={!!addErrors.actionStatus}
                      errorMessage={addErrors.actionStatus?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="actionNotTaken"
                  control={addControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Action Not Taken Alert Text (Non-Complied Red Path)"
                      labelPlacement="outside"
                      placeholder="e.g. Compliance Overdue / Contempt Imminent"
                      isInvalid={!!addErrors.actionNotTaken}
                      errorMessage={addErrors.actionNotTaken?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="impactScope"
                  control={addControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Institutional Impact Scope"
                      labelPlacement="outside"
                      placeholder="e.g. Requires departmental compliance within statutory window"
                      isInvalid={!!addErrors.impactScope}
                      errorMessage={addErrors.impactScope?.message}
                      isRequired
                    />
                  )}
                />

                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Requires Time-Bound Compliance?</p>
                    <p className="text-[10px] text-slate-500">Triggers countdown clock on 5.2 Contempt Radar</p>
                  </div>
                  <Controller
                    name="requiresComplianceDeadline"
                    control={addControl}
                    render={({ field }) => (
                      <Switch
                        size="sm"
                        isSelected={field.value}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {addRequiresDeadline && (
                  <Controller
                    name="defaultDeadlineDays"
                    control={addControl}
                    render={({ field }) => (
                      <Input
                        size="sm"
                        label="Default Statutory Deadline (Days)"
                        labelPlacement="outside"
                        type="number"
                        value={field.value !== undefined ? field.value.toString() : "30"}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        isInvalid={!!addErrors.defaultDeadlineDays}
                        errorMessage={addErrors.defaultDeadlineDays?.message}
                      />
                    )}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={submitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  isLoading={submitting}
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
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleEditSubmit(onUpdateRule)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit</span>
                Edit Action Rule: {editingItem?.courtDecision}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Controller
                  name="courtDecision"
                  control={editControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Court Decision Outcome"
                      labelPlacement="outside"
                      isInvalid={!!editErrors.courtDecision}
                      errorMessage={editErrors.courtDecision?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="actionStatus"
                  control={editControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Board Action Taken Text"
                      labelPlacement="outside"
                      isInvalid={!!editErrors.actionStatus}
                      errorMessage={editErrors.actionStatus?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="actionNotTaken"
                  control={editControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Action Not Taken Alert Text"
                      labelPlacement="outside"
                      isInvalid={!!editErrors.actionNotTaken}
                      errorMessage={editErrors.actionNotTaken?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="impactScope"
                  control={editControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Institutional Impact Scope"
                      labelPlacement="outside"
                      isInvalid={!!editErrors.impactScope}
                      errorMessage={editErrors.impactScope?.message}
                      isRequired
                    />
                  )}
                />

                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Requires Time-Bound Compliance?</p>
                    <p className="text-[10px] text-slate-500">Triggers countdown clock on 5.2 Contempt Radar</p>
                  </div>
                  <Controller
                    name="requiresComplianceDeadline"
                    control={editControl}
                    render={({ field }) => (
                      <Switch
                        size="sm"
                        isSelected={field.value}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {editRequiresDeadline && (
                  <Controller
                    name="defaultDeadlineDays"
                    control={editControl}
                    render={({ field }) => (
                      <Input
                        size="sm"
                        label="Default Deadline (Days)"
                        labelPlacement="outside"
                        type="number"
                        value={field.value !== undefined ? field.value.toString() : "30"}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        isInvalid={!!editErrors.defaultDeadlineDays}
                        errorMessage={editErrors.defaultDeadlineDays?.message}
                      />
                    )}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={submitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  isLoading={submitting}
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
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} placement="center" size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">warning</span>
                Confirm Rule Deletion
              </ModalHeader>
              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove the rule for <b>{itemToDelete?.courtDecision}</b>? Compliance state automation and contempt clock calculations for this outcome will be disabled.
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={submitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  isLoading={submitting}
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