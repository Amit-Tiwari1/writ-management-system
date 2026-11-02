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
  Pagination,
  Spinner,
} from "@nextui-org/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { MastersAPI } from "@/api/mastersApi";
import { courtSchema, caseTypeSchema } from "@/schemas/masterSchema";
import { ICourtItem, ICaseTypeItem } from "@/types/master.types";
import { z } from "zod";

type CourtFormValues = z.infer<typeof courtSchema>;
type CaseTypeFormValues = z.infer<typeof caseTypeSchema>;

const FORUM_TYPES = [
  { key: "HIGH_COURT", label: "High Court (Principal / Benches)" },
  { key: "APEX_COURT", label: "Supreme Court of India" },
  { key: "TRIBUNAL", label: "State Public Services Tribunal (SPST)" },
  { key: "SUBORDINATE_COURT", label: "District / Sessions Court" },
];

export default function JudicialMasterPage() {
  const [activeTab, setActiveTab] = useState<string>("case_types");
  const [selectedCourtId, setSelectedCourtId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [courts, setCourts] = useState<ICourtItem[]>([]);
  const [caseTypes, setCaseTypes] = useState<ICaseTypeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const rowsPerPage = 8;

  const { isOpen: isAddCourtOpen, onOpen: onAddCourtOpen, onOpenChange: onAddCourtOpenChange } = useDisclosure();
  const { isOpen: isAddTypeOpen, onOpen: onAddTypeOpen, onOpenChange: onAddTypeOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; kind: "COURT" | "CASE_TYPE" } | null>(null);

  // 1. React Hook Form for Case Type
  const {
    control: caseTypeControl,
    handleSubmit: handleCaseTypeSubmit,
    reset: resetCaseTypeForm,
    formState: { errors: caseTypeErrors },
  } = useForm<CaseTypeFormValues>({
    resolver: zodResolver(caseTypeSchema) as any,
    defaultValues: {
      courtId: "",
      caseTypeName: "",
      shortName: "",
    },
  });

  // 2. React Hook Form for Court
  const {
    control: courtControl,
    handleSubmit: handleCourtSubmit,
    reset: resetCourtForm,
    formState: { errors: courtErrors },
  } = useForm<CourtFormValues>({
    resolver: zodResolver(courtSchema) as any,
    defaultValues: {
      courtName: "",
      shortCode: "",
      courtType: "HIGH_COURT",
      location: "",
    },
  });

  const loadJudicialData = useCallback(async () => {
    setLoading(true);
    try {
      const [resCourts, resCaseTypes] = await Promise.all([
        MastersAPI.getCourts({ limit: 100 }),
        MastersAPI.getCaseTypes({
          limit: 200,
          courtId: selectedCourtId !== "ALL" ? selectedCourtId : undefined,
        }),
      ]);

      if (resCourts?.success) {
        setCourts(resCourts.data || []);
      }
      if (resCaseTypes?.success) {
        setCaseTypes(resCaseTypes.data || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load judicial master records");
    } finally {
      setLoading(false);
    }
  }, [selectedCourtId]);

  useEffect(() => {
    loadJudicialData();
  }, [loadJudicialData]);

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

  const handleOpenAddType = () => {
    resetCaseTypeForm({
      courtId: courts[0]?._id || "",
      caseTypeName: "",
      shortName: "",
    });
    onAddTypeOpen();
  };

  const handleOpenAddCourt = () => {
    resetCourtForm({
      courtName: "",
      shortCode: "",
      courtType: "HIGH_COURT",
      location: "",
    });
    onAddCourtOpen();
  };

  const onSaveCaseType = async (values: CaseTypeFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        courtId: values.courtId,
        caseTypeName: values.caseTypeName.trim(),
        shortName: values.shortName.trim().toUpperCase(),
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

  const onSaveCourt = async (values: CourtFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        courtName: values.courtName.trim(),
        shortCode: values.shortCode.trim().toUpperCase(),
        courtType: values.courtType,
        location: values.location.trim(),
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

  // Filter & Pagination for Case Types
  const filteredCaseTypes = useMemo(() => {
    return caseTypes.filter((c) => {
      const cId = typeof c.courtId === "object" ? (c.courtId as any)?._id : c.courtId;
      const matchesCourt = selectedCourtId === "ALL" || cId === selectedCourtId;
      const matchesSearch =
        c.caseTypeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.shortName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCourt && matchesSearch;
    });
  }, [caseTypes, selectedCourtId, searchQuery]);

  const totalTypePages = Math.ceil(filteredCaseTypes.length / rowsPerPage) || 1;
  const paginatedCaseTypes = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredCaseTypes.slice(start, start + rowsPerPage);
  }, [filteredCaseTypes, page, rowsPerPage]);

  // Filter & Pagination for Courts
  const filteredCourts = useMemo(() => {
    return courts.filter((c) => {
      return (
        c.courtName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.shortCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [courts, searchQuery]);

  const totalCourtPages = Math.ceil(filteredCourts.length / rowsPerPage) || 1;
  const paginatedCourts = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredCourts.slice(start, start + rowsPerPage);
  }, [filteredCourts, page, rowsPerPage]);

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
                  7.5 Judicial Courts & Case Types Master
                </h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  eCourts CIS Mapped
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Configure judicial forums, benches, jurisdiction, and official eCourts/CIS case classification codes
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

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <Tabs
              aria-label="Judicial Master Tabs"
              selectedKey={activeTab}
              onSelectionChange={(key) => {
                setActiveTab(key as string);
                setSearchQuery("");
                setPage(1);
              }}
              color="primary"
              variant="underlined"
              classNames={{
                tabList: "gap-6 p-0 border-b-0",
                cursor: "w-full bg-[#0f2744]",
                tab: "max-w-fit px-0 h-8 text-xs font-semibold",
                tabContent: "group-data-[selected=true]:text-[#0f2744] text-slate-500",
              }}
            >
              <Tab key="case_types" title={`Case Types (${caseTypes.length})`} />
              <Tab key="courts" title={`Court Establishments (${courts.length})`} />
            </Tabs>

            <div className="flex items-center gap-3">
              {activeTab === "case_types" && (
                <div className="w-64">
                  <Select
                    size="sm"
                    radius="sm"
                    aria-label="Filter by Court Establishment"
                    placeholder="Filter by Court"
                    items={courtFilterItems}
                    selectedKeys={[selectedCourtId]}
                    onChange={(e) => {
                      setSelectedCourtId(e.target.value || "ALL");
                      setPage(1);
                    }}
                    className="bg-slate-50 font-semibold"
                  >
                    {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                  </Select>
                </div>
              )}
              <div className="w-64">
                <Input
                  size="sm"
                  radius="sm"
                  placeholder="Search active view..."
                  value={searchQuery}
                  onValueChange={(val) => {
                    setSearchQuery(val);
                    setPage(1);
                  }}
                  startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
                  className="bg-slate-50"
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Tables View */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          {activeTab === "case_types" && (
            <Table
              removeWrapper
              aria-label="Case Types Table"
              className="min-w-full"
              bottomContent={
                totalTypePages > 1 ? (
                  <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Showing {(page - 1) * rowsPerPage + 1} to{" "}
                      {Math.min(page * rowsPerPage, filteredCaseTypes.length)} of {filteredCaseTypes.length}
                    </span>
                    <Pagination
                      isCompact
                      showControls
                      color="primary"
                      page={page}
                      total={totalTypePages}
                      onChange={(p) => setPage(p)}
                    />
                  </div>
                ) : null
              }
            >
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
                items={paginatedCaseTypes}
                emptyContent={
                  loading ? (
                    <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                      <Spinner size="sm" /> Loading case types...
                    </div>
                  ) : (
                    "No case types match the selected criteria."
                  )
                }
              >
                {(item) => {
                  const itemIndex = (page - 1) * rowsPerPage + paginatedCaseTypes.indexOf(item) + 1;
                  return (
                    <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <TableCell className="text-xs font-bold text-slate-400">{itemIndex}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800">
                        {typeof item.courtId === "object" ? (item.courtId as any)?.courtName : "--"}
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
          )}

          {activeTab === "courts" && (
            <Table
              removeWrapper
              aria-label="Courts Table"
              className="min-w-full"
              bottomContent={
                totalCourtPages > 1 ? (
                  <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Showing {(page - 1) * rowsPerPage + 1} to{" "}
                      {Math.min(page * rowsPerPage, filteredCourts.length)} of {filteredCourts.length}
                    </span>
                    <Pagination
                      isCompact
                      showControls
                      color="primary"
                      page={page}
                      total={totalCourtPages}
                      onChange={(p) => setPage(p)}
                    />
                  </div>
                ) : null
              }
            >
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
                items={paginatedCourts}
                emptyContent={
                  loading ? (
                    <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                      <Spinner size="sm" /> Loading court establishments...
                    </div>
                  ) : (
                    "No court establishments configured."
                  )
                }
              >
                {(item) => {
                  const itemIndex = (page - 1) * rowsPerPage + paginatedCourts.indexOf(item) + 1;
                  return (
                    <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <TableCell className="text-xs font-bold text-slate-400">{itemIndex}</TableCell>
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
          )}
        </CardBody>
      </Card>

      {/* MODAL 1: ADD CASE TYPE */}
      <Modal isOpen={isAddTypeOpen} onOpenChange={onAddTypeOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleCaseTypeSubmit(onSaveCaseType)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">gavel</span>
                Add Case Type Master
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Controller
                  name="courtId"
                  control={caseTypeControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Court Establishment <span className="text-red-500">*</span>
                      </label>
                      <Select
                        size="sm"
                        placeholder="Select Court Establishment"
                        items={courtSelectItems}
                        selectedKeys={field.value ? [field.value] : []}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!caseTypeErrors.courtId}
                        errorMessage={caseTypeErrors.courtId?.message}
                      >
                        {(court) => <SelectItem key={court.key}>{court.label}</SelectItem>}
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="caseTypeName"
                  control={caseTypeControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Case Type Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. WRIT - A (Civil Services)"
                        isInvalid={!!caseTypeErrors.caseTypeName}
                        errorMessage={caseTypeErrors.caseTypeName?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="shortName"
                  control={caseTypeControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Short Acronym / Code <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. WRIT-A"
                        isInvalid={!!caseTypeErrors.shortName}
                        errorMessage={caseTypeErrors.shortName?.message}
                      />
                    </div>
                  )}
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                >
                  Save Case Type
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: ADD COURT */}
      <Modal isOpen={isAddCourtOpen} onOpenChange={onAddCourtOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleCourtSubmit(onSaveCourt)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">account_balance</span>
                Add Court Establishment
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Controller
                  name="courtName"
                  control={courtControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Court Establishment Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. High Court Allahabad"
                        isInvalid={!!courtErrors.courtName}
                        errorMessage={courtErrors.courtName?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="shortCode"
                  control={courtControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Short Acronym Code <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. HC-ALD"
                        isInvalid={!!courtErrors.shortCode}
                        errorMessage={courtErrors.shortCode?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="courtType"
                  control={courtControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Forum Classification <span className="text-red-500">*</span>
                      </label>
                      <Select
                        size="sm"
                        items={FORUM_TYPES}
                        selectedKeys={[field.value || "HIGH_COURT"]}
                        onChange={(e) => field.onChange(e.target.value)}
                        isInvalid={!!courtErrors.courtType}
                        errorMessage={courtErrors.courtType?.message}
                      >
                        {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="location"
                  control={courtControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Bench / Seat Location <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Principal Bench (Prayagraj)"
                        isInvalid={!!courtErrors.location}
                        errorMessage={courtErrors.location?.message}
                      />
                    </div>
                  )}
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                >
                  Save Court
                </Button>
              </ModalFooter>
            </form>
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