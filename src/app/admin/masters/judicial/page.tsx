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
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";

export default function JudicialMasterPage() {
  const [selectedCourt, setSelectedCourt] = useState("High Court Allahabad");

  const { isOpen: isAddCourtOpen, onOpen: onAddCourtOpen, onOpenChange: onAddCourtOpenChange } = useDisclosure();
  const { isOpen: isAddTypeOpen, onOpen: onAddTypeOpen, onOpenChange: onAddTypeOpenChange } = useDisclosure();
  const { isOpen: isEditTypeOpen, onOpen: onEditTypeOpen, onOpenChange: onEditTypeOpenChange } = useDisclosure();
  const { isOpen: isEditCourtOpen, onOpen: onEditCourtOpen, onOpenChange: onEditCourtOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  // Courts Master State
  const [courts, setCourts] = useState([
    { id: 1, name: "Supreme Court of India", type: "Apex Court", benches: "New Delhi", caseTypesCount: 8, activeWrits: 28 },
    { id: 2, name: "High Court Allahabad", type: "High Court", benches: "Principal Bench (Prayagraj)", caseTypesCount: 14, activeWrits: 1102 },
    { id: 3, name: "High Court Lucknow", type: "High Court", benches: "Lucknow Bench", caseTypesCount: 12, activeWrits: 341 },
    { id: 4, name: "State Public Services Tribunal", type: "Tribunal", benches: "Indira Bhawan, Lucknow", caseTypesCount: 6, activeWrits: 14 },
    { id: 5, name: "CJM Court Lucknow", type: "Subordinate Court", benches: "District Court Complex", caseTypesCount: 4, activeWrits: 3 },
  ]);

  // Case Types Master State
  const [caseTypes, setCaseTypes] = useState([
    { id: 1, court: "High Court Allahabad", typeName: "WRIT - A (Service Matters)", shortName: "WRIT-A", eCourtsCode: "WRITA", activeWrits: 842 },
    { id: 2, court: "High Court Allahabad", typeName: "WRIT - C (Civil Miscellaneous)", shortName: "WRIT-C", eCourtsCode: "WRITC", activeWrits: 154 },
    { id: 3, court: "High Court Allahabad", typeName: "CONTEMPT APPLICATION (CIVIL)", shortName: "CONTEMPT", eCourtsCode: "CONT", activeWrits: 28 },
    { id: 4, court: "High Court Allahabad", typeName: "SPECIAL APPEAL DEFECTIVE", shortName: "SPL. APPEAL", eCourtsCode: "SPAD", activeWrits: 72 },
    { id: 5, court: "High Court Allahabad", typeName: "CIVIL REVISION", shortName: "CIVIL REV", eCourtsCode: "CR", activeWrits: 6 },
    { id: 6, court: "High Court Lucknow", typeName: "MISC. BENCH (WRIT-MB)", shortName: "WRIT-MB", eCourtsCode: "WMB", activeWrits: 110 },
    { id: 7, court: "High Court Lucknow", typeName: "SERVICE BENCH (WRIT-SB)", shortName: "WRIT-SB", eCourtsCode: "WSB", activeWrits: 310 },
  ]);

  // Add Form Inputs
  const [newCaseType, setNewCaseType] = useState({ court: "High Court Allahabad", typeName: "", shortName: "", code: "" });
  const [newCourt, setNewCourt] = useState({ name: "", type: "High Court", bench: "" });

  // Edit Form State
  const [editingCaseType, setEditingCaseType] = useState<any>(null);
  const [editingCourt, setEditingCourt] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const filteredCaseTypes = useMemo(() => {
    return caseTypes.filter((c) => selectedCourt === "ALL" || c.court === selectedCourt);
  }, [caseTypes, selectedCourt]);

  // Handlers
  const handleAddCaseType = () => {
    if (!newCaseType.typeName.trim() || !newCaseType.shortName.trim()) return;
    setCaseTypes((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        court: newCaseType.court,
        typeName: newCaseType.typeName.trim(),
        shortName: newCaseType.shortName.trim().toUpperCase(),
        eCourtsCode: newCaseType.code.trim().toUpperCase() || newCaseType.shortName.trim().toUpperCase(),
        activeWrits: 0,
      },
    ]);
    setNewCaseType({ court: "High Court Allahabad", typeName: "", shortName: "", code: "" });
    onAddTypeOpenChange();
  };

  const handleAddCourt = () => {
    if (!newCourt.name.trim()) return;
    setCourts((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: newCourt.name.trim(),
        type: newCourt.type,
        benches: newCourt.bench.trim() || "Principal Bench",
        caseTypesCount: 0,
        activeWrits: 0,
      },
    ]);
    setNewCourt({ name: "", type: "High Court", bench: "" });
    onAddCourtOpenChange();
  };

  const handleSaveEditType = () => {
    if (!editingCaseType) return;
    setCaseTypes((prev) =>
      prev.map((item) => (item.id === editingCaseType.id ? editingCaseType : item))
    );
    onEditTypeOpenChange();
  };

  const handleSaveEditCourt = () => {
    if (!editingCourt) return;
    setCourts((prev) =>
      prev.map((c) => (c.id === editingCourt.id ? editingCourt : c))
    );
    onEditCourtOpenChange();
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.kind === "CASE_TYPE") {
      setCaseTypes((prev) => prev.filter((item) => item.id !== itemToDelete.id));
    } else {
      setCourts((prev) => prev.filter((c) => c.id !== itemToDelete.id));
    }
    onDeleteOpenChange();
  };

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
                <h1 className="text-base font-bold text-slate-900">6.5 Judicial Courts & Case Types Master</h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  eCourts Mapped
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Configure judicial forums, benches, jurisdiction and official eCourts/CIS case classification codes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                startContent={<span className="material-symbols-rounded text-sm">add</span>}
                onPress={onAddCourtOpen}
              >
                Add Court
              </Button>
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
                startContent={<span className="material-symbols-rounded text-sm">add</span>}
                onPress={onAddTypeOpen}
              >
                Add Case Type
              </Button>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <Tabs
              aria-label="Judicial Master Tabs"
              variant="underlined"
              classNames={{ tabList: "gap-6", cursor: "bg-[#0f2744]", tab: "max-w-fit px-0 h-9 text-xs font-semibold" }}
            >
              {/* TAB 1: CASE TYPES */}
              <Tab key="case_types" title="Case Types (Court Mapped)">
                <div className="mt-3 flex items-center justify-between">
                  <div className="w-72">
                    <Select
                      size="sm"
                      radius="sm"
                      label="Filter by Court"
                      labelPlacement="outside"
                      selectedKeys={[selectedCourt]}
                      onChange={(e) => setSelectedCourt(e.target.value || "ALL")}
                      className="bg-slate-50 font-semibold"
                    >
                      <SelectItem key="ALL">All Judicial Establishments</SelectItem>
                      <SelectItem key="High Court Allahabad">High Court Allahabad</SelectItem>
                      <SelectItem key="High Court Lucknow">High Court Lucknow</SelectItem>
                      <SelectItem key="Supreme Court of India">Supreme Court of India</SelectItem>
                      <SelectItem key="State Public Services Tribunal">State Public Services Tribunal</SelectItem>
                    </Select>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{filteredCaseTypes.length} Case Types Registered</span>
                </div>

                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200/80">
                  <Table removeWrapper aria-label="Case Types Table" className="min-w-full">
                    <TableHeader>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">COURT</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">OFFICIAL CASE TYPE</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">SHORT NAME</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">eCOURTS CODE</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">RUNNING WRITS</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
                    </TableHeader>
                    <TableBody items={filteredCaseTypes} emptyContent="No case types match the selected court filter.">
                      {(item) => (
                        <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                          <TableCell className="text-xs font-bold text-slate-400">{item.id}</TableCell>
                          <TableCell className="text-xs font-semibold text-slate-800">{item.court}</TableCell>
                          <TableCell className="text-xs font-bold text-slate-900">{item.typeName}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-blue-700">{item.shortName}</TableCell>
                          <TableCell><Chip size="sm" variant="flat" className="h-4 px-1 text-[10px] font-mono">{item.eCourtsCode}</Chip></TableCell>
                          <TableCell><Chip size="sm" variant="flat" color="primary" className="text-[10px] font-bold">{item.activeWrits} Active</Chip></TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-slate-400 hover:text-slate-700"
                                onClick={() => {
                                  setEditingCaseType({ ...item });
                                  onEditTypeOpen();
                                }}
                              >
                                <span className="material-symbols-rounded text-sm">edit</span>
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-slate-400 hover:text-rose-600"
                                onClick={() => {
                                  setItemToDelete({ ...item, kind: "CASE_TYPE" });
                                  onDeleteOpen();
                                }}
                              >
                                <span className="material-symbols-rounded text-sm">delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Tab>

              {/* TAB 2: COURT ESTABLISHMENTS */}
              <Tab key="courts" title="Court Establishments & Benches">
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200/80">
                  <Table removeWrapper aria-label="Courts Table" className="min-w-full">
                    <TableHeader>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">COURT NAME</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">FORUM TYPE</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">BENCH LOCATION</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">MAPPED TYPES</TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
                    </TableHeader>
                    <TableBody items={courts} emptyContent="No court establishments configured.">
                      {(item) => (
                        <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                          <TableCell className="text-xs font-bold text-slate-400">{item.id}</TableCell>
                          <TableCell className="text-xs font-bold text-slate-900">{item.name}</TableCell>
                          <TableCell className="text-xs text-slate-600">{item.type}</TableCell>
                          <TableCell className="text-xs text-slate-700 font-medium">{item.benches}</TableCell>
                          <TableCell><Chip size="sm" variant="flat" color="primary" className="text-[10px] font-bold">{item.caseTypesCount} Types</Chip></TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-slate-400 hover:text-slate-700"
                                onClick={() => {
                                  setEditingCourt({ ...item });
                                  onEditCourtOpen();
                                }}
                              >
                                <span className="material-symbols-rounded text-sm">edit</span>
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-slate-400 hover:text-rose-600"
                                onClick={() => {
                                  setItemToDelete({ ...item, kind: "COURT" });
                                  onDeleteOpen();
                                }}
                              >
                                <span className="material-symbols-rounded text-sm">delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Tab>
            </Tabs>
          </div>
        </CardBody>
      </Card>

      {/* MODAL 1: ADD CASE TYPE */}
      <Modal isOpen={isAddTypeOpen} onOpenChange={onAddTypeOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900">Add Case Type Master</ModalHeader>
              <ModalBody className="space-y-3">
                <Select
                  size="sm"
                  label="Court Forum"
                  labelPlacement="outside"
                  selectedKeys={[newCaseType.court]}
                  onChange={(e) => setNewCaseType({ ...newCaseType, court: e.target.value })}
                  isRequired
                >
                  <SelectItem key="High Court Allahabad">High Court Allahabad</SelectItem>
                  <SelectItem key="High Court Lucknow">High Court Lucknow</SelectItem>
                  <SelectItem key="Supreme Court of India">Supreme Court of India</SelectItem>
                  <SelectItem key="State Public Services Tribunal">State Public Services Tribunal</SelectItem>
                </Select>
                <Input
                  size="sm"
                  label="Case Type Full Name"
                  labelPlacement="outside"
                  placeholder="e.g. WRIT - A (Civil Services)"
                  value={newCaseType.typeName}
                  onValueChange={(v) => setNewCaseType({ ...newCaseType, typeName: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Short Acronym"
                  labelPlacement="outside"
                  placeholder="e.g. WRIT-A"
                  value={newCaseType.shortName}
                  onValueChange={(v) => setNewCaseType({ ...newCaseType, shortName: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="CIS / eCourts Code"
                  labelPlacement="outside"
                  placeholder="e.g. WRITA"
                  value={newCaseType.code}
                  onValueChange={(v) => setNewCaseType({ ...newCaseType, code: v })}
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>Cancel</Button>
                <Button size="sm" radius="sm" className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]" onClick={handleAddCaseType}>
                  Save Case Type
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: ADD COURT */}
      <Modal isOpen={isAddCourtOpen} onOpenChange={onAddCourtOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900">Add Court Establishment</ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Court Establishment Name"
                  labelPlacement="outside"
                  placeholder="e.g. Central Administrative Tribunal"
                  value={newCourt.name}
                  onValueChange={(v) => setNewCourt({ ...newCourt, name: v })}
                  isRequired
                />
                <Select
                  size="sm"
                  label="Forum Classification"
                  labelPlacement="outside"
                  selectedKeys={[newCourt.type]}
                  onChange={(e) => setNewCourt({ ...newCourt, type: e.target.value })}
                >
                  <SelectItem key="Apex Court">Apex Court</SelectItem>
                  <SelectItem key="High Court">High Court</SelectItem>
                  <SelectItem key="Tribunal">Tribunal</SelectItem>
                  <SelectItem key="Subordinate Court">Subordinate Court</SelectItem>
                </Select>
                <Input
                  size="sm"
                  label="Bench / Seat Location"
                  labelPlacement="outside"
                  placeholder="e.g. Lucknow Bench"
                  value={newCourt.bench}
                  onValueChange={(v) => setNewCourt({ ...newCourt, bench: v })}
                  isRequired
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>Cancel</Button>
                <Button size="sm" radius="sm" className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]" onClick={handleAddCourt}>
                  Save Court
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 3: EDIT CASE TYPE */}
      <Modal isOpen={isEditTypeOpen} onOpenChange={onEditTypeOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900">Edit Case Type: {editingCaseType?.shortName}</ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Case Type Name"
                  labelPlacement="outside"
                  value={editingCaseType?.typeName || ""}
                  onValueChange={(v) => setEditingCaseType({ ...editingCaseType, typeName: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Short Name"
                  labelPlacement="outside"
                  value={editingCaseType?.shortName || ""}
                  onValueChange={(v) => setEditingCaseType({ ...editingCaseType, shortName: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="eCourts / CIS Code"
                  labelPlacement="outside"
                  value={editingCaseType?.eCourtsCode || ""}
                  onValueChange={(v) => setEditingCaseType({ ...editingCaseType, eCourtsCode: v })}
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>Cancel</Button>
                <Button size="sm" radius="sm" className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]" onClick={handleSaveEditType}>
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 4: EDIT COURT */}
      <Modal isOpen={isEditCourtOpen} onOpenChange={onEditCourtOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900">Edit Court: {editingCourt?.name}</ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Court Name"
                  labelPlacement="outside"
                  value={editingCourt?.name || ""}
                  onValueChange={(v) => setEditingCourt({ ...editingCourt, name: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Bench / Seat Location"
                  labelPlacement="outside"
                  value={editingCourt?.benches || ""}
                  onValueChange={(v) => setEditingCourt({ ...editingCourt, benches: v })}
                  isRequired
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>Cancel</Button>
                <Button size="sm" radius="sm" className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]" onClick={handleSaveEditCourt}>
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 5: DELETE CONFIRMATION */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} placement="center" size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">warning</span>
                Confirm Deletion
              </ModalHeader>
              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove <b>{itemToDelete?.typeName || itemToDelete?.name}</b>?
                {itemToDelete?.activeWrits > 0 && (
                  <p className="mt-2 text-rose-600 font-bold">
                    Warning: There are {itemToDelete.activeWrits} active writs referencing this judicial entry.
                  </p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>Cancel</Button>
                <Button size="sm" radius="sm" className="bg-rose-600 font-semibold text-white hover:bg-rose-700" onClick={handleConfirmDelete}>
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