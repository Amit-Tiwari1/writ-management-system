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
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { MastersAPI } from "@/api/mastersApi";
import { z } from "zod";

const rankFormSchema = z.object({
  rankName: z.string().min(2, "Rank name is required").trim(),
  shortCode: z.string().min(2, "Short code is required").toUpperCase().trim(),
  cadreType: z.string().min(1, "Cadre type is required"),
  payLevelGrade: z.string().min(1, "Pay level grade is required"),
});

type RankFormValues = z.infer<typeof rankFormSchema>;

interface RankRecord {
  _id: string;
  rankName: string;
  shortCode: string;
  cadreType: string;
  payLevelGrade: string;
  createdAt?: string;
}

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

  const [ranks, setRanks] = useState<RankRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCadreFilter, setSelectedCadreFilter] = useState("ALL");

  const [editingRank, setEditingRank] = useState<RankRecord | null>(null);
  const [rankToDelete, setRankToDelete] = useState<RankRecord | null>(null);

  // React Hook Form for Add
  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<RankFormValues>({
    resolver: zodResolver(rankFormSchema),
    defaultValues: {
      rankName: "",
      shortCode: "",
      cadreType: "Non-Gazetted",
      payLevelGrade: "Pay Level 3",
    },
  });

  // React Hook Form for Edit
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<RankFormValues>({
    resolver: zodResolver(rankFormSchema),
    defaultValues: {
      rankName: "",
      shortCode: "",
      cadreType: "Non-Gazetted",
      payLevelGrade: "Pay Level 3",
    },
  });

  // Fetch Ranks from Real Backend API
  const fetchRanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MastersAPI.getRanks();
      if (res?.success) {
        setRanks(res.data || []);
      }
    } catch (err: any) {
      console.error("[RankMaster] Error fetching ranks:", err);
      toast.error(err.response?.data?.message || "Failed to load rank masters");
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Submit Add to Backend
  const onAddRank: SubmitHandler<RankFormValues> = async (values) => {
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

  const handleOpenEdit = (item: RankRecord) => {
    setEditingRank(item);
    resetEditForm({
      rankName: item.rankName,
      shortCode: item.shortCode,
      cadreType: item.cadreType,
      payLevelGrade: item.payLevelGrade,
    });
    onEditOpen();
  };

  const onSaveEdit: SubmitHandler<RankFormValues> = async (values) => {
    if (!editingRank) return;
    try {
      setIsSubmitting(true);
      setRanks((prev) =>
        prev.map((r) =>
          r._id === editingRank._id
            ? { ...r, ...values, shortCode: values.shortCode.toUpperCase() }
            : r
        )
      );
      toast.success(`Updated ${values.shortCode}`);
      onEditOpenChange();
      setEditingRank(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update rank");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (item: RankRecord) => {
    setRankToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!rankToDelete) return;
    setRanks((prev) => prev.filter((r) => r._id !== rankToDelete._id));
    toast.success(`Rank ${rankToDelete.shortCode} removed.`);
    onDeleteOpenChange();
    setRankToDelete(null);
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

  return (
    <div className="space-y-4">
      {/* Header Info */}
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
                <h1 className="text-base font-bold text-slate-900">6.3 Rank & Service Cadre Master</h1>
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

          {/* Filters Bar */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search rank title, short code or pay level..."
              value={searchQuery}
              onValueChange={setSearchQuery}
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
              onChange={(e) => setSelectedCadreFilter(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              {(cadre) => <SelectItem key={cadre.key}>{cadre.label}</SelectItem>}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Main Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Rank Master Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">RANK TITLE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">SHORT CODE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">CADRE TYPE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">PAY GRADE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
            </TableHeader>
            <TableBody
              items={filteredRanks}
              isLoading={loading}
              loadingContent={
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              }
              emptyContent={!loading ? "No police ranks match the specified criteria." : " "}
            >
              {(item) => {
                const index = ranks.findIndex((r) => r._id === item._id) + 1;
                return (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-bold text-slate-400">{index}</TableCell>
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

      {/* 1. Add Rank Modal */}
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
                    <Input
                      {...field}
                      size="sm"
                      label="Official Rank Title"
                      labelPlacement="outside"
                      placeholder="e.g. Assistant Sub Inspector"
                      isInvalid={!!addErrors.rankName}
                      errorMessage={addErrors.rankName?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="shortCode"
                  control={addControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Short Acronym / Code"
                      labelPlacement="outside"
                      placeholder="e.g. ASI"
                      isInvalid={!!addErrors.shortCode}
                      errorMessage={addErrors.shortCode?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="cadreType"
                  control={addControl}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Cadre Classification"
                      labelPlacement="outside"
                      items={CADRE_ITEMS}
                      selectedKeys={[field.value]}
                      onChange={(e) => field.onChange(e.target.value)}
                      isInvalid={!!addErrors.cadreType}
                      errorMessage={addErrors.cadreType?.message}
                      isRequired
                    >
                      {(cadre) => <SelectItem key={cadre.key}>{cadre.label}</SelectItem>}
                    </Select>
                  )}
                />

                <Controller
                  name="payLevelGrade"
                  control={addControl}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Applicable Pay Level"
                      labelPlacement="outside"
                      items={PAY_LEVEL_ITEMS}
                      selectedKeys={[field.value]}
                      onChange={(e) => field.onChange(e.target.value)}
                      isInvalid={!!addErrors.payLevelGrade}
                      errorMessage={addErrors.payLevelGrade?.message}
                      isRequired
                    >
                      {(pay) => <SelectItem key={pay.key}>{pay.label}</SelectItem>}
                    </Select>
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

      {/* 2. Edit Rank Modal */}
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
                    <Input
                      {...field}
                      size="sm"
                      label="Rank Title"
                      labelPlacement="outside"
                      isInvalid={!!editErrors.rankName}
                      errorMessage={editErrors.rankName?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="shortCode"
                  control={editControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Short Code"
                      labelPlacement="outside"
                      isInvalid={!!editErrors.shortCode}
                      errorMessage={editErrors.shortCode?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="cadreType"
                  control={editControl}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Cadre Classification"
                      labelPlacement="outside"
                      items={CADRE_ITEMS}
                      selectedKeys={[field.value]}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {(cadre) => <SelectItem key={cadre.key}>{cadre.label}</SelectItem>}
                    </Select>
                  )}
                />

                <Controller
                  name="payLevelGrade"
                  control={editControl}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Pay Grade Level"
                      labelPlacement="outside"
                      items={PAY_LEVEL_ITEMS}
                      selectedKeys={[field.value]}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {(pay) => <SelectItem key={pay.key}>{pay.label}</SelectItem>}
                    </Select>
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

      {/* 3. Delete Confirmation Modal */}
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
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  onClick={handleConfirmDelete}
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