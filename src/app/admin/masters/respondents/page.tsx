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
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/store";

import { respondentGroupSchema } from "@/schemas/masterSchema";

import type { RespondentGroupFormValues } from "@/schemas/masterSchema";

import type { IRespondentGroupItem } from "@/types/master.types";

import {
  fetchRespondentGroups,
  createRespondentGroup,
  updateRespondentGroup,
  deleteRespondentGroup,
} from "@/store/thunks/masterThunks/respondentsThunks";

// ==========================================
// CONSTANTS
// ==========================================

const ORG_TYPE_FILTER_ITEMS = [
  { key: "ALL", label: "All Organization Types" },
  {
    key: "OUR_OFFICE",
    label: "Our Institution (Direct Board Office)",
  },
  {
    key: "STATE",
    label: "State Respondent / External Department",
  },
];

const ORG_CLASSIFICATION_OPTIONS = [
  {
    key: "false",
    label: "State Respondent / External Department",
  },
  {
    key: "true",
    label: "Our Institution (Direct Board Office)",
  },
];

const DEFAULT_FORM_VALUES: RespondentGroupFormValues = {
  groupName: "",
  defaultRankId: "",
  defaultAddress: "",
  isOurOffice: false,
};

const ROWS_PER_PAGE = 8;

// ==========================================
// ERROR HANDLER
// ==========================================

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  const err = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return (
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong. Please try again."
  );
};

// ==========================================
// COMPONENT
// ==========================================

