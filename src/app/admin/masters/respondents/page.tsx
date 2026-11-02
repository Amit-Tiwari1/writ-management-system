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

import { MastersAPI } from "@/api/mastersApi";
import {
  respondentGroupSchema,
  RespondentGroupFormValues,
} from "@/schemas/masterSchema";
import { IRespondentGroupItem } from "@/types/master.types";

const ORG_TYPE_FILTER_ITEMS = [
  { key: "ALL", label: "All Organization Types" },
  { key: "OUR_OFFICE", label: "Our Institution (Direct Board Office)" },
  { key: "STATE", label: "State Respondent / External Department" },
];

const ORG_CLASSIFICATION_OPTIONS = [
  { key: "false", label: "State Respondent / External Department" },
  { key: "true", label: "Our Institution (Direct Board Office)" },
];

export default function RespondentsMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [respondents, setRespondents] = useState<IRespondentGroupItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [editingItem, setEditingItem] = useState<IRespondentGroupItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<IRespondentGroupItem | null>(null);

  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<RespondentGroupFormValues>({
    resolver: zodResolver(respondentGroupSchema) as any,
    defaultValues: {
      groupName: "",
      defaultRankTitle: "",
      defaultAddress: "",
      isOurOffice: false,
    },
  });

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<RespondentGroupFormValues>({
    resolver: zodResolver(respondentGroupSchema) as any,
    defaultValues: {
      groupName: "",
      defaultRankTitle: "",
      defaultAddress: "",
      isOurOffice: false,
    },
  });

  const fetchRespondentGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await MastersAPI.getRespondentGroups({ limit: 100 });
      if (res?.success && Array.isArray(res.data)) {
        setRespondents(res.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load respondent groups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRespondentGroups();
  }, [fetchRespondentGroups]);

  const onAddGroup: SubmitHandler<RespondentGroupFormValues> = async (values) => {
    try {
      setSubmitting(true);
      const res = await MastersAPI.createRespondentGroup(values);
      if (res?.success) {
        toast.success(res.message || "Respondent group registered successfully");
        resetAddForm();
        onAddOpenChange();
        fetchRespondentGroups();
      } else {
        toast.error(res?.message || "Failed to add respondent group");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to register respondent group");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (item: IRespondentGroupItem) => {
    setEditingItem(item);
    resetEditForm({
      groupName: item.groupName,
      defaultRankTitle: item.defaultRankTitle,
      defaultAddress: item.defaultAddress,
      isOurOffice: Boolean(item.isOurOffice),
    });
    onEditOpen();
  };

  const onUpdateGroup: SubmitHandler<RespondentGroupFormValues> = async (values) => {
    if (!editingItem) return;
    try {
      setSubmitting(true);
      const payload = {
        _id: editingItem._id,
        ...values,
      };
      await MastersAPI.createRespondentGroup(payload);
      toast.success("Respondent group updated successfully");
      onEditOpenChange();
      setEditingItem(null);
      fetchRespondentGroups();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update respondent group");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (item: IRespondentGroupItem) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setSubmitting(true);
      setRespondents((prev) => prev.filter((r) => r._id !== itemToDelete._id));
      toast.success("Respondent group removed");
      onDeleteOpenChange();
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete respondent group");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRespondents = useMemo(() => {
    return respondents.filter((item) => {
      const matchesSearch =
        item.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.defaultRankTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.defaultAddress?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedTypeFilter === "ALL" ||
        (selectedTypeFilter === "OUR_OFFICE" && item.isOurOffice) ||
        (selectedTypeFilter === "STATE" && !item.isOurOffice);

      return matchesSearch && matchesType;
    });
  }, [respondents, searchQuery, selectedTypeFilter]);

  const totalPages = Math.ceil(filteredRespondents.length / rowsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredRespondents.slice(start, start + rowsPerPage);
  }, [filteredRespondents, page, rowsPerPage]);

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
                  7.8 Respondent Groups & Opposite Parties Master
                </h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  {respondents.length} Groups Configured
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Standardize government respondents, standing counsels & service addresses for automated notice serving
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={() => {
                resetAddForm({
                  groupName: "",
                  defaultRankTitle: "",
                  defaultAddress: "",
                  isOurOffice: false,
                });
                onAddOpen();
              }}
            >
              Add Respondent Group
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search group code, title or service address..."
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
              aria-label="Filter by Organization Type"
              placeholder="Filter by Organization Type"
              items={ORG_TYPE_FILTER_ITEMS}
              selectedKeys={[selectedTypeFilter]}
              onChange={(e) => {
                setSelectedTypeFilter(e.target.value || "ALL");
                setPage(1);
              }}
              className="bg-slate-50 font-semibold"
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Mappings Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="Respondent Groups Table"
            className="min-w-full"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Showing {(page - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(page * rowsPerPage, filteredRespondents.length)} of {filteredRespondents.length}
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
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                ACTION
              </TableColumn>
            </TableHeader>
            <TableBody
              items={paginatedItems}
              emptyContent={
                loading ? (
                  <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                    <Spinner size="sm" /> Loading master records...
                  </div>
                ) : (
                  "No respondent groups found matching your search."
                )
              }
            >
              {(item) => {
                const itemIndex = (page - 1) * rowsPerPage + paginatedItems.indexOf(item) + 1;
                return (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-bold text-slate-400">{itemIndex}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">{item.groupName}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">{item.defaultRankTitle}</TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-[280px] font-serif leading-relaxed truncate">
                      {item.defaultAddress}
                    </TableCell>
                    <TableCell>
                      {item.isOurOffice ? (
                        <Chip size="sm" color="primary" variant="solid" className="text-[10px] font-bold">
                          OUR INSTITUTION
                        </Chip>
                      ) : (
                        <Chip size="sm" variant="flat" className="text-[10px] font-medium text-slate-600">
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

      {/* MODAL 1: Add Respondent Group */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAddSubmit(onAddGroup)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">group_add</span>
                Add Respondent Group Master
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Controller
                  name="groupName"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Respondent Group Code / Identifier <span className="text-red-500">*</span>
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
                  name="defaultRankTitle"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Default Representative Official Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Principal Secretary (Higher Education)"
                        isInvalid={!!addErrors.defaultRankTitle}
                        errorMessage={addErrors.defaultRankTitle?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="defaultAddress"
                  control={addControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Official Service Postal Address <span className="text-red-500">*</span>
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
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Institutional Classification <span className="text-red-500">*</span>
                      </label>
                      <Select
                        size="sm"
                        items={ORG_CLASSIFICATION_OPTIONS}
                        selectedKeys={[field.value ? "true" : "false"]}
                        onChange={(e) => field.onChange(e.target.value === "true")}
                      >
                        {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                      </Select>
                    </div>
                  )}
                />
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
                  Save Group
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: Edit Respondent Group */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleEditSubmit(onUpdateGroup)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit</span>
                Edit Respondent Group: {editingItem?.groupName}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Controller
                  name="groupName"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
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
                  name="defaultRankTitle"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Default Representative Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        isInvalid={!!editErrors.defaultRankTitle}
                        errorMessage={editErrors.defaultRankTitle?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="defaultAddress"
                  control={editControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Official Service Address <span className="text-red-500">*</span>
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
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Classification <span className="text-red-500">*</span>
                      </label>
                      <Select
                        size="sm"
                        items={ORG_CLASSIFICATION_OPTIONS}
                        selectedKeys={[field.value ? "true" : "false"]}
                        onChange={(e) => field.onChange(e.target.value === "true")}
                      >
                        {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                      </Select>
                    </div>
                  )}
                />
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
                Confirm Deletion
              </ModalHeader>
              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove <b>{itemToDelete?.groupName}</b> from the master registry? Active case notices mapped to this respondent group will be affected.
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