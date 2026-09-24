"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";

interface PermissionRow {
  module: string;
  menus: string[];
  view: boolean;
  create: boolean;
  edit: boolean;
  sign: boolean;
  export: boolean;
}

export default function DynamicRBACPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedRole, setSelectedRole] = useState("LEGAL_OIC");

  const [roles, setRoles] = useState([
    { id: "SUPER_ADMIN", name: "Super Admin", description: "Unrestricted institutional control", userCount: 2 },
    { id: "LEGAL_OIC", name: "Officer-in-Charge (OIC)", description: "Case vetting, drafting PWC & sign-off", userCount: 6 },
    { id: "SECTION_NODAL", name: "Section Nodal Officer", description: "Departmental file movement & record routing", userCount: 14 },
    { id: "LEGAL_CLERK", name: "Legal Cell Clerk", description: "Case ingestion, cause-list parsing & uploads", userCount: 8 },
    { id: "READ_ONLY", name: "Read-Only Reviewer", description: "Audit review without modification privileges", userCount: 3 },
  ]);

  // Role-wise permissions state dictionary
  const [rolePermissions, setRolePermissions] = useState<Record<string, PermissionRow[]>>({
    SUPER_ADMIN: [
      { module: "1.0 Dashboard Cockpit", menus: ["Executive KPIs", "Dynamic Summary Matrix"], view: true, create: true, edit: true, sign: true, export: true },
      { module: "2.0 Writ & Case Hub", menus: ["2.1 Case Register", "2.2 Intake Wizard", "2.3 Co-Petitioners", "2.4 Inward Discovery"], view: true, create: true, edit: true, sign: true, export: true },
      { module: "3.0 Document DMS", menus: ["E-File Tree", "Split Annotator", "Certified Copies"], view: true, create: true, edit: true, sign: true, export: true },
      { module: "4.0 Green Sheet Notings", menus: ["Secretariat Notings", "File Movement", "Forward Authority"], view: true, create: true, edit: true, sign: true, export: true },
      { module: "5.0 Directives & Stays", menus: ["5.1 Stays Roster", "5.2 Contempt Radar", "5.3 Compliance Archival"], view: true, create: true, edit: true, sign: true, export: true },
      { module: "6.0 System Masters", menus: ["Districts", "Departments", "Taxonomy", "Aliases"], view: true, create: true, edit: true, sign: false, export: true },
      { module: "7.0 Administration", menus: ["User Management", "Dynamic RBAC", "Audit Logs"], view: true, create: true, edit: true, sign: true, export: true },
    ],
    LEGAL_OIC: [
      { module: "1.0 Dashboard Cockpit", menus: ["Executive KPIs", "Dynamic Summary Matrix"], view: true, create: false, edit: false, sign: false, export: true },
      { module: "2.0 Writ & Case Hub", menus: ["2.1 Case Register", "2.2 Intake Wizard", "2.3 Co-Petitioners", "2.4 Inward Discovery"], view: true, create: true, edit: true, sign: false, export: true },
      { module: "3.0 Document DMS", menus: ["E-File Tree", "Split Annotator", "Certified Copies"], view: true, create: true, edit: true, sign: false, export: true },
      { module: "4.0 Green Sheet Notings", menus: ["Secretariat Notings", "File Movement", "Forward Authority"], view: true, create: true, edit: true, sign: true, export: false },
      { module: "5.0 Directives & Stays", menus: ["5.1 Stays Roster", "5.2 Contempt Radar", "5.3 Compliance Archival"], view: true, create: false, edit: true, sign: true, export: true },
      { module: "6.0 System Masters", menus: ["Districts", "Departments", "Taxonomy", "Aliases"], view: true, create: false, edit: false, sign: false, export: false },
      { module: "7.0 Administration", menus: ["User Management", "Dynamic RBAC", "Audit Logs"], view: false, create: false, edit: false, sign: false, export: false },
    ],
    SECTION_NODAL: [
      { module: "1.0 Dashboard Cockpit", menus: ["Executive KPIs", "Dynamic Summary Matrix"], view: true, create: false, edit: false, sign: false, export: false },
      { module: "2.0 Writ & Case Hub", menus: ["2.1 Case Register", "2.2 Intake Wizard", "2.3 Co-Petitioners", "2.4 Inward Discovery"], view: true, create: false, edit: true, sign: false, export: true },
      { module: "3.0 Document DMS", menus: ["E-File Tree", "Split Annotator", "Certified Copies"], view: true, create: true, edit: true, sign: false, export: false },
      { module: "4.0 Green Sheet Notings", menus: ["Secretariat Notings", "File Movement", "Forward Authority"], view: true, create: true, edit: false, sign: true, export: false },
      { module: "5.0 Directives & Stays", menus: ["5.1 Stays Roster", "5.2 Contempt Radar", "5.3 Compliance Archival"], view: true, create: false, edit: false, sign: false, export: false },
      { module: "6.0 System Masters", menus: ["Districts", "Departments", "Taxonomy", "Aliases"], view: false, create: false, edit: false, sign: false, export: false },
      { module: "7.0 Administration", menus: ["User Management", "Dynamic RBAC", "Audit Logs"], view: false, create: false, edit: false, sign: false, export: false },
    ],
    LEGAL_CLERK: [
      { module: "1.0 Dashboard Cockpit", menus: ["Executive KPIs", "Dynamic Summary Matrix"], view: true, create: false, edit: false, sign: false, export: false },
      { module: "2.0 Writ & Case Hub", menus: ["2.1 Case Register", "2.2 Intake Wizard", "2.3 Co-Petitioners", "2.4 Inward Discovery"], view: true, create: true, edit: true, sign: false, export: false },
      { module: "3.0 Document DMS", menus: ["E-File Tree", "Split Annotator", "Certified Copies"], view: true, create: true, edit: false, sign: false, export: false },
      { module: "4.0 Green Sheet Notings", menus: ["Secretariat Notings", "File Movement", "Forward Authority"], view: true, create: true, edit: false, sign: false, export: false },
      { module: "5.0 Directives & Stays", menus: ["5.1 Stays Roster", "5.2 Contempt Radar", "5.3 Compliance Archival"], view: true, create: false, edit: false, sign: false, export: false },
      { module: "6.0 System Masters", menus: ["Districts", "Departments", "Taxonomy", "Aliases"], view: false, create: false, edit: false, sign: false, export: false },
      { module: "7.0 Administration", menus: ["User Management", "Dynamic RBAC", "Audit Logs"], view: false, create: false, edit: false, sign: false, export: false },
    ],
    READ_ONLY: [
      { module: "1.0 Dashboard Cockpit", menus: ["Executive KPIs", "Dynamic Summary Matrix"], view: true, create: false, edit: false, sign: false, export: true },
      { module: "2.0 Writ & Case Hub", menus: ["2.1 Case Register", "2.2 Intake Wizard", "2.3 Co-Petitioners", "2.4 Inward Discovery"], view: true, create: false, edit: false, sign: false, export: false },
      { module: "3.0 Document DMS", menus: ["E-File Tree", "Split Annotator", "Certified Copies"], view: true, create: false, edit: false, sign: false, export: false },
      { module: "4.0 Green Sheet Notings", menus: ["Secretariat Notings", "File Movement", "Forward Authority"], view: true, create: false, edit: false, sign: false, export: false },
      { module: "5.0 Directives & Stays", menus: ["5.1 Stays Roster", "5.2 Contempt Radar", "5.3 Compliance Archival"], view: true, create: false, edit: false, sign: false, export: false },
      { module: "6.0 System Masters", menus: ["Districts", "Departments", "Taxonomy", "Aliases"], view: true, create: false, edit: false, sign: false, export: false },
      { module: "7.0 Administration", menus: ["User Management", "Dynamic RBAC", "Audit Logs"], view: false, create: false, edit: false, sign: false, export: false },
    ],
  });

  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const currentPermissions = rolePermissions[selectedRole] || rolePermissions["LEGAL_OIC"];

  const handleTogglePermission = (
    moduleIndex: number,
    actionKey: "view" | "create" | "edit" | "sign" | "export"
  ) => {
    setRolePermissions((prev) => {
      const updatedList = [...(prev[selectedRole] || [])];
      updatedList[moduleIndex] = {
        ...updatedList[moduleIndex],
        [actionKey]: !updatedList[moduleIndex][actionKey],
      };
      return {
        ...prev,
        [selectedRole]: updatedList,
      };
    });
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) return;
    const roleId = newRoleName.trim().toUpperCase().replace(/\s+/g, "_");
    setRoles((prev) => [
      ...prev,
      { id: roleId, name: newRoleName.trim(), description: newRoleDesc.trim() || "Custom configured role", userCount: 0 },
    ]);
    
    // Copy default permissions template for new role
    setRolePermissions((prev) => ({
      ...prev,
      [roleId]: rolePermissions["LEGAL_CLERK"].map((item) => ({ ...item })),
    }));

    setSelectedRole(roleId);
    setNewRoleName("");
    setNewRoleDesc("");
    onOpenChange();
  };

  const handleSavePermissions = () => {
    const roleName = roles.find((r) => r.id === selectedRole)?.name;
    alert(`Granular RBAC permissions for "${roleName}" successfully committed to database!`);
  };

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
                <h1 className="text-base font-bold text-slate-900">7.2 Dynamic RBAC Role & Permission Matrix</h1>
                <Chip size="sm" className="bg-emerald-500/20 px-1 text-[10px] font-bold text-emerald-800">
                  Granular Menu Security
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Create dynamic institutional roles and assign action-level permissions across modules
              </p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white shadow hover:bg-[#163a66]"
              startContent={<span className="material-symbols-rounded text-sm">add</span>}
              onPress={onOpen}
            >
              Create New Role
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 2. Main Workspace Split: Roles List + Capability Matrix */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Roles List (4 cols) */}
        <Card shadow="none" className="border border-slate-200/80 bg-white lg:col-span-4">
          <div className="border-b border-slate-100 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Configured Roles ({roles.length})
            </h3>
          </div>
          <CardBody className="p-2 space-y-1">
            {roles.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`cursor-pointer rounded-lg p-3 transition-colors ${
                  selectedRole === r.id ? "bg-blue-50/80 border border-blue-200" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">{r.name}</p>
                  <Chip size="sm" variant="flat" className="h-4 px-1 text-[9px] font-bold">
                    {r.userCount} Users
                  </Chip>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{r.description}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Matrix Grid (8 cols) */}
        <Card shadow="none" className="border border-slate-200/80 bg-white lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Action Capabilities for: <span className="text-blue-950 font-bold">{roles.find((r) => r.id === selectedRole)?.name}</span>
              </h3>
              <p className="text-[11px] text-slate-400">Toggle actions granted to this role</p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white hover:bg-[#163a66]"
              onClick={handleSavePermissions}
            >
              Save Permissions
            </Button>
          </div>

          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                  <tr>
                    <th className="p-3">SYSTEM MODULE & MENUS</th>
                    <th className="p-3 text-center">VIEW</th>
                    <th className="p-3 text-center">CREATE</th>
                    <th className="p-3 text-center">EDIT</th>
                    <th className="p-3 text-center">SIGN</th>
                    <th className="p-3 text-center">EXPORT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentPermissions.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{p.module}</p>
                        <p className="text-[10px] text-slate-400">{p.menus.join(" · ")}</p>
                      </td>
                      <td className="p-3 text-center">
                        <Checkbox
                          isSelected={p.view}
                          onValueChange={() => handleTogglePermission(idx, "view")}
                          size="sm"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Checkbox
                          isSelected={p.create}
                          onValueChange={() => handleTogglePermission(idx, "create")}
                          size="sm"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Checkbox
                          isSelected={p.edit}
                          onValueChange={() => handleTogglePermission(idx, "edit")}
                          size="sm"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Checkbox
                          isSelected={p.sign}
                          onValueChange={() => handleTogglePermission(idx, "sign")}
                          size="sm"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Checkbox
                          isSelected={p.export}
                          onValueChange={() => handleTogglePermission(idx, "export")}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Define New Role Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-700">admin_panel_settings</span>
                Define New Institutional Role
              </ModalHeader>
              <ModalBody className="space-y-3">
                <Input
                  size="sm"
                  label="Role Name"
                  labelPlacement="outside"
                  placeholder="e.g. Legal Cell Pairokar"
                  value={newRoleName}
                  onValueChange={setNewRoleName}
                  isRequired
                />
                <Input
                  size="sm"
                  label="Role Description"
                  labelPlacement="outside"
                  placeholder="e.g. High Court physical appearance liaison"
                  value={newRoleDesc}
                  onValueChange={setNewRoleDesc}
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  onClick={handleCreateRole}
                >
                  Create Role
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}