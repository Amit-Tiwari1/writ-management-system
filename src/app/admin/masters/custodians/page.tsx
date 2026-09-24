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

export default function CustodianMappingPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [mappings, setMappings] = useState([
    { id: 1, category: "Others", subject: "For Giving Work Order For House Keeping", designation: "Inspector / SPO", officer: "Ravindra Prakash Srivastava", wing: "General Administration" },
    { id: 2, category: "Others", subject: "Dismissal From Service Challenge", designation: "Deputy SP (Legal)", officer: "Sayad Mani Asgar", wing: "Disciplinary Cell" },
    { id: 3, category: "Promotion", subject: "DYSP PROMOTION & Seniority Dispute", designation: "Superintendent of Police", officer: "Ramakant Prashad", wing: "Promotion Wing" },
    { id: 4, category: "Others", subject: "Pension and Gratuity Release Matters", designation: "Senior Accounts Officer", officer: "Vijay Kumar (SPO)", wing: "Finance Wing" },
    { id: 5, category: "Others", subject: "Quashing the Punishment Order", designation: "Senior Prosecuting Officer", officer: "Manoj Kumar Yadav (SPO)", wing: "Legal Cell" },
    { id: 6, category: "Recruitment", subject: "Sports Quota Certification Scrutiny", designation: "Dy.SP (Kushal Khiladi)", officer: "Ahsanullah Khan", wing: "Recruitment Wing" },
  ]);

  const [formData, setFormData] = useState({
    category: "Others",
    subject: "",
    designation: "Superintendent of Police (Legal)",
    officer: "",
    wing: "Legal Cell",
  });

  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const handleAdd = () => {
    if (!formData.subject.trim() || !formData.officer.trim()) return;
    setMappings((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        category: formData.category,
        subject: formData.subject.trim(),
        designation: formData.designation,
        officer: formData.officer.trim(),
        wing: formData.wing,
      },
    ]);
    setFormData({
      category: "Others",
      subject: "",
      designation: "Superintendent of Police (Legal)",
      officer: "",
      wing: "Legal Cell",
    });
    onAddOpenChange();
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem({ ...item });
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setMappings((prev) =>
      prev.map((m) => (m.id === editingItem.id ? editingItem : m))
    );
    onEditOpenChange();
  };

  const handleOpenDelete = (item: any) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    setMappings((prev) => prev.filter((m) => m.id !== itemToDelete.id));
    onDeleteOpenChange();
  };

  const filteredMappings = useMemo(() => {
    return mappings.filter((item) => {
      const matchesCategory =
        selectedCategoryFilter === "ALL" || item.category === selectedCategoryFilter;

      const matchesSearch =
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.officer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.wing.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.designation.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [mappings, selectedCategoryFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* 1. Header Information Bar */}
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
                <h1 className="text-base font-bold text-slate-900">6.7 Subject-Wise Officer Custodian Mapping</h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  Automated Assignment
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Maps incoming writ subjects directly to the designated officer, designation and administrative wing
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={onAddOpen}
            >
              Assign New Custodian
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search subject, custodian officer or wing..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50 sm:col-span-2"
            />
            <Select
              size="sm"
              radius="sm"
              placeholder="Filter by Category"
              selectedKeys={[selectedCategoryFilter]}
              onChange={(e) => setSelectedCategoryFilter(e.target.value || "ALL")}
              className="bg-slate-50 font-semibold"
            >
              <SelectItem key="ALL">All Categories</SelectItem>
              <SelectItem key="Recruitment">Recruitment</SelectItem>
              <SelectItem key="Promotion">Promotion</SelectItem>
              <SelectItem key="Establishment">Establishment</SelectItem>
              <SelectItem key="Others">Others</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Mappings Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Subject-Officer Bindings ({filteredMappings.length} Rules)
          </h3>
          <span className="text-[11px] text-slate-400">Instant routing on 2.2 Case Intake</span>
        </div>

        <CardBody className="p-0">
          <Table removeWrapper aria-label="Custodian Mapping Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">CATEGORY</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">LITIGATION SUBJECT MATTER</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">OFFICIAL DESIGNATION</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">CUSTODIAN OFFICER NAME</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">SECTION WING</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
            </TableHeader>
            <TableBody items={filteredMappings} emptyContent="No custodian rules match the selected filter.">
              {(item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell className="text-xs font-bold text-slate-400">{item.id}</TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        item.category === "Recruitment"
                          ? "primary"
                          : item.category === "Promotion"
                          ? "secondary"
                          : item.category === "Establishment"
                          ? "warning"
                          : "default"
                      }
                      className="text-[10px] font-bold"
                    >
                      {item.category}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-900 max-w-[260px] font-serif leading-relaxed">
                    {item.subject}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-blue-700">{item.designation}</TableCell>
                  <TableCell className="text-xs text-slate-800 font-medium">{item.officer}</TableCell>
                  <TableCell className="text-xs text-slate-500">{item.wing}</TableCell>
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

      {/* MODAL 1: Add New Custodian Rule */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">person_add</span>
                Map Subject to Legal Custodian
              </ModalHeader>
              <ModalBody className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    size="sm"
                    label="Case Category"
                    labelPlacement="outside"
                    selectedKeys={[formData.category]}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    isRequired
                  >
                    <SelectItem key="Recruitment">Recruitment</SelectItem>
                    <SelectItem key="Promotion">Promotion</SelectItem>
                    <SelectItem key="Establishment">Establishment</SelectItem>
                    <SelectItem key="Others">Others</SelectItem>
                  </Select>

                  <Select
                    size="sm"
                    label="Section Wing"
                    labelPlacement="outside"
                    selectedKeys={[formData.wing]}
                    onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                    isRequired
                  >
                    <SelectItem key="Legal Cell">Legal Cell</SelectItem>
                    <SelectItem key="Recruitment Wing">Recruitment Wing</SelectItem>
                    <SelectItem key="Promotion Wing">Promotion Wing</SelectItem>
                    <SelectItem key="Disciplinary Cell">Disciplinary Cell</SelectItem>
                    <SelectItem key="Finance Wing">Finance Wing</SelectItem>
                    <SelectItem key="General Administration">General Administration</SelectItem>
                  </Select>
                </div>

                <Input
                  size="sm"
                  label="Litigation Subject Matter"
                  labelPlacement="outside"
                  placeholder="e.g. Height Measurement Re-examination Challenge"
                  value={formData.subject}
                  onValueChange={(v) => setFormData({ ...formData, subject: v })}
                  isRequired
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    size="sm"
                    label="Custodian Designation"
                    labelPlacement="outside"
                    selectedKeys={[formData.designation]}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    isRequired
                  >
                    <SelectItem key="Superintendent of Police (Legal)">Superintendent of Police (Legal)</SelectItem>
                    <SelectItem key="Deputy SP (Legal)">Deputy SP (Legal)</SelectItem>
                    <SelectItem key="Dy.SP (Promotion)">Dy.SP (Promotion)</SelectItem>
                    <SelectItem key="Senior Prosecuting Officer">Senior Prosecuting Officer</SelectItem>
                    <SelectItem key="Senior Accounts Officer">Senior Accounts Officer</SelectItem>
                    <SelectItem key="Inspector / SPO">Inspector / SPO</SelectItem>
                  </Select>

                  <Input
                    size="sm"
                    label="Custodian Officer Name"
                    labelPlacement="outside"
                    placeholder="e.g. Swahleen Ahmad (SI)"
                    value={formData.officer}
                    onValueChange={(v) => setFormData({ ...formData, officer: v })}
                    isRequired
                  />
                </div>
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
                  Save Mapping
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: Edit Custodian Rule */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit</span>
                Edit Custodian Mapping: #{editingItem?.id}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    size="sm"
                    label="Case Category"
                    labelPlacement="outside"
                    selectedKeys={editingItem ? [editingItem.category] : ["Others"]}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  >
                    <SelectItem key="Recruitment">Recruitment</SelectItem>
                    <SelectItem key="Promotion">Promotion</SelectItem>
                    <SelectItem key="Establishment">Establishment</SelectItem>
                    <SelectItem key="Others">Others</SelectItem>
                  </Select>

                  <Select
                    size="sm"
                    label="Section Wing"
                    labelPlacement="outside"
                    selectedKeys={editingItem ? [editingItem.wing] : ["Legal Cell"]}
                    onChange={(e) => setEditingItem({ ...editingItem, wing: e.target.value })}
                  >
                    <SelectItem key="Legal Cell">Legal Cell</SelectItem>
                    <SelectItem key="Recruitment Wing">Recruitment Wing</SelectItem>
                    <SelectItem key="Promotion Wing">Promotion Wing</SelectItem>
                    <SelectItem key="Disciplinary Cell">Disciplinary Cell</SelectItem>
                    <SelectItem key="Finance Wing">Finance Wing</SelectItem>
                    <SelectItem key="General Administration">General Administration</SelectItem>
                  </Select>
                </div>

                <Input
                  size="sm"
                  label="Litigation Subject Matter"
                  labelPlacement="outside"
                  value={editingItem?.subject || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, subject: v })}
                  isRequired
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    size="sm"
                    label="Custodian Designation"
                    labelPlacement="outside"
                    selectedKeys={editingItem ? [editingItem.designation] : ["Superintendent of Police (Legal)"]}
                    onChange={(e) => setEditingItem({ ...editingItem, designation: e.target.value })}
                  >
                    <SelectItem key="Superintendent of Police (Legal)">Superintendent of Police (Legal)</SelectItem>
                    <SelectItem key="Deputy SP (Legal)">Deputy SP (Legal)</SelectItem>
                    <SelectItem key="Dy.SP (Promotion)">Dy.SP (Promotion)</SelectItem>
                    <SelectItem key="Senior Prosecuting Officer">Senior Prosecuting Officer</SelectItem>
                    <SelectItem key="Senior Accounts Officer">Senior Accounts Officer</SelectItem>
                    <SelectItem key="Inspector / SPO">Inspector / SPO</SelectItem>
                  </Select>

                  <Input
                    size="sm"
                    label="Custodian Officer Name"
                    labelPlacement="outside"
                    value={editingItem?.officer || ""}
                    onValueChange={(v) => setEditingItem({ ...editingItem, officer: v })}
                    isRequired
                  />
                </div>
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
                Are you sure you want to remove the custodian rule for <b>{itemToDelete?.subject}</b>? Newly registered petitions on this issue will not be auto-routed.
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