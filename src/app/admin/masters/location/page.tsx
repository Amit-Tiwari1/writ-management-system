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

export default function LocationMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStateFilter, setSelectedStateFilter] = useState("ALL");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState("ALL");

  const [districts, setDistricts] = useState([
    { id: "d1", state: "Uttar Pradesh", zone: "Lucknow Zone", range: "Lucknow Range", district: "Lucknow", headquarters: "Lucknow", status: "ACTIVE" },
    { id: "d2", state: "Uttar Pradesh", zone: "Varanasi Zone", range: "Varanasi Range", district: "Varanasi", headquarters: "Varanasi", status: "ACTIVE" },
    { id: "d3", state: "Uttar Pradesh", zone: "Prayagraj Zone", range: "Prayagraj Range", district: "Prayagraj", headquarters: "Prayagraj", status: "ACTIVE" },
    { id: "d4", state: "Uttar Pradesh", zone: "Gorakhpur Zone", range: "Gorakhpur Range", district: "Gorakhpur", headquarters: "Gorakhpur", status: "ACTIVE" },
    { id: "d5", state: "Uttar Pradesh", zone: "Agra Zone", range: "Agra Range", district: "Agra", headquarters: "Agra", status: "ACTIVE" },
    { id: "d6", state: "West Bengal", zone: "Kolkata Region", range: "Jalpaiguri", district: "Alipurduar", headquarters: "Alipurduar", status: "ACTIVE" },
  ]);

  const [formData, setFormData] = useState({ state: "Uttar Pradesh", zone: "", district: "", headquarters: "" });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const handleAdd = () => {
    if (!formData.district.trim()) return;
    setDistricts((prev) => [
      ...prev,
      {
        id: `d${Date.now()}`,
        state: formData.state,
        zone: formData.zone || "Headquarters",
        range: formData.zone || "Headquarters",
        district: formData.district,
        headquarters: formData.headquarters || formData.district,
        status: "ACTIVE",
      },
    ]);
    setFormData({ state: "Uttar Pradesh", zone: "", district: "", headquarters: "" });
    onAddOpenChange();
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem({ ...item });
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setDistricts((prev) =>
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
    setDistricts((prev) => prev.filter((d) => d.id !== itemToDelete.id));
    onDeleteOpenChange();
  };

  const filteredDistricts = useMemo(() => {
    return districts.filter((item) => {
      const matchesSearch =
        item.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.zone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesState =
        selectedStateFilter === "ALL" || item.state === selectedStateFilter;

      const matchesZone =
        selectedZoneFilter === "ALL" || item.zone === selectedZoneFilter;

      return matchesSearch && matchesState && matchesZone;
    });
  }, [districts, searchQuery, selectedStateFilter, selectedZoneFilter]);

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
                <h1 className="text-base font-bold text-slate-900">6.1 District & Geographical Zones Master</h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  {districts.length} Districts Mapped
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Configure state jurisdictions, police ranges, zones & administrative districts
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={onAddOpen}
            >
              Add New District
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search district, state or zone..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50"
            />
            <Select
              size="sm"
              radius="sm"
              placeholder="Filter by State"
              selectedKeys={[selectedStateFilter]}
              onChange={(e) => setSelectedStateFilter(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              <SelectItem key="ALL">All States</SelectItem>
              <SelectItem key="Uttar Pradesh">Uttar Pradesh</SelectItem>
              <SelectItem key="West Bengal">West Bengal</SelectItem>
            </Select>
            <Select
              size="sm"
              radius="sm"
              placeholder="Filter by Zone / Range"
              selectedKeys={[selectedZoneFilter]}
              onChange={(e) => setSelectedZoneFilter(e.target.value || "ALL")}
              className="bg-slate-50"
            >
              <SelectItem key="ALL">All Zones</SelectItem>
              <SelectItem key="Lucknow Zone">Lucknow Zone</SelectItem>
              <SelectItem key="Varanasi Zone">Varanasi Zone</SelectItem>
              <SelectItem key="Prayagraj Zone">Prayagraj Zone</SelectItem>
              <SelectItem key="Gorakhpur Zone">Gorakhpur Zone</SelectItem>
              <SelectItem key="Agra Zone">Agra Zone</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Main Master Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table removeWrapper aria-label="District master table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">STATE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">ADMINISTRATIVE ZONE / RANGE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">DISTRICT NAME</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">HEADQUARTERS</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">STATUS</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
            </TableHeader>
            <TableBody items={filteredDistricts} emptyContent="No geographical districts match the current filters.">
              {(item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell className="text-xs font-semibold text-slate-800">{item.state}</TableCell>
                  <TableCell className="text-xs text-slate-600">{item.zone}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">{item.district}</TableCell>
                  <TableCell className="text-xs text-slate-600">{item.headquarters}</TableCell>
                  <TableCell>
                    <Chip size="sm" color="success" variant="flat" className="text-[10px] font-bold">
                      {item.status}
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

      {/* 1. Add District Modal */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">add_location_alt</span>
                Add New District Master
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Select
                  size="sm"
                  label="State Jurisdiction"
                  labelPlacement="outside"
                  selectedKeys={[formData.state]}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  isRequired
                >
                  <SelectItem key="Uttar Pradesh">Uttar Pradesh</SelectItem>
                  <SelectItem key="West Bengal">West Bengal</SelectItem>
                  <SelectItem key="Delhi">Delhi</SelectItem>
                  <SelectItem key="Bihar">Bihar</SelectItem>
                </Select>
                <Input
                  size="sm"
                  label="Administrative Zone / Police Range"
                  labelPlacement="outside"
                  placeholder="e.g. Bareilly Range"
                  value={formData.zone}
                  onValueChange={(v) => setFormData({ ...formData, zone: v })}
                />
                <Input
                  size="sm"
                  label="District Name"
                  labelPlacement="outside"
                  placeholder="e.g. Bareilly"
                  value={formData.district}
                  onValueChange={(v) => setFormData({ ...formData, district: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Headquarters Name"
                  labelPlacement="outside"
                  placeholder="e.g. Bareilly City"
                  value={formData.headquarters}
                  onValueChange={(v) => setFormData({ ...formData, headquarters: v })}
                />
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
                  Save District
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 2. Edit District Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit_location</span>
                Edit District: {editingItem?.district}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Select
                  size="sm"
                  label="State Jurisdiction"
                  labelPlacement="outside"
                  selectedKeys={editingItem ? [editingItem.state] : ["Uttar Pradesh"]}
                  onChange={(e) => setEditingItem({ ...editingItem, state: e.target.value })}
                >
                  <SelectItem key="Uttar Pradesh">Uttar Pradesh</SelectItem>
                  <SelectItem key="West Bengal">West Bengal</SelectItem>
                  <SelectItem key="Delhi">Delhi</SelectItem>
                  <SelectItem key="Bihar">Bihar</SelectItem>
                </Select>
                <Input
                  size="sm"
                  label="Administrative Zone / Police Range"
                  labelPlacement="outside"
                  value={editingItem?.zone || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, zone: v })}
                />
                <Input
                  size="sm"
                  label="District Name"
                  labelPlacement="outside"
                  value={editingItem?.district || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, district: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Headquarters"
                  labelPlacement="outside"
                  value={editingItem?.headquarters || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, headquarters: v })}
                />
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
                Are you sure you want to remove <b>{itemToDelete?.district}</b> ({itemToDelete?.state}) from the location master? Active petitions linked to this district may lose geographical mapping.
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
                  Delete Record
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}