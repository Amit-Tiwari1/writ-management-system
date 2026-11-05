
"use client";

import React, { useState, useEffect } from "react";
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

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  aliasSchema,
  standingCounselSchema,
  AliasFormValues,
  StandingCounselFormValues,
} from "@/schemas/masterSchema";

import { IAliasItem, IStandingCounselItem } from "@/types/master.types";

import {
  fetchAliases,
  createAlias,
  deleteAlias,
  fetchStandingCounsels,
  createStandingCounsel,
  deleteStandingCounsel,
} from "@/store/thunks/masterThunks/aliasesThunks";

/* =========================================================
   CONSTANTS
========================================================= */

const LANGUAGE_OPTIONS = [
  { key: "Hindi (Devanagari)", label: "Hindi (Devanagari Script)" },
  { key: "English (Latin)", label: "English (Latin Script)" },
  { key: "English (Abbr)", label: "English (Acronym / Abbreviation)" },
  { key: "English (Colloquial)", label: "English (Colloquial / Slang)" },
];

const CATEGORY_OPTIONS = [
  { key: "Primary Institution Code", label: "Primary Institution Code" },
  { key: "Informal Court Name", label: "Informal Court Name" },
  { key: "Full Official Name", label: "Full Official Name" },
  { key: "Representative Title", label: "Representative Title" },
  { key: "Alternative Entity", label: "Alternative Entity" },
];

const MATCH_WEIGHT_OPTIONS = [
  { key: "Exact (100%)", label: "Exact (100% Match)" },
  { key: "High (95%)", label: "High (95% Match)" },
  { key: "High (90%)", label: "High (90% Match)" },
  { key: "Medium (80%)", label: "Medium (80% Match)" },
];

const DEFAULT_ALIAS_VALUES: AliasFormValues = {
  keyword: "",
  language: "Hindi (Devanagari)",
  category: "Informal Court Name",
  matchWeight: "High (90%)",
};

const DEFAULT_ADVOCATE_VALUES: StandingCounselFormValues = {
  name: "",
  monitoredBenches: "",
  autoFlag: true,
};

type DeleteItem = {
  id: string;
  name: string;
  type: "KEYWORD" | "ADVOCATE";
};

/* =========================================================
   COMPONENT
========================================================= */