export default function RespondentsMasterPage() {
  const dispatch = useDispatch<AppDispatch>();

  // ==========================================
  // REDUX STATE
  // ==========================================

  const respondents = useSelector(
    (state: RootState) => state.respondents.list.data,
  );

  const loading = useSelector(
    (state: RootState) => state.respondents.list.loading,
  );

  const submitting = useSelector(
    (state: RootState) =>
      state.respondents.createLoading ||
      state.respondents.updateLoading ||
      state.respondents.deleteLoading,
  );

  // ==========================================
  // MODAL STATES
  // ==========================================

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  // ==========================================
  // LOCAL STATES
  // ==========================================

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");

  const [page, setPage] = useState(1);

  const [editingItem, setEditingItem] = useState<IRespondentGroupItem | null>(
    null,
  );

  const [itemToDelete, setItemToDelete] = useState<IRespondentGroupItem | null>(
    null,
  );

  // ==========================================
  // ADD FORM
  // ==========================================

  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<RespondentGroupFormValues>({
    resolver: zodResolver(respondentGroupSchema) as any,
    defaultValues: DEFAULT_FORM_VALUES,
  });

  // ==========================================
  // EDIT FORM
  // ==========================================

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<RespondentGroupFormValues>({
    resolver: zodResolver(respondentGroupSchema) as any,
    defaultValues: DEFAULT_FORM_VALUES,
  });

  // ==========================================
  // FETCH RESPONDENT GROUPS
  // ==========================================

  const fetchRespondents = useCallback(async () => {
    try {
      await dispatch(
        fetchRespondentGroups({
          limit: 100,
        }),
      ).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [dispatch]);

  useEffect(() => {
    void fetchRespondents();
  }, [fetchRespondents]);

  const onAddGroup: SubmitHandler<RespondentGroupFormValues> = async (
    values,
  ) => {
    try {
      const response = await dispatch(createRespondentGroup(values)).unwrap();

      if (!response?.success) {
        toast.error(response?.message || "Failed to add respondent group");
        return;
      }

      toast.success(
        response.message || "Respondent group registered successfully",
      );

      resetAddForm(DEFAULT_FORM_VALUES);
      onAddOpenChange();
      setPage(1);
      await fetchRespondents();

      await fetchRespondents();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleOpenEdit = (item: IRespondentGroupItem) => {
    setEditingItem(item);

    resetEditForm({
      groupName: item.groupName || "",
      defaultRankId: item.defaultRankId || "",
      defaultAddress: item.defaultAddress || "",
      isOurOffice: Boolean(item.isOurOffice),
    });

    onEditOpen();
  };

  const onUpdateGroup: SubmitHandler<RespondentGroupFormValues> = async (
    values,
  ) => {
    if (!editingItem?._id) {
      toast.error("Please select a respondent group to update.");
      return;
    }

    try {
      const response = await dispatch(
        updateRespondentGroup({
          id: editingItem._id,
          payload: values,
        }),
      ).unwrap();

      if (!response?.success) {
        toast.error(response?.message || "Failed to update respondent group");
        return;
      }

      toast.success(
        response.message || "Respondent group updated successfully",
      );

      onEditOpenChange();
      setEditingItem(null);
      resetEditForm(DEFAULT_FORM_VALUES);
      await fetchRespondents();

      await fetchRespondents();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleOpenDelete = (item: IRespondentGroupItem) => {
    setItemToDelete(item);
    onDeleteOpen();
  };
  const handleConfirmDelete = async () => {
    if (!itemToDelete?._id) {
      return;
    }

    try {
      const response = await dispatch(
        deleteRespondentGroup(itemToDelete._id),
      ).unwrap();

      if (!response?.success) {
        toast.error(response?.message || "Failed to delete respondent group");
        return;
      }

      toast.success(
        response.message || "Respondent group removed successfully",
      );

      onDeleteOpenChange();
      setItemToDelete(null);

      const remainingItems = filteredRespondents.length - 1;

      if (remainingItems > 0 && (page - 1) * ROWS_PER_PAGE >= remainingItems) {
        setPage((previousPage) => Math.max(1, previousPage - 1));
      }

      await fetchRespondents();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // ==========================================
  // SEARCH AND ORGANIZATION TYPE FILTER
  // ==========================================

  const filteredRespondents = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return respondents.filter((item) => {
      const matchesSearch =
        item.groupName?.toLowerCase().includes(normalizedSearch) ||
        item.defaultRankId?.toLowerCase().includes(normalizedSearch) ||
        item.defaultAddress?.toLowerCase().includes(normalizedSearch);

      const matchesType =
        selectedTypeFilter === "ALL" ||
        (selectedTypeFilter === "OUR_OFFICE" && item.isOurOffice) ||
        (selectedTypeFilter === "STATE" && !item.isOurOffice);

      return matchesSearch && matchesType;
    });
  }, [respondents, searchQuery, selectedTypeFilter]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.ceil(filteredRespondents.length / ROWS_PER_PAGE) || 1;

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;

    return filteredRespondents.slice(start, start + ROWS_PER_PAGE);
  }, [filteredRespondents, page]);

  // Keep page valid when filters reduce the result count.
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-4">
      {/* ==========================================
          1. HEADER INFORMATION BAR
      ========================================== */}

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
                  7.8 Respondent Groups & Opposite Parties Master
                </h1>

                <Chip
                  size="sm"
                  className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700"
                >
                  {respondents.length} Groups Configured
                </Chip>
              </div>

              <p className="ml-9 text-xs text-slate-500">
                Standardize government respondents, standing counsels & service
                addresses for automated notice serving
              </p>
            </div>

            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={
                <span className="material-symbols-rounded text-sm">add</span>
              }
              onPress={() => {
                resetAddForm(DEFAULT_FORM_VALUES);
                onAddOpen();
              }}
            >
              Add Respondent Group
            </Button>
          </div>

          {/* QUICK FILTERS */}

          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search group code, title or service address..."
              value={searchQuery}
              onValueChange={(value) => {
                setSearchQuery(value);
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
              aria-label="Filter by Organization Type"
              placeholder="Filter by Organization Type"
              items={ORG_TYPE_FILTER_ITEMS}
              selectedKeys={[selectedTypeFilter]}
              onChange={(event) => {
                setSelectedTypeFilter(event.target.value || "ALL");
                setPage(1);
              }}
              className="bg-slate-50 font-semibold"
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* ==========================================
          2. MAIN RESPONDENT GROUPS TABLE
      ========================================== */}

      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="Respondent Groups Table"
            className="min-w-full"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full items-center justify-between border-t border-slate-100 p-3">
                  <span className="text-xs text-slate-500">
                    Showing {(page - 1) * ROWS_PER_PAGE + 1} to{" "}
                    {Math.min(page * ROWS_PER_PAGE, filteredRespondents.length)}{" "}
                    of {filteredRespondents.length}
                  </span>

                  <Pagination
                    isCompact
                    showControls
                    color="primary"
                    page={page}
                    total={totalPages}
                    onChange={(nextPage) => setPage(nextPage)}
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
                RESPONDENT GROUP CODE
              </TableColumn>

              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DEFAULT RANK / TITLE
              </TableColumn>

              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                OFFICIAL SERVICE ADDRESS
              </TableColumn>

              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ORGANIZATION TYPE
              </TableColumn>

              <TableColumn className="bg-transparent text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ACTION
              </TableColumn>
            </TableHeader>

            <TableBody
              items={paginatedItems}
              emptyContent={
                loading ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-slate-500">
                    <Spinner size="sm" />
                    Loading master records...
                  </div>
                ) : (
                  "No respondent groups found matching your search."
                )
              }
            >
              {(item) => {
                const itemIndex =
                  (page - 1) * ROWS_PER_PAGE + paginatedItems.indexOf(item) + 1;

                return (
                  <TableRow
                    key={item._id}
                    className="border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    <TableCell className="text-xs font-bold text-slate-400">
                      {itemIndex}
                    </TableCell>

                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {item.groupName}
                    </TableCell>

                    <TableCell className="text-xs font-semibold text-slate-800">
                      {item.defaultRankId}
                    </TableCell>

                    <TableCell className="max-w-[280px] truncate font-serif text-xs leading-relaxed text-slate-600">
                      {item.defaultAddress}
                    </TableCell>

                    <TableCell>
                      {item.isOurOffice ? (
                        <Chip
                          size="sm"
                          color="primary"
                          variant="solid"
                          className="text-[10px] font-bold"
                        >
                          OUR INSTITUTION
                        </Chip>
                      ) : (
                        <Chip
                          size="sm"
                          variant="flat"
                          className="text-[10px] font-medium text-slate-600"
                        >
                          STATE RESPONDENT
                        </Chip>
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

      {/* ==========================================
          MODAL 1: ADD RESPONDENT GROUP
      ========================================== */}

      <Modal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        placement="top"
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAddSubmit(onAddGroup)}>
              <ModalHeader className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="material-symbols-rounded text-blue-700">
                  group_add
                </span>
                Add Respondent Group Master
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Controller
                  name="groupName"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Respondent Group Code / Identifier{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. HIGHER EDUCATION DEPT"
                        isInvalid={!!addErrors.groupName}
                        errorMessage={addErrors.groupName?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="defaultRankId"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Default Representative Official Title{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Principal Secretary (Higher Education)"
                        isInvalid={!!addErrors.defaultRankId}
                        errorMessage={addErrors.defaultRankId?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="defaultAddress"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Official Service Postal Address{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Directorate Office, Prayagraj / Secretariat, Lucknow"
                        isInvalid={!!addErrors.defaultAddress}
                        errorMessage={addErrors.defaultAddress?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="isOurOffice"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Institutional Classification{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={ORG_CLASSIFICATION_OPTIONS}
                        selectedKeys={[field.value ? "true" : "false"]}
                        onChange={(event) =>
                          field.onChange(event.target.value === "true")
                        }
                      >
                        {(item) => (
                          <SelectItem key={item.key}>{item.label}</SelectItem>
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
                  isDisabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  isLoading={submitting}
                  isDisabled={submitting}
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                >
                  Save Group
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* ==========================================
          MODAL 2: EDIT RESPONDENT GROUP
      ========================================== */}

      <Modal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        placement="top"
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleEditSubmit(onUpdateGroup)}>
              <ModalHeader className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="material-symbols-rounded text-blue-700">
                  edit
                </span>
                Edit Respondent Group: {editingItem?.groupName}
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Controller
                  name="groupName"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Group Code Name <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.groupName}
                        errorMessage={editErrors.groupName?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="defaultRankId"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Default Representative Title{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.defaultRankId}
                        errorMessage={editErrors.defaultRankId?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="defaultAddress"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Official Service Address{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.defaultAddress}
                        errorMessage={editErrors.defaultAddress?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="isOurOffice"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Classification <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={ORG_CLASSIFICATION_OPTIONS}
                        selectedKeys={[field.value ? "true" : "false"]}
                        onChange={(event) =>
                          field.onChange(event.target.value === "true")
                        }
                      >
                        {(item) => (
                          <SelectItem key={item.key}>{item.label}</SelectItem>
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
                  isDisabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  isLoading={submitting}
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

      {/* ==========================================
          MODAL 3: DELETE CONFIRMATION
      ========================================== */}

      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        placement="center"
        size="sm"
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
                Are you sure you want to remove <b>{itemToDelete?.groupName}</b>{" "}
                from the master registry? Active case notices mapped to this
                respondent group will be affected.
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
                  isLoading={submitting}
                  isDisabled={submitting}
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  onPress={handleConfirmDelete}
                >
                  Delete Group
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
