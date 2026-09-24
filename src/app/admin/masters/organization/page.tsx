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

export default function OrganizationMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParentFilter, setSelectedParentFilter] = useState("ALL");

  const [departments, setDepartments] = useState([
    { id: 1, name: "DISTRICT EFFECTIVE FORCE", code: "DEF", parent: "State Police Headquarter", activeCases: 412 },
    { id: 2, name: "Training Directorate", code: "TRG", parent: "State Police Headquarter", activeCases: 89 },
    { id: 3, name: "Criminal Investigation Department (CID)", code: "CID", parent: "State Police Headquarter", activeCases: 34 },
    { id: 4, name: "Special Enquiry Cell", code: "SEC", parent: "Recruitment Board", activeCases: 19 },
    { id: 5, name: "Anti Corruption Organization (ACO)", code: "ACO", parent: "Vigilance Wing", activeCases: 12 },
    { id: 6, name: "Human Rights Cell (HRC)", code: "HRC", parent: "Director General Office", activeCases: 7 },
    { id: 7, name: "Anti-Terrorist Squad (ATS)", code: "ATS", parent: "Special Wing", activeCases: 3 },
    { id: 8, name: "Intelligence Department (IB)", code: "INT", parent: "State Police Headquarter", activeCases: 15 },
  ]);

  const [newDept, setNewDept] = useState({ name: "", code: "", parent: "State Police Headquarter" });
  const [editingDept, setEditingDept] = useState<any>(null);
  const [deptToDelete, setDeptToDelete] = useState<any>(null);

  const parentFormations = [
    { key: "State Police Headquarter", label: "State Police Headquarter" },
    { key: "Recruitment Board", label: "Recruitment Board" },
    { key: "Vigilance Wing", label: "Vigilance Wing" },
    { key: "Director General Office", label: "Director General Office" },
    { key: "Special Wing", label: "Special Wing" },
  ];

  const handleAdd = () => {
    if (!newDept.name.trim()) return;
    setDepartments((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: newDept.name.trim(),
        code: newDept.code.trim().toUpperCase() || `DEP-${prev.length + 1}`,
        parent: newDept.parent,
        activeCases: 0,
      },
    ]);
    setNewDept({ name: "", code: "", parent: "State Police Headquarter" });
    onAddOpenChange();
  };

  const handleOpenEdit = (item: any) => {
    setEditingDept({ ...item });
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (!editingDept) return;
    setDepartments((prev) =>
      prev.map((d) => (d.id === editingDept.id ? editingDept : d))
    );
    onEditOpenChange();
  };

  const handleOpenDelete = (item: any) => {
    setDeptToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = () => {
    if (!deptToDelete) return;
    setDepartments((prev) => prev.filter((d) => d.id !== deptToDelete.id));
    onDeleteOpenChange();
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.parent.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesParent =
        selectedParentFilter === "ALL" || item.parent === selectedParentFilter;

      return matchesSearch && matchesParent;
    });
  }, [departments, searchQuery, selectedParentFilter]);

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
                <h1 className="text-base font-bold text-slate-900">6.2 Department & Institutional Units Master</h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  {departments.length} Units Active
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Institutional directorates, police wings, sections & internal administrative units
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={onAddOpen}
            >
              Add Department Unit
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search by unit name or code..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50 sm:col-span-2"
            />
            <Select
              size="sm"
              radius="sm"
              placeholder="Filter by Parent Formation"
              selectedKeys={[selectedParentFilter]}
              onChange={(e) => setSelectedParentFilter(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              <SelectItem key="ALL">All Parent Formations</SelectItem>
              <SelectItem key="State Police Headquarter">State Police Headquarter</SelectItem>
              <SelectItem key="Recruitment Board">Recruitment Board</SelectItem>
              <SelectItem key="Vigilance Wing">Vigilance Wing</SelectItem>
              <SelectItem key="Director General Office">Director General Office</SelectItem>
              <SelectItem key="Special Wing">Special Wing</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Main Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Department Master Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">DEPARTMENT / UNIT NAME</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">UNIT CODE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">PARENT FORMATION</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">LINKED WRITS</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
            </TableHeader>
            <TableBody items={filteredDepartments} emptyContent="No institutional units match your search.">
              {(item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell className="text-xs font-bold text-slate-400">{item.id}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">{item.name}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-blue-700">{item.code}</TableCell>
                  <TableCell className="text-xs text-slate-600">{item.parent}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="primary" className="text-[10px] font-bold">
                      {item.activeCases} Writs
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
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* 1. Add Department Modal */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">corporate_fare</span>
                Add Institutional Department Unit
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Department / Unit Full Name"
                  labelPlacement="outside"
                  placeholder="e.g. Special Task Force (STF)"
                  value={newDept.name}
                  onValueChange={(v) => setNewDept({ ...newDept, name: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Unit Short Code"
                  labelPlacement="outside"
                  placeholder="e.g. STF"
                  value={newDept.code}
                  onValueChange={(v) => setNewDept({ ...newDept, code: v })}
                />
                <Select
                  size="sm"
                  label="Parent Formation"
                  labelPlacement="outside"
                  selectedKeys={[newDept.parent]}
                  onChange={(e) => setNewDept({ ...newDept, parent: e.target.value })}
                  isRequired
                >
                  <SelectItem key="State Police Headquarter">State Police Headquarter</SelectItem>
                  <SelectItem key="Recruitment Board">Recruitment Board</SelectItem>
                  <SelectItem key="Vigilance Wing">Vigilance Wing</SelectItem>
                  <SelectItem key="Director General Office">Director General Office</SelectItem>
                  <SelectItem key="Special Wing">Special Wing</SelectItem>
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
                  Save Department
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 2. Edit Department Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit</span>
                Edit Department: {editingDept?.code}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Department Name"
                  labelPlacement="outside"
                  value={editingDept?.name || ""}
                  onValueChange={(v) => setEditingDept({ ...editingDept, name: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Unit Code"
                  labelPlacement="outside"
                  value={editingDept?.code || ""}
                  onValueChange={(v) => setEditingDept({ ...editingDept, code: v })}
                  isRequired
                />
                <Select
                  size="sm"
                  label="Parent Formation"
                  labelPlacement="outside"
                  selectedKeys={editingDept ? [editingDept.parent] : ["State Police Headquarter"]}
                  onChange={(e) => setEditingDept({ ...editingDept, parent: e.target.value })}
                >
                  <SelectItem key="State Police Headquarter">State Police Headquarter</SelectItem>
                  <SelectItem key="Recruitment Board">Recruitment Board</SelectItem>
                  <SelectItem key="Vigilance Wing">Vigilance Wing</SelectItem>
                  <SelectItem key="Director General Office">Director General Office</SelectItem>
                  <SelectItem key="Special Wing">Special Wing</SelectItem>
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
                Are you sure you want to remove <b>{deptToDelete?.name}</b> ({deptToDelete?.code})?
                {deptToDelete?.activeCases > 0 && (
                  <p className="mt-2 text-rose-600 font-semibold">
                    Warning: There are {deptToDelete?.activeCases} active writ petitions currently linked to this unit.
                  </p>
                )}
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
                  Delete Unit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}