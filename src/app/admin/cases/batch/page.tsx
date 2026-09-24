"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
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
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function BatchCoPetitionersContent() {
  const searchParams = useSearchParams();
  const queryCaseId = searchParams.get("caseId");

  const { isOpen: isCsvOpen, onOpen: onCsvOpen, onOpenChange: onCsvOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  // Mapping of available batch cases
  const availableCases: Record<string, { label: string; defaultCadre: string }> = {
    "WRIT-A/4012/2026": {
      label: "WRIT-A/4012/2026 — Abhay Gupta & 4 Ors (HC Allahabad)",
      defaultCadre: "Constable Civil Police",
    },
    "WRIT-A/7100/2025": {
      label: "WRIT-A/7100/2025 — Rohit Kumar & Ors (HC Allahabad)",
      defaultCadre: "Constable PAC",
    },
    "CONTEMPT/312/2026": {
      label: "CONTEMPT/312/2026 — Abhay Gupta vs Chairman (HC Lucknow)",
      defaultCadre: "Sub Inspector (Civil Police)",
    },
  };

  const [selectedCase, setSelectedCase] = useState<string>("WRIT-A/4012/2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Auto-select case if query param matches
  useEffect(() => {
    if (queryCaseId) {
      if (queryCaseId === "1") setSelectedCase("WRIT-A/4012/2026");
      else if (queryCaseId === "2") setSelectedCase("CONTEMPT/312/2026");
      else if (queryCaseId === "3") setSelectedCase("WRIT-A/7100/2025");
    }
  }, [queryCaseId]);

  // Case-wise petitioner storage
  const [casePetitionersStore, setCasePetitionersStore] = useState<Record<string, any[]>>({
    "WRIT-A/4012/2026": [
      {
        id: "p1",
        rollNo: "21004921",
        name: "Abhay Gupta",
        fatherName: "R.S. Gupta",
        rank: "Constable Civil Police",
        district: "Lucknow",
        status: "ACTIVE",
        isLead: true,
      },
      {
        id: "p2",
        rollNo: "21004928",
        name: "Deepak Singh",
        fatherName: "B.P. Singh",
        rank: "Constable Civil Police",
        district: "Varanasi",
        status: "ACTIVE",
        isLead: false,
      },
      {
        id: "p3",
        rollNo: "21005110",
        name: "Amit Patel",
        fatherName: "Mahesh Patel",
        rank: "Constable PAC",
        district: "Prayagraj",
        status: "WITHDRAWN",
        isLead: false,
      },
      {
        id: "p4",
        rollNo: "21006240",
        name: "Sanjay Yadav",
        fatherName: "D.K. Yadav",
        rank: "Constable Civil Police",
        district: "Gorakhpur",
        status: "ACTIVE",
        isLead: false,
      },
      {
        id: "p5",
        rollNo: "21007819",
        name: "Pradeep Kumar",
        fatherName: "Ram Chandra",
        rank: "Constable PAC",
        district: "Agra",
        status: "DISMISSED_ON_MERIT",
        isLead: false,
      },
    ],
    "WRIT-A/7100/2025": [
      {
        id: "p201",
        rollNo: "22001190",
        name: "Rohit Kumar",
        fatherName: "Babu Ram",
        rank: "Constable PAC",
        district: "Meerut",
        status: "ACTIVE",
        isLead: true,
      },
      {
        id: "p202",
        rollNo: "22001245",
        name: "Satendra Pratap",
        fatherName: "S.N. Singh",
        rank: "Constable PAC",
        district: "Ghaziabad",
        status: "ACTIVE",
        isLead: false,
      },
    ],
    "CONTEMPT/312/2026": [
      {
        id: "p301",
        rollNo: "21004921",
        name: "Abhay Gupta",
        fatherName: "R.S. Gupta",
        rank: "Sub Inspector (Civil Police)",
        district: "Lucknow",
        status: "ACTIVE",
        isLead: true,
      },
    ],
  });

  const activePetitioners = useMemo(() => {
    return casePetitionersStore[selectedCase] || [];
  }, [casePetitionersStore, selectedCase]);

  // Filtered list
  const filteredPetitioners = useMemo(() => {
    if (!searchQuery) return activePetitioners;
    return activePetitioners.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.rollNo.includes(searchQuery) ||
        p.district.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activePetitioners, searchQuery]);

  const paginatedPetitioners = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredPetitioners.slice(start, start + rowsPerPage);
  }, [filteredPetitioners, page]);

  // Individual Add Form State
  const [newPetitioner, setNewPetitioner] = useState({
    rollNo: "",
    name: "",
    fatherName: "",
    rank: "",
    district: "",
  });

  const handleAddPetitioner = () => {
    if (!newPetitioner.name.trim()) return;

    const newItem = {
      id: `p-${Date.now()}`,
      rollNo: newPetitioner.rollNo.trim() || "--",
      name: newPetitioner.name.trim(),
      fatherName: newPetitioner.fatherName.trim() || "--",
      rank: newPetitioner.rank.trim() || availableCases[selectedCase]?.defaultCadre || "Constable Civil Police",
      district: newPetitioner.district.trim() || "--",
      status: "ACTIVE",
      isLead: activePetitioners.length === 0,
    };

    setCasePetitionersStore((prev) => ({
      ...prev,
      [selectedCase]: [...(prev[selectedCase] || []), newItem],
    }));

    setNewPetitioner({ rollNo: "", name: "", fatherName: "", rank: "", district: "" });
  };

  // Edit Modal State
  const [editingPetitioner, setEditingPetitioner] = useState<any>(null);

  const openEditModal = (item: any) => {
    setEditingPetitioner({ ...item });
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (!editingPetitioner) return;
    setCasePetitionersStore((prev) => ({
      ...prev,
      [selectedCase]: (prev[selectedCase] || []).map((p) =>
        p.id === editingPetitioner.id ? editingPetitioner : p
      ),
    }));
    onEditOpenChange();
  };

  // Bulk CSV Simulation Import
  const handleSimulateCsvUpload = () => {
    const bulkMock = [
      {
        id: `p-csv-${Date.now()}-1`,
        rollNo: "21008901",
        name: "Manish Kumar Sharma",
        fatherName: "K.L. Sharma",
        rank: availableCases[selectedCase]?.defaultCadre || "Constable Civil Police",
        district: "Aligarh",
        status: "ACTIVE",
        isLead: false,
      },
      {
        id: `p-csv-${Date.now()}-2`,
        rollNo: "21008902",
        name: "Dharmendra Pratap",
        fatherName: "R.P. Singh",
        rank: availableCases[selectedCase]?.defaultCadre || "Constable Civil Police",
        district: "Mathura",
        status: "ACTIVE",
        isLead: false,
      },
      {
        id: `p-csv-${Date.now()}-3`,
        rollNo: "21008903",
        name: "Anil Kumar Maurya",
        fatherName: "S.R. Maurya",
        rank: availableCases[selectedCase]?.defaultCadre || "Constable Civil Police",
        district: "Kanpur Nagar",
        status: "ACTIVE",
        isLead: false,
      },
    ];

    setCasePetitionersStore((prev) => ({
      ...prev,
      [selectedCase]: [...(prev[selectedCase] || []), ...bulkMock],
    }));

    alert(`Bulk Import Successful! Added 3 co-petitioners from CSV into ${selectedCase}.`);
    onCsvOpenChange();
  };

  return (
    <div className="space-y-4">
      {/* Header & Case Selector Bar */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/admin/cases">
                  <Button isIconOnly size="sm" variant="light" className="text-slate-500">
                    <span className="material-symbols-rounded">arrow_back</span>
                  </Button>
                </Link>
                <h1 className="text-base font-bold text-slate-900">2.3 Co-Petitioners Registry</h1>
                <Chip size="sm" color="primary" variant="flat" className="text-[10px] font-bold">
                  Batch Litigation Manager
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Manage batch petitions, joined candidates, candidate roll numbers & bulk CSV uploads[cite: 1]
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                startContent={<span className="material-symbols-rounded text-sm">upload_file</span>}
                onPress={onCsvOpen}
              >
                Bulk CSV Import
              </Button>
              <Link href="/admin/cases">
                <Button
                  size="sm"
                  radius="sm"
                  variant="bordered"
                  className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                  startContent={<span className="material-symbols-rounded text-sm">format_list_bulleted</span>}
                >
                  Case Register
                </Button>
              </Link>
            </div>
          </div>

          {/* Target Parent Writ Switcher */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Select
              size="sm"
              radius="sm"
              label="Select Parent Writ Matter"
              labelPlacement="outside"
              selectedKeys={[selectedCase]}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedCase(e.target.value);
                  setPage(1);
                }
              }}
              className="bg-slate-50 font-semibold"
            >
              {Object.entries(availableCases).map(([k, v]) => (
                <SelectItem key={k}>{v.label}</SelectItem>
              ))}
            </Select>

            <Input
              size="sm"
              radius="sm"
              label="Search Petitioner Name / Roll No."
              labelPlacement="outside"
              placeholder="e.g. 21004921 or Abhay"
              value={searchQuery}
              onValueChange={(val) => {
                setSearchQuery(val);
                setPage(1);
              }}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50"
            />

            <div className="flex items-end gap-2">
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-900 flex items-center justify-between w-full border border-blue-200">
                <span>Attached Petitioners for this Writ:</span>
                <span className="font-bold text-sm text-blue-700">{activePetitioners.length} Candidates</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Table Grid */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="Co-Petitioners Table"
            className="min-w-full"
            bottomContent={
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <span className="text-xs text-slate-500">
                  Showing {(page - 1) * rowsPerPage + 1} to{" "}
                  {Math.min(page * rowsPerPage, filteredPetitioners.length)} of {filteredPetitioners.length} co-petitioners
                </span>
                <Pagination
                  size="sm"
                  isCompact
                  showControls
                  total={Math.ceil(filteredPetitioners.length / rowsPerPage) || 1}
                  page={page}
                  onChange={setPage}
                />
              </div>
            }
          >
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PETITIONER ROLE
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ROLL NO.
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                NAME & FATHER&apos;S NAME
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                RANK / POST CLAIMED
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DISTRICT / UNIT
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                LEGAL STATUS
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                ACTIONS
              </TableColumn>
            </TableHeader>
            <TableBody items={paginatedPetitioners} emptyContent="No petitioners found for this writ case.">
              {(item: any) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell>
                    {item.isLead ? (
                      <Chip size="sm" color="primary" variant="solid" className="text-[10px] font-bold">
                        Lead Petitioner
                      </Chip>
                    ) : (
                      <Chip size="sm" variant="flat" className="text-[10px] font-medium text-slate-600">
                        Co-Petitioner
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-slate-900">
                    {item.rollNo}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                    <p className="text-[10px] text-slate-400">S/o {item.fatherName}</p>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700">{item.rank}</TableCell>
                  <TableCell className="text-xs text-slate-600">{item.district}</TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        item.status === "ACTIVE"
                          ? "success"
                          : item.status === "WITHDRAWN"
                          ? "warning"
                          : "danger"
                      }
                      className="text-[10px] font-bold"
                    >
                      {item.status}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="text-slate-500 hover:text-blue-700"
                      onClick={() => openEditModal(item)}
                    >
                      <span className="material-symbols-rounded text-sm">edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Manual Add Form Card */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Add Individual Co-Petitioner to {selectedCase}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <Input
              size="sm"
              label="Roll No."
              labelPlacement="outside"
              placeholder="e.g. 21008891"
              value={newPetitioner.rollNo}
              onValueChange={(v) => setNewPetitioner({ ...newPetitioner, rollNo: v })}
            />
            <Input
              size="sm"
              label="Petitioner Name"
              labelPlacement="outside"
              placeholder="Candidate Name"
              value={newPetitioner.name}
              onValueChange={(v) => setNewPetitioner({ ...newPetitioner, name: v })}
              isRequired
            />
            <Input
              size="sm"
              label="Father's Name"
              labelPlacement="outside"
              placeholder="Father's Name"
              value={newPetitioner.fatherName}
              onValueChange={(v) => setNewPetitioner({ ...newPetitioner, fatherName: v })}
            />
            <Input
              size="sm"
              label="Rank / Post Claimed"
              labelPlacement="outside"
              placeholder="e.g. Constable CP"
              value={newPetitioner.rank}
              onValueChange={(v) => setNewPetitioner({ ...newPetitioner, rank: v })}
            />
            <div className="flex items-end gap-2">
              <Input
                size="sm"
                label="Home District"
                labelPlacement="outside"
                placeholder="District"
                value={newPetitioner.district}
                onValueChange={(v) => setNewPetitioner({ ...newPetitioner, district: v })}
              />
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white hover:bg-[#163a66] min-w-[70px]"
                onClick={handleAddPetitioner}
              >
                Add
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Edit Individual Petitioner Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900">
                Edit Petitioner: {editingPetitioner?.name}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Roll Number"
                  labelPlacement="outside"
                  value={editingPetitioner?.rollNo || ""}
                  onValueChange={(v) => setEditingPetitioner({ ...editingPetitioner, rollNo: v })}
                />
                <Input
                  size="sm"
                  label="Petitioner Name"
                  labelPlacement="outside"
                  value={editingPetitioner?.name || ""}
                  onValueChange={(v) => setEditingPetitioner({ ...editingPetitioner, name: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Father's Name"
                  labelPlacement="outside"
                  value={editingPetitioner?.fatherName || ""}
                  onValueChange={(v) => setEditingPetitioner({ ...editingPetitioner, fatherName: v })}
                />
                <Select
                  size="sm"
                  label="Legal Status in Writ"
                  labelPlacement="outside"
                  selectedKeys={editingPetitioner?.status ? [editingPetitioner.status] : ["ACTIVE"]}
                  onChange={(e) => setEditingPetitioner({ ...editingPetitioner, status: e.target.value })}
                >
                  <SelectItem key="ACTIVE">ACTIVE (Claim Pursued)</SelectItem>
                  <SelectItem key="WITHDRAWN">WITHDRAWN (Candidate Opted Out)</SelectItem>
                  <SelectItem key="DISMISSED_ON_MERIT">DISMISSED ON MERIT</SelectItem>
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

      {/* Bulk CSV Upload Modal */}
      <Modal isOpen={isCsvOpen} onOpenChange={onCsvOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">upload_file</span>
                Bulk CSV / Excel Petitioner Ingestion
              </ModalHeader>
              <ModalBody className="space-y-4">
                <p className="text-xs text-slate-500">
                  Upload an Excel (.xlsx) or CSV file with candidate roll numbers, names, and districts to append directly to{" "}
                  <b>{selectedCase}</b>.
                </p>
                <div
                  onClick={handleSimulateCsvUpload}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50/50 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-rounded text-4xl text-blue-700">cloud_upload</span>
                  <p className="mt-2 text-xs font-bold text-slate-800">Click to Upload & Parse Sample CSV</p>
                  <p className="text-[10px] text-slate-400 mt-1">Columns parsed: RollNo, CandidateName, FatherName, District</p>
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
                  onClick={handleSimulateCsvUpload}
                >
                  Simulate Import (3 Records)
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function BatchCoPetitionersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500">Loading Co-Petitioners Registry...</div>}>
      <BatchCoPetitionersContent />
    </Suspense>
  );
}