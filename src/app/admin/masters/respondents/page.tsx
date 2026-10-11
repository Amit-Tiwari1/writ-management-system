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
import { z } from "zod";

// Strict 1:1 Schema for React Hook Form resolving
const respondentGroupFormSchema = z.object({
  groupName: z
    .string()
    .min(2, "Respondent group code must be at least 2 characters")
    .max(100, "Group code is too long")
    .transform((val) => val.trim().toUpperCase()),
  defaultRankTitle: z
    .string()
    .min(2, "Official title must be at least 2 characters")
    .max(150, "Title is too long")
    .transform((val) => val.trim()),
  defaultAddress: z
    .string()
    .min(5, "Official service address must be at least 5 characters")
    .transform((val) => val.trim()),
  isOurOffice: z.boolean(),
});

type RespondentGroupFormValues = z.infer<typeof respondentGroupFormSchema>;

interface IRespondentGroupItem {
  _id: string;
  groupName: string;
  defaultRankTitle: string;
  defaultAddress: string;
  isOurOffice: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function RespondentsMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [respondents, setRespondents] = useState<IRespondentGroupItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [editingItem, setEditingItem] = useState<IRespondentGroupItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<IRespondentGroupItem | null>(null);

  // Hook Form for Add
  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<RespondentGroupFormValues>({
    resolver: zodResolver(respondentGroupFormSchema),
    defaultValues: {
      groupName: "",
      defaultRankTitle: "",
      defaultAddress: "",
      isOurOffice: false,
    },
  });

  // Hook Form for Edit
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<RespondentGroupFormValues>({
    resolver: zodResolver(respondentGroupFormSchema),
    defaultValues: {
      groupName: "",
      defaultRankTitle: "",
      defaultAddress: "",
      isOurOffice: false,
    },
  });

  // Fetch from Backend API
  const fetchRespondentGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await MastersAPI.getRespondentGroups();
      if (res && res.success && Array.isArray(res.data)) {
        setRespondents(res.data);
      } else if (Array.isArray(res)) {
        setRespondents(res);
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

  // Handle Create
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

  // Open Edit Modal
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

  // Handle Edit Save
  const onUpdateGroup: SubmitHandler<RespondentGroupFormValues> = async (values) => {
    if (!editingItem) return;
    try {
      setSubmitting(true);
      setRespondents((prev) =>
        prev.map((r) => (r._id === editingItem._id ? { ...r, ...values } : r))
      );
      toast.success("Group configuration updated");
      onEditOpenChange();
      setEditingItem(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update respondent group");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (item: IRespondentGroupItem) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  // Confirm Delete
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

  // Search & Filter
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

  // Pagination calculation
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
                  6.8 Respondent Groups & Opposite Parties Master
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
                resetAddForm();
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
              selectedKeys={[selectedTypeFilter]}
              onChange={(e) => {
                setSelectedTypeFilter(e.target.value || "ALL");
                setPage(1);
              }}
              className="bg-slate-50 font-semibold"
            >
              <SelectItem key="ALL">All Organization Types</SelectItem>
              <SelectItem key="OUR_OFFICE">Our Institution (UPPRPB)</SelectItem>
              <SelectItem key="STATE">State Respondent Depts</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

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
                    <Input
                      {...field}
                      size="sm"
                      label="Respondent Group Code / Identifier"
                      labelPlacement="outside"
                      placeholder="e.g. HIGHER EDUCATION DEPT"
                      isInvalid={!!addErrors.groupName}
                      errorMessage={addErrors.groupName?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="defaultRankTitle"
                  control={addControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Default Representative Official Title"
                      labelPlacement="outside"
                      placeholder="e.g. Principal Secretary (Higher Education)"
                      isInvalid={!!addErrors.defaultRankTitle}
                      errorMessage={addErrors.defaultRankTitle?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="defaultAddress"
                  control={addControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Official Service Postal Address"
                      labelPlacement="outside"
                      placeholder="e.g. Directorate Office, Prayagraj / Secretariat, Lucknow"
                      isInvalid={!!addErrors.defaultAddress}
                      errorMessage={addErrors.defaultAddress?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="isOurOffice"
                  control={addControl}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Institutional Classification"
                      labelPlacement="outside"
                      selectedKeys={[field.value ? "true" : "false"]}
                      onChange={(e) => field.onChange(e.target.value === "true")}
                      isRequired
                    >
                      <SelectItem key="false">State Respondent / External Department</SelectItem>
                      <SelectItem key="true">Our Institution (Direct Board Office)</SelectItem>
                    </Select>
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
                    <Input
                      {...field}
                      size="sm"
                      label="Group Code Name"
                      labelPlacement="outside"
                      isInvalid={!!editErrors.groupName}
                      errorMessage={editErrors.groupName?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="defaultRankTitle"
                  control={editControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Default Representative Title"
                      labelPlacement="outside"
                      isInvalid={!!editErrors.defaultRankTitle}
                      errorMessage={editErrors.defaultRankTitle?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="defaultAddress"
                  control={editControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Official Service Address"
                      labelPlacement="outside"
                      isInvalid={!!editErrors.defaultAddress}
                      errorMessage={editErrors.defaultAddress?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="isOurOffice"
                  control={editControl}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Classification"
                      labelPlacement="outside"
                      selectedKeys={[field.value ? "true" : "false"]}
                      onChange={(e) => field.onChange(e.target.value === "true")}
                    >
                      <SelectItem key="false">State Respondent / External Department</SelectItem>
                      <SelectItem key="true">Our Institution (Direct Board Office)</SelectItem>
                    </Select>
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