export default function AliasesMasterPage() {
  const dispatch = useAppDispatch();

  /* -------------------------------------------------------
     MODALS
  ------------------------------------------------------- */

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
    onClose: onAddClose,
  } = useDisclosure();

  const {
    isOpen: isAdvocateOpen,
    onOpen: onAdvocateOpen,
    onOpenChange: onAdvocateOpenChange,
    onClose: onAdvocateClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
    onClose: onDeleteClose,
  } = useDisclosure();

  /* -------------------------------------------------------
     LOCAL UI STATE
  ------------------------------------------------------- */

  const [threshold, setThreshold] = useState<number>(85);
  const [itemToDelete, setItemToDelete] = useState<DeleteItem | null>(
    null
  );

  /* -------------------------------------------------------
     REDUX STATE
  ------------------------------------------------------- */

  const {
    aliases,
    standingCounsels,
    mutations,
  } = useAppSelector((state) => state.aliases);

  const aliasList = aliases.data;
  const counselList = standingCounsels.data;

  const loading =
    aliases.loading || standingCounsels.loading;

  const submitting =
    mutations.createAliasLoading ||
    mutations.deleteAliasLoading ||
    mutations.createStandingCounselLoading ||
    mutations.deleteStandingCounselLoading;

  const deleteLoading =
    mutations.deleteAliasLoading ||
    mutations.deleteStandingCounselLoading;

  /* -------------------------------------------------------
     ALIAS FORM
  ------------------------------------------------------- */

  const {
    control: aliasControl,
    handleSubmit: handleAliasSubmit,
    reset: resetAliasForm,
    formState: {
      errors: aliasErrors,
      isSubmitting: isAliasFormSubmitting,
    },
  } = useForm<AliasFormValues>({
    resolver: zodResolver(aliasSchema) as any,
    defaultValues: DEFAULT_ALIAS_VALUES,
    mode: "onSubmit",
  });

  /* -------------------------------------------------------
     STANDING COUNSEL FORM
  ------------------------------------------------------- */

  const {
    control: advocateControl,
    handleSubmit: handleAdvocateSubmit,
    reset: resetAdvocateForm,
    formState: {
      errors: advocateErrors,
      isSubmitting: isAdvocateFormSubmitting,
    },
  } = useForm<StandingCounselFormValues>({
    resolver: zodResolver(standingCounselSchema) as any,
    defaultValues: DEFAULT_ADVOCATE_VALUES,
    mode: "onSubmit",
  });

  /* -------------------------------------------------------
     FETCH MASTER DATA
  ------------------------------------------------------- */

  useEffect(() => {
    dispatch(fetchAliases());
    dispatch(fetchStandingCounsels());
  }, [dispatch]);

  /* -------------------------------------------------------
     FETCH ERROR HANDLING
  ------------------------------------------------------- */

  useEffect(() => {
    if (aliases.error) {
      toast.error(aliases.error);
    }
  }, [aliases.error]);

  useEffect(() => {
    if (standingCounsels.error) {
      toast.error(standingCounsels.error);
    }
  }, [standingCounsels.error]);

  /* -------------------------------------------------------
     REFRESH DATA
  ------------------------------------------------------- */

  const refreshAliases = () => {
    dispatch(fetchAliases());
  };

  const refreshStandingCounsels = () => {
    dispatch(fetchStandingCounsels());
  };

  /* -------------------------------------------------------
     ADD ALIAS
  ------------------------------------------------------- */

  const onAddKeyword: SubmitHandler<AliasFormValues> = async (
    values
  ) => {
    try {
      await dispatch(
        createAlias({
          ...values,
          keyword: values.keyword.trim(),
        })
      ).unwrap();

      toast.success("Alias pattern registered successfully");

      resetAliasForm(DEFAULT_ALIAS_VALUES);
      onAddClose();

      refreshAliases();
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Failed to add alias pattern"
      );
    }
  };

  /* -------------------------------------------------------
     ADD STANDING COUNSEL
  ------------------------------------------------------- */

  const onAddAdvocate: SubmitHandler<
    StandingCounselFormValues
  > = async (values) => {
    try {
      await dispatch(
        createStandingCounsel({
          name: values.name.trim(),
          monitoredBenches: values.monitoredBenches.trim(),
          autoFlag: values.autoFlag,
        })
      ).unwrap();

      toast.success("Panel advocate added to monitoring queue");

      resetAdvocateForm(DEFAULT_ADVOCATE_VALUES);
      onAdvocateClose();

      refreshStandingCounsels();
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Failed to add panel advocate"
      );
    }
  };

  /* -------------------------------------------------------
     OPEN DELETE CONFIRMATION
  ------------------------------------------------------- */

  const handleOpenDelete = (
    item: IAliasItem | IStandingCounselItem,
    type: "KEYWORD" | "ADVOCATE"
  ) => {
    const name =
      type === "KEYWORD"
        ? (item as IAliasItem).keyword
        : (item as IStandingCounselItem).name;

    setItemToDelete({
      id: item._id,
      name: name || "Selected Item",
      type,
    });

    onDeleteOpen();
  };

  /* -------------------------------------------------------
     CONFIRM DELETE
  ------------------------------------------------------- */

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === "KEYWORD") {
        await dispatch(
          deleteAlias(itemToDelete.id)
        ).unwrap();

        toast.success("Alias keyword removed successfully");
      } else {
        await dispatch(
          deleteStandingCounsel(itemToDelete.id)
        ).unwrap();

        toast.success("Panel advocate removed successfully");
      }

      setItemToDelete(null);
      onDeleteClose();
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Failed to remove entry"
      );
    }
  };

  /* -------------------------------------------------------
     MODAL CLOSE HANDLERS
  ------------------------------------------------------- */

  const handleAliasModalClose = () => {
    if (mutations.createAliasLoading) return;

    resetAliasForm(DEFAULT_ALIAS_VALUES);
    onAddClose();
  };

  const handleAdvocateModalClose = () => {
    if (mutations.createStandingCounselLoading) return;

    resetAdvocateForm(DEFAULT_ADVOCATE_VALUES);
    onAdvocateClose();
  };

  const handleDeleteModalClose = () => {
    if (deleteLoading) return;

    setItemToDelete(null);
    onDeleteClose();
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-4">
      {/* 1. Header Information Bar */}

      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/admin/masters">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="text-slate-500"
                  >
                    <span className="material-symbols-rounded">
                      arrow_back
                    </span>
                  </Button>
                </Link>

                <h1 className="text-base font-bold text-slate-900">
                  7.10 Institutional Alias &amp; Keyword Matrix
                </h1>

                <Chip
                  size="sm"
                  className="bg-amber-500/20 px-1 text-[10px] font-bold text-amber-700"
                >
                  Cause List Matching Engine
                </Chip>
              </div>

              <p className="text-xs text-slate-500 ml-9">
                Manages acronyms, Hindi variations &amp; advocate associations to power Screen 2.4 Inward Discovery Desk
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                className="border-slate-200 bg-white text-xs font-semibold text-slate-700"
                startContent={
                  <span className="material-symbols-rounded text-sm">
                    person_add
                  </span>
                }
                onPress={() => {
                  resetAdvocateForm(DEFAULT_ADVOCATE_VALUES);
                  onAdvocateOpen();
                }}
              >
                Add Panel Advocate
              </Button>

              <Button
                size="sm"
                radius="sm"
                className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
                startContent={
                  <span className="material-symbols-rounded text-sm">
                    add
                  </span>
                }
                onPress={() => {
                  resetAliasForm(DEFAULT_ALIAS_VALUES);
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
                <span className="font-bold text-slate-800">
                  Fuzzy Matching Sensitivity Threshold
                </span>

                <span className="font-bold text-blue-700">
                  {threshold}%
                </span>
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
              <span className="font-bold">
                Active Engine Status:
              </span>

              <p className="text-[11px] mt-1">
                Scanning daily cause lists for{" "}
                <b>{aliasList.length} synonyms</b> across Allahabad &amp;
                Lucknow registries.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. Split Grids: Left (Aliases) + Right (Monitored Advocates) */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Keywords Table (7 Cols) */}

        <Card
          shadow="none"
          className="border border-slate-200/80 bg-white lg:col-span-7"
        >
          <div className="border-b border-slate-100 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Configured Keyword Synonyms ({aliasList.length})
            </h3>
          </div>

          <CardBody className="p-0">
            <Table
              removeWrapper
              aria-label="Alias Matrix Table"
              className="min-w-full"
            >
              <TableHeader>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  KEYWORD PATTERN
                </TableColumn>

                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  SCRIPT / LANGUAGE
                </TableColumn>

                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MATCH WEIGHT
                </TableColumn>

                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                  ACTION
                </TableColumn>
              </TableHeader>

              <TableBody
                items={aliasList}
                isLoading={aliases.loading}
                loadingContent={
                  <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                    <Spinner size="sm" />
                    Loading aliases...
                  </div>
                }
                emptyContent={
                  aliases.loading
                    ? null
                    : "No keyword patterns configured."
                }
              >
                {(item) => (
                  <TableRow
                    key={item._id}
                    className="border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    <TableCell>
                      <p className="font-bold text-xs text-slate-900">
                        {item.keyword}
                      </p>

                      <p className="text-[10px] text-slate-400">
                        {item.category}
                      </p>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {item.language}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="text-[10px] font-mono font-bold"
                      >
                        {item.matchWeight}
                      </Chip>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-400 hover:text-rose-600"
                        isDisabled={submitting}
                        onPress={() =>
                          handleOpenDelete(item, "KEYWORD")
                        }
                      >
                        <span className="material-symbols-rounded text-sm">
                          delete
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Monitored Standing Counsels Table (5 Cols) */}

        <Card
          shadow="none"
          className="border border-slate-200/80 bg-white lg:col-span-5"
        >
          <div className="border-b border-slate-100 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monitored Panel Advocates ({counselList.length})
            </h3>

            <p className="text-[11px] text-slate-400">
              Any appearance listed for these counsels auto-tags the board
            </p>
          </div>

          <CardBody className="p-0">
            <Table
              removeWrapper
              aria-label="Standing Counsels Table"
              className="min-w-full"
            >
              <TableHeader>
                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ADVOCATE NAME / OFFICE
                </TableColumn>

                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MONITORED BENCHES
                </TableColumn>

                <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                  ACTION
                </TableColumn>
              </TableHeader>

              <TableBody
                items={counselList}
                isLoading={standingCounsels.loading}
                loadingContent={
                  <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                    <Spinner size="sm" />
                    Loading panel advocates...
                  </div>
                }
                emptyContent={
                  standingCounsels.loading
                    ? null
                    : "No panel advocates monitored."
                }
              >
                {(item) => (
                  <TableRow
                    key={item._id}
                    className="border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    <TableCell>
                      <p className="text-xs font-bold text-slate-900">
                        {item.name}
                      </p>

                      <Chip
                        size="sm"
                        color="success"
                        variant="flat"
                        className="text-[9px] font-bold h-4 px-1 mt-0.5"
                      >
                        Active Listener
                      </Chip>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {item.monitoredBenches}
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-400 hover:text-rose-600"
                        isDisabled={submitting}
                        onPress={() =>
                          handleOpenDelete(item, "ADVOCATE")
                        }
                      >
                        <span className="material-symbols-rounded text-sm">
                          delete
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* =====================================================
          MODAL 1: Add Alias Variant
      ===================================================== */}

      <Modal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        placement="top"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAliasSubmit(onAddKeyword)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">
                  spellcheck
                </span>
                Add Institution Alias Variant
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Controller
                  name="keyword"
                  control={aliasControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Keyword / Search Pattern{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. उत्तर प्रदेश पुलिस बोर्ड"
                        isInvalid={!!aliasErrors.keyword}
                        errorMessage={aliasErrors.keyword?.message}
                        isDisabled={mutations.createAliasLoading}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="language"
                  control={aliasControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Script / Language Classification{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={LANGUAGE_OPTIONS}
                        selectedKeys={
                          field.value ? [field.value] : []
                        }
                        onChange={(e) =>
                          field.onChange(e.target.value)
                        }
                        isInvalid={!!aliasErrors.language}
                        errorMessage={aliasErrors.language?.message}
                        isDisabled={mutations.createAliasLoading}
                      >
                        {(item) => (
                          <SelectItem key={item.key}>
                            {item.label}
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="category"
                  control={aliasControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Entity Category{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={CATEGORY_OPTIONS}
                        selectedKeys={
                          field.value ? [field.value] : []
                        }
                        onChange={(e) =>
                          field.onChange(e.target.value)
                        }
                        isInvalid={!!aliasErrors.category}
                        errorMessage={aliasErrors.category?.message}
                        isDisabled={mutations.createAliasLoading}
                      >
                        {(item) => (
                          <SelectItem key={item.key}>
                            {item.label}
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="matchWeight"
                  control={aliasControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Match Weight Level{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        size="sm"
                        items={MATCH_WEIGHT_OPTIONS}
                        selectedKeys={
                          field.value ? [field.value] : []
                        }
                        onChange={(e) =>
                          field.onChange(e.target.value)
                        }
                        isInvalid={!!aliasErrors.matchWeight}
                        errorMessage={aliasErrors.matchWeight?.message}
                        isDisabled={mutations.createAliasLoading}
                      >
                        {(item) => (
                          <SelectItem key={item.key}>
                            {item.label}
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                  )}
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={() => {
                    handleAliasModalClose();
                    onClose();
                  }}
                  isDisabled={mutations.createAliasLoading}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  isLoading={mutations.createAliasLoading}
                  isDisabled={isAliasFormSubmitting}
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                >
                  Save Alias
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* =====================================================
          MODAL 2: Add Panel Advocate
      ===================================================== */}

      <Modal
        isOpen={isAdvocateOpen}
        onOpenChange={onAdvocateOpenChange}
        placement="top"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAdvocateSubmit(onAddAdvocate)}>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">
                  person_add
                </span>
                Add Monitored Standing Counsel
              </ModalHeader>

              <ModalBody className="space-y-3">
                <Controller
                  name="name"
                  control={advocateControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Advocate / Office Name{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Additional Chief Standing Counsel (LKO)"
                        isInvalid={!!advocateErrors.name}
                        errorMessage={advocateErrors.name?.message}
                        isDisabled={
                          mutations.createStandingCounselLoading
                        }
                      />
                    </div>
                  )}
                />

                <Controller
                  name="monitoredBenches"
                  control={advocateControl}
                  render={({ field }) => (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Monitored Benches / Court Halls{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <Input
                        {...field}
                        size="sm"
                        placeholder="e.g. Court No. 1, Court No. 18, Division Bench"
                        isInvalid={!!advocateErrors.monitoredBenches}
                        errorMessage={
                          advocateErrors.monitoredBenches?.message
                        }
                        isDisabled={
                          mutations.createStandingCounselLoading
                        }
                      />
                    </div>
                  )}
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={() => {
                    handleAdvocateModalClose();
                    onClose();
                  }}
                  isDisabled={
                    mutations.createStandingCounselLoading
                  }
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  type="submit"
                  radius="sm"
                  isLoading={
                    mutations.createStandingCounselLoading
                  }
                  isDisabled={isAdvocateFormSubmitting}
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                >
                  Save Panel Advocate
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* =====================================================
          MODAL 3: Delete Confirmation
      ===================================================== */}

      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        placement="center"
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">
                  warning
                </span>
                Confirm Deletion
              </ModalHeader>

              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove{" "}
                <b>{itemToDelete?.name}</b>? The automatic discovery
                scraper will stop querying this pattern from High
                Court cause lists.
              </ModalBody>

              <ModalFooter>
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={() => {
                    handleDeleteModalClose();
                    onClose();
                  }}
                  isDisabled={deleteLoading}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  radius="sm"
                  isLoading={deleteLoading}
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  onPress={handleConfirmDelete}
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
