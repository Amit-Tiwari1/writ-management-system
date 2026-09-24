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

export default function RankMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCadreFilter, setSelectedCadreFilter] = useState("ALL");

  const [ranks, setRanks] = useState([
    { id: 1, name: "Constable", shortCode: "CT", cadreType: "Non-Gazetted", level: "Pay Level 3" },
    { id: 2, name: "Head Constable", shortCode: "HC", cadreType: "Non-Gazetted", level: "Pay Level 4" },
    { id: 3, name: "Sub Inspector", shortCode: "SI", cadreType: "Non-Gazetted (Executive)", level: "Pay Level 6" },
    { id: 4, name: "Inspector", shortCode: "INSP", cadreType: "Gazetted Class II", level: "Pay Level 7" },
    { id: 5, name: "Computer Operator Grade A", shortCode: "CO-A", cadreType: "Ministerial / Technical", level: "Pay Level 4" },
    { id: 6, name: "Deputy Superintendent of Police", shortCode: "DySP", cadreType: "State Police Service (PPS)", level: "Pay Level 10" },
    { id: 7, name: "Additional S.P.", shortCode: "Addl. SP", cadreType: "State Police Service (PPS)", level: "Pay Level 12" },
    { id: 8, name: "Superintendent of Police", shortCode: "SP", cadreType: "Indian Police Service (IPS)", level: "Pay Level 12" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    shortCode: "",
    cadreType: "Non-Gazetted",
    level: "Pay Level 3",
  });

  const [editingRank, setEditingRank] = useState<any>(null);
  const [rankToDelete, setRankToDelete] = useState<any>(null);

  const handleAdd = () => {
    if (!formData.name.trim()) return;
    setRanks((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: formData.name.trim(),
        shortCode: formData.shortCode.trim().toUpperCase() || `R-${prev.length + 1}`,
        cadreType: formData.cadreType,
        level: formData.level,
      },
    ]);
    setFormData({ name: "", shortCode: "", cadreType: "Non-Gazetted", level: "Pay Level 3" });
    onAddOpenChange();
  };

  const handleOpenEdit = (item: any) => {
    setEditingRank({ ...item });
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (!editingRank) return;
    setRanks((prev) =>
      prev.map((r) => (r.id === editingRank.id ? editingRank : r))
    );
    onEditOpenChange();
  };

  const handleOpenDelete = (item: any) => {
    setRankToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = () => {
    if (!rankToDelete) return;
    setRanks((prev) => prev.filter((r) => r.id !== rankToDelete.id));
    onDeleteOpenChange();
  };

  const filteredRanks = useMemo(() => {
    return ranks.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.level.toLowerCase().includes(searchQuery.toLowerCase());

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
                <Link href="/admin/cases">
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
              onPress={onAddOpen}
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
              placeholder="Filter by Cadre Type"
              selectedKeys={[selectedCadreFilter]}
              onChange={(e) => setSelectedCadreFilter(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              <SelectItem key="ALL">All Cadres</SelectItem>
              <SelectItem key="Non-Gazetted">Non-Gazetted</SelectItem>
              <SelectItem key="Non-Gazetted (Executive)">Non-Gazetted (Executive)</SelectItem>
              <SelectItem key="Gazetted Class II">Gazetted Class II</SelectItem>
              <SelectItem key="Ministerial / Technical">Ministerial / Technical</SelectItem>
              <SelectItem key="State Police Service (PPS)">State Police Service (PPS)</SelectItem>
              <SelectItem key="Indian Police Service (IPS)">Indian Police Service (IPS)</SelectItem>
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
            <TableBody items={filteredRanks} emptyContent="No police ranks match the specified criteria.">
              {(item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell className="text-xs font-bold text-slate-400">{item.id}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">{item.name}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-blue-700">{item.shortCode}</TableCell>
                  <TableCell className="text-xs text-slate-600">{item.cadreType}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="default" className="text-xs font-semibold text-slate-700">
                      {item.level}
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

      {/* 1. Add Rank Modal */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">military_tech</span>
                Add Service Rank Master
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Official Rank Title"
                  labelPlacement="outside"
                  placeholder="e.g. Assistant Sub Inspector"
                  value={formData.name}
                  onValueChange={(v) => setFormData({ ...formData, name: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Short Acronym / Code"
                  labelPlacement="outside"
                  placeholder="e.g. ASI"
                  value={formData.shortCode}
                  onValueChange={(v) => setFormData({ ...formData, shortCode: v })}
                  isRequired
                />
                <Select
                  size="sm"
                  label="Cadre Classification"
                  labelPlacement="outside"
                  selectedKeys={[formData.cadreType]}
                  onChange={(e) => setFormData({ ...formData, cadreType: e.target.value })}
                  isRequired
                >
                  <SelectItem key="Non-Gazetted">Non-Gazetted</SelectItem>
                  <SelectItem key="Non-Gazetted (Executive)">Non-Gazetted (Executive)</SelectItem>
                  <SelectItem key="Gazetted Class II">Gazetted Class II</SelectItem>
                  <SelectItem key="Ministerial / Technical">Ministerial / Technical</SelectItem>
                  <SelectItem key="State Police Service (PPS)">State Police Service (PPS)</SelectItem>
                  <SelectItem key="Indian Police Service (IPS)">Indian Police Service (IPS)</SelectItem>
                </Select>
                <Select
                  size="sm"
                  label="Applicable Pay Level"
                  labelPlacement="outside"
                  selectedKeys={[formData.level]}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  isRequired
                >
                  <SelectItem key="Pay Level 3">Pay Level 3</SelectItem>
                  <SelectItem key="Pay Level 4">Pay Level 4</SelectItem>
                  <SelectItem key="Pay Level 5">Pay Level 5</SelectItem>
                  <SelectItem key="Pay Level 6">Pay Level 6</SelectItem>
                  <SelectItem key="Pay Level 7">Pay Level 7</SelectItem>
                  <SelectItem key="Pay Level 8">Pay Level 8</SelectItem>
                  <SelectItem key="Pay Level 10">Pay Level 10</SelectItem>
                  <SelectItem key="Pay Level 12">Pay Level 12</SelectItem>
                  <SelectItem key="Pay Level 14">Pay Level 14</SelectItem>
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
                  Save Rank
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 2. Edit Rank Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit</span>
                Edit Service Rank: {editingRank?.name}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Rank Title"
                  labelPlacement="outside"
                  value={editingRank?.name || ""}
                  onValueChange={(v) => setEditingRank({ ...editingRank, name: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Short Code"
                  labelPlacement="outside"
                  value={editingRank?.shortCode || ""}
                  onValueChange={(v) => setEditingRank({ ...editingRank, shortCode: v })}
                  isRequired
                />
                <Select
                  size="sm"
                  label="Cadre Classification"
                  labelPlacement="outside"
                  selectedKeys={editingRank ? [editingRank.cadreType] : ["Non-Gazetted"]}
                  onChange={(e) => setEditingRank({ ...editingRank, cadreType: e.target.value })}
                >
                  <SelectItem key="Non-Gazetted">Non-Gazetted</SelectItem>
                  <SelectItem key="Non-Gazetted (Executive)">Non-Gazetted (Executive)</SelectItem>
                  <SelectItem key="Gazetted Class II">Gazetted Class II</SelectItem>
                  <SelectItem key="Ministerial / Technical">Ministerial / Technical</SelectItem>
                  <SelectItem key="State Police Service (PPS)">State Police Service (PPS)</SelectItem>
                  <SelectItem key="Indian Police Service (IPS)">Indian Police Service (IPS)</SelectItem>
                </Select>
                <Select
                  size="sm"
                  label="Pay Grade Level"
                  labelPlacement="outside"
                  selectedKeys={editingRank ? [editingRank.level] : ["Pay Level 3"]}
                  onChange={(e) => setEditingRank({ ...editingRank, level: e.target.value })}
                >
                  <SelectItem key="Pay Level 3">Pay Level 3</SelectItem>
                  <SelectItem key="Pay Level 4">Pay Level 4</SelectItem>
                  <SelectItem key="Pay Level 5">Pay Level 5</SelectItem>
                  <SelectItem key="Pay Level 6">Pay Level 6</SelectItem>
                  <SelectItem key="Pay Level 7">Pay Level 7</SelectItem>
                  <SelectItem key="Pay Level 8">Pay Level 8</SelectItem>
                  <SelectItem key="Pay Level 10">Pay Level 10</SelectItem>
                  <SelectItem key="Pay Level 12">Pay Level 12</SelectItem>
                  <SelectItem key="Pay Level 14">Pay Level 14</SelectItem>
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
                Are you sure you want to remove <b>{rankToDelete?.name}</b> ({rankToDelete?.shortCode})?
                Candidate profiles in active writs referencing this cadre might be affected.
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