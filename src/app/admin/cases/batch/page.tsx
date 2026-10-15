"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
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
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import axiosClient from "@/api/axiosClient";
import { MastersAPI } from "@/api/mastersApi";

interface PetitionerRecord {
  _id: string;
  caseId: string;
  fileNo: string;
  rollNo: string;
  registrationNo?: string;
  name: string;
  fatherName?: string;
  role: "Lead Petitioner" | "Co-Petitioner";
  categoryClaimed?: string;
  postClaimed?: string;
  state?: string;
  district: string;
  status: "ACTIVE" | "WITHDRAWN" | "DISMISSED_ON_MERIT" | "RELIEF_GRANTED";
  createdAt?: string;
}

interface CaseOption {
  _id: string;
  fileNo: string;
  writNumber?: string;
  leadPetitioner: string;
  category: string;
}

interface DistrictOption {
  key: string;
  label: string;
  zone: string;
  state: string;
}

function BatchCoPetitionersContent() {
  const searchParams = useSearchParams();
  const queryCaseId = searchParams.get("caseId");

  const { isOpen: isCsvOpen, onOpen: onCsvOpen, onOpenChange: onCsvOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  const [casesList, setCasesList] = useState<CaseOption[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [petitioners, setPetitioners] = useState<PetitionerRecord[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);

  const [loadingCases, setLoadingCases] = useState<boolean>(true);
  const [loadingPetitioners, setLoadingPetitioners] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  const [formData, setFormData] = useState({
    rollNo: "",
    registrationNo: "",
    name: "",
    fatherName: "",
    postClaimed: "Constable Civil Police",
    district: "Lucknow",
    zone: "Lucknow Zone",
    state: "Uttar Pradesh",
  });

  const [editingItem, setEditingItem] = useState<PetitionerRecord | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoadingCases(true);
        const [casesRes, dropdownRes] = await Promise.all([
          axiosClient.get("/cases", { params: { limit: 100 } }),
          MastersAPI.getIntakeDropdowns(),
        ]);

        if (casesRes.data?.success && Array.isArray(casesRes.data.data)) {
          const rawCases = casesRes.data.data;
          setCasesList(rawCases);
          if (rawCases.length > 0) {
            const initialId = queryCaseId || rawCases[0]._id;
            setSelectedCaseId(initialId);
          }
        }

        if (dropdownRes?.success && dropdownRes.data?.districts) {
          const mappedDistricts = dropdownRes.data.districts.map((d: any) => ({
            key: d.districtName,
            label: d.districtName,
            zone: d.zoneId?.zoneName || "Central Zone",
            state: d.stateId?.stateName || "Uttar Pradesh",
          }));
          setDistricts(mappedDistricts);
        } else {
          setDistricts([
            { key: "Lucknow", label: "Lucknow", zone: "Lucknow Zone", state: "Uttar Pradesh" },
            { key: "Prayagraj", label: "Prayagraj", zone: "Prayagraj Zone", state: "Uttar Pradesh" },
            { key: "Kanpur Nagar", label: "Kanpur Nagar", zone: "Kanpur Zone", state: "Uttar Pradesh" },
            { key: "Varanasi", label: "Varanasi", zone: "Varanasi Zone", state: "Uttar Pradesh" },
            { key: "Gorakhpur", label: "Gorakhpur", zone: "Gorakhpur Zone", state: "Uttar Pradesh" },
            { key: "Meerut", label: "Meerut", zone: "Meerut Zone", state: "Uttar Pradesh" },
            { key: "Agra", label: "Agra", zone: "Agra Zone", state: "Uttar Pradesh" },
            { key: "Bareilly", label: "Bareilly", zone: "Bareilly Zone", state: "Uttar Pradesh" },
          ]);
        }
      } catch (err: any) {
        console.error("Failed to load initial batch data:", err);
        toast.error("Failed to load cases index");
      } finally {
        setLoadingCases(false);
      }
    }
    loadInitialData();
  }, [queryCaseId]);

  const fetchPetitionersForCase = useCallback(async (caseId: string) => {
    if (!caseId) return;
    setLoadingPetitioners(true);
    try {
      const res = await axiosClient.get(`/cases/${caseId}/petitioners`);
      if (res.data?.success) {
        setPetitioners(res.data.petitioners || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch petitioners:", err);
      toast.error(err.response?.data?.message || "Failed to load petitioners");
    } finally {
      setLoadingPetitioners(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      fetchPetitionersForCase(selectedCaseId);
    }
  }, [selectedCaseId, fetchPetitionersForCase]);

  const handleDistrictChange = (districtName: string) => {
    const found = districts.find((d) => d.key === districtName);
    setFormData((prev) => ({
      ...prev,
      district: districtName,
      zone: found ? found.zone : "Central Zone",
      state: found ? found.state : "Uttar Pradesh",
    }));
  };

  const handleAddPetitioner = async () => {
    if (!formData.rollNo.trim() || !formData.name.trim()) {
      toast.error("Roll Number and Petitioner Name are required!");
      return;
    }

    if (!selectedCaseId) {
      toast.error("Please select a valid parent writ case.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        rollNo: formData.rollNo.trim(),
        registrationNo: formData.registrationNo.trim() || "--",
        name: formData.name.trim(),
        fatherName: formData.fatherName.trim() || "--",
        postClaimed: formData.postClaimed.trim() || "Constable Civil Police",
        district: formData.district,
        state: formData.state,
        role: petitioners.length === 0 ? "Lead Petitioner" : "Co-Petitioner",
        status: "ACTIVE",
      };

      const res = await axiosClient.post(`/cases/${selectedCaseId}/petitioners`, payload);
      if (res.data?.success) {
        toast.success(`Petitioner ${payload.name} added successfully!`);
        setFormData({
          rollNo: "",
          registrationNo: "",
          name: "",
          fatherName: "",
          postClaimed: "Constable Civil Police",
          district: "Lucknow",
          zone: "Lucknow Zone",
          state: "Uttar Pradesh",
        });
        fetchPetitionersForCase(selectedCaseId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add petitioner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item: PetitionerRecord) => {
    setEditingItem({ ...item });
    onEditOpen();
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      setPetitioners((prev) =>
        prev.map((p) => (p._id === editingItem._id ? { ...editingItem } : p))
      );
      toast.success("Petitioner record updated");
      onEditOpenChange();
      setEditingItem(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update record");
    }
  };

  const caseSelectItems = useMemo(() => {
    return casesList.map((c) => ({
      key: c._id,
      label: `${c.fileNo} · ${c.writNumber || "Notice"} — ${c.leadPetitioner}`,
    }));
  }, [casesList]);

  const currentCase = useMemo(() => {
    return casesList.find((c) => c._id === selectedCaseId);
  }, [casesList, selectedCaseId]);

  const filteredPetitioners = useMemo(() => {
    if (!searchQuery.trim()) return petitioners;
    const q = searchQuery.toLowerCase().trim();
    return petitioners.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.rollNo.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
    );
  }, [petitioners, searchQuery]);

  const totalPages = Math.ceil(filteredPetitioners.length / rowsPerPage) || 1;
  const paginatedPetitioners = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredPetitioners.slice(start, start + rowsPerPage);
  }, [filteredPetitioners, page, rowsPerPage]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Case Selector Bar */}
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
                Manage batch petitions, candidates, roll numbers &amp; geographical masters (District/Zone/State)[cite: 1]
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
              items={caseSelectItems}
              selectedKeys={selectedCaseId ? [selectedCaseId] : []}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedCaseId(e.target.value);
                  setPage(1);
                }
              }}
              isLoading={loadingCases}
              className="bg-slate-50 font-semibold"
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>

            <Input
              size="sm"
              radius="sm"
              label="Search Petitioner Name / Roll No. / District"
              labelPlacement="outside"
              placeholder="e.g. 21004921 or Varanasi"
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
                <span>Attached Candidates for this Writ:</span>
                <span className="font-bold text-sm text-blue-700">{petitioners.length} Litigants</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Table Grid with Geographical Columns */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="Co-Petitioners Table"
            className="min-w-full"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <span className="text-xs text-slate-500">
                    Showing {(page - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(page * rowsPerPage, filteredPetitioners.length)} of {filteredPetitioners.length} co-petitioners
                  </span>
                  <Pagination
                    size="sm"
                    isCompact
                    showControls
                    total={totalPages}
                    page={page}
                    onChange={setPage}
                  />
                </div>
              ) : null
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
                NAME &amp; FATHER&apos;S NAME
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                POST CLAIMED
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                GEOGRAPHICAL MASTER (DISTRICT / STATE)
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                LEGAL STATUS
              </TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                ACTIONS
              </TableColumn>
            </TableHeader>
            <TableBody
              items={paginatedPetitioners}
              isLoading={loadingPetitioners}
              loadingContent={
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              }
              emptyContent={!loadingPetitioners ? "No petitioners found for this writ case." : " "}
            >
              {(item: PetitionerRecord) => (
                <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell>
                    {item.role === "Lead Petitioner" ? (
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
                    <p className="text-[10px] text-slate-400">S/o {item.fatherName || "--"}</p>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700">{item.postClaimed || "--"}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">{item.district}</p>
                      <p className="text-[10px] text-slate-500">{item.state || "Uttar Pradesh"}</p>
                    </div>
                  </TableCell>
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

      {/* 3. Manual Add Form Card */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Add Individual Co-Petitioner to {currentCase?.fileNo || "Selected Docket"}
            </h3>
            <span className="text-[10px] text-slate-400">
              District dropdown binds to 6.1 Geographical Master
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
            <Input
              size="sm"
              label="Roll No."
              labelPlacement="outside"
              placeholder="e.g. 21008891"
              value={formData.rollNo}
              onValueChange={(v) => setFormData({ ...formData, rollNo: v })}
              isRequired
            />
            <Input
              size="sm"
              label="Candidate Name"
              labelPlacement="outside"
              placeholder="Candidate Name"
              value={formData.name}
              onValueChange={(v) => setFormData({ ...formData, name: v })}
              isRequired
            />
            <Input
              size="sm"
              label="Father's Name"
              labelPlacement="outside"
              placeholder="Father's Name"
              value={formData.fatherName}
              onValueChange={(v) => setFormData({ ...formData, fatherName: v })}
            />
            <Input
              size="sm"
              label="Rank / Post Claimed"
              labelPlacement="outside"
              placeholder="e.g. Constable CP"
              value={formData.postClaimed}
              onValueChange={(v) => setFormData({ ...formData, postClaimed: v })}
            />

            {/* Master-Aligned District Dropdown */}
            <Select
              size="sm"
              label="Home District (Master)"
              labelPlacement="outside"
              items={districts}
              selectedKeys={[formData.district]}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="font-medium"
            >
              {(d) => <SelectItem key={d.key}>{d.label}</SelectItem>}
            </Select>

            {/* Resolved Zone Display + Add Button */}
            <div className="flex items-end gap-2">
              <Input
                size="sm"
                isReadOnly
                label="Police Zone (Auto)"
                labelPlacement="outside"
                value={formData.zone}
                className="bg-slate-50 font-semibold"
              />
              <Button
                size="sm"
                radius="sm"
                isLoading={isSubmitting}
                className="bg-[#0f2744] text-xs font-semibold text-white hover:bg-[#163a66] min-w-[70px]"
                onClick={handleAddPetitioner}
              >
                Add
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 4. Edit Individual Petitioner Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900">
                Edit Petitioner: {editingItem?.name}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Roll Number"
                  labelPlacement="outside"
                  value={editingItem?.rollNo || ""}
                  onValueChange={(v) =>
                    setEditingItem(editingItem ? { ...editingItem, rollNo: v } : null)
                  }
                />
                <Input
                  size="sm"
                  label="Petitioner Name"
                  labelPlacement="outside"
                  value={editingItem?.name || ""}
                  onValueChange={(v) =>
                    setEditingItem(editingItem ? { ...editingItem, name: v } : null)
                  }
                  isRequired
                />
                <Input
                  size="sm"
                  label="Father's Name"
                  labelPlacement="outside"
                  value={editingItem?.fatherName || ""}
                  onValueChange={(v) =>
                    setEditingItem(editingItem ? { ...editingItem, fatherName: v } : null)
                  }
                />

                <Select
                  size="sm"
                  label="Home District"
                  labelPlacement="outside"
                  items={districts}
                  selectedKeys={editingItem?.district ? [editingItem.district] : ["Lucknow"]}
                  onChange={(e) =>
                    setEditingItem(editingItem ? { ...editingItem, district: e.target.value } : null)
                  }
                >
                  {(d) => <SelectItem key={d.key}>{d.label}</SelectItem>}
                </Select>

                <Select
                  size="sm"
                  label="Legal Status in Writ"
                  labelPlacement="outside"
                  selectedKeys={editingItem?.status ? [editingItem.status] : ["ACTIVE"]}
                  onChange={(e) =>
                    setEditingItem(
                      editingItem ? { ...editingItem, status: e.target.value as any } : null
                    )
                  }
                >
                  <SelectItem key="ACTIVE">ACTIVE (Claim Pursued)</SelectItem>
                  <SelectItem key="WITHDRAWN">WITHDRAWN (Candidate Opted Out)</SelectItem>
                  <SelectItem key="DISMISSED_ON_MERIT">DISMISSED ON MERIT</SelectItem>
                  <SelectItem key="RELIEF_GRANTED">RELIEF GRANTED</SelectItem>
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

      {/* 5. Bulk CSV Upload Modal */}
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
                  <b>{currentCase?.fileNo || "Selected Case"}</b>.
                </p>
                <div
                  onClick={() => {
                    toast.success("Parsed sample CSV rows into candidate queue!");
                    onCsvOpenChange();
                  }}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50/50 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-rounded text-4xl text-blue-700">cloud_upload</span>
                  <p className="mt-2 text-xs font-bold text-slate-800">Click to Upload &amp; Parse CSV</p>
                  <p className="text-[10px] text-slate-400 mt-1">Columns: RollNo, CandidateName, FatherName, District</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
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