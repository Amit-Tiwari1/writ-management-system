"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Slider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@nextui-org/react";
import Link from "next/link";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { MastersAPI } from "@/api/mastersApi";
import { z } from "zod";

const aliasFormSchema = z.object({
  keyword: z.string().min(2, "Keyword is required").trim(),
  language: z.string().min(1, "Language is required"),
  category: z.string().min(1, "Category is required"),
  matchWeight: z.string().min(1, "Match weight is required"),
});

type AliasFormValues = z.infer<typeof aliasFormSchema>;

const standingCounselFormSchema = z.object({
  name: z.string().min(2, "Advocate or office name is required").trim(),
  monitoredBenches: z.string().min(2, "Monitored benches are required").trim(),
  autoFlag: z.boolean(),
});

type StandingCounselFormValues = z.infer<typeof standingCounselFormSchema>;

interface IAliasItem {
  _id: string;
  keyword: string;
  language: string;
  category: string;
  matchWeight: string;
  createdAt?: string;
  updatedAt?: string;
}

interface IStandingCounselItem {
  _id: string;
  name: string;
  monitoredBenches: string;
  autoFlag: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function AliasesMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isAdvocateOpen, onOpen: onAdvocateOpen, onOpenChange: onAdvocateOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(85);

  const [aliasList, setAliasList] = useState<IAliasItem[]>([]);
  const [standingCounsels, setStandingCounsels] = useState<IStandingCounselItem[]>([]);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: "KEYWORD" | "ADVOCATE" } | null>(null);

  const {
    control: aliasControl,
    handleSubmit: handleAliasSubmit,
    reset: resetAliasForm,
    formState: { errors: aliasErrors },
  } = useForm<AliasFormValues>({
    resolver: zodResolver(aliasFormSchema),
    defaultValues: {
      keyword: "",
      language: "Hindi (Devanagari)",
      category: "Informal Court Name",
      matchWeight: "High (90%)",
    },
  });

  const {
    control: advocateControl,
    handleSubmit: handleAdvocateSubmit,
    reset: resetAdvocateForm,
    formState: { errors: advocateErrors },
  } = useForm<StandingCounselFormValues>({
    resolver: zodResolver(standingCounselFormSchema),
    defaultValues: {
      name: "",
      monitoredBenches: "",
      autoFlag: true,
    },
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await MastersAPI.getAliases();
      if (res?.success && res.data) {
        setAliasList(res.data.aliases || []);
        setStandingCounsels(res.data.counsels || []);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load alias and counsel records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onAddKeyword: SubmitHandler<AliasFormValues> = async (values) => {
    try {
      setSubmitting(true);
      const res = await MastersAPI.createAlias(values);
      if (res?.success) {
        toast.success(res.message || "Alias pattern registered successfully");
        resetAliasForm();
        onAddOpenChange();
        fetchData();
      } else {
        toast.error(res?.message || "Failed to add alias");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add alias pattern");
    } finally {
      setSubmitting(false);
    }
  };

  const onAddAdvocate: SubmitHandler<StandingCounselFormValues> = async (values) => {
    try {
      setSubmitting(true);
      const newItem: IStandingCounselItem = {
        _id: Date.now().toString(),
        name: values.name,
        monitoredBenches: values.monitoredBenches,
        autoFlag: values.autoFlag,
      };
      setStandingCounsels((prev) => [...prev, newItem]);
      toast.success("Panel advocate added to monitoring queue");
      resetAdvocateForm();
      onAdvocateOpenChange();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add panel advocate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (item: { _id: string; keyword?: string; name?: string }, type: "KEYWORD" | "ADVOCATE") => {
    setItemToDelete({
      id: item._id,
      name: item.keyword || item.name || "Selected Item",
      type,
    });
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setSubmitting(true);
      if (itemToDelete.type === "KEYWORD") {
        setAliasList((prev) => prev.filter((a) => a._id !== itemToDelete.id));
        toast.success("Alias keyword removed");
      } else {
        setStandingCounsels((prev) => prev.filter((c) => c._id !== itemToDelete.id));
        toast.success("Panel advocate removed");
      }
      onDeleteOpenChange();
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove entry");
    } finally {
      setSubmitting(false);
    }
  };

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
                <h1 className="text-base font-bold text-slate-900">6.10 Institutional Alias & Keyword Matrix</h1>
                <Chip size="sm" className="bg-amber-500/20 px-1 text-[10px] font-bold text-amber-700">
                  Cause List Matching Engine
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Manages acronyms, Hindi variations & advocate associations to power Screen 2.4 Inward Discovery Desk
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                startContent={<span className="material-symbols-rounded text-sm">person_add</span>}
                onPress={() => {
                  resetAdvocateForm();
                  onAdvocateOpen();
                }}
              >
                Add Panel Advocate
              </Button>
              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
                startContent={<span className="material-symbols-rounded text-sm">add</span>}
                onPress={() => {
                  resetAliasForm();
                  onAddOpen();
                }}
              >
                Add Alias Variant
              </Button>
            </div>
          </div>

          {/* Fuzzy Threshold Slider */}
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-800">Fuzzy Matching Sensitivity Threshold</span>
                <span className="font-bold text-blue-700">{threshold}%</span>
              </div>
              <Slider
                size="sm"
                step={5}
                minValue={60}
                maxValue={100}
                value={threshold}
                onChange={(val) => setThreshold(val as number)}
                className="mt-2"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Matches with confidence above this percentage automatically surface in 2.4 Inward Discovery Desk.
              </p>
            </div>

            <div className="flex flex-col justify-between rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-900">
              <span className="font-bold">Active Engine Status:</span>
              <p className="text-[11px] mt-1">
                Scanning daily cause lists for <b>{aliasList.length} synonyms</b> across Allahabad & Lucknow registries.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. Split Grids: Left (Aliases) + Right (Monitored Advocates) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Keywords Table (7 Cols) */}
        <Card shadow="none" className="border border-slate-200/80 bg-white lg:col-span-7">
          <div className="border-b border-slate-100 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Configured Keyword Synonyms ({aliasList.length})
            </h3>
          </div>
          <CardBody className="p-0">
            <Table removeWrapper aria-label="Alias Matrix Table" className="min-w-full">
              <TableHeader>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">KEYWORD PATTERN</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">SCRIPT / LANGUAGE</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">MATCH WEIGHT</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
              </TableHeader>
              <TableBody
                items={aliasList}
                emptyContent={
                  loading ? (
                    <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                      <Spinner size="sm" /> Loading aliases...
                    </div>
                  ) : (
                    "No keyword patterns configured."
                  )
                }
              >
                {(item) => (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell>
                      <p className="font-bold text-xs text-slate-900">{item.keyword}</p>
                      <p className="text-[10px] text-slate-400">{item.category}</p>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{item.language}</TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="primary" className="text-[10px] font-mono font-bold">
                        {item.matchWeight}
                      </Chip>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-400 hover:text-rose-600"
                        onClick={() => handleOpenDelete(item, "KEYWORD")}
                      >
                        <span className="material-symbols-rounded text-sm">delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Monitored Standing Counsels Table (5 Cols) */}
        <Card shadow="none" className="border border-slate-200/80 bg-white lg:col-span-5">
          <div className="border-b border-slate-100 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monitored Panel Advocates ({standingCounsels.length})
            </h3>
            <p className="text-[11px] text-slate-400">Any appearance listed for these counsels auto-tags the board</p>
          </div>
          <CardBody className="p-0">
            <Table removeWrapper aria-label="Standing Counsels Table" className="min-w-full">
              <TableHeader>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">ADVOCATE NAME / OFFICE</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">MONITORED BENCHES</TableColumn>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
              </TableHeader>
              <TableBody
                items={standingCounsels}
                emptyContent={
                  loading ? (
                    <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                      <Spinner size="sm" /> Loading panel advocates...
                    </div>
                  ) : (
                    "No panel advocates monitored."
                  )
                }
              >
                {(item) => (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell>
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                      <Chip size="sm" color="success" variant="flat" className="text-[9px] font-bold h-4 px-1 mt-0.5">
                        Active Listener
                      </Chip>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{item.monitoredBenches}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-400 hover:text-rose-600"
                        onClick={() => handleOpenDelete(item, "ADVOCATE")}
                      >
                        <span className="material-symbols-rounded text-sm">delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* MODAL 1: Add Alias Variant */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAliasSubmit(onAddKeyword)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">spellcheck</span>
                Add Institution Alias Variant
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Controller
                  name="keyword"
                  control={aliasControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Keyword / Search Pattern"
                      labelPlacement="outside"
                      placeholder="e.g. उत्तर प्रदेश पुलिस बोर्ड"
                      isInvalid={!!aliasErrors.keyword}
                      errorMessage={aliasErrors.keyword?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="language"
                  control={aliasControl}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Script / Language Classification"
                      labelPlacement="outside"
                      selectedKeys={[field.value]}
                      onChange={(e) => field.onChange(e.target.value)}
                      isRequired
                    >
                      <SelectItem key="Hindi (Devanagari)">Hindi (Devanagari Script)</SelectItem>
                      <SelectItem key="English (Latin)">English (Latin Script)</SelectItem>
                      <SelectItem key="English (Abbr)">English (Acronym / Abbreviation)</SelectItem>
                      <SelectItem key="English (Colloquial)">English (Colloquial / Slang)</SelectItem>
                    </Select>
                  )}
                />

                <Controller
                  name="category"
                  control={aliasControl}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Entity Category"
                      labelPlacement="outside"
                      selectedKeys={[field.value]}
                      onChange={(e) => field.onChange(e.target.value)}
                      isRequired
                    >
                      <SelectItem key="Primary Institution Code">Primary Institution Code</SelectItem>
                      <SelectItem key="Informal Court Name">Informal Court Name</SelectItem>
                      <SelectItem key="Full Official Name">Full Official Name</SelectItem>
                      <SelectItem key="Representative Title">Representative Title</SelectItem>
                      <SelectItem key="Alternative Entity">Alternative Entity</SelectItem>
                    </Select>
                  )}
                />

                <Controller
                  name="matchWeight"
                  control={aliasControl}
                  render={({ field }) => (
                    <Select
                      size="sm"
                      label="Match Weight Level"
                      labelPlacement="outside"
                      selectedKeys={[field.value]}
                      onChange={(e) => field.onChange(e.target.value)}
                      isRequired
                    >
                      <SelectItem key="Exact (100%)">Exact (100% Match)</SelectItem>
                      <SelectItem key="High (95%)">High (95% Match)</SelectItem>
                      <SelectItem key="High (90%)">High (90% Match)</SelectItem>
                      <SelectItem key="Medium (80%)">Medium (80% Match)</SelectItem>
                    </Select>
                  )}
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={submitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  isLoading={submitting}
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                >
                  Save Alias
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: Add Panel Advocate */}
      <Modal isOpen={isAdvocateOpen} onOpenChange={onAdvocateOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAdvocateSubmit(onAddAdvocate)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">person_add</span>
                Add Monitored Standing Counsel
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Controller
                  name="name"
                  control={advocateControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Advocate / Office Name"
                      labelPlacement="outside"
                      placeholder="e.g. Additional Chief Standing Counsel (LKO)"
                      isInvalid={!!advocateErrors.name}
                      errorMessage={advocateErrors.name?.message}
                      isRequired
                    />
                  )}
                />

                <Controller
                  name="monitoredBenches"
                  control={advocateControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="sm"
                      label="Monitored Benches / Court Halls"
                      labelPlacement="outside"
                      placeholder="e.g. Court No. 1, Court No. 18, Division Bench"
                      isInvalid={!!advocateErrors.monitoredBenches}
                      errorMessage={advocateErrors.monitoredBenches?.message}
                      isRequired
                    />
                  )}
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={submitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  isLoading={submitting}
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                >
                  Save Panel Advocate
                </Button>
              </ModalFooter>
            </form>
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
                Are you sure you want to remove <b>{itemToDelete?.name}</b>? The automatic discovery scraper will stop querying this pattern from High Court cause lists.
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={submitting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  isLoading={submitting}
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  onClick={handleConfirmDelete}
                >
                  Delete Entry
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}