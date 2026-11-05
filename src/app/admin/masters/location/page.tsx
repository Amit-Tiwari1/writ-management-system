
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@nextui-org/react";

import Link from "next/link";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/store";

import {
  stateSchema,
  zoneSchema,
  rangeSchema,
  districtSchema,
  type StateFormValues,
  type ZoneFormValues,
  type RangeFormValues,
  type DistrictFormValues,
} from "@/schemas/masterSchema";

import {
  IStateItem,
  IZoneItem,
  IRangeItem,
  IDistrictItem,
} from "@/types/master.types";

import {
  fetchStates,
  createState,
  updateState,
  deleteState,
  fetchZones,
  createZone,
  updateZone,
  deleteZone,
  fetchRanges,
  createRange,
  updateRange,
  deleteRange,
  fetchDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} from "@/store/thunks/masterThunks/locationThunk";

import LocationTable from "@/app/admin/components/tables/LocationTable";

import {
  stateColumns,
  zoneColumns,
  rangeColumns,
  districtColumns,
  renderStateCell,
  renderZoneCell,
  renderRangeCell,
  renderDistrictCell,
} from "@/app/admin/components/columns/LocationColumns";

type LocationTab = "districts" | "ranges" | "zones" | "states";

type LocationItem =
  | IStateItem
  | IZoneItem
  | IRangeItem
  | IDistrictItem;

const ROWS_PER_PAGE = 5;

const getReferenceId = (
  value: string | { _id?: string } | null | undefined
): string => {
  if (!value) return "";
  return typeof value === "object" ? value._id || "" : value;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
};

