"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Skeleton,
} from "@nextui-org/react";
import Link from "next/link";
import toast from "react-hot-toast";

import { RbacAPI, RoleMetricItem, PermissionMatrixItem } from "@/api/rbacApi";

export default function DynamicRBACPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [roles, setRoles] = useState<RoleMetricItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [permissionsMatrix, setPermissionsMatrix] = useState<PermissionMatrixItem[]>([]);

  const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
  const [loadingMatrix, setLoadingMatrix] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCreatingRole, setIsCreatingRole] = useState<boolean>(false);

  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const loadRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const res = await RbacAPI.getRoles();
      if (res?.success && Array.isArray(res.data)) {
        setRoles(res.data);
        if (res.data.length > 0 && !selectedRoleId) {
          setSelectedRoleId(res.data[0]._id);
        }
      }
    } catch (err: any) {
      console.error("Failed to load roles:", err);
      toast.error(err.response?.data?.message || "Failed to load roles directory");
    } finally {
      setLoadingRoles(false);
    }
  }, [selectedRoleId]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const loadMatrix = useCallback(async (roleId: string) => {
    if (!roleId) return;
    setLoadingMatrix(true);
    try {
      const res = await RbacAPI.getRolePermissions(roleId);
      if (res?.success && Array.isArray(res.data)) {
        setPermissionsMatrix(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load permissions matrix:", err);
      toast.error(err.response?.data?.message || "Failed to load permissions matrix");
    } finally {
      setLoadingMatrix(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      loadMatrix(selectedRoleId);
    }
  }, [selectedRoleId, loadMatrix]);

  const activeRole = useMemo(() => {
    return roles.find((r) => r._id === selectedRoleId);
  }, [roles, selectedRoleId]);

  const handleToggleAction = (
    index: number,
    actionKey: "canView" | "canCreate" | "canEdit" | "canDelete" | "canSign" | "canExport" | "canDownload"
  ) => {
    setPermissionsMatrix((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [actionKey]: !updated[index][actionKey],
      };
      return updated;
    });
  };

  const handleToggleRowAll = (index: number) => {
    setPermissionsMatrix((prev) => {
      const updated = [...prev];
      const row = updated[index];
      const nextVal = !(row.canView && row.canCreate && row.canEdit);
      updated[index] = {
        ...row,
        canView: nextVal,
        canCreate: nextVal,
        canEdit: nextVal,
        canDelete: nextVal,
        canSign: nextVal,
        canExport: nextVal,
        canDownload: nextVal,
      };
      return updated;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setIsSaving(true);
    try {
      const payload = {
        permissions: permissionsMatrix.map((p) => ({
          menuKey: p.menuKey,
          canView: p.canView,
          canCreate: p.canCreate,
          canEdit: p.canEdit,
          canDelete: p.canDelete,
          canSign: p.canSign,
          canExport: p.canExport,
          canDownload: p.canDownload,
        })),
      };

      const res = await RbacAPI.updateRolePermissions(selectedRoleId, payload);
      if (res?.success) {
        toast.success(`Permissions matrix updated for ${activeRole?.roleName}!`, { icon: "🔒" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async (onClose: () => void) => {
    if (!newRoleName.trim() || !newRoleCode.trim()) {
      toast.error("Role Name and Code are mandatory.");
      return;
    }

    setIsCreatingRole(true);
    try {
      const payload = {
        roleName: newRoleName.trim(),
        roleCode: newRoleCode.trim().toUpperCase(),
        description: newRoleDesc.trim(),
      };

      const res = await RbacAPI.createRole(payload);
      if (res?.success) {
        toast.success(`Role '${payload.roleName}' created successfully!`);
        setNewRoleName("");
        setNewRoleCode("");
        setNewRoleDesc("");
        onClose();
        loadRoles();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create role");
    } finally {
      setIsCreatingRole(false);
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
                <Link href="/admin/cases">
                  <Button isIconOnly size="sm" variant="light" className="text-slate-500">
                    <span className="material-symbols-rounded">arrow_back</span>
                  </Button>
                </Link>
                <h1 className="text-base font-bold text-slate-900">7.2 Dynamic RBAC Role &amp; Permission Matrix</h1>
                <Chip size="sm" className="bg-emerald-500/20 px-1 text-[10px] font-bold text-emerald-800">
                  Granular Menu Security
                </Chip>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Create dynamic institutional roles and assign granular action-level capabilities across system modules
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
            {loadingRoles ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : roles.length > 0 ? (
              roles.map((r) => (
                <div
                  key={r._id}
                  onClick={() => setSelectedRoleId(r._id)}
                  className={`cursor-pointer rounded-lg p-3 transition-colors ${
                    selectedRoleId === r._id ? "bg-blue-50/80 border border-blue-200" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">{r.roleName}</p>
                    <Chip size="sm" variant="flat" className="h-4 px-1 text-[9px] font-bold">
                      {r.usersAssignedCount} Users
                    </Chip>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-[10px] text-blue-700 font-semibold">{r.roleCode}</span>
                    <p className="text-[11px] text-slate-400 truncate max-w-[170px]">{r.description || "--"}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 p-4">No roles configured.</p>
            )}
          </CardBody>
        </Card>

        {/* Matrix Grid (8 cols) */}
        <Card shadow="none" className="border border-slate-200/80 bg-white lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Action Capabilities for: <span className="text-blue-950 font-bold">{activeRole?.roleName}</span>
              </h3>
              <p className="text-[11px] text-slate-400">Toggle actions granted to this role</p>
            </div>
            <Button
              size="sm"
              radius="sm"
              className="bg-[#0f2744] text-xs font-semibold text-white hover:bg-[#163a66]"
              isLoading={isSaving}
              onClick={handleSavePermissions}
            >
              Save Permissions
            </Button>
          </div>

          <CardBody className="p-0">
            {loadingMatrix ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-8 w-full rounded" />
                <Skeleton className="h-8 w-full rounded" />
                <Skeleton className="h-8 w-full rounded" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 bg-slate-50/50">
                    <tr>
                      <th className="p-3">SYSTEM MODULE &amp; MENUS</th>
                      <th className="p-3 text-center">VIEW</th>
                      <th className="p-3 text-center">CREATE</th>
                      <th className="p-3 text-center">EDIT</th>
                      <th className="p-3 text-center">DELETE</th>
                      <th className="p-3 text-center">SIGN</th>
                      <th className="p-3 text-center">EXPORT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {permissionsMatrix.map((p, idx) => (
                      <tr key={p.menuId} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <p
                            className="font-bold text-slate-900 cursor-pointer hover:underline"
                            onClick={() => handleToggleRowAll(idx)}
                          >
                            {p.moduleTitle}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {p.subMenus && p.subMenus.length > 0
                              ? p.subMenus.map((s) => s.label).join(" · ")
                              : p.groupTitle}
                          </p>
                        </td>
                        <td className="p-3 text-center">
                          <Checkbox
                            isSelected={p.canView}
                            onValueChange={() => handleToggleAction(idx, "canView")}
                            size="sm"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Checkbox
                            isSelected={p.canCreate}
                            onValueChange={() => handleToggleAction(idx, "canCreate")}
                            size="sm"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Checkbox
                            isSelected={p.canEdit}
                            onValueChange={() => handleToggleAction(idx, "canEdit")}
                            size="sm"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Checkbox
                            isSelected={p.canDelete}
                            onValueChange={() => handleToggleAction(idx, "canDelete")}
                            size="sm"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Checkbox
                            isSelected={p.canSign}
                            onValueChange={() => handleToggleAction(idx, "canSign")}
                            size="sm"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Checkbox
                            isSelected={p.canExport}
                            onValueChange={() => handleToggleAction(idx, "canExport")}
                            size="sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                  label="Role Code (Unique Acronym)"
                  labelPlacement="outside"
                  placeholder="e.g. PAIROKAR_ALD"
                  value={newRoleCode}
                  onValueChange={setNewRoleCode}
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
                <Button size="sm" variant="bordered" radius="sm" onPress={onClose} isDisabled={isCreatingRole}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-[#0f2744] font-semibold text-white hover:bg-[#163a66]"
                  isLoading={isCreatingRole}
                  onClick={() => handleCreateRole(onClose)}
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