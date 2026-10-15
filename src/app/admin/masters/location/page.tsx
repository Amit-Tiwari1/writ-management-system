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

export default function LocationMasterPage() {
  const [activeTab, setActiveTab] = useState<string>("districts");
  const [loading, setLoading] = useState<boolean>(true);

  const [states, setStates] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [ranges, setRanges] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [formData, setFormData] = useState<any>({});
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadLocationData = useCallback(async () => {
    setLoading(true);
    try {
      const [resStates, resZones, resRanges, resDistricts] = await Promise.all([
        MastersAPI.getStates(),
        MastersAPI.getZones(),
        MastersAPI.getRanges(),
        MastersAPI.getDistricts(),
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

  const handleOpenAdd = () => {
    setFormData({
      stateId: states[0]?._id || "",
      zoneId: "",
      rangeId: "",
      stateName: "",
      stateCode: "",
      zoneName: "",
      rangeName: "",
      districtName: "",
      headquarters: "",
    });
    onAddOpen();
  };

  const handleSubmitAdd = async () => {
    setIsSubmitting(true);
    try {
      if (activeTab === "states") {
        if (!formData.stateName?.trim() || !formData.stateCode?.trim()) {
          toast.error("State name and state code are required");
          return;
        }
        await MastersAPI.createState({
          stateName: formData.stateName.trim(),
          stateCode: formData.stateCode.trim().toUpperCase(),
        });
        toast.success("State registered successfully!");
      } else if (activeTab === "zones") {
        if (!formData.zoneName?.trim() || !formData.stateId) {
          toast.error("Zone name and state selection are required");
          return;
        }
        await MastersAPI.createZone({
          zoneName: formData.zoneName.trim(),
          stateId: formData.stateId,
          headquarters: formData.headquarters?.trim() || "",
        });
        toast.success("Zone registered successfully!");
      } else if (activeTab === "ranges") {
        if (!formData.rangeName?.trim() || !formData.zoneId || !formData.stateId) {
          toast.error("Range name, state, and zone selections are required");
          return;
        }
        await MastersAPI.createRange({
          rangeName: formData.rangeName.trim(),
          stateId: formData.stateId,
          zoneId: formData.zoneId,
        });
        toast.success("Range registered successfully!");
      } else if (activeTab === "districts") {
        if (!formData.districtName?.trim() || !formData.stateId || !formData.zoneId || !formData.rangeId) {
          toast.error("District name, state, zone, and range selections are required");
          return;
        }
        await MastersAPI.createDistrict({
          districtName: formData.districtName.trim(),
          stateId: formData.stateId,
          zoneId: formData.zoneId,
          rangeId: formData.rangeId,
        });
        toast.success("District registered successfully!");
      }

      onAddOpenChange();
      loadLocationData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save record");
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

  const filteredZones = zones.filter((z) => !formData.stateId || z.stateId?._id === formData.stateId || z.stateId === formData.stateId);
  const filteredRanges = ranges.filter((r) => !formData.zoneId || r.zoneId?._id === formData.zoneId || r.zoneId === formData.zoneId);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Link href="/admin/cases">
                <Button isIconOnly size="sm" variant="light" className="text-slate-500">
                  <span className="material-symbols-rounded">arrow_back</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-base font-bold text-slate-900">
                  6.1 Geographical Hierarchy Master
                </h1>
                <p className="text-xs text-slate-500">
                  State $\rightarrow$ Zone $\rightarrow$ Police Range $\rightarrow$ District Jurisdiction mapping
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
                onValueChange={setSearchQuery}
                startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
                className="bg-slate-50"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Table View */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          {activeTab === "districts" && (
            <Table removeWrapper aria-label="District table" className="min-w-full">
              <TableHeader>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">STATE</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">ZONE</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">RANGE</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">DISTRICT NAME</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400 text-center">ACTION</TableColumn>
              </TableHeader>
              <TableBody
                items={districts.filter((d) => d.districtName?.toLowerCase().includes(searchQuery.toLowerCase()))}
                isLoading={loading}
                loadingContent={<div className="p-4 space-y-2"><Skeleton className="h-6 w-full rounded" /><Skeleton className="h-6 w-full rounded" /></div>}
                emptyContent="No districts found"
              >
                {(item) => (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-semibold text-slate-800">{item.stateId?.stateName || "--"}</TableCell>
                    <TableCell className="text-xs text-slate-600">{item.zoneId?.zoneName || "--"}</TableCell>
                    <TableCell className="text-xs text-slate-600">{item.rangeId?.rangeName || "--"}</TableCell>
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
            <Table removeWrapper aria-label="Range table" className="min-w-full">
              <TableHeader>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">RANGE NAME</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">PARENT ZONE</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">STATE</TableColumn>
              </TableHeader>
              <TableBody
                items={ranges.filter((r) => r.rangeName?.toLowerCase().includes(searchQuery.toLowerCase()))}
                isLoading={loading}
                emptyContent="No police ranges found"
              >
                {(item) => (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-bold text-slate-900">{item.rangeName}</TableCell>
                    <TableCell className="text-xs text-slate-700">{item.zoneId?.zoneName || "--"}</TableCell>
                    <TableCell className="text-xs text-slate-600">{item.stateId?.stateName || "--"}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "zones" && (
            <Table removeWrapper aria-label="Zone table" className="min-w-full">
              <TableHeader>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">ZONE NAME</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">STATE JURISDICTION</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">HEADQUARTERS</TableColumn>
              </TableHeader>
              <TableBody
                items={zones.filter((z) => z.zoneName?.toLowerCase().includes(searchQuery.toLowerCase()))}
                isLoading={loading}
                emptyContent="No administrative zones found"
              >
                {(item) => (
                  <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="text-xs font-bold text-slate-900">{item.zoneName}</TableCell>
                    <TableCell className="text-xs text-slate-700">{item.stateId?.stateName || "--"}</TableCell>
                    <TableCell className="text-xs text-slate-500">{item.headquarters || "--"}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === "states" && (
            <Table removeWrapper aria-label="State table" className="min-w-full">
              <TableHeader>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">STATE NAME</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">STATE CODE</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">COUNTRY</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400 text-center">ACTION</TableColumn>
              </TableHeader>
              <TableBody
                items={states.filter((s) => s.stateName?.toLowerCase().includes(searchQuery.toLowerCase()))}
                isLoading={loading}
                emptyContent="No states registered"
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

      {/* Add Modal */}
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
                  <>
                    <Input
                      size="sm"
                      label="State Name"
                      placeholder="e.g. Uttar Pradesh"
                      value={formData.stateName || ""}
                      onValueChange={(v) => setFormData({ ...formData, stateName: v })}
                      isRequired
                    />
                    <Input
                      size="sm"
                      label="State Code (2-Letter ISO)"
                      placeholder="e.g. UP"
                      value={formData.stateCode || ""}
                      onValueChange={(v) => setFormData({ ...formData, stateCode: v })}
                      isRequired
                    />
                  </>
                )}

                {activeTab === "zones" && (
                  <>
                    <Select
                      size="sm"
                      label="Select State"
                      selectedKeys={formData.stateId ? [formData.stateId] : []}
                      onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                      isRequired
                    >
                      {states.map((s) => (
                        <SelectItem key={s._id} value={s._id}>{s.stateName}</SelectItem>
                      ))}
                    </Select>
                    <Input
                      size="sm"
                      label="Zone Name"
                      placeholder="e.g. Lucknow Zone"
                      value={formData.zoneName || ""}
                      onValueChange={(v) => setFormData({ ...formData, zoneName: v })}
                      isRequired
                    />
                    <Input
                      size="sm"
                      label="Headquarters"
                      placeholder="e.g. Lucknow"
                      value={formData.headquarters || ""}
                      onValueChange={(v) => setFormData({ ...formData, headquarters: v })}
                    />
                  </>
                )}

                {activeTab === "ranges" && (
                  <>
                    <Select
                      size="sm"
                      label="Select State"
                      selectedKeys={formData.stateId ? [formData.stateId] : []}
                      onChange={(e) => setFormData({ ...formData, stateId: e.target.value, zoneId: "" })}
                      isRequired
                    >
                      {states.map((s) => (
                        <SelectItem key={s._id} value={s._id}>{s.stateName}</SelectItem>
                      ))}
                    </Select>
                    <Select
                      size="sm"
                      label="Select Zone"
                      selectedKeys={formData.zoneId ? [formData.zoneId] : []}
                      onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                      isRequired
                    >
                      {filteredZones.map((z) => (
                        <SelectItem key={z._id} value={z._id}>{z.zoneName}</SelectItem>
                      ))}
                    </Select>
                    <Input
                      size="sm"
                      label="Range Name"
                      placeholder="e.g. Lucknow Range"
                      value={formData.rangeName || ""}
                      onValueChange={(v) => setFormData({ ...formData, rangeName: v })}
                      isRequired
                    />
                  </>
                )}

                {activeTab === "districts" && (
                  <>
                    <Select
                      size="sm"
                      label="Select State"
                      selectedKeys={formData.stateId ? [formData.stateId] : []}
                      onChange={(e) => setFormData({ ...formData, stateId: e.target.value, zoneId: "", rangeId: "" })}
                      isRequired
                    >
                      {states.map((s) => (
                        <SelectItem key={s._id} value={s._id}>{s.stateName}</SelectItem>
                      ))}
                    </Select>
                    <Select
                      size="sm"
                      label="Select Zone"
                      selectedKeys={formData.zoneId ? [formData.zoneId] : []}
                      onChange={(e) => setFormData({ ...formData, zoneId: e.target.value, rangeId: "" })}
                      isRequired
                    >
                      {filteredZones.map((z) => (
                        <SelectItem key={z._id} value={z._id}>{z.zoneName}</SelectItem>
                      ))}
                    </Select>
                    <Select
                      size="sm"
                      label="Select Police Range"
                      selectedKeys={formData.rangeId ? [formData.rangeId] : []}
                      onChange={(e) => setFormData({ ...formData, rangeId: e.target.value })}
                      isRequired
                    >
                      {filteredRanges.map((r) => (
                        <SelectItem key={r._id} value={r._id}>{r.rangeName}</SelectItem>
                      ))}
                    </Select>
                    <Input
                      size="sm"
                      label="District Name"
                      placeholder="e.g. Lucknow"
                      value={formData.districtName || ""}
                      onValueChange={(v) => setFormData({ ...formData, districtName: v })}
                      isRequired
                    />
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isSubmitting}
                  onClick={handleSubmitAdd}
                >
                  Save Record
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
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
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
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