export default function LocationMasterPage() {
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState<LocationTab>("districts");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [itemToDelete, setItemToDelete] =
    useState<LocationItem | null>(null);

  const [itemToEdit, setItemToEdit] =
    useState<LocationItem | null>(null);

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  // --------------------------------------------------
  // Redux Selectors
  // --------------------------------------------------

  const {
    states,
    zones,
    ranges,
    districts,
  } = useSelector((state: RootState) => state.location);

  const stateList = states.list.data || [];
  const zoneList = zones.list.data || [];
  const rangeList = ranges.list.data || [];
  const districtList = districts.list.data || [];

  const stateOptions = states.options.data || [];
  const zoneOptions = zones.options.data || [];
  const rangeOptions = ranges.options.data || [];

  const currentList =
    activeTab === "districts"
      ? districts.list
      : activeTab === "ranges"
        ? ranges.list
        : activeTab === "zones"
          ? zones.list
          : states.list;

  const loading = currentList.loading;

  const currentData =
    activeTab === "districts"
      ? districtList
      : activeTab === "ranges"
        ? rangeList
        : activeTab === "zones"
          ? zoneList
          : stateList;

  const totalCount = currentList.totalCount || 0;
  const totalPages = currentList.pagination?.pages || 1;

  // --------------------------------------------------
  // React Hook Form: State
  // --------------------------------------------------

  const {
    control: stateControl,
    handleSubmit: handleStateSubmit,
    reset: resetStateForm,
    formState: { errors: stateErrors },
  } = useForm<StateFormValues>({
    resolver: zodResolver(stateSchema) as any,
    defaultValues: {
      stateName: "",
      stateCode: "",
      country: "India",
    },
  });

  // --------------------------------------------------
  // React Hook Form: Zone
  // --------------------------------------------------

  const {
    control: zoneControl,
    handleSubmit: handleZoneSubmit,
    reset: resetZoneForm,
    formState: { errors: zoneErrors },
  } = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneSchema) as any,
    defaultValues: {
      zoneName: "",
      stateId: "",
      headquarters: "",
    },
  });

  // --------------------------------------------------
  // React Hook Form: Range
  // --------------------------------------------------

  const {
    control: rangeControl,
    handleSubmit: handleRangeSubmit,
    watch: watchRangeForm,
    setValue: setRangeValue,
    reset: resetRangeForm,
    formState: { errors: rangeErrors },
  } = useForm<RangeFormValues>({
    resolver: zodResolver(rangeSchema) as any,
    defaultValues: {
      rangeName: "",
      zoneId: "",
      stateId: "",
    },
  });

  // --------------------------------------------------
  // React Hook Form: District
  // --------------------------------------------------

  const {
    control: districtControl,
    handleSubmit: handleDistrictSubmit,
    watch: watchDistrictForm,
    setValue: setDistrictValue,
    reset: resetDistrictForm,
    formState: { errors: districtErrors },
  } = useForm<DistrictFormValues>({
    resolver: zodResolver(districtSchema) as any,
    defaultValues: {
      districtName: "",
      stateId: "",
      zoneId: "",
      rangeId: "",
    },
  });

  const selectedRangeStateId = watchRangeForm("stateId");

  const selectedDistrictStateId =
    watchDistrictForm("stateId");

  const selectedDistrictZoneId =
    watchDistrictForm("zoneId");

  // --------------------------------------------------
  // Backend List Fetching
  // --------------------------------------------------

  const loadCurrentList = useCallback(() => {
    const params = {
      view: "list" as const,
      page,
      limit: ROWS_PER_PAGE,
      search: searchQuery.trim(),
    };

    switch (activeTab) {
      case "districts":
        dispatch(fetchDistricts(params));
        break;

      case "ranges":
        dispatch(fetchRanges(params));
        break;

      case "zones":
        dispatch(fetchZones(params));
        break;

      case "states":
        dispatch(fetchStates(params));
        break;
    }
  }, [dispatch, activeTab, page, searchQuery]);

  useEffect(() => {
    loadCurrentList();
  }, [loadCurrentList]);

  // --------------------------------------------------
  // Dropdown Options Fetching
  // --------------------------------------------------

  const loadStateOptions = useCallback(() => {
    dispatch(
      fetchStates({
        view: "options",
        page: 1,
        limit: 100,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    loadStateOptions();
  }, [loadStateOptions]);

  // Range form: zones belonging to selected state
  useEffect(() => {
    if (!selectedRangeStateId) return;

    dispatch(
      fetchZones({
        view: "options",
        page: 1,
        limit: 100,
        stateId: selectedRangeStateId,
      })
    );
  }, [dispatch, selectedRangeStateId]);

  // District form: zones belonging to selected state
  useEffect(() => {
    if (!selectedDistrictStateId) return;

    dispatch(
      fetchZones({
        view: "options",
        page: 1,
        limit: 100,
        stateId: selectedDistrictStateId,
      })
    );
  }, [dispatch, selectedDistrictStateId]);

  // District form: ranges belonging to selected state and zone
  useEffect(() => {
    if (!selectedDistrictStateId || !selectedDistrictZoneId) {
      return;
    }

    dispatch(
      fetchRanges({
        view: "options",
        page: 1,
        limit: 100,
        stateId: selectedDistrictStateId,
        zoneId: selectedDistrictZoneId,
      })
    );
  }, [
    dispatch,
    selectedDistrictStateId,
    selectedDistrictZoneId,
  ]);

  // --------------------------------------------------
  // Dropdown Data
  // --------------------------------------------------

  const stateSelectItems = stateOptions.map((state) => ({
    key: state._id,
    label: state.stateName,
  }));

  const availableZonesForRange = zoneOptions
    .filter((zone) => {
      const zoneStateId = getReferenceId(zone.stateId);

      return zoneStateId === selectedRangeStateId;
    })
    .map((zone) => ({
      key: zone._id,
      label: zone.zoneName,
    }));

  const availableZonesForDistrict = zoneOptions
    .filter((zone) => {
      const zoneStateId = getReferenceId(zone.stateId);

      return zoneStateId === selectedDistrictStateId;
    })
    .map((zone) => ({
      key: zone._id,
      label: zone.zoneName,
    }));

  const availableRangesForDistrict = rangeOptions
    .filter((range) => {
      const rangeStateId = getReferenceId(range.stateId);
      const rangeZoneId = getReferenceId(range.zoneId);

      return (
        rangeStateId === selectedDistrictStateId &&
        rangeZoneId === selectedDistrictZoneId
      );
    })
    .map((range) => ({
      key: range._id,
      label: range.rangeName,
    }));

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const getTabLabel = (tab: LocationTab = activeTab) => {
    switch (tab) {
      case "states":
        return "STATE";

      case "zones":
        return "ZONE";

      case "ranges":
        return "RANGE";

      case "districts":
        return "DISTRICT";
    }
  };

  const resetAllForms = () => {
    resetStateForm({
      stateName: "",
      stateCode: "",
      country: "India",
    });

    resetZoneForm({
      zoneName: "",
      stateId: "",
      headquarters: "",
    });

    resetRangeForm({
      rangeName: "",
      stateId: "",
      zoneId: "",
    });

    resetDistrictForm({
      districtName: "",
      stateId: "",
      zoneId: "",
      rangeId: "",
    });
  };

  // --------------------------------------------------
  // Open Add Modal
  // --------------------------------------------------

  const handleOpenAdd = () => {
    setIsEditing(false);
    setItemToEdit(null);

    resetAllForms();

    onAddOpen();
  };

  // --------------------------------------------------
  // Open Edit Modal
  // --------------------------------------------------

  const handleOpenEdit = (item: LocationItem) => {
    setIsEditing(true);
    setItemToEdit(item);

    if (activeTab === "states") {
      const state = item as IStateItem;

      resetStateForm({
        stateName: state.stateName || "",
        stateCode: state.stateCode || "",
        country: state.country || "India",
      });
    }

    if (activeTab === "zones") {
      const zone = item as IZoneItem;

      resetZoneForm({
        zoneName: zone.zoneName || "",
        stateId: getReferenceId(zone.stateId),
        headquarters: zone.headquarters || "",
      });
    }

    if (activeTab === "ranges") {
      const range = item as IRangeItem;

      resetRangeForm({
        rangeName: range.rangeName || "",
        stateId: getReferenceId(range.stateId),
        zoneId: getReferenceId(range.zoneId),
      });
    }

    if (activeTab === "districts") {
      const district = item as IDistrictItem;

      resetDistrictForm({
        districtName: district.districtName || "",
        stateId: getReferenceId(district.stateId),
        zoneId: getReferenceId(district.zoneId),
        rangeId: getReferenceId(district.rangeId),
      });
    }

    onAddOpen();
  };

  // --------------------------------------------------
  // Close Add/Edit Modal
  // --------------------------------------------------

  const handleCloseAddModal = () => {
    if (isSubmitting) return;

    onAddOpenChange();
    setIsEditing(false);
    setItemToEdit(null);
    resetAllForms();
  };

  // --------------------------------------------------
  // Refetch After Mutation
  // --------------------------------------------------

  const refreshAfterMutation = () => {
    loadCurrentList();
    loadStateOptions();

    toast.success(
      isEditing
        ? "Record updated successfully!"
        : "Record registered successfully!"
    );

    onAddOpenChange();

    setIsEditing(false);
    setItemToEdit(null);

    resetAllForms();
  };

  // --------------------------------------------------
  // State Create / Update
  // --------------------------------------------------

  const onSaveState = async (values: StateFormValues) => {
    setIsSubmitting(true);

    try {
      if (isEditing && itemToEdit) {
        await dispatch(
          updateState({
            id: itemToEdit._id,
            payload: values,
          })
        ).unwrap();

        toast.success("State updated successfully!");
      } else {
        await dispatch(createState(values)).unwrap();

        toast.success("State registered successfully!");
      }

      onAddOpenChange();
      resetStateForm({
        stateName: "",
        stateCode: "",
        country: "India",
      });

      setIsEditing(false);
      setItemToEdit(null);

      loadCurrentList();
      loadStateOptions();
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to save state")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Zone Create / Update
  // --------------------------------------------------

  const onSaveZone = async (values: ZoneFormValues) => {
    setIsSubmitting(true);

    try {
      if (isEditing && itemToEdit) {
        await dispatch(
          updateZone({
            id: itemToEdit._id,
            payload: values,
          })
        ).unwrap();

        toast.success("Administrative Zone updated successfully!");
      } else {
        await dispatch(createZone(values)).unwrap();

        toast.success(
          "Administrative Zone registered successfully!"
        );
      }

      onAddOpenChange();
      resetZoneForm({
        zoneName: "",
        stateId: "",
        headquarters: "",
      });

      setIsEditing(false);
      setItemToEdit(null);

      loadCurrentList();
      loadStateOptions();

      if (values.stateId) {
        dispatch(
          fetchZones({
            view: "options",
            page: 1,
            limit: 100,
            stateId: values.stateId,
          })
        );
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to save zone")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Range Create / Update
  // --------------------------------------------------

  const onSaveRange = async (values: RangeFormValues) => {
    setIsSubmitting(true);

    try {
      if (isEditing && itemToEdit) {
        await dispatch(
          updateRange({
            id: itemToEdit._id,
            payload: values,
          })
        ).unwrap();

        toast.success("Police Range updated successfully!");
      } else {
        await dispatch(createRange(values)).unwrap();

        toast.success("Police Range registered successfully!");
      }

      onAddOpenChange();
      resetRangeForm({
        rangeName: "",
        stateId: "",
        zoneId: "",
      });

      setIsEditing(false);
      setItemToEdit(null);

      loadCurrentList();

      if (values.stateId) {
        dispatch(
          fetchZones({
            view: "options",
            page: 1,
            limit: 100,
            stateId: values.stateId,
          })
        );
      }

      if (values.stateId && values.zoneId) {
        dispatch(
          fetchRanges({
            view: "options",
            page: 1,
            limit: 100,
            stateId: values.stateId,
            zoneId: values.zoneId,
          })
        );
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to save police range")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // District Create / Update
  // --------------------------------------------------

  const onSaveDistrict = async (
    values: DistrictFormValues
  ) => {
    setIsSubmitting(true);

    try {
      if (isEditing && itemToEdit) {
        await dispatch(
          updateDistrict({
            id: itemToEdit._id,
            payload: values,
          })
        ).unwrap();

        toast.success("District updated successfully!");
      } else {
        await dispatch(createDistrict(values)).unwrap();

        toast.success("District registered successfully!");
      }

      onAddOpenChange();
      resetDistrictForm({
        districtName: "",
        stateId: "",
        zoneId: "",
        rangeId: "",
      });

      setIsEditing(false);
      setItemToEdit(null);

      loadCurrentList();

      loadStateOptions();

      if (values.stateId) {
        dispatch(
          fetchZones({
            view: "options",
            page: 1,
            limit: 100,
            stateId: values.stateId,
          })
        );
      }

      if (values.stateId && values.zoneId) {
        dispatch(
          fetchRanges({
            view: "options",
            page: 1,
            limit: 100,
            stateId: values.stateId,
            zoneId: values.zoneId,
          })
        );
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to save district")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Delete Confirmation
  // --------------------------------------------------

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsSubmitting(true);

    try {
      switch (activeTab) {
        case "states":
          await dispatch(
            deleteState(itemToDelete._id)
          ).unwrap();
          break;

        case "zones":
          await dispatch(
            deleteZone(itemToDelete._id)
          ).unwrap();
          break;

        case "ranges":
          await dispatch(
            deleteRange(itemToDelete._id)
          ).unwrap();
          break;

        case "districts":
          await dispatch(
            deleteDistrict(itemToDelete._id)
          ).unwrap();
          break;
      }

      toast.success("Record deleted successfully!");

      onDeleteOpenChange();
      setItemToDelete(null);

      loadCurrentList();
      loadStateOptions();
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to delete record")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  // --------------------------------------------------
  // Tab Change
  // --------------------------------------------------

  const handleTabChange = (key: React.Key) => {
    setActiveTab(key as LocationTab);
    setSearchQuery("");
    setPage(1);
  };

  // --------------------------------------------------
  // Table Render Functions
  // --------------------------------------------------

  const renderState = (
    item: IStateItem,
    columnKey: React.Key
  ) =>
    renderStateCell(
      item,
      columnKey,
      handleOpenEdit,
      (record: IStateItem) => {
        setItemToDelete(record);
        onDeleteOpen();
      }
    );

  const renderZone = (
    item: IZoneItem,
    columnKey: React.Key
  ) =>
    renderZoneCell(
      item,
      columnKey,
      handleOpenEdit,
      (record: IZoneItem) => {
        setItemToDelete(record);
        onDeleteOpen();
      }
    );

  const renderRange = (
    item: IRangeItem,
    columnKey: React.Key
  ) =>
    renderRangeCell(
      item,
      columnKey,
      handleOpenEdit,
      (record: IRangeItem) => {
        setItemToDelete(record);
        onDeleteOpen();
      }
    );

  const renderDistrict = (
    item: IDistrictItem,
    columnKey: React.Key
  ) =>
    renderDistrictCell(
      item,
      columnKey,
      handleOpenEdit,
      (record: IDistrictItem) => {
        setItemToDelete(record);
        onDeleteOpen();
      }
    );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="space-y-4">

      {/* 1. Header Information */}

      <Card
        shadow="none"
        className="border border-slate-200/80 bg-white"
      >
        <CardBody className="p-4">

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

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

              <div>
                <h1 className="text-base font-bold text-slate-900">
                  7.1 Geographical Jurisdiction Master
                </h1>

                <p className="text-xs text-slate-500">
                  Four-tier governance mapping: State &rarr;
                  Administrative Zone &rarr; Police Range &rarr;
                  District
                </p>
              </div>

            </div>

            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={
                <span className="material-symbols-rounded text-sm">
                  add
                </span>
              }
              onPress={handleOpenAdd}
            >
              Add New {getTabLabel()}
            </Button>

          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">

            <Tabs
              aria-label="Location Hierarchy Levels"
              selectedKey={activeTab}
              onSelectionChange={handleTabChange}
              color="primary"
              variant="underlined"
              classNames={{
                tabList: "gap-6 p-0 border-b-0",
                cursor: "w-full bg-[#0f2744]",
                tab: "max-w-fit px-0 h-8 text-xs font-semibold",
                tabContent:
                  "group-data-[selected=true]:text-[#0f2744] text-slate-500",
              }}
            >
              <Tab
                key="districts"
                title={`Districts (${districts.list.totalCount || 0})`}
              />

              <Tab
                key="ranges"
                title={`Police Ranges (${ranges.list.totalCount || 0})`}
              />

              <Tab
                key="zones"
                title={`Administrative Zones (${zones.list.totalCount || 0})`}
              />

              <Tab
                key="states"
                title={`States (${states.list.totalCount || 0})`}
              />
            </Tabs>

            <div className="w-72">
              <Input
                size="sm"
                radius="sm"
                placeholder="Search active view..."
                value={searchQuery}
                onValueChange={handleSearchChange}
                startContent={
                  <span className="material-symbols-rounded text-sm text-slate-400">
                    search
                  </span>
                }
                className="bg-slate-50"
              />
            </div>

          </div>

        </CardBody>
      </Card>

      {/* 2. Main Table View */}

      <Card
        shadow="none"
        className="border border-slate-200/80 bg-white"
      >
        <CardBody className="p-0">

          {activeTab === "districts" && (
            <LocationTable<IDistrictItem>
              ariaLabel="District table"
              columns={districtColumns}
              items={districtList}
              loading={loading}
              loadingText="Loading districts..."
              emptyText="No districts found"
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              rowsPerPage={ROWS_PER_PAGE}
              onPageChange={setPage}
              renderCell={renderDistrict}
            />
          )}

          {activeTab === "ranges" && (
            <LocationTable<IRangeItem>
              ariaLabel="Range table"
              columns={rangeColumns}
              items={rangeList}
              loading={loading}
              loadingText="Loading police ranges..."
              emptyText="No police ranges found"
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              rowsPerPage={ROWS_PER_PAGE}
              onPageChange={setPage}
              renderCell={renderRange}
            />
          )}

          {activeTab === "zones" && (
            <LocationTable<IZoneItem>
              ariaLabel="Zone table"
              columns={zoneColumns}
              items={zoneList}
              loading={loading}
              loadingText="Loading administrative zones..."
              emptyText="No administrative zones found"
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              rowsPerPage={ROWS_PER_PAGE}
              onPageChange={setPage}
              renderCell={renderZone}
            />
          )}

          {activeTab === "states" && (
            <LocationTable<IStateItem>
              ariaLabel="State table"
              columns={stateColumns}
              items={stateList}
              loading={loading}
              loadingText="Loading states..."
              emptyText="No states registered"
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              rowsPerPage={ROWS_PER_PAGE}
              onPageChange={setPage}
              renderCell={renderState}
            />
          )}

        </CardBody>
      </Card>

      {/* 3. Add / Edit Modal */}

      <Modal
        isOpen={isAddOpen}
        onOpenChange={handleCloseAddModal}
        placement="top"
      >
        <ModalContent>
          {(onClose) => (
            <>

              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">

                <span className="material-symbols-rounded text-blue-700">
                  {isEditing ? "edit_location_alt" : "add_location_alt"}
                </span>

                {isEditing ? "Update " : "Add New "}
                {getTabLabel()}

              </ModalHeader>

              <ModalBody className="space-y-3">

                {/* STATE FORM */}

                {activeTab === "states" && (
                  <form
                    id="state-form"
                    onSubmit={handleStateSubmit(onSaveState)}
                    className="space-y-3"
                  >

                    <Controller
                      name="stateName"
                      control={stateControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            State Name{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Input
                            {...field}
                            size="sm"
                            placeholder="e.g. Uttar Pradesh"
                            isInvalid={!!stateErrors.stateName}
                            errorMessage={stateErrors.stateName?.message}
                          />
                        </div>
                      )}
                    />

                    <Controller
                      name="stateCode"
                      control={stateControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            State Code (2-Letter ISO){" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Input
                            {...field}
                            size="sm"
                            placeholder="e.g. UP"
                            isInvalid={!!stateErrors.stateCode}
                            errorMessage={stateErrors.stateCode?.message}
                          />
                        </div>
                      )}
                    />

                  </form>
                )}

                {/* ZONE FORM */}

                {activeTab === "zones" && (
                  <form
                    id="zone-form"
                    onSubmit={handleZoneSubmit(onSaveZone)}
                    className="space-y-3"
                  >

                    <Controller
                      name="stateId"
                      control={zoneControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Select State{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Select
                            size="sm"
                            items={stateSelectItems}
                            selectedKeys={
                              field.value ? [field.value] : []
                            }
                            onChange={(e) =>
                              field.onChange(e.target.value)
                            }
                            isInvalid={!!zoneErrors.stateId}
                            errorMessage={zoneErrors.stateId?.message}
                          >
                            {(state) => (
                              <SelectItem key={state.key}>
                                {state.label}
                              </SelectItem>
                            )}
                          </Select>
                        </div>
                      )}
                    />

                    <Controller
                      name="zoneName"
                      control={zoneControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Zone Name{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Input
                            {...field}
                            size="sm"
                            placeholder="e.g. Lucknow Zone"
                            isInvalid={!!zoneErrors.zoneName}
                            errorMessage={zoneErrors.zoneName?.message}
                          />
                        </div>
                      )}
                    />

                    <Controller
                      name="headquarters"
                      control={zoneControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Headquarters
                          </label>

                          <Input
                            {...field}
                            size="sm"
                            placeholder="e.g. Lucknow"
                          />
                        </div>
                      )}
                    />

                  </form>
                )}

                {/* RANGE FORM */}

                {activeTab === "ranges" && (
                  <form
                    id="range-form"
                    onSubmit={handleRangeSubmit(onSaveRange)}
                    className="space-y-3"
                  >

                    <Controller
                      name="stateId"
                      control={rangeControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Select State{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Select
                            size="sm"
                            items={stateSelectItems}
                            selectedKeys={
                              field.value ? [field.value] : []
                            }
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setRangeValue("zoneId", "");
                            }}
                            isInvalid={!!rangeErrors.stateId}
                            errorMessage={rangeErrors.stateId?.message}
                          >
                            {(state) => (
                              <SelectItem key={state.key}>
                                {state.label}
                              </SelectItem>
                            )}
                          </Select>
                        </div>
                      )}
                    />

                    <Controller
                      name="zoneId"
                      control={rangeControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Select Parent Zone{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Select
                            size="sm"
                            items={availableZonesForRange}
                            selectedKeys={
                              field.value ? [field.value] : []
                            }
                            onChange={(e) =>
                              field.onChange(e.target.value)
                            }
                            isInvalid={!!rangeErrors.zoneId}
                            errorMessage={rangeErrors.zoneId?.message}
                            isDisabled={
                              availableZonesForRange.length === 0
                            }
                          >
                            {(zone) => (
                              <SelectItem key={zone.key}>
                                {zone.label}
                              </SelectItem>
                            )}
                          </Select>
                        </div>
                      )}
                    />

                    <Controller
                      name="rangeName"
                      control={rangeControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Range Name{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Input
                            {...field}
                            size="sm"
                            placeholder="e.g. Lucknow Range"
                            isInvalid={!!rangeErrors.rangeName}
                            errorMessage={rangeErrors.rangeName?.message}
                          />
                        </div>
                      )}
                    />

                  </form>
                )}

                {/* DISTRICT FORM */}

                {activeTab === "districts" && (
                  <form
                    id="district-form"
                    onSubmit={handleDistrictSubmit(onSaveDistrict)}
                    className="space-y-3"
                  >

                    <Controller
                      name="stateId"
                      control={districtControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Select State{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Select
                            size="sm"
                            items={stateSelectItems}
                            selectedKeys={
                              field.value ? [field.value] : []
                            }
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setDistrictValue("zoneId", "");
                              setDistrictValue("rangeId", "");
                            }}
                            isInvalid={!!districtErrors.stateId}
                            errorMessage={districtErrors.stateId?.message}
                          >
                            {(state) => (
                              <SelectItem key={state.key}>
                                {state.label}
                              </SelectItem>
                            )}
                          </Select>
                        </div>
                      )}
                    />

                    <Controller
                      name="zoneId"
                      control={districtControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Select Zone{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Select
                            size="sm"
                            items={availableZonesForDistrict}
                            selectedKeys={
                              field.value ? [field.value] : []
                            }
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setDistrictValue("rangeId", "");
                            }}
                            isInvalid={!!districtErrors.zoneId}
                            errorMessage={districtErrors.zoneId?.message}
                            isDisabled={
                              availableZonesForDistrict.length === 0
                            }
                          >
                            {(zone) => (
                              <SelectItem key={zone.key}>
                                {zone.label}
                              </SelectItem>
                            )}
                          </Select>
                        </div>
                      )}
                    />

                    <Controller
                      name="rangeId"
                      control={districtControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Select Police Range{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Select
                            size="sm"
                            items={availableRangesForDistrict}
                            selectedKeys={
                              field.value ? [field.value] : []
                            }
                            onChange={(e) =>
                              field.onChange(e.target.value)
                            }
                            isInvalid={!!districtErrors.rangeId}
                            errorMessage={districtErrors.rangeId?.message}
                            isDisabled={
                              availableRangesForDistrict.length === 0
                            }
                          >
                            {(range) => (
                              <SelectItem key={range.key}>
                                {range.label}
                              </SelectItem>
                            )}
                          </Select>
                        </div>
                      )}
                    />

                    <Controller
                      name="districtName"
                      control={districtControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            District Name{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <Input
                            {...field}
                            size="sm"
                            placeholder="e.g. Lucknow"
                            isInvalid={!!districtErrors.districtName}
                            errorMessage={districtErrors.districtName?.message}
                          />
                        </div>
                      )}
                    />

                  </form>
                )}

              </ModalBody>

              <ModalFooter>

                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={handleCloseAddModal}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  type="submit"
                  form={`${activeTab.slice(0, -1)}-form`}
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                >
                  {isEditing ? "Update Record" : "Save Record"}
                </Button>

              </ModalFooter>

            </>
          )}
        </ModalContent>
      </Modal>

      {/* 4. Delete Confirmation Modal */}

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

                <b>
                  {itemToDelete &&
                    ("districtName" in itemToDelete
                      ? itemToDelete.districtName
                      : "rangeName" in itemToDelete
                        ? itemToDelete.rangeName
                        : "zoneName" in itemToDelete
                          ? itemToDelete.zoneName
                          : itemToDelete.stateName)}
                </b>
                ?

                {" "}The record will be deleted only if backend
                integrity checks allow the operation.

              </ModalBody>

              <ModalFooter>

                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onPress={onClose}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  radius="sm"
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  isLoading={isSubmitting}
                  onPress={handleConfirmDelete}
                >
                  Delete
                </Button>

              </ModalFooter>

            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
}
