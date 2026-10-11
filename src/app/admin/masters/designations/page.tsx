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
import toast from "react-hot-toast";
import { MastersAPI } from "@/api/mastersApi";

interface DesignationRecord {
  _id: string;
  title: string;
  authorityLevel: string;
  defaultRole: string;
  canSignPWC?: boolean;
  canForwardFiles?: boolean;
  createdAt?: string;
}

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

export default function DesignationMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [designations, setDesignations] = useState<DesignationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTierFilter, setSelectedTierFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    title: "",
    authorityLevel: "Legal Desk Operator",
    defaultRole: "Noting / Filing Desk",
    canSignPWC: false,
    canForwardFiles: true,
  });

  const [editingItem, setEditingItem] = useState<DesignationRecord | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DesignationRecord | null>(null);

  // Fetch Designations from Backend
  const fetchDesignations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MastersAPI.getDesignations();
      if (res?.success) {
        setDesignations(res.data || []);
      }
    } catch (err: any) {
      console.error("[DesignationMaster] Error fetching:", err);
      toast.error(err.response?.data?.message || "Failed to load designations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesignations();
  }, [fetchDesignations]);

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      authorityLevel: "Legal Desk Operator",
      defaultRole: "Noting / Filing Desk",
      canSignPWC: false,
      canForwardFiles: true,
    });
    onAddOpen();
  };

  // Submit Add to Backend
  const handleAdd = async () => {
    if (!formData.title.trim()) {
      toast.error("Designation title is required!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        authorityLevel: formData.authorityLevel,
        defaultRole: formData.defaultRole,
        canSignPWC: formData.authorityLevel.includes("Head") || formData.authorityLevel.includes("Apex"),
        canForwardFiles: true,
      };

      const res = await MastersAPI.createDesignation(payload);
      if (res?.success) {
        toast.success(`Designation "${payload.title}" created successfully!`);
        onAddOpenChange();
        fetchDesignations();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create designation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (item: DesignationRecord) => {
    setEditingItem({ ...item });
    onEditOpen();
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editingItem.title.trim()) return;
    setDesignations((prev) =>
      prev.map((d) => (d._id === editingItem._id ? { ...editingItem } : d))
    );
    toast.success(`Updated designation: ${editingItem.title}`);
    onEditOpenChange();
    setEditingItem(null);
  };

  const handleOpenDelete = (item: DesignationRecord) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDesignations((prev) => prev.filter((d) => d._id !== itemToDelete._id));
    toast.success(`Designation "${itemToDelete.title}" removed.`);
    onDeleteOpenChange();
    setItemToDelete(null);
  };

  const filteredDesignations = useMemo(() => {
    return designations.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authorityLevel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.defaultRole?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier =
        selectedTierFilter === "ALL" || item.authorityLevel === selectedTierFilter;

      return matchesSearch && matchesTier;
    });
  }, [designations, searchQuery, selectedTierFilter]);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
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
                  6.4 Designation & Administrative Roles Master
                </h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  {designations.length} Designations Mapped
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
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
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
              onValueChange={setSearchQuery}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50 sm:col-span-2"
            />
            <Select
              size="sm"
              radius="sm"
              aria-label="Filter by Authority Tier"
              placeholder="Filter by Authority Tier"
              items={AUTHORITY_FILTER_ITEMS}
              selectedKeys={[selectedTierFilter]}
              onChange={(e) => setSelectedTierFilter(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              {(tier) => <SelectItem key={tier.key}>{tier.label}</SelectItem>}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Main Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Designation Master Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                S.NO
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                OFFICIAL DESIGNATION TITLE
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                AUTHORITY TIER
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DEFAULT CASE ROLE
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                ACTION
              </TableColumn>
            </TableHeader>
            <TableBody
              items={filteredDesignations}
              isLoading={loading}
              loadingContent={
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              }
              emptyContent={!loading ? "No administrative designations match the specified criteria." : " "}
            >
              {(item) => {
                const index = designations.findIndex((d) => d._id === item._id) + 1;
                return (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-bold text-slate-400">{index}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-900">{item.title}</TableCell>
                    <TableCell className="text-xs text-slate-700 font-medium">
                      {item.authorityLevel}
                    </TableCell>
                    <TableCell className="text-xs text-blue-700 font-semibold">
                      {item.defaultRole}
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

      {/* 1. Add Designation Modal */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">badge</span>
                Add Official Designation
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Official Designation Title"
                  labelPlacement="outside"
                  placeholder="e.g. Chief Law Officer (CLO)"
                  value={formData.title}
                  onValueChange={(v) => setFormData({ ...formData, title: v })}
                  isRequired
                />
                <Select
                  size="sm"
                  label="Authority Level / Signing Tier"
                  labelPlacement="outside"
                  items={AUTHORITY_TIERS}
                  selectedKeys={[formData.authorityLevel]}
                  onChange={(e) => setFormData({ ...formData, authorityLevel: e.target.value })}
                  isRequired
                >
                  {(tier) => <SelectItem key={tier.key}>{tier.label}</SelectItem>}
                </Select>
                <Select
                  size="sm"
                  label="Default Case Management Role"
                  labelPlacement="outside"
                  items={DEFAULT_ROLES}
                  selectedKeys={[formData.defaultRole]}
                  onChange={(e) => setFormData({ ...formData, defaultRole: e.target.value })}
                  isRequired
                >
                  {(role) => <SelectItem key={role.key}>{role.label}</SelectItem>}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                  onClick={handleAdd}
                >
                  Save Designation
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 2. Edit Designation Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit</span>
                Edit Designation: {editingItem?.title}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Designation Title"
                  labelPlacement="outside"
                  value={editingItem?.title || ""}
                  onValueChange={(v) =>
                    setEditingItem(editingItem ? { ...editingItem, title: v } : null)
                  }
                  isRequired
                />
                <Select
                  size="sm"
                  label="Authority Level"
                  labelPlacement="outside"
                  items={AUTHORITY_TIERS}
                  selectedKeys={editingItem ? [editingItem.authorityLevel] : ["Legal Desk Operator"]}
                  onChange={(e) =>
                    setEditingItem(
                      editingItem ? { ...editingItem, authorityLevel: e.target.value } : null
                    )
                  }
                >
                  {(tier) => <SelectItem key={tier.key}>{tier.label}</SelectItem>}
                </Select>
                <Select
                  size="sm"
                  label="Default Case Role"
                  labelPlacement="outside"
                  items={DEFAULT_ROLES}
                  selectedKeys={editingItem ? [editingItem.defaultRole] : ["Noting / Filing Desk"]}
                  onChange={(e) =>
                    setEditingItem(
                      editingItem ? { ...editingItem, defaultRole: e.target.value } : null
                    )
                  }
                >
                  {(role) => <SelectItem key={role.key}>{role.label}</SelectItem>}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
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
                Are you sure you want to remove <b>{itemToDelete?.title}</b>? Any officer profile assigned to this designation will need reconfiguration.
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