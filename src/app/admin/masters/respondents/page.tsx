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

export default function RespondentsMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");

  const [respondents, setRespondents] = useState([
    { id: 1, groupName: "BHARTI BOARD", defaultRankTitle: "Chairman, UPPRPB", defaultAddress: "Tulsi Ganga Complex, 19-C Vidhan Sabha Marg, Lucknow", isOurOffice: true },
    { id: 2, groupName: "DGP / PHQ HEAD QUARTER", defaultRankTitle: "Director General of Police", defaultAddress: "Police Headquarters, Signature Building, Lucknow", isOurOffice: false },
    { id: 3, groupName: "UP GOVERNMENT (Home Dept)", defaultRankTitle: "Principal Secretary (Home)", defaultAddress: "Civil Secretariat, Vidhan Sabha Marg, Lucknow", isOurOffice: false },
    { id: 4, groupName: "DISTRICT MAGISTRATE", defaultRankTitle: "District Magistrate / Collector", defaultAddress: "Collectorate Office (Concerned District)", isOurOffice: false },
    { id: 5, groupName: "CHIEF MEDICAL OFFICER (CMO)", defaultRankTitle: "Chief Medical Officer", defaultAddress: "District Hospital / Medical Board", isOurOffice: false },
    { id: 6, groupName: "PAC UNIT / COMMANDANT", defaultRankTitle: "Commandant PAC Battalion", defaultAddress: "Concerned PAC Battalion Headquarters", isOurOffice: false },
    { id: 7, groupName: "RAILWAYS / RPF", defaultRankTitle: "Chief Security Commissioner (RPF)", defaultAddress: "Northern Railway Headquarters", isOurOffice: false },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    address: "",
    isOurOffice: "false",
  });

  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const handleAdd = () => {
    if (!formData.name.trim()) return;
    setRespondents((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        groupName: formData.name.trim().toUpperCase(),
        defaultRankTitle: formData.title.trim() || "--",
        defaultAddress: formData.address.trim() || "--",
        isOurOffice: formData.isOurOffice === "true",
      },
    ]);
    setFormData({ name: "", title: "", address: "", isOurOffice: "false" });
    onAddOpenChange();
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem({
      ...item,
      isOurOfficeStr: item.isOurOffice ? "true" : "false",
    });
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setRespondents((prev) =>
      prev.map((r) =>
        r.id === editingItem.id
          ? {
              ...editingItem,
              isOurOffice: editingItem.isOurOfficeStr === "true",
            }
          : r
      )
    );
    onEditOpenChange();
  };

  const handleOpenDelete = (item: any) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    setRespondents((prev) => prev.filter((r) => r.id !== itemToDelete.id));
    onDeleteOpenChange();
  };

  const filteredRespondents = useMemo(() => {
    return respondents.filter((item) => {
      const matchesSearch =
        item.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.defaultRankTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.defaultAddress.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedTypeFilter === "ALL" ||
        (selectedTypeFilter === "OUR_OFFICE" && item.isOurOffice) ||
        (selectedTypeFilter === "STATE" && !item.isOurOffice);

      return matchesSearch && matchesType;
    });
  }, [respondents, searchQuery, selectedTypeFilter]);

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
                <h1 className="text-base font-bold text-slate-900">6.8 Respondent Groups & Opposite Parties Master</h1>
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
              onPress={onAddOpen}
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
              onValueChange={setSearchQuery}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50 sm:col-span-2"
            />
            <Select
              size="sm"
              radius="sm"
              placeholder="Filter by Organization Type"
              selectedKeys={[selectedTypeFilter]}
              onChange={(e) => setSelectedTypeFilter(e.target.value || "ALL")}
              className="bg-slate-50 font-semibold"
            >
              <SelectItem key="ALL">All Organization Types</SelectItem>
              <SelectItem key="OUR_OFFICE">Our Institution (UPPRPB)</SelectItem>
              <SelectItem key="STATE">State Respondent Depts</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Respondents Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Respondent Groups Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">RESPONDENT GROUP CODE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">DEFAULT RANK / TITLE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">OFFICIAL SERVICE ADDRESS</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">ORGANIZATION TYPE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
            </TableHeader>
            <TableBody items={filteredRespondents} emptyContent="No respondent groups found matching your search.">
              {(item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell className="text-xs font-bold text-slate-400">{item.id}</TableCell>
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
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* MODAL 1: Add Respondent Group */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">group_add</span>
                Add Respondent Group Master
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Respondent Group Code / Identifier"
                  labelPlacement="outside"
                  placeholder="e.g. HIGHER EDUCATION DEPT"
                  value={formData.name}
                  onValueChange={(v) => setFormData({ ...formData, name: v })}
                  isRequired
                />

                <Input
                  size="sm"
                  label="Default Representative Official Title"
                  labelPlacement="outside"
                  placeholder="e.g. Principal Secretary (Higher Education)"
                  value={formData.title}
                  onValueChange={(v) => setFormData({ ...formData, title: v })}
                  isRequired
                />

                <Input
                  size="sm"
                  label="Official Service Postal Address"
                  labelPlacement="outside"
                  placeholder="e.g. Directorate Office, Prayagraj / Secretariat, Lucknow"
                  value={formData.address}
                  onValueChange={(v) => setFormData({ ...formData, address: v })}
                  isRequired
                />

                <Select
                  size="sm"
                  label="Institutional Classification"
                  labelPlacement="outside"
                  selectedKeys={[formData.isOurOffice]}
                  onChange={(e) => setFormData({ ...formData, isOurOffice: e.target.value })}
                  isRequired
                >
                  <SelectItem key="false">State Respondent / External Department</SelectItem>
                  <SelectItem key="true">Our Institution (Direct Board Office)</SelectItem>
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
                  Save Group
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: Edit Respondent Group */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit</span>
                Edit Respondent Group: {editingItem?.groupName}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Group Code Name"
                  labelPlacement="outside"
                  value={editingItem?.groupName || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, groupName: v })}
                  isRequired
                />

                <Input
                  size="sm"
                  label="Default Representative Title"
                  labelPlacement="outside"
                  value={editingItem?.defaultRankTitle || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, defaultRankTitle: v })}
                  isRequired
                />

                <Input
                  size="sm"
                  label="Official Service Address"
                  labelPlacement="outside"
                  value={editingItem?.defaultAddress || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, defaultAddress: v })}
                  isRequired
                />

                <Select
                  size="sm"
                  label="Classification"
                  labelPlacement="outside"
                  selectedKeys={editingItem ? [editingItem.isOurOfficeStr] : ["false"]}
                  onChange={(e) => setEditingItem({ ...editingItem, isOurOfficeStr: e.target.value })}
                >
                  <SelectItem key="false">State Respondent / External Department</SelectItem>
                  <SelectItem key="true">Our Institution (Direct Board Office)</SelectItem>
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
                Confirm Deletion
              </ModalHeader>
              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove <b>{itemToDelete?.groupName}</b> from the master registry? Active case notices mapped to this respondent group will be affected.
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