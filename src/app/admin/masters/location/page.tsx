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
import {
  stateSchema,
  zoneSchema,
  rangeSchema,
  districtSchema,
} from "@/schemas/masterSchema";
import {
  IStateItem,
  IZoneItem,
  IRangeItem,
  IDistrictItem,
} from "@/types/master.types";
import { z } from "zod";

type StateFormValues = z.infer<typeof stateSchema>;
type ZoneFormValues = z.infer<typeof zoneSchema>;
type RangeFormValues = z.infer<typeof rangeSchema>;
type DistrictFormValues = z.infer<typeof districtSchema>;

export default function LocationMasterPage() {
  const [activeTab, setActiveTab] = useState<string>("districts");
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [states, setStates] = useState<IStateItem[]>([]);
  const [zones, setZones] = useState<IZoneItem[]>([]);
  const [ranges, setRanges] = useState<IRangeItem[]>([]);
  const [districts, setDistricts] = useState<IDistrictItem[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // 1. State Form
  const {
    control: stateControl,
    handleSubmit: handleStateSubmit,
    reset: resetStateForm,
    formState: { errors: stateErrors },
  } = useForm<StateFormValues>({
    resolver: zodResolver(stateSchema) as any,
    defaultValues: { stateName: "", stateCode: "", country: "India" },
  });

  // 2. Zone Form
  const {
    control: zoneControl,
    handleSubmit: handleZoneSubmit,
    reset: resetZoneForm,
    formState: { errors: zoneErrors },
  } = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneSchema) as any,
    defaultValues: { zoneName: "", stateId: "", headquarters: "" },
  });

  // 3. Range Form
  const {
    control: rangeControl,
    handleSubmit: handleRangeSubmit,
    watch: watchRangeForm,
    setValue: setRangeValue,
    reset: resetRangeForm,
    formState: { errors: rangeErrors },
  } = useForm<RangeFormValues>({
    resolver: zodResolver(rangeSchema) as any,
    defaultValues: { rangeName: "", zoneId: "", stateId: "" },
  });

  // 4. District Form
  const {
    control: districtControl,
    handleSubmit: handleDistrictSubmit,
    watch: watchDistrictForm,
    setValue: setDistrictValue,
    reset: resetDistrictForm,
    formState: { errors: districtErrors },
  } = useForm<DistrictFormValues>({
    resolver: zodResolver(districtSchema) as any,
    defaultValues: { districtName: "", stateId: "", zoneId: "", rangeId: "" },
  });

  const selectedRangeStateId = watchRangeForm("stateId");
  const selectedDistrictStateId = watchDistrictForm("stateId");
  const selectedDistrictZoneId = watchDistrictForm("zoneId");

  const loadLocationData = useCallback(async () => {
    setLoading(true);
    try {
      const [resStates, resZones, resRanges, resDistricts] = await Promise.all([
        MastersAPI.getStates({ limit: 100 }),
        MastersAPI.getZones(),
        MastersAPI.getRanges(),
        MastersAPI.getDistricts({ limit: 200 }),
      ]);

      setStates(resStates?.data || []);
      setZones(resZones?.data || []);
      setRanges(resRanges?.data || []);
      setDistricts(resDistricts?.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load geographical master records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocationData();
  }, [loadLocationData]);

  // Dynamic filter items for dropdowns
  const stateSelectItems = useMemo(() => {
    return states.map((s) => ({ key: s._id, label: s.stateName }));
  }, [states]);

  const availableZonesForRange = useMemo(() => {
    return zones
      .filter((z) => {
        const sId = typeof z.stateId === "object" ? (z.stateId as any)?._id : z.stateId;
        return !selectedRangeStateId || sId === selectedRangeStateId;
      })
      .map((z) => ({ key: z._id, label: z.zoneName }));
  }, [zones, selectedRangeStateId]);

  const availableZonesForDistrict = useMemo(() => {
    return zones
      .filter((z) => {
        const sId = typeof z.stateId === "object" ? (z.stateId as any)?._id : z.stateId;
        return !selectedDistrictStateId || sId === selectedDistrictStateId;
      })
      .map((z) => ({ key: z._id, label: z.zoneName }));
  }, [zones, selectedDistrictStateId]);

  const availableRangesForDistrict = useMemo(() => {
    return ranges
      .filter((r) => {
        const zId = typeof r.zoneId === "object" ? (r.zoneId as any)?._id : r.zoneId;
        return !selectedDistrictZoneId || zId === selectedDistrictZoneId;
      })
      .map((r) => ({ key: r._id, label: r.rangeName }));
  }, [ranges, selectedDistrictZoneId]);

  const handleOpenAdd = () => {
    const defaultStateId = states[0]?._id || "";
    if (activeTab === "states") {
      resetStateForm({ stateName: "", stateCode: "", country: "India" });
    } else if (activeTab === "zones") {
      resetZoneForm({ zoneName: "", stateId: defaultStateId, headquarters: "" });
    } else if (activeTab === "ranges") {
      resetRangeForm({ rangeName: "", stateId: defaultStateId, zoneId: "" });
    } else if (activeTab === "districts") {
      resetDistrictForm({ districtName: "", stateId: defaultStateId, zoneId: "", rangeId: "" });
    }
    onAddOpen();
  };

  // Submit Handlers
  const onAddState = async (values: StateFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await MastersAPI.createState(values);
      if (res?.success) {
        toast.success("State registered successfully!");
        onAddOpenChange();
        loadLocationData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create state");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAddZone = async (values: ZoneFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await MastersAPI.createZone(values);
      if (res?.success) {
        toast.success("Administrative Zone registered successfully!");
        onAddOpenChange();
        loadLocationData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create zone");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAddRange = async (values: RangeFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await MastersAPI.createRange(values);
      if (res?.success) {
        toast.success("Police Range registered successfully!");
        onAddOpenChange();
        loadLocationData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create police range");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAddDistrict = async (values: DistrictFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await MastersAPI.createDistrict(values);
      if (res?.success) {
        toast.success("District registered successfully!");
        onAddOpenChange();
        loadLocationData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create district");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      if (activeTab === "states") {
        await MastersAPI.deleteState(itemToDelete._id);
      } else if (activeTab === "districts") {
        await MastersAPI.deleteDistrict(itemToDelete._id);
      } else {
        toast.error("Deletion locked for integrity");
        return;
      }
      toast.success("Record deleted successfully!");
      onDeleteOpenChange();
      loadLocationData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete record");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search filter per tab
  const filteredDistricts = useMemo(() => {
    return districts.filter((d) => d.districtName?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [districts, searchQuery]);

  const filteredRangesList = useMemo(() => {
    return ranges.filter((r) => r.rangeName?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [ranges, searchQuery]);

  const filteredZonesList = useMemo(() => {
    return zones.filter((z) => z.zoneName?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [zones, searchQuery]);

  const filteredStatesList = useMemo(() => {
    return states.filter((s) => s.stateName?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [states, searchQuery]);

  const currentListLength = useMemo(() => {
    if (activeTab === "districts") return filteredDistricts.length;
    if (activeTab === "ranges") return filteredRangesList.length;
    if (activeTab === "zones") return filteredZonesList.length;
    return filteredStatesList.length;
  }, [activeTab, filteredDistricts, filteredRangesList, filteredZonesList, filteredStatesList]);

  const totalPages = Math.ceil(currentListLength / rowsPerPage) || 1;

  const paginatedDistricts = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredDistricts.slice(start, start + rowsPerPage);
  }, [filteredDistricts, page, rowsPerPage]);

  const paginatedRanges = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredRangesList.slice(start, start + rowsPerPage);
  }, [filteredRangesList, page, rowsPerPage]);

  const paginatedZones = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredZonesList.slice(start, start + rowsPerPage);
  }, [filteredZonesList, page, rowsPerPage]);

  const paginatedStates = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredStatesList.slice(start, start + rowsPerPage);
  }, [filteredStatesList, page, rowsPerPage]);

  return (
    <div className="space-y-4">
      {/* 1. Header Information */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Link href="/admin/masters">
                <Button isIconOnly size="sm" variant="light" className="text-slate-500">
                  <span className="material-symbols-rounded">arrow_back</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-base font-bold text-slate-900">
                  7.1 Geographical Jurisdiction Master
                </h1>
                <p className="text-xs text-slate-500">
                  Four-tier governance mapping: State &rarr; Administrative Zone &rarr; Police Range &rarr; District
                </p>
              </div>
            </div>

            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={handleOpenAdd}
            >
              Add New {activeTab.slice(0, -1).toUpperCase()}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <Tabs
              aria-label="Location Hierarchy Levels"
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
              <Tab key="districts" title={`Districts (${districts.length})`} />
              <Tab key="ranges" title={`Police Ranges (${ranges.length})`} />
              <Tab key="zones" title={`Administrative Zones (${zones.length})`} />
              <Tab key="states" title={`States (${states.length})`} />
            </Tabs>

            <div className="w-72">
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
        </CardBody>
      </Card>

      {/* 2. Main Table View with Pagination */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          {activeTab === "districts" && (
            <Table
              removeWrapper
              aria-label="District table"
              className="min-w-full"
              bottomContent={
                totalPages > 1 ? (
                  <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Showing {(page - 1) * rowsPerPage + 1} to{" "}
                      {Math.min(page * rowsPerPage, filteredDistricts.length)} of {filteredDistricts.length}
                    </span>
                    <Pagination
                      isCompact
                      showControls
                      color="primary"
                      page={page}
                      total={totalPages}
                      onChange={(p) => setPage(p)}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">STATE</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">ZONE</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">RANGE</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">DISTRICT NAME</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400 text-center">ACTION</TableColumn>
              </TableHeader>
              <TableBody
                items={paginatedDistricts}
                emptyContent={
                  loading ? (
                    <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                      <Spinner size="sm" /> Loading districts...
                    </div>
                  ) : (
                    "No districts found"
                  )
                }
              >
                {(item) => (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {typeof item.stateId === "object" ? (item.stateId as any)?.stateName : "--"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {typeof item.zoneId === "object" ? (item.zoneId as any)?.zoneName : "--"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {typeof item.rangeId === "object" ? (item.rangeId as any)?.rangeName : "--"}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900">{item.districtName}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-400 hover:text-rose-600"
                        onPress={() => { setItemToDelete(item); onDeleteOpen(); }}
                      >
                        <span className="material-symbols-rounded text-sm">delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "ranges" && (
            <Table
              removeWrapper
              aria-label="Range table"
              className="min-w-full"
              bottomContent={
                totalPages > 1 ? (
                  <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Showing {(page - 1) * rowsPerPage + 1} to{" "}
                      {Math.min(page * rowsPerPage, filteredRangesList.length)} of {filteredRangesList.length}
                    </span>
                    <Pagination
                      isCompact
                      showControls
                      color="primary"
                      page={page}
                      total={totalPages}
                      onChange={(p) => setPage(p)}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">RANGE NAME</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">PARENT ZONE</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">STATE</TableColumn>
              </TableHeader>
              <TableBody
                items={paginatedRanges}
                emptyContent={
                  loading ? (
                    <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                      <Spinner size="sm" /> Loading police ranges...
                    </div>
                  ) : (
                    "No police ranges found"
                  )
                }
              >
                {(item) => (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-bold text-slate-900">{item.rangeName}</TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {typeof item.zoneId === "object" ? (item.zoneId as any)?.zoneName : "--"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {typeof item.stateId === "object" ? (item.stateId as any)?.stateName : "--"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "zones" && (
            <Table
              removeWrapper
              aria-label="Zone table"
              className="min-w-full"
              bottomContent={
                totalPages > 1 ? (
                  <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Showing {(page - 1) * rowsPerPage + 1} to{" "}
                      {Math.min(page * rowsPerPage, filteredZonesList.length)} of {filteredZonesList.length}
                    </span>
                    <Pagination
                      isCompact
                      showControls
                      color="primary"
                      page={page}
                      total={totalPages}
                      onChange={(p) => setPage(p)}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">ZONE NAME</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">STATE JURISDICTION</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">HEADQUARTERS</TableColumn>
              </TableHeader>
              <TableBody
                items={paginatedZones}
                emptyContent={
                  loading ? (
                    <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                      <Spinner size="sm" /> Loading administrative zones...
                    </div>
                  ) : (
                    "No administrative zones found"
                  )
                }
              >
                {(item) => (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-bold text-slate-900">{item.zoneName}</TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {typeof item.stateId === "object" ? (item.stateId as any)?.stateName : "--"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{item.headquarters || "--"}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "states" && (
            <Table
              removeWrapper
              aria-label="State table"
              className="min-w-full"
              bottomContent={
                totalPages > 1 ? (
                  <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Showing {(page - 1) * rowsPerPage + 1} to{" "}
                      {Math.min(page * rowsPerPage, filteredStatesList.length)} of {filteredStatesList.length}
                    </span>
                    <Pagination
                      isCompact
                      showControls
                      color="primary"
                      page={page}
                      total={totalPages}
                      onChange={(p) => setPage(p)}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">STATE NAME</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">STATE CODE</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">COUNTRY</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400 text-center">ACTION</TableColumn>
              </TableHeader>
              <TableBody
                items={paginatedStates}
                emptyContent={
                  loading ? (
                    <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
                      <Spinner size="sm" /> Loading states...
                    </div>
                  ) : (
                    "No states registered"
                  )
                }
              >
                {(item) => (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-bold text-slate-900">{item.stateName}</TableCell>
                    <TableCell className="text-xs font-mono font-bold text-blue-700">{item.stateCode}</TableCell>
                    <TableCell className="text-xs text-slate-500">{item.country || "India"}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-400 hover:text-rose-600"
                        onPress={() => { setItemToDelete(item); onDeleteOpen(); }}
                      >
                        <span className="material-symbols-rounded text-sm">delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* 3. Add Modal with React Hook Form & Zod */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">add_location_alt</span>
                Add New {activeTab.slice(0, -1).toUpperCase()}
              </ModalHeader>
              <ModalBody className="space-y-3">
                {activeTab === "states" && (
                  <form id="state-form" onSubmit={handleStateSubmit(onAddState)} className="space-y-3">
                    <Controller
                      name="stateName"
                      control={stateControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            State Name <span className="text-red-500">*</span>
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
                            State Code (2-Letter ISO) <span className="text-red-500">*</span>
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

                {activeTab === "zones" && (
                  <form id="zone-form" onSubmit={handleZoneSubmit(onAddZone)} className="space-y-3">
                    <Controller
                      name="stateId"
                      control={zoneControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Select State <span className="text-red-500">*</span>
                          </label>
                          <Select
                            size="sm"
                            items={stateSelectItems}
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!zoneErrors.stateId}
                            errorMessage={zoneErrors.stateId?.message}
                          >
                            {(s) => <SelectItem key={s.key}>{s.label}</SelectItem>}
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
                            Zone Name <span className="text-red-500">*</span>
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

                {activeTab === "ranges" && (
                  <form id="range-form" onSubmit={handleRangeSubmit(onAddRange)} className="space-y-3">
                    <Controller
                      name="stateId"
                      control={rangeControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Select State <span className="text-red-500">*</span>
                          </label>
                          <Select
                            size="sm"
                            items={stateSelectItems}
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setRangeValue("zoneId", "");
                            }}
                            isInvalid={!!rangeErrors.stateId}
                            errorMessage={rangeErrors.stateId?.message}
                          >
                            {(s) => <SelectItem key={s.key}>{s.label}</SelectItem>}
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
                            Select Parent Zone <span className="text-red-500">*</span>
                          </label>
                          <Select
                            size="sm"
                            items={availableZonesForRange}
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!rangeErrors.zoneId}
                            errorMessage={rangeErrors.zoneId?.message}
                            isDisabled={availableZonesForRange.length === 0}
                          >
                            {(z) => <SelectItem key={z.key}>{z.label}</SelectItem>}
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
                            Range Name <span className="text-red-500">*</span>
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

                {activeTab === "districts" && (
                  <form id="district-form" onSubmit={handleDistrictSubmit(onAddDistrict)} className="space-y-3">
                    <Controller
                      name="stateId"
                      control={districtControl}
                      render={({ field }) => (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Select State <span className="text-red-500">*</span>
                          </label>
                          <Select
                            size="sm"
                            items={stateSelectItems}
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setDistrictValue("zoneId", "");
                              setDistrictValue("rangeId", "");
                            }}
                            isInvalid={!!districtErrors.stateId}
                            errorMessage={districtErrors.stateId?.message}
                          >
                            {(s) => <SelectItem key={s.key}>{s.label}</SelectItem>}
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
                            Select Zone <span className="text-red-500">*</span>
                          </label>
                          <Select
                            size="sm"
                            items={availableZonesForDistrict}
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setDistrictValue("rangeId", "");
                            }}
                            isInvalid={!!districtErrors.zoneId}
                            errorMessage={districtErrors.zoneId?.message}
                            isDisabled={availableZonesForDistrict.length === 0}
                          >
                            {(z) => <SelectItem key={z.key}>{z.label}</SelectItem>}
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
                            Select Police Range <span className="text-red-500">*</span>
                          </label>
                          <Select
                            size="sm"
                            items={availableRangesForDistrict}
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!districtErrors.rangeId}
                            errorMessage={districtErrors.rangeId?.message}
                            isDisabled={availableRangesForDistrict.length === 0}
                          >
                            {(r) => <SelectItem key={r.key}>{r.label}</SelectItem>}
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
                            District Name <span className="text-red-500">*</span>
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
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isSubmitting}>
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
                  Save Record
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 4. Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} placement="center" size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-rose-600">warning</span>
                Confirm Deletion
              </ModalHeader>
              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove <b>{itemToDelete?.districtName || itemToDelete?.stateName}</b>? Dockets linked to this record might be affected.
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