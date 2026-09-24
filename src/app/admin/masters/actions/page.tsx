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
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";

export default function ActionTakenMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeadlineFilter, setSelectedDeadlineFilter] = useState("ALL");

  const [actionsList, setActionsList] = useState([
    {
      id: 1,
      courtDecision: "Dismissed on Merit",
      actionStatus: "Order Received in Board - File Closed",
      actionNotTaken: "Order NOT Received in Board",
      requiresComplianceDeadline: false,
      defaultDeadlineDays: 0,
      impactScope: "Case permanently closed; no compliance obligation",
    },
    {
      id: 2,
      courtDecision: "Allowed with Directions",
      actionStatus: "Compliance Directions Issued to Section",
      actionNotTaken: "Compliance Pending / Overdue",
      requiresComplianceDeadline: true,
      defaultDeadlineDays: 42,
      impactScope: "Starts compliance countdown; prompts contempt watch",
    },
    {
      id: 3,
      courtDecision: "Interim Stay Granted",
      actionStatus: "Stay Received - Draft Vacation Initiated",
      actionNotTaken: "Vacation of Stay NOT Filed",
      requiresComplianceDeadline: true,
      defaultDeadlineDays: 14,
      impactScope: "Adds case to 5.1 Active Stays Roster",
    },
    {
      id: 4,
      courtDecision: "Disposed with Direction to Decide Representation",
      actionStatus: "Speaking Order Passed by Authority",
      actionNotTaken: "Representation Awaiting Decision",
      requiresComplianceDeadline: true,
      defaultDeadlineDays: 28,
      impactScope: "Requires speaking order upload before closure",
    },
    {
      id: 5,
      courtDecision: "Withdrawn by Petitioner",
      actionStatus: "File Consigned to Record Room",
      actionNotTaken: "Withdrawal Order Copy Awaited",
      requiresComplianceDeadline: false,
      defaultDeadlineDays: 0,
      impactScope: "Immediate archival",
    },
  ]);

  const [newAction, setNewAction] = useState({
    courtDecision: "",
    actionStatus: "",
    actionNotTaken: "",
    requiresDeadline: false,
    days: "30",
    impactScope: "",
  });

  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const handleAdd = () => {
    if (!newAction.courtDecision.trim() || !newAction.actionStatus.trim()) return;
    setActionsList((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        courtDecision: newAction.courtDecision.trim(),
        actionStatus: newAction.actionStatus.trim(),
        actionNotTaken: newAction.actionNotTaken.trim() || "Action Pending / Overdue",
        requiresComplianceDeadline: newAction.requiresDeadline,
        defaultDeadlineDays: newAction.requiresDeadline ? parseInt(newAction.days) || 30 : 0,
        impactScope: newAction.impactScope.trim() || "Configured institutional workflow rule",
      },
    ]);
    setNewAction({
      courtDecision: "",
      actionStatus: "",
      actionNotTaken: "",
      requiresDeadline: false,
      days: "30",
      impactScope: "",
    });
    onAddOpenChange();
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem({
      ...item,
      daysStr: item.defaultDeadlineDays.toString(),
    });
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setActionsList((prev) =>
      prev.map((a) =>
        a.id === editingItem.id
          ? {
              ...editingItem,
              defaultDeadlineDays: editingItem.requiresComplianceDeadline
                ? parseInt(editingItem.daysStr) || 30
                : 0,
            }
          : a
      )
    );
    onEditOpenChange();
  };

  const handleOpenDelete = (item: any) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    setActionsList((prev) => prev.filter((a) => a.id !== itemToDelete.id));
    onDeleteOpenChange();
  };

  const filteredActions = useMemo(() => {
    return actionsList.filter((item) => {
      const matchesSearch =
        item.courtDecision.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.actionStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.actionNotTaken.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDeadline =
        selectedDeadlineFilter === "ALL" ||
        (selectedDeadlineFilter === "TIME_BOUND" && item.requiresComplianceDeadline) ||
        (selectedDeadlineFilter === "NO_DEADLINE" && !item.requiresComplianceDeadline);

      return matchesSearch && matchesDeadline;
    });
  }, [actionsList, searchQuery, selectedDeadlineFilter]);

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
                <h1 className="text-base font-bold text-slate-900">6.9 Legal Action Taken Mapping Master</h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  Judicial-to-Board Rules
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Maps judicial outcomes to institutional action statuses and automated compliance deadlines
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={onAddOpen}
            >
              Add Action Rule
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search judicial decision or action status..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50 sm:col-span-2"
            />
            <Select
              size="sm"
              radius="sm"
              placeholder="Filter by Compliance Type"
              selectedKeys={[selectedDeadlineFilter]}
              onChange={(e) => setSelectedDeadlineFilter(e.target.value || "ALL")}
              className="bg-slate-50 font-semibold"
            >
              <SelectItem key="ALL">All Decision Outcomes</SelectItem>
              <SelectItem key="TIME_BOUND">Time-Bound (Contempt Risk)</SelectItem>
              <SelectItem key="NO_DEADLINE">Non-Time Bound / Closed</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Rules Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Configured Judicial-To-Administrative State Machine ({filteredActions.length} Rules)
          </h3>
          <span className="text-[11px] text-slate-400">Drives 5.0 Directives, Stays & Contempt Engine</span>
        </div>

        <CardBody className="p-0">
          <Table removeWrapper aria-label="Action Taken Master Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">COURT DECISION / OUTCOME</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">BOARD ACTION TAKEN STATUS</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">ACTION NOT TAKEN ALERT TEXT</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">COMPLIANCE DEADLINE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
            </TableHeader>
            <TableBody items={filteredActions} emptyContent="No action rules match your filter.">
              {(item) => (
                <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell className="text-xs font-bold text-slate-400">{item.id}</TableCell>
                  <TableCell>
                    <p className="text-xs font-bold text-slate-900">{item.courtDecision}</p>
                    <p className="text-[10px] text-slate-400">{item.impactScope}</p>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="success" className="text-xs font-semibold">
                      {item.actionStatus}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="danger" className="text-xs font-semibold">
                      {item.actionNotTaken}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {item.requiresComplianceDeadline ? (
                      <Chip size="sm" variant="solid" color="warning" className="text-[10px] font-bold text-slate-900">
                        {item.defaultDeadlineDays} Days Statutory
                      </Chip>
                    ) : (
                      <span className="text-xs text-slate-400">Not Applicable</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-400 hover:text-slate-700"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <span className="material-symbols-rounded text-sm">edit</span>
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-400 hover:text-rose-600"
                        onClick={() => handleOpenDelete(item)}
                      >
                        <span className="material-symbols-rounded text-sm">delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* MODAL 1: Add Action Rule */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">rule</span>
                Add Legal Action Mapping Rule
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Court Order Decision Outcome"
                  labelPlacement="outside"
                  placeholder="e.g. Allowed with Costs / Speaking Order"
                  value={newAction.courtDecision}
                  onValueChange={(v) => setNewAction({ ...newAction, courtDecision: v })}
                  isRequired
                />

                <Input
                  size="sm"
                  label="Board Action Taken Text (Complied Green Path)"
                  labelPlacement="outside"
                  placeholder="e.g. Cost Deposited & Order Complied"
                  value={newAction.actionStatus}
                  onValueChange={(v) => setNewAction({ ...newAction, actionStatus: v })}
                  isRequired
                />

                <Input
                  size="sm"
                  label="Action Not Taken Alert Text (Non-Complied Red Path)"
                  labelPlacement="outside"
                  placeholder="e.g. Compliance Overdue / Contempt Imminent"
                  value={newAction.actionNotTaken}
                  onValueChange={(v) => setNewAction({ ...newAction, actionNotTaken: v })}
                />

                <Input
                  size="sm"
                  label="Institutional Impact Scope"
                  labelPlacement="outside"
                  placeholder="e.g. Requires departmental compliance within statutory window"
                  value={newAction.impactScope}
                  onValueChange={(v) => setNewAction({ ...newAction, impactScope: v })}
                />

                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Requires Time-Bound Compliance?</p>
                    <p className="text-[10px] text-slate-500">Triggers countdown clock on 5.2 Contempt Radar</p>
                  </div>
                  <Switch
                    size="sm"
                    isSelected={newAction.requiresDeadline}
                    onValueChange={(val) => setNewAction({ ...newAction, requiresDeadline: val })}
                  />
                </div>

                {newAction.requiresDeadline && (
                  <Input
                    size="sm"
                    label="Default Statutory Deadline (Days)"
                    labelPlacement="outside"
                    type="number"
                    value={newAction.days}
                    onValueChange={(v) => setNewAction({ ...newAction, days: v })}
                  />
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
                  onClick={handleAdd}
                >
                  Save Action Rule
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: Edit Action Rule */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit</span>
                Edit Action Rule: #{editingItem?.id}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Court Decision Outcome"
                  labelPlacement="outside"
                  value={editingItem?.courtDecision || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, courtDecision: v })}
                  isRequired
                />

                <Input
                  size="sm"
                  label="Board Action Taken Text"
                  labelPlacement="outside"
                  value={editingItem?.actionStatus || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, actionStatus: v })}
                  isRequired
                />

                <Input
                  size="sm"
                  label="Action Not Taken Alert Text"
                  labelPlacement="outside"
                  value={editingItem?.actionNotTaken || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, actionNotTaken: v })}
                />

                <Input
                  size="sm"
                  label="Institutional Impact Scope"
                  labelPlacement="outside"
                  value={editingItem?.impactScope || ""}
                  onValueChange={(v) => setEditingItem({ ...editingItem, impactScope: v })}
                />

                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Requires Time-Bound Compliance?</p>
                    <p className="text-[10px] text-slate-500">Triggers countdown clock on 5.2 Contempt Radar</p>
                  </div>
                  <Switch
                    size="sm"
                    isSelected={editingItem?.requiresComplianceDeadline}
                    onValueChange={(val) => setEditingItem({ ...editingItem, requiresComplianceDeadline: val })}
                  />
                </div>

                {editingItem?.requiresComplianceDeadline && (
                  <Input
                    size="sm"
                    label="Default Deadline (Days)"
                    labelPlacement="outside"
                    type="number"
                    value={editingItem?.daysStr || "30"}
                    onValueChange={(v) => setEditingItem({ ...editingItem, daysStr: v })}
                  />
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
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
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
                Confirm Rule Deletion
              </ModalHeader>
              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to remove the rule for <b>{itemToDelete?.courtDecision}</b>? Compliance state automation and contempt clock calculations for this outcome will be disabled.
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  onClick={handleConfirmDelete}
                >
                  Delete Rule
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}