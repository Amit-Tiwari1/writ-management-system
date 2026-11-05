
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";

import type { AppDispatch, RootState } from "@/store";
import { rankSchema } from "@/schemas/masterSchema";
import type { IRankItem } from "@/types/master.types";

import {
  fetchRanks,
  createRank,
  updateRank,
  deleteRank,
} from "@/store/thunks/masterThunks/ranksThunk";

import { rankColumns } from "@/app/admin/components/columns/RankColumns";

type RankFormValues = z.infer<typeof rankSchema>;

const CADRE_ITEMS = [
  { key: "Non-Gazetted", label: "Non-Gazetted" },
  { key: "Non-Gazetted (Executive)", label: "Non-Gazetted (Executive)" },
  { key: "Gazetted Class II", label: "Gazetted Class II" },
  { key: "Ministerial / Technical", label: "Ministerial / Technical" },
  { key: "State Police Service (PPS)", label: "State Police Service (PPS)" },
  { key: "Indian Police Service (IPS)", label: "Indian Police Service (IPS)" },
];

const CADRE_FILTER_ITEMS = [
  { key: "ALL", label: "All Cadres" },
  ...CADRE_ITEMS,
];

const PAY_LEVEL_ITEMS = [
  { key: "Pay Level 3", label: "Pay Level 3" },
  { key: "Pay Level 4", label: "Pay Level 4" },
  { key: "Pay Level 5", label: "Pay Level 5" },
  { key: "Pay Level 6", label: "Pay Level 6" },
  { key: "Pay Level 7", label: "Pay Level 7" },
  { key: "Pay Level 8", label: "Pay Level 8" },
  { key: "Pay Level 10", label: "Pay Level 10" },
  { key: "Pay Level 12", label: "Pay Level 12" },
  { key: "Pay Level 14", label: "Pay Level 14" },
];

export default function RankMasterPage() {
  const dispatch = useDispatch<AppDispatch>();

  // =====================================================
  // REDUX STATE
  // =====================================================

  const rankList = useSelector((state: RootState) => state.ranks.list);

  const {
    data: ranks,
    totalCount,
    pagination,
    loading,
  } = rankList;

  const {
    createLoading,
    updateLoading,
    deleteLoading,
  } = useSelector((state: RootState) => state.ranks);

  const isSubmitting =
    createLoading || updateLoading || deleteLoading;

  // =====================================================
  // MODALS
  // =====================================================

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

  // =====================================================
  // LOCAL STATE
  // =====================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCadreFilter, setSelectedCadreFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [editingRank, setEditingRank] = useState<IRankItem | null>(null);
  const [rankToDelete, setRankToDelete] = useState<IRankItem | null>(null);

  // =====================================================
  // ADD FORM
  // =====================================================

  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<RankFormValues>({
    resolver: zodResolver(rankSchema) as any,
    defaultValues: {
      rankName: "",
      shortCode: "",
      cadreType: "Non-Gazetted",
      payLevelGrade: "Pay Level 3",
    },
  });

  // =====================================================
  // EDIT FORM
  // =====================================================

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<RankFormValues>({
    resolver: zodResolver(rankSchema) as any,
    defaultValues: {
      rankName: "",
      shortCode: "",
      cadreType: "Non-Gazetted",
      payLevelGrade: "Pay Level 3",
    },
  });

  // =====================================================
  // FETCH RANKS
  // =====================================================

  const refreshRanks = useCallback(async () => {
    await dispatch(
      fetchRanks({
        page,
        limit: rowsPerPage,
        search: searchQuery.trim() || undefined,
        cadreType:
          selectedCadreFilter !== "ALL"
            ? selectedCadreFilter
            : undefined,
        view: "list",
      }),
    ).unwrap();
  }, [dispatch, page, rowsPerPage, searchQuery, selectedCadreFilter]);

  useEffect(() => {
    dispatch(
      fetchRanks({
        page,
        limit: rowsPerPage,
        search: searchQuery.trim() || undefined,
        cadreType:
          selectedCadreFilter !== "ALL"
            ? selectedCadreFilter
            : undefined,
        view: "list",
      }),
    );
  }, [dispatch, page, rowsPerPage, searchQuery, selectedCadreFilter]);

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const handleOpenAdd = () => {
    resetAddForm({
      rankName: "",
      shortCode: "",
      cadreType: "Non-Gazetted",
      payLevelGrade: "Pay Level 3",
    });

    onAddOpen();
  };

  // =====================================================
  // CREATE RANK
  // =====================================================

  const onAddRank = async (values: RankFormValues) => {
    const payload = {
      rankName: values.rankName.trim(),
      shortCode: values.shortCode.trim().toUpperCase(),
      cadreType: values.cadreType,
      payLevelGrade: values.payLevelGrade,
    };

    try {
      await dispatch(createRank(payload)).unwrap();

      toast.success(`Rank ${payload.shortCode} added successfully!`);

      onAddClose();

      await refreshRanks();
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Failed to create rank record",
      );
    }
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const handleOpenEdit = (item: IRankItem) => {
    setEditingRank(item);

    resetEditForm({
      rankName: item.rankName,
      shortCode: item.shortCode,
      cadreType: item.cadreType || "Non-Gazetted",
      payLevelGrade: item.payLevelGrade || "Pay Level 3",
    });

    onEditOpen();
  };

  // =====================================================
  // UPDATE RANK
  // =====================================================

  const onSaveEdit = async (values: RankFormValues) => {
    if (!editingRank) return;

    const payload = {
      rankName: values.rankName.trim(),
      shortCode: values.shortCode.trim().toUpperCase(),
      cadreType: values.cadreType,
      payLevelGrade: values.payLevelGrade,
    };

    try {
      await dispatch(
        updateRank({
          id: editingRank._id,
          payload,
        }),
      ).unwrap();

      toast.success(`Updated ${payload.shortCode}`);

      onEditClose();
      setEditingRank(null);

      await refreshRanks();
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Failed to update rank",
      );
    }
  };

  // =====================================================
  // OPEN DELETE MODAL
  // =====================================================

  const handleOpenDelete = (item: IRankItem) => {
    setRankToDelete(item);
    onDeleteOpen();
  };

  // =====================================================
  // DELETE RANK
  // =====================================================

  const handleConfirmDelete = async () => {
    if (!rankToDelete) return;

    try {
      await dispatch(deleteRank(rankToDelete._id)).unwrap();

      toast.success(`Rank ${rankToDelete.shortCode} removed.`);

      onDeleteClose();
      setRankToDelete(null);

      // If the last record on the current page was deleted,
      // move to the previous page.
      if (ranks.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await refreshRanks();
      }
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Failed to delete rank",
      );
    }
  };

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(pagination?.pages ?? 1, 1);

  const showingFrom =
    totalCount === 0 ? 0 : (page - 1) * rowsPerPage + 1;

  const showingTo = Math.min(
    page * rowsPerPage,
    totalCount,
  );

  // =====================================================
  // TABLE CELL RENDER
  // =====================================================

  const renderRankCell = (
    item: IRankItem,
    columnKey: React.Key,
    index: number,
  ) => {
    switch (columnKey) {
      case "serial":
        return (
          <span className="text-xs font-bold text-slate-400">
            {(page - 1) * rowsPerPage + index + 1}
          </span>
        );

      case "rankName":
        return (
          <span className="text-xs font-bold text-slate-900">
            {item.rankName}
          </span>
        );

      case "shortCode":
        return (
          <span className="font-mono text-xs font-semibold text-blue-700">
            {item.shortCode}
          </span>
        );

      case "cadreType":
        return (
          <span className="text-xs text-slate-600">
            {item.cadreType}
          </span>
        );

      case "payLevelGrade":
        return (
          <Chip
            size="sm"
            variant="flat"
            color="default"
            className="text-xs font-semibold text-slate-700"
          >
            {item.payLevelGrade}
          </Chip>
        );

      case "actions":
        return (
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
        );

      default:
        return null;
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-4">

      {/* HEADER INFORMATION BAR */}

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
                  7.3 Rank & Service Cadre Master
                </h1>

                <Chip
                  size="sm"
                  className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700"
                >
                  {totalCount} Ranks Configured
                </Chip>
              </div>

              <p className="text-xs text-slate-500 ml-9">
                Service cadres, police post designations & pay grade classifications
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
              onPress={handleOpenAdd}
            >
              Add New Rank
            </Button>
          </div>

          {/* QUICK FILTERS */}

          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search rank title, short code or pay level..."
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
              aria-label="Filter by Cadre Type"
              placeholder="Filter by Cadre Type"
              items={CADRE_FILTER_ITEMS}
              selectedKeys={[selectedCadreFilter]}
              onChange={(e) => {
                setSelectedCadreFilter(e.target.value || "ALL");
                setPage(1);
              }}
              className="bg-slate-50 font-semibold"
            >
              {(cadre) => (
                <SelectItem key={cadre.key}>
                  {cadre.label}
                </SelectItem>
              )}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* MAIN RANK TABLE */}

      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="Rank Master Table"
            className="min-w-full"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Showing {showingFrom} to {showingTo} of {totalCount}
                  </span>

                  <Pagination
                    isCompact
                    showControls
                    color="primary"
                    page={page}
                    total={totalPages}
                    onChange={setPage}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              {rankColumns.map((column) => (
                <TableColumn
                  key={column.key}
                  className={`bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 ${
                    column.key === "actions" ? "text-center" : ""
                  }`}
                >
                  {column.label}
                </TableColumn>
              ))}
            </TableHeader>

            <TableBody
              items={ranks}
              isLoading={loading}
              loadingContent={
                <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                  <Spinner size="sm" />
                  Loading police ranks...
                </div>
              }
              emptyContent={
                loading
                  ? "Loading police ranks..."
                  : "No police ranks match the specified criteria."
              }
            >
              {(item) => {
                const index = ranks.findIndex(
                  (rank) => rank._id === item._id,
                );

                return (
                  <TableRow
                    key={item._id}
                    className="border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    {(columnKey) => (
                      <TableCell
                        className={
                          columnKey === "actions"
                            ? "text-center"
                            : ""
                        }
                      >
                        {renderRankCell(item, columnKey, index)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              }}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* MODAL 1: ADD RANK */}

      <Modal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        placement="top"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAddSubmit(onAddRank)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">
                  military_tech
                </span>
                Add Service Rank Master
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Controller
                  name="rankName"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Official Rank Title <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Assistant Sub Inspector"
                        isInvalid={!!addErrors.rankName}
                        errorMessage={addErrors.rankName?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="shortCode"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Short Acronym / Code <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. ASI"
                        isInvalid={!!addErrors.shortCode}
                        errorMessage={addErrors.shortCode?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="cadreType"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Cadre Classification <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={CADRE_ITEMS}
                        selectedKeys={field.value ? [field.value] : []}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!addErrors.cadreType}
                        errorMessage={addErrors.cadreType?.message}
                      >
                        {(cadre) => (
                          <SelectItem key={cadre.key}>
                            {cadre.label}
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="payLevelGrade"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Applicable Pay Level <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={PAY_LEVEL_ITEMS}
                        selectedKeys={field.value ? [field.value] : []}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!addErrors.payLevelGrade}
                        errorMessage={addErrors.payLevelGrade?.message}
                      >
                        {(pay) => (
                          <SelectItem key={pay.key}>
                            {pay.label}
                          </SelectItem>
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
                  Save Rank
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: EDIT RANK */}

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
                Edit Service Rank: {editingRank?.rankName}
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Controller
                  name="rankName"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Rank Title <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.rankName}
                        errorMessage={editErrors.rankName?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="shortCode"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Short Code <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.shortCode}
                        errorMessage={editErrors.shortCode?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="cadreType"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Cadre Classification <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={CADRE_ITEMS}
                        selectedKeys={field.value ? [field.value] : []}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!editErrors.cadreType}
                        errorMessage={editErrors.cadreType?.message}
                      >
                        {(cadre) => (
                          <SelectItem key={cadre.key}>
                            {cadre.label}
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="payLevelGrade"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Pay Grade Level <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={PAY_LEVEL_ITEMS}
                        selectedKeys={field.value ? [field.value] : []}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!editErrors.payLevelGrade}
                        errorMessage={editErrors.payLevelGrade?.message}
                      >
                        {(pay) => (
                          <SelectItem key={pay.key}>
                            {pay.label}
                          </SelectItem>
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

      {/* MODAL 3: DELETE CONFIRMATION */}

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
                <b>{rankToDelete?.rankName}</b>{" "}
                ({rankToDelete?.shortCode})?
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
                  Delete Rank
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
