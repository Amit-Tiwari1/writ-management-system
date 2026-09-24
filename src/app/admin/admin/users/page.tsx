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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";

export default function UsersMasterPage() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onOpenChange: onStatusOpenChange } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Chairman",
      designation: "Chairman/DG",
      section: "Apex Board",
      username: "chairman",
      mobile: "9454400100",
      email: "chairman@policeboard.in",
      role: "Super Admin",
      status: "ACTIVE",
    },
    {
      id: 2,
      name: "R.K. Swarnkar",
      designation: "Member Secretary/ADG",
      section: "Administration",
      username: "membersec",
      mobile: "9454400150",
      email: "member@policeboard.in",
      role: "Head of Legal Cell",
      status: "ACTIVE",
    },
    {
      id: 3,
      name: "Padmaja Chauhan",
      designation: "Additional Secretary",
      section: "Recruitment Wing",
      username: "9454400194",
      mobile: "9454400194",
      email: "asecr@policeboard.in",
      role: "Section Nodal Officer",
      status: "ACTIVE",
    },
    {
      id: 4,
      name: "Ramakant Prashad",
      designation: "Superintendent of Police",
      section: "Promotion/DDO",
      username: "9454400423",
      mobile: "9454400423",
      email: "sp_legal@policeboard.in",
      role: "Officer-in-Charge (OIC)",
      status: "ACTIVE",
    },
    {
      id: 5,
      name: "Swahleen Ahmad",
      designation: "Sub Inspector",
      section: "Legal Cell Desk",
      username: "swahleen",
      mobile: "9454402120",
      email: "legaldesk@policeboard.in",
      role: "Legal Clerk / Operator",
      status: "ACTIVE",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    section: "Recruitment Wing",
    username: "",
    mobile: "",
    email: "",
    role: "Officer-in-Charge (OIC)",
  });

  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToToggle, setUserToToggle] = useState<any>(null);

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.username.trim()) return;
    setUsers((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: formData.name.trim(),
        designation: formData.designation.trim() || "Staff Officer",
        section: formData.section,
        username: formData.username.trim(),
        mobile: formData.mobile.trim() || "--",
        email: formData.email.trim() || "--",
        role: formData.role,
        status: "ACTIVE",
      },
    ]);
    setFormData({
      name: "",
      designation: "",
      section: "Recruitment Wing",
      username: "",
      mobile: "",
      email: "",
      role: "Officer-in-Charge (OIC)",
    });
    onAddOpenChange();
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser({ ...user });
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    onEditOpenChange();
  };

  const handleOpenStatusToggle = (user: any) => {
    setUserToToggle(user);
    onStatusOpen();
  };

  const handleConfirmToggle = () => {
    if (!userToToggle) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userToToggle.id
          ? { ...u, status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
          : u
      )
    );
    onStatusOpenChange();
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.mobile.includes(searchQuery);

      const matchesRole =
        selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRoleFilter]);

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
                <h1 className="text-base font-bold text-slate-900">7.1 Officers & User Credentials Directory</h1>
                <Chip size="sm" className="bg-blue-500/20 px-1 text-[10px] font-bold text-blue-700">
                  {users.length} Active Staff
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Staff profile records, credentials, designations, and assigned dynamic roles
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">person_add</span>}
              onPress={onAddOpen}
            >
              Create New Staff User
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <Input
              size="sm"
              radius="sm"
              placeholder="Search officer name, designation, login or mobile..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<span className="material-symbols-rounded text-sm text-slate-400">search</span>}
              className="bg-slate-50 sm:col-span-2"
            />
            <Select
              size="sm"
              radius="sm"
              placeholder="Filter by Assigned Role"
              selectedKeys={[selectedRoleFilter]}
              onChange={(e) => setSelectedRoleFilter(e.target.value || "ALL")}
              className="bg-slate-50 font-semibold"
            >
              <SelectItem key="ALL">All Roles</SelectItem>
              <SelectItem key="Super Admin">Super Admin</SelectItem>
              <SelectItem key="Head of Legal Cell">Head of Legal Cell</SelectItem>
              <SelectItem key="Section Nodal Officer">Section Nodal Officer</SelectItem>
              <SelectItem key="Officer-in-Charge (OIC)">Officer-in-Charge (OIC)</SelectItem>
              <SelectItem key="Legal Clerk / Operator">Legal Clerk / Operator</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Directory Table */}
      <Card shadow="none" className="border border-slate-200/80 bg-white">
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Officers Table" className="min-w-full">
            <TableHeader>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">S.NO</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">OFFICER NAME</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">DESIGNATION & WING</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">USER ID / LOGIN</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">CONTACT & EMAIL</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">ASSIGNED ROLE</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400">STATUS</TableColumn>
              <TableColumn className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">ACTION</TableColumn>
            </TableHeader>
            <TableBody items={filteredUsers} emptyContent="No officers found matching your search.">
              {(u) => (
                <TableRow key={u.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <TableCell className="text-xs font-bold text-slate-400">{u.id}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">{u.name}</TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold text-blue-900">{u.designation}</p>
                    <p className="text-[10px] text-slate-400">{u.section}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-slate-700">{u.username}</TableCell>
                  <TableCell>
                    <p className="text-xs text-slate-800">{u.mobile}</p>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="primary" className="text-[10px] font-semibold">
                      {u.role}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="dot"
                      color={u.status === "ACTIVE" ? "success" : "danger"}
                      className="border-none text-[10px] font-bold cursor-pointer"
                      onClick={() => handleOpenStatusToggle(u)}
                    >
                      {u.status}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-400 hover:text-slate-700"
                        onClick={() => handleOpenEdit(u)}
                      >
                        <span className="material-symbols-rounded text-sm">edit</span>
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-400 hover:text-amber-700"
                        onClick={() => handleOpenStatusToggle(u)}
                      >
                        <span className="material-symbols-rounded text-sm">
                          {u.status === "ACTIVE" ? "block" : "check_circle"}
                        </span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* MODAL 1: Create New Staff User */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">person_add</span>
                Add Staff Member & Credentials
              </ModalHeader>
              <ModalBody className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    size="sm"
                    label="Full Name"
                    labelPlacement="outside"
                    placeholder="e.g. Anand Kumar"
                    value={formData.name}
                    onValueChange={(v) => setFormData({ ...formData, name: v })}
                    isRequired
                  />
                  <Input
                    size="sm"
                    label="Official Designation"
                    labelPlacement="outside"
                    placeholder="e.g. DySP Legal"
                    value={formData.designation}
                    onValueChange={(v) => setFormData({ ...formData, designation: v })}
                    isRequired
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    size="sm"
                    label="User ID / Login"
                    labelPlacement="outside"
                    placeholder="e.g. anand_legal"
                    value={formData.username}
                    onValueChange={(v) => setFormData({ ...formData, username: v })}
                    isRequired
                  />
                  <Input
                    size="sm"
                    label="Mobile Number"
                    labelPlacement="outside"
                    placeholder="9454400000"
                    value={formData.mobile}
                    onValueChange={(v) => setFormData({ ...formData, mobile: v })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    size="sm"
                    label="Official Email"
                    labelPlacement="outside"
                    placeholder="officer@policeboard.in"
                    value={formData.email}
                    onValueChange={(v) => setFormData({ ...formData, email: v })}
                  />
                  <Select
                    size="sm"
                    label="Assigned Section / Wing"
                    labelPlacement="outside"
                    selectedKeys={[formData.section]}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  >
                    <SelectItem key="Apex Board">Apex Board</SelectItem>
                    <SelectItem key="Administration">Administration</SelectItem>
                    <SelectItem key="Recruitment Wing">Recruitment Wing</SelectItem>
                    <SelectItem key="Promotion/DDO">Promotion/DDO</SelectItem>
                    <SelectItem key="Legal Cell Desk">Legal Cell Desk</SelectItem>
                  </Select>
                </div>
                <Select
                  size="sm"
                  label="Assign Dynamic RBAC Role"
                  labelPlacement="outside"
                  selectedKeys={[formData.role]}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  isRequired
                >
                  <SelectItem key="Super Admin">Super Admin</SelectItem>
                  <SelectItem key="Head of Legal Cell">Head of Legal Cell</SelectItem>
                  <SelectItem key="Section Nodal Officer">Section Nodal Officer</SelectItem>
                  <SelectItem key="Officer-in-Charge (OIC)">Officer-in-Charge (OIC)</SelectItem>
                  <SelectItem key="Legal Clerk / Operator">Legal Clerk / Operator</SelectItem>
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
                  onClick={handleCreate}
                >
                  Save Staff User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 2: Edit Staff User */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">edit</span>
                Edit User Profile: {editingUser?.username}
              </ModalHeader>
              <ModalBody className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    size="sm"
                    label="Full Name"
                    labelPlacement="outside"
                    value={editingUser?.name || ""}
                    onValueChange={(v) => setEditingUser({ ...editingUser, name: v })}
                    isRequired
                  />
                  <Input
                    size="sm"
                    label="Official Designation"
                    labelPlacement="outside"
                    value={editingUser?.designation || ""}
                    onValueChange={(v) => setEditingUser({ ...editingUser, designation: v })}
                    isRequired
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    size="sm"
                    label="Mobile Number"
                    labelPlacement="outside"
                    value={editingUser?.mobile || ""}
                    onValueChange={(v) => setEditingUser({ ...editingUser, mobile: v })}
                  />
                  <Input
                    size="sm"
                    label="Official Email"
                    labelPlacement="outside"
                    value={editingUser?.email || ""}
                    onValueChange={(v) => setEditingUser({ ...editingUser, email: v })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    size="sm"
                    label="Assigned Section / Wing"
                    labelPlacement="outside"
                    selectedKeys={editingUser ? [editingUser.section] : ["Recruitment Wing"]}
                    onChange={(e) => setEditingUser({ ...editingUser, section: e.target.value })}
                  >
                    <SelectItem key="Apex Board">Apex Board</SelectItem>
                    <SelectItem key="Administration">Administration</SelectItem>
                    <SelectItem key="Recruitment Wing">Recruitment Wing</SelectItem>
                    <SelectItem key="Promotion/DDO">Promotion/DDO</SelectItem>
                    <SelectItem key="Legal Cell Desk">Legal Cell Desk</SelectItem>
                  </Select>
                  <Select
                    size="sm"
                    label="Assign Dynamic RBAC Role"
                    labelPlacement="outside"
                    selectedKeys={editingUser ? [editingUser.role] : ["Officer-in-Charge (OIC)"]}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    <SelectItem key="Super Admin">Super Admin</SelectItem>
                    <SelectItem key="Head of Legal Cell">Head of Legal Cell</SelectItem>
                    <SelectItem key="Section Nodal Officer">Section Nodal Officer</SelectItem>
                    <SelectItem key="Officer-in-Charge (OIC)">Officer-in-Charge (OIC)</SelectItem>
                    <SelectItem key="Legal Clerk / Operator">Legal Clerk / Operator</SelectItem>
                  </Select>
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
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL 3: Status Toggle Confirmation */}
      <Modal isOpen={isStatusOpen} onOpenChange={onStatusOpenChange} placement="center" size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-amber-600">admin_panel_settings</span>
                {userToToggle?.status === "ACTIVE" ? "Deactivate User Access" : "Re-activate User Access"}
              </ModalHeader>
              <ModalBody className="text-xs text-slate-600">
                Are you sure you want to change the status of <b>{userToToggle?.name}</b> ({userToToggle?.username}) to{" "}
                <b className={userToToggle?.status === "ACTIVE" ? "text-rose-600" : "text-emerald-600"}>
                  {userToToggle?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}
                </b>
                ? Inactive users cannot digitally sign notings or access sensitive case dossiers.
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className={
                    userToToggle?.status === "ACTIVE"
                      ? "bg-rose-600 font-semibold text-white hover:bg-rose-700"
                      : "bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                  }
                  onClick={handleConfirmToggle}
                >
                  Confirm Change
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}