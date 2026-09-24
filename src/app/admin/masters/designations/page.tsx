"use client";

import React, { useState, useMemo } from "react";
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
} from "@nextui-org/react";
import Link from "next/link";

export default function DesignationMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTierFilter, setSelectedTierFilter] = useState("ALL");

  const [designations, setDesignations] = useState([
    { id: 1, title: "Chairman / DG", authorityLevel: "Apex Board Authority", defaultRole: "Executive Head" },
    { id: 2, title: "Member Secretary / ADG", authorityLevel: "Senior Administrative", defaultRole: "Operational Head" },
    { id: 3, title: "Superintendent of Police (Legal)", authorityLevel: "Head of Legal Cell", defaultRole: "OIC & PWC Authority" },
    { id: 4, title: "Additional Secretary / S.P. (Recruitment)", authorityLevel: "Wing Head", defaultRole: "Recruitment Custodian" },
    { id: 5, title: "Dy.SP (Promotion)", authorityLevel: "Division Head", defaultRole: "Promotion Custodian" },
    { id: 6, title: "Senior Prosecuting Officer (SPO)", authorityLevel: "Judicial Advisory", defaultRole: "Legal Vetting Officer" },
    { id: 7, title: "Assistant Sub Inspector (M)", authorityLevel: "Legal Desk Operator", defaultRole: "Noting / Filing Desk" },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    authorityLevel: "Legal Desk Operator",
    defaultRole: "Noting / Filing Desk",
  });

  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const handleAdd = () => {
    if (!formData.title.trim()) return;
    setDesignations((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: formData.title.trim(),
        authorityLevel: formData.authorityLevel,
        defaultRole: formData.defaultRole,
      },
    ]);
    setFormData({ title: "", authorityLevel: "Legal Desk Operator", defaultRole: "Noting / Filing Desk" });
    onAddOpenChange();
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem({ ...item });
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setDesignations((prev) =>
      prev.map((d) => (d.id === editingItem.id ? editingItem : d))
    );
    onEditOpenChange();
  };

  const handleOpenDelete = (item: any) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    setDesignations((prev) => prev.filter((d) => d.id !== itemToDelete.id));
    onDeleteOpenChange();
  };

  const filteredDesignations = useMemo(() => {
    return designations.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authorityLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.defaultRole.toLowerCase().includes(searchQuery.toLowerCase());

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
                <Link href="/admin/cases">
                  <Button isIconOnly size="sm" variant="light" className="text-slate-500">
                    <span className="material-symbols-rounded">arrow_back</span>
                  </Button>
                </Link>
                <h1 className="text-base font-bold text-slate-900">6.4 Designation & Administrative Roles Master</h1>
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
              onPress={onAddOpen}
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
              placeholder="Filter by Authority Tier"
              selectedKeys={[selectedTierFilter]}
              onChange={(e) => setSelectedTierFilter(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              <SelectItem key="ALL">All Authority Tiers</SelectItem>
              <SelectItem key="Apex Board Authority">Apex Board Authority</SelectItem>
              <SelectItem key="Senior Administrative">Senior Administrative</SelectItem>
              <SelectItem key="Head of Legal Cell">Head of Legal Cell</SelectItem>
              <SelectItem key="Wing Head">Wing Head</SelectItem>
              <SelectItem key="Division Head">Division Head</SelectItem>
              <SelectItem key="Judicial Advisory">Judicial Advisory</SelectItem>
              <SelectItem key="Legal Desk Operator">Legal Desk Operator</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Main Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Designation Master Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">OFFICIAL DESIGNATION TITLE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">AUTHORITY TIER</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">DEFAULT CASE ROLE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
            </TableHeader>
            <TableBody items={filteredDesignations} emptyContent="No administrative designations match the specified criteria.">
              {(item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell className="text-xs font-bold text-slate-400">{item.id}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">{item.title}</TableCell>
                  <TableCell className="text-xs text-slate-700 font-medium">{item.authorityLevel}</TableCell>
                  <TableCell className="text-xs text-blue-700 font-semibold">{item.defaultRole}</TableCell>
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
              )}
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
                  selectedKeys={[formData.authorityLevel]}
                  onChange={(e) => setFormData({ ...formData, authorityLevel: e.target.value })}
                  isRequired
                >
                  <SelectItem key="Apex Board Authority">Apex Board Authority</SelectItem>
                  <SelectItem key="Senior Administrative">Senior Administrative</SelectItem>
                  <SelectItem key="Head of Legal Cell">Head of Legal Cell</SelectItem>
                  <SelectItem key="Wing Head">Wing Head</SelectItem>
                  <SelectItem key="Division Head">Division Head</SelectItem>
                  <SelectItem key="Judicial Advisory">Judicial Advisory</SelectItem>
                  <SelectItem key="Legal Desk Operator">Legal Desk Operator</SelectItem>
                </Select>
                <Select
                  size="sm"
                  label="Default Case Management Role"
                  labelPlacement="outside"
                  selectedKeys={[formData.defaultRole]}
                  onChange={(e) => setFormData({ ...formData, defaultRole: e.target.value })}
                  isRequired
                >
                  <SelectItem key="Executive Head">Executive Head</SelectItem>
                  <SelectItem key="Operational Head">Operational Head</SelectItem>
                  <SelectItem key="OIC & PWC Authority">OIC & PWC Authority</SelectItem>
                  <SelectItem key="Recruitment Custodian">Recruitment Custodian</SelectItem>
                  <SelectItem key="Promotion Custodian">Promotion Custodian</SelectItem>
                  <SelectItem key="Legal Vetting Officer">Legal Vetting Officer</SelectItem>
                  <SelectItem key="Noting / Filing Desk">Noting / Filing Desk</SelectItem>
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
                  onValueChange={(v) => setEditingItem({ ...editingItem, title: v })}
                  isRequired
                />
                <Select
                  size="sm"
                  label="Authority Level"
                  labelPlacement="outside"
                  selectedKeys={editingItem ? [editingItem.authorityLevel] : ["Legal Desk Operator"]}
                  onChange={(e) => setEditingItem({ ...editingItem, authorityLevel: e.target.value })}
                >
                  <SelectItem key="Apex Board Authority">Apex Board Authority</SelectItem>
                  <SelectItem key="Senior Administrative">Senior Administrative</SelectItem>
                  <SelectItem key="Head of Legal Cell">Head of Legal Cell</SelectItem>
                  <SelectItem key="Wing Head">Wing Head</SelectItem>
                  <SelectItem key="Division Head">Division Head</SelectItem>
                  <SelectItem key="Judicial Advisory">Judicial Advisory</SelectItem>
                  <SelectItem key="Legal Desk Operator">Legal Desk Operator</SelectItem>
                </Select>
                <Select
                  size="sm"
                  label="Default Case Role"
                  labelPlacement="outside"
                  selectedKeys={editingItem ? [editingItem.defaultRole] : ["Noting / Filing Desk"]}
                  onChange={(e) => setEditingItem({ ...editingItem, defaultRole: e.target.value })}
                >
                  <SelectItem key="Executive Head">Executive Head</SelectItem>
                  <SelectItem key="Operational Head">Operational Head</SelectItem>
                  <SelectItem key="OIC & PWC Authority">OIC & PWC Authority</SelectItem>
                  <SelectItem key="Recruitment Custodian">Recruitment Custodian</SelectItem>
                  <SelectItem key="Promotion Custodian">Promotion Custodian</SelectItem>
                  <SelectItem key="Legal Vetting Officer">Legal Vetting Officer</SelectItem>
                  <SelectItem key="Noting / Filing Desk">Noting / Filing Desk</SelectItem>
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