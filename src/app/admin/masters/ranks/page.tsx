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
import { rankSchema } from "@/schemas/masterSchema";
import { IRankItem } from "@/types/master.types";
import { z } from "zod";

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
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [ranks, setRanks] = useState<IRankItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCadreFilter, setSelectedCadreFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [editingRank, setEditingRank] = useState<IRankItem | null>(null);
  const [rankToDelete, setRankToDelete] = useState<IRankItem | null>(null);

  // 1. Add Form
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

  // 2. Edit Form
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

  const fetchRanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MastersAPI.getRanks({
        limit: 100,
        cadreType: selectedCadreFilter !== "ALL" ? selectedCadreFilter : undefined,
      });
      if (res?.success) {
        setRanks(res.data || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load rank masters");
    } finally {
      setLoading(false);
    }
  }, [selectedCadreFilter]);

  useEffect(() => {
    fetchRanks();
  }, [fetchRanks]);

  const handleOpenAdd = () => {
    resetAddForm({
      rankName: "",
      shortCode: "",
      cadreType: "Non-Gazetted",
      payLevelGrade: "Pay Level 3",
    });
    onAddOpen();
  };

  const onAddRank = async (values: RankFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        rankName: values.rankName.trim(),
        shortCode: values.shortCode.trim().toUpperCase(),
        cadreType: values.cadreType,
        payLevelGrade: values.payLevelGrade,
      };

      const res = await MastersAPI.createRank(payload);
      if (res?.success) {
        toast.success(`Rank ${payload.shortCode} added successfully!`);
        onAddOpenChange();
        fetchRanks();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create rank record");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const onSaveEdit = async (values: RankFormValues) => {
    if (!editingRank) return;
    setIsSubmitting(true);
    try {
      const payload = {
        _id: editingRank._id,
        rankName: values.rankName.trim(),
        shortCode: values.shortCode.trim().toUpperCase(),
        cadreType: values.cadreType,
        payLevelGrade: values.payLevelGrade,
      };

      await MastersAPI.createRank(payload);
      toast.success(`Updated ${payload.shortCode}`);
      onEditOpenChange();
      setEditingRank(null);
      fetchRanks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update rank");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (item: IRankItem) => {
    setRankToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!rankToDelete) return;
    setIsSubmitting(true);
    try {
      setRanks((prev) => prev.filter((r) => r._id !== rankToDelete._id));
      toast.success(`Rank ${rankToDelete.shortCode} removed.`);
      onDeleteOpenChange();
      setRankToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete rank");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRanks = useMemo(() => {
    return ranks.filter((item) => {
      const matchesSearch =
        item.rankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.payLevelGrade?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCadre =
        selectedCadreFilter === "ALL" || item.cadreType === selectedCadreFilter;

      return matchesSearch && matchesCadre;
    });
  }, [ranks, searchQuery, selectedCadreFilter]);

  const totalPages = Math.ceil(filteredRanks.length / rowsPerPage) || 1;
  const paginatedRanks = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredRanks.slice(start, start + rowsPerPage);
  }, [filteredRanks, page, rowsPerPage]);

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
                <h1 className="text-base font-bold text-slate-900">7.3 Rank & Service Cadre Master</h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  {ranks.length} Ranks Configured
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
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={handleOpenAdd}
            >
              Add New Rank
            </Button>
          </div>

          {/* Quick Filters */}
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
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
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
              {(cadre) => <SelectItem key={cadre.key}>{cadre.label}</SelectItem>}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Rules Table */}
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
                    Showing {(page - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(page * rowsPerPage, filteredRanks.length)} of {filteredRanks.length}
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
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">RANK TITLE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">SHORT CODE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">CADRE TYPE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">PAY GRADE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
            </TableHeader>
            <TableBody
              items={paginatedRanks}
              emptyContent={
                loading ? (
                  <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                    <Spinner size="sm" /> Loading police ranks...
                  </div>
                ) : (
                  "No police ranks match the specified criteria."
                )
              }
            >
              {(item) => {
                const itemIndex = (page - 1) * rowsPerPage + paginatedRanks.indexOf(item) + 1;
                return (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-bold text-slate-400">{itemIndex}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-900">{item.rankName}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-blue-700">{item.shortCode}</TableCell>
                    <TableCell className="text-xs text-slate-600">{item.cadreType}</TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="default" className="text-xs font-semibold text-slate-700">
                        {item.payLevelGrade}
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

      {/* MODAL 1: Add Rank Modal */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAddSubmit(onAddRank)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">military_tech</span>
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
                        selectedKeys={[field.value]}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!addErrors.cadreType}
                        errorMessage={addErrors.cadreType?.message}
                      >
                        {(cadre) => <SelectItem key={cadre.key}>{cadre.label}</SelectItem>}
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
                        selectedKeys={[field.value]}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!addErrors.payLevelGrade}
                        errorMessage={addErrors.payLevelGrade?.message}
                      >
                        {(pay) => <SelectItem key={pay.key}>{pay.label}</SelectItem>}
                      </Select>
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
                  Save Rank
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: Edit Rank Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleEditSubmit(onSaveEdit)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit</span>
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
                        selectedKeys={[field.value]}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!editErrors.cadreType}
                        errorMessage={editErrors.cadreType?.message}
                      >
                        {(cadre) => <SelectItem key={cadre.key}>{cadre.label}</SelectItem>}
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
                        selectedKeys={[field.value]}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!editErrors.payLevelGrade}
                        errorMessage={editErrors.payLevelGrade?.message}
                      >
                        {(pay) => <SelectItem key={pay.key}>{pay.label}</SelectItem>}
                      </Select>
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
                Are you sure you want to remove <b>{rankToDelete?.rankName}</b> ({rankToDelete?.shortCode})?
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