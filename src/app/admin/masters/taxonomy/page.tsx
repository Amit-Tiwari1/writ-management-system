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

export default function TaxonomyMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [taxonomyData, setTaxonomyData] = useState([
    { id: 1, category: "Recruitment", subCategory: "Constable Civil Police & PAC Recruitment - 2009", subject: "PET Fail / Physical Disqualification", officer: "Swahleen Ahmad (SI)" },
    { id: 2, category: "Recruitment", subCategory: "Constable Civil Police and PAC Recruitment - 2018", subject: "Cut-off Marks & Normalization Discrepancy", officer: "Himanshu Tiwari (ASI)" },
    { id: 3, category: "Recruitment", subCategory: "UP Police Sub Inspector Civil Police & Platoon Rec. 2011", subject: "Answer Key & OMR Evaluation Challenge", officer: "Rajveer Singh (SI)" },
    { id: 4, category: "Promotion", subCategory: "SICP Ranker Exam 2011", subject: "PET Absent / Exemption Claim", officer: "Rakesh Sharma (DySP)" },
    { id: 5, category: "Promotion", subCategory: "Head Constable to Sub Inspector Promotion 2021", subject: "Seniority List & Cadre Dispute", officer: "DySP Promotion" },
    { id: 6, category: "Establishment", subCategory: "Appointment under Dying in Harness Rules", subject: "Compassionate Appointment Claim (SICP)", officer: "SP Legal (Cell-1)" },
    { id: 7, category: "Others", subCategory: "Disciplinary Proceedings & Punishment", subject: "Quashing the Punishment / Suspension Order", officer: "SPO (Legal Desk)" },
    { id: 8, category: "Others", subCategory: "House Keeping & Vendor Procurement", subject: "Tender Cancellation & Work Order Challenge", officer: "Accounts Wing" },
  ]);

  const [formData, setFormData] = useState({
    category: "Recruitment",
    subCategory: "",
    subject: "",
    officer: "SP Legal (Cell-1)",
  });

  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const handleAdd = () => {
    if (!formData.subCategory.trim() || !formData.subject.trim()) return;
    setTaxonomyData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        category: formData.category,
        subCategory: formData.subCategory.trim(),
        subject: formData.subject.trim(),
        officer: formData.officer,
      },
    ]);
    setFormData({ category: "Recruitment", subCategory: "", subject: "", officer: "SP Legal (Cell-1)" });
    onAddOpenChange();
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem({ ...item });
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setTaxonomyData((prev) =>
      prev.map((t) => (t.id === editingItem.id ? editingItem : t))
    );
    onEditOpenChange();
  };

  const handleOpenDelete = (item: any) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    setTaxonomyData((prev) => prev.filter((t) => t.id !== itemToDelete.id));
    onDeleteOpenChange();
  };

  const filtered = useMemo(() => {
    return taxonomyData.filter((t) => {
      const matchesCategory = selectedCategory === "ALL" || t.category === selectedCategory;
      const matchesSearch =
        t.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.officer.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [taxonomyData, selectedCategory, searchQuery]);

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
                <h1 className="text-base font-bold text-slate-900">6.6 Case Category, Sub Category & Subject Tree</h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  3-Tier Dynamic Taxonomy
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Manage recruitment cycles, exams, promotion heads and granular litigation issues
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={onAddOpen}
            >
              Add Taxonomy Node
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search exam name, subject issue or officer..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50 sm:col-span-2"
            />
            <Select
              size="sm"
              radius="sm"
              placeholder="Filter by Master Category"
              selectedKeys={[selectedCategory]}
              onChange={(e) => setSelectedCategory(e.target.value || "ALL")}
              className="bg-slate-50 font-semibold"
            >
              <SelectItem key="ALL">All Master Categories</SelectItem>
              <SelectItem key="Recruitment">Recruitment</SelectItem>
              <SelectItem key="Promotion">Promotion</SelectItem>
              <SelectItem key="Establishment">Establishment</SelectItem>
              <SelectItem key="Others">Others</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Taxonomy Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Litigation Subject Hierarchy ({filtered.length} Nodes)
          </h3>
          <span className="text-[11px] text-slate-400">Auto-routes incoming petitions to nodal officers</span>
        </div>

        <CardBody className="p-0">
          <Table removeWrapper aria-label="Taxonomy Tree Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">CATEGORY</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">SUB CATEGORY (EXAM / MATTERS)</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">GRANULAR SUBJECT ISSUE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">MAPPED OFFICER</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
            </TableHeader>
            <TableBody items={filtered} emptyContent="No taxonomy nodes found matching your search.">
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
                  <TableCell className="text-xs font-semibold text-slate-900 max-w-[240px]">{item.subCategory}</TableCell>
                  <TableCell className="text-xs text-slate-700 max-w-[260px] font-serif leading-relaxed">{item.subject}</TableCell>
                  <TableCell className="text-xs font-medium text-blue-900">{item.officer}</TableCell>
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

      {/* MODAL 1: Add Taxonomy Node */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">account_tree</span>
                Add Taxonomy Subject Node
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Select
                  size="sm"
                  label="Master Category (Tier-1)"
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

                <Input
                  size="sm"
                  label="Sub Category / Exam Cycle Name (Tier-2)"
                  labelPlacement="outside"
                  placeholder="e.g. Constable Civil Police & PAC 2023"
                  value={formData.subCategory}
                  onValueChange={(v) => setFormData({ ...formData, subCategory: v })}
                  isRequired
                />

                <Input
                  size="sm"
                  label="Granular Subject Issue (Tier-3)"
                  labelPlacement="outside"
                  placeholder="e.g. Disqualification in Physical Standard Test (Chest Measurement)"
                  value={formData.subject}
                  onValueChange={(v) => setFormData({ ...formData, subject: v })}
                  isRequired
                />

                <Select
                  size="sm"
                  label="Default Nodal Custodian Officer"
                  labelPlacement="outside"
                  selectedKeys={[formData.officer]}
                  onChange={(e) => setFormData({ ...formData, officer: e.target.value })}
                  isRequired
                >
                  <SelectItem key="SP Legal (Cell-1)">SP Legal (Cell-1)</SelectItem>
                  <SelectItem key="DySP Promotion">DySP Promotion</SelectItem>
                  <SelectItem key="Swahleen Ahmad (SI)">Swahleen Ahmad (SI)</SelectItem>
                  <SelectItem key="Himanshu Tiwari (ASI)">Himanshu Tiwari (ASI)</SelectItem>
                  <SelectItem key="Rajveer Singh (SI)">Rajveer Singh (SI)</SelectItem>
                  <SelectItem key="SPO (Legal Desk)">SPO (Legal Desk)</SelectItem>
                  <SelectItem key="Accounts Wing">Accounts Wing</SelectItem>
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
                  Save Subject Node
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: Edit Taxonomy Node */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit</span>
                Edit Taxonomy Node: #{editingItem?.id}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Select
                  size="sm"
                  label="Master Category"
                  labelPlacement="outside"
                  selectedKeys={editingItem ? [editingItem.category] : ["Recruitment"]}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                >
                  <SelectItem key="Recruitment">Recruitment</SelectItem>
                  <SelectItem key="Promotion">Promotion</SelectItem>
                  <SelectItem key="Establishment">Establishment</SelectItem>
                  <SelectItem key="Others">Others</SelectItem>
                </Select>

                <Input
                  size="sm"
                  label="Sub Category / Exam Name"
                  labelPlacement="outside"
                  value={editingItem?.subCategory || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, subCategory: v })}
                  isRequired
                />

                <Input
                  size="sm"
                  label="Granular Subject Issue"
                  labelPlacement="outside"
                  value={editingItem?.subject || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, subject: v })}
                  isRequired
                />

                <Select
                  size="sm"
                  label="Default Nodal Officer"
                  labelPlacement="outside"
                  selectedKeys={editingItem ? [editingItem.officer] : ["SP Legal (Cell-1)"]}
                  onChange={(e) => setEditingItem({ ...editingItem, officer: e.target.value })}
                >
                  <SelectItem key="SP Legal (Cell-1)">SP Legal (Cell-1)</SelectItem>
                  <SelectItem key="DySP Promotion">DySP Promotion</SelectItem>
                  <SelectItem key="Swahleen Ahmad (SI)">Swahleen Ahmad (SI)</SelectItem>
                  <SelectItem key="Himanshu Tiwari (ASI)">Himanshu Tiwari (ASI)</SelectItem>
                  <SelectItem key="Rajveer Singh (SI)">Rajveer Singh (SI)</SelectItem>
                  <SelectItem key="SPO (Legal Desk)">SPO (Legal Desk)</SelectItem>
                  <SelectItem key="Accounts Wing">Accounts Wing</SelectItem>
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

      {/* MODAL 3: Delete Confirmation */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} placement="center" size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">warning</span>
                Confirm Node Deletion
              </ModalHeader>
              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove <b>{itemToDelete?.subject}</b> under <i>{itemToDelete?.subCategory}</i>? Existing petitions mapped to this issue node will require taxonomy re-assignment.
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
                  Delete Node
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}