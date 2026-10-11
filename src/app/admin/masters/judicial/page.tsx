"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { MastersAPI } from "@/api/mastersApi";

interface CourtRecord {
  _id: string;
  courtName: string;
  shortCode: string;
  courtType: string;
  location: string;
  createdAt?: string;
}

interface CaseTypeRecord {
  _id: string;
  courtId: {
    _id: string;
    courtName: string;
    shortCode: string;
  };
  caseTypeName: string;
  shortName: string;
  activeWritsCount?: number;
  createdAt?: string;
}

const FORUM_TYPES = [
  { key: "HIGH_COURT", label: "HIGH_COURT" },
  { key: "APEX_COURT", label: "APEX_COURT" },
  { key: "TRIBUNAL", label: "TRIBUNAL" },
  { key: "SUBORDINATE_COURT", label: "SUBORDINATE_COURT" },
];

export default function JudicialMasterPage() {
  const [selectedCourtId, setSelectedCourtId] = useState<string>("ALL");
  const [courts, setCourts] = useState<CourtRecord[]>([]);
  const [caseTypes, setCaseTypes] = useState<CaseTypeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { isOpen: isAddCourtOpen, onOpen: onAddCourtOpen, onOpenChange: onAddCourtOpenChange } = useDisclosure();
  const { isOpen: isAddTypeOpen, onOpen: onAddTypeOpen, onOpenChange: onAddTypeOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  // Add Form Inputs
  const [newCaseType, setNewCaseType] = useState({
    courtId: "",
    caseTypeName: "",
    shortName: "",
  });

  const [newCourt, setNewCourt] = useState({
    courtName: "",
    shortCode: "",
    courtType: "HIGH_COURT",
    location: "",
  });

  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; kind: "COURT" | "CASE_TYPE" } | null>(null);

  // Load Judicial Data from Backend
  const loadJudicialData = useCallback(async () => {
    setLoading(true);
    try {
      const [resCourts, resCaseTypes] = await Promise.all([
        MastersAPI.getCourts(),
        MastersAPI.getCaseTypes(),
      ]);

      if (resCourts?.success) {
        setCourts(resCourts.data || []);
      }
      if (resCaseTypes?.success) {
        setCaseTypes(resCaseTypes.data || []);
      }
    } catch (err: any) {
      console.error("[JudicialMaster] Error fetching:", err);
      toast.error(err.response?.data?.message || "Failed to load judicial master records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJudicialData();
  }, [loadJudicialData]);

  // Dynamic filter items for Court selection
  const courtFilterItems = useMemo(() => {
    return [
      { key: "ALL", label: "All Judicial Establishments" },
      ...courts.map((court) => ({
        key: court._id,
        label: `${court.courtName} (${court.shortCode})`,
      })),
    ];
  }, [courts]);

  const courtSelectItems = useMemo(() => {
    return courts.map((court) => ({
      key: court._id,
      label: `${court.courtName} (${court.shortCode})`,
    }));
  }, [courts]);

  // Open Add Case Type Modal with Default Court
  const handleOpenAddType = () => {
    setNewCaseType({
      courtId: courts[0]?._id || "",
      caseTypeName: "",
      shortName: "",
    });
    onAddTypeOpen();
  };

  // Open Add Court Modal
  const handleOpenAddCourt = () => {
    setNewCourt({
      courtName: "",
      shortCode: "",
      courtType: "HIGH_COURT",
      location: "",
    });
    onAddCourtOpen();
  };

  // Add Case Type Handler
  const handleAddCaseType = async () => {
    if (!newCaseType.courtId || !newCaseType.caseTypeName.trim() || !newCaseType.shortName.trim()) {
      toast.error("Court selection, Case Type Name, and Short Name are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        courtId: newCaseType.courtId,
        caseTypeName: newCaseType.caseTypeName.trim(),
        shortName: newCaseType.shortName.trim().toUpperCase(),
      };

      const res = await MastersAPI.createCaseType(payload);
      if (res?.success) {
        toast.success(`Case Type ${payload.shortName} registered successfully!`);
        onAddTypeOpenChange();
        loadJudicialData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save case type");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Court Handler
  const handleAddCourt = async () => {
    if (!newCourt.courtName.trim() || !newCourt.shortCode.trim() || !newCourt.location.trim()) {
      toast.error("Court Name, Short Code, and Location Bench are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        courtName: newCourt.courtName.trim(),
        shortCode: newCourt.shortCode.trim().toUpperCase(),
        courtType: newCourt.courtType,
        location: newCourt.location.trim(),
      };

      const res = await MastersAPI.createCourt(payload);
      if (res?.success) {
        toast.success(`Court ${payload.shortCode} registered successfully!`);
        onAddCourtOpenChange();
        loadJudicialData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to register court establishment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      if (itemToDelete.kind === "CASE_TYPE") {
        await MastersAPI.deleteCaseType(itemToDelete.id);
        toast.success("Case Type removed.");
      } else {
        await MastersAPI.deleteCourt(itemToDelete.id);
        toast.success("Court establishment removed.");
      }
      onDeleteOpenChange();
      loadJudicialData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cannot delete: Record in active use");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCaseTypes = useMemo(() => {
    return caseTypes.filter(
      (c) => selectedCourtId === "ALL" || c.courtId?._id === selectedCourtId
    );
  }, [caseTypes, selectedCourtId]);

  return (
    <div className="space-y-4">
      {/* 1. Header Information Bar */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/admin/masters">
                  <Button isIconOnly size="sm" variant="light" className="text-slate-500">
                    <span className="material-symbols-rounded">arrow_back</span>
                  </Button>
                </Link>
                <h1 className="text-base font-bold text-slate-900">
                  6.5 Judicial Courts & Case Types Master
                </h1>
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
                onPress={handleOpenAddCourt}
              >
                Add Court
              </Button>
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
                startContent={<span className="material-symbols-rounded text-sm">add</span>}
                onPress={handleOpenAddType}
              >
                Add Case Type
              </Button>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <Tabs
              aria-label="Judicial Master Tabs"
              variant="underlined"
              classNames={{
                tabList: "gap-6",
                cursor: "bg-[#0f2744]",
                tab: "max-w-fit px-0 h-9 text-xs font-semibold",
              }}
            >
              {/* TAB 1: CASE TYPES */}
              <Tab key="case_types" title={`Case Types (${caseTypes.length})`}>
                <div className="mt-3 flex items-center justify-between">
                  <div className="w-72">
                    <Select
                      size="sm"
                      radius="sm"
                      label="Filter by Court Establishment"
                      labelPlacement="outside"
                      items={courtFilterItems}
                      selectedKeys={[selectedCourtId]}
                      onChange={(e) => setSelectedCourtId(e.target.value || "ALL")}
                      className="bg-slate-50 font-semibold"
                    >
                      {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                    </Select>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {filteredCaseTypes.length} Case Types Listed
                  </span>
                </div>

                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200/80">
                  <Table removeWrapper aria-label="Case Types Table" className="min-w-full">
                    <TableHeader>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        S.NO
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        COURT ESTABLISHMENT
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        OFFICIAL CASE TYPE
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        SHORT NAME
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                        ACTION
                      </TableColumn>
                    </TableHeader>
                    <TableBody
                      items={filteredCaseTypes}
                      isLoading={loading}
                      loadingContent={
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-6 w-full rounded" />
                          <Skeleton className="h-6 w-full rounded" />
                        </div>
                      }
                      emptyContent={!loading ? "No case types match the selected court filter." : " "}
                    >
                      {(item) => {
                        const index = caseTypes.findIndex((c) => c._id === item._id) + 1;
                        return (
                          <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                            <TableCell className="text-xs font-bold text-slate-400">{index}</TableCell>
                            <TableCell className="text-xs font-semibold text-slate-800">
                              {item.courtId?.courtName || "--"}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-slate-900">
                              {item.caseTypeName}
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-blue-700">
                              {item.shortName}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-slate-400 hover:text-rose-600"
                                onPress={() => {
                                  setItemToDelete({ id: item._id, name: item.shortName, kind: "CASE_TYPE" });
                                  onDeleteOpen();
                                }}
                              >
                                <span className="material-symbols-rounded text-sm">delete</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      }}
                    </TableBody>
                  </Table>
                </div>
              </Tab>

              {/* TAB 2: COURT ESTABLISHMENTS */}
              <Tab key="courts" title={`Court Establishments (${courts.length})`}>
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200/80">
                  <Table removeWrapper aria-label="Courts Table" className="min-w-full">
                    <TableHeader>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        S.NO
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        COURT NAME
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        SHORT CODE
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        FORUM TYPE
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        BENCH LOCATION
                      </TableColumn>
                      <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                        ACTION
                      </TableColumn>
                    </TableHeader>
                    <TableBody
                      items={courts}
                      isLoading={loading}
                      loadingContent={
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-6 w-full rounded" />
                          <Skeleton className="h-6 w-full rounded" />
                        </div>
                      }
                      emptyContent={!loading ? "No court establishments configured." : " "}
                    >
                      {(item) => {
                        const index = courts.findIndex((c) => c._id === item._id) + 1;
                        return (
                          <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                            <TableCell className="text-xs font-bold text-slate-400">{index}</TableCell>
                            <TableCell className="text-xs font-bold text-slate-900">{item.courtName}</TableCell>
                            <TableCell className="font-mono text-xs font-bold text-blue-700">
                              {item.shortCode}
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">{item.courtType}</TableCell>
                            <TableCell className="text-xs text-slate-700 font-medium">{item.location}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-slate-400 hover:text-rose-600"
                                onPress={() => {
                                  setItemToDelete({ id: item._id, name: item.courtName, kind: "COURT" });
                                  onDeleteOpen();
                                }}
                              >
                                <span className="material-symbols-rounded text-sm">delete</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      }}
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
                  label="Court Establishment"
                  labelPlacement="outside"
                  items={courtSelectItems}
                  selectedKeys={newCaseType.courtId ? [newCaseType.courtId] : []}
                  onChange={(e) => setNewCaseType({ ...newCaseType, courtId: e.target.value })}
                  isRequired
                >
                  {(court) => <SelectItem key={court.key}>{court.label}</SelectItem>}
                </Select>
                <Input
                  size="sm"
                  label="Case Type Full Name"
                  labelPlacement="outside"
                  placeholder="e.g. WRIT - A (Civil Services)"
                  value={newCaseType.caseTypeName}
                  onValueChange={(v) => setNewCaseType({ ...newCaseType, caseTypeName: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Short Acronym / Code"
                  labelPlacement="outside"
                  placeholder="e.g. WRIT-A"
                  value={newCaseType.shortName}
                  onValueChange={(v) => setNewCaseType({ ...newCaseType, shortName: v })}
                  isRequired
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                  onClick={handleAddCaseType}
                >
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
                  placeholder="e.g. High Court Allahabad"
                  value={newCourt.courtName}
                  onValueChange={(v) => setNewCourt({ ...newCourt, courtName: v })}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Short Acronym Code"
                  labelPlacement="outside"
                  placeholder="e.g. HC-ALD"
                  value={newCourt.shortCode}
                  onValueChange={(v) => setNewCourt({ ...newCourt, shortCode: v })}
                  isRequired
                />
                <Select
                  size="sm"
                  label="Forum Classification"
                  labelPlacement="outside"
                  items={FORUM_TYPES}
                  selectedKeys={[newCourt.courtType]}
                  onChange={(e) => setNewCourt({ ...newCourt, courtType: e.target.value })}
                >
                  {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                </Select>
                <Input
                  size="sm"
                  label="Bench / Seat Location"
                  labelPlacement="outside"
                  placeholder="e.g. Principal Bench (Prayagraj)"
                  value={newCourt.location}
                  onValueChange={(v) => setNewCourt({ ...newCourt, location: v })}
                  isRequired
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                  onClick={handleAddCourt}
                >
                  Save Court
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 3: DELETE CONFIRMATION */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} placement="center" size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">warning</span>
                Confirm Deletion
              </ModalHeader>
              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove <b>{itemToDelete?.name}</b>? Linked dockets or case types in active litigation might be affected.
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  isLoading={isSubmitting}
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