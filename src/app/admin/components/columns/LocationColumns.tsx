
"use client";

import React from "react";
import { Button } from "@nextui-org/react";

import {
  IStateItem,
  IZoneItem,
  IRangeItem,
  IDistrictItem,
} from "@/types/master.types";

// =====================================================
// 1. STATE COLUMNS
// =====================================================

export const stateColumns = [
  { key: "stateName", label: "STATE NAME" },
  { key: "stateCode", label: "STATE CODE" },
  { key: "country", label: "COUNTRY" },
  { key: "actions", label: "ACTION" },
];

// =====================================================
// 2. ZONE COLUMNS
// =====================================================

export const zoneColumns = [
  { key: "zoneName", label: "ZONE NAME" },
  { key: "state", label: "STATE JURISDICTION" },
  { key: "headquarters", label: "HEADQUARTERS" },
  { key: "actions", label: "ACTION" },
];

// =====================================================
// 3. RANGE COLUMNS
// =====================================================

export const rangeColumns = [
  { key: "rangeName", label: "RANGE NAME" },
  { key: "zone", label: "PARENT ZONE" },
  { key: "state", label: "STATE" },
  { key: "actions", label: "ACTION" },
];

// =====================================================
// 4. DISTRICT COLUMNS
// =====================================================

export const districtColumns = [
  { key: "state", label: "STATE" },
  { key: "zone", label: "ZONE" },
  { key: "range", label: "RANGE" },
  { key: "districtName", label: "DISTRICT NAME" },
  { key: "actions", label: "ACTION" },
];

// =====================================================
// COMMON ACTION BUTTONS
// =====================================================

interface ActionButtonsProps<T> {
  item: T;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

function ActionButtons<T>({
  item,
  onEdit,
  onDelete,
}: ActionButtonsProps<T>) {
  return (
    <div className="flex justify-center items-center gap-1">
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="text-slate-400 hover:text-blue-700"
        onPress={() => onEdit(item)}
        aria-label="Edit record"
      >
        <span className="material-symbols-rounded text-sm">
          edit
        </span>
      </Button>

      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="text-slate-400 hover:text-rose-600"
        onPress={() => onDelete(item)}
        aria-label="Delete record"
      >
        <span className="material-symbols-rounded text-sm">
          delete
        </span>
      </Button>
    </div>
  );
}

// =====================================================
// 5. STATE RENDER CELL
// =====================================================

export const renderStateCell = (
  item: IStateItem,
  columnKey: React.Key,
  onEdit: (item: IStateItem) => void,
  onDelete: (item: IStateItem) => void
): React.ReactNode => {
  switch (columnKey) {
    case "stateName":
      return (
        <span className="text-xs font-bold text-slate-900">
          {item.stateName}
        </span>
      );

    case "stateCode":
      return (
        <span className="text-xs font-mono font-bold text-blue-700">
          {item.stateCode}
        </span>
      );

    case "country":
      return (
        <span className="text-xs text-slate-500">
          {item.country || "India"}
        </span>
      );

    case "actions":
      return (
        <ActionButtons
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

    default:
      return null;
  }
};

// =====================================================
// 6. ZONE RENDER CELL
// =====================================================

export const renderZoneCell = (
  item: IZoneItem,
  columnKey: React.Key,
  onEdit: (item: IZoneItem) => void,
  onDelete: (item: IZoneItem) => void
): React.ReactNode => {
  switch (columnKey) {
    case "zoneName":
      return (
        <span className="text-xs font-bold text-slate-900">
          {item.zoneName}
        </span>
      );

    case "state":
      return (
        <span className="text-xs text-slate-700">
          {typeof item.stateId === "object"
            ? item.stateId?.stateName || "--"
            : "--"}
        </span>
      );

    case "headquarters":
      return (
        <span className="text-xs text-slate-500">
          {item.headquarters || "--"}
        </span>
      );

    case "actions":
      return (
        <ActionButtons
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

    default:
      return null;
  }
};

// =====================================================
// 7. RANGE RENDER CELL
// =====================================================

export const renderRangeCell = (
  item: IRangeItem,
  columnKey: React.Key,
  onEdit: (item: IRangeItem) => void,
  onDelete: (item: IRangeItem) => void
): React.ReactNode => {
  switch (columnKey) {
    case "rangeName":
      return (
        <span className="text-xs font-bold text-slate-900">
          {item.rangeName}
        </span>
      );

    case "zone":
      return (
        <span className="text-xs text-slate-700">
          {typeof item.zoneId === "object"
            ? item.zoneId?.zoneName || "--"
            : "--"}
        </span>
      );

    case "state":
      return (
        <span className="text-xs text-slate-600">
          {typeof item.stateId === "object"
            ? item.stateId?.stateName || "--"
            : "--"}
        </span>
      );

    case "actions":
      return (
        <ActionButtons
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

    default:
      return null;
  }
};

// =====================================================
// 8. DISTRICT RENDER CELL
// =====================================================

export const renderDistrictCell = (
  item: IDistrictItem,
  columnKey: React.Key,
  onEdit: (item: IDistrictItem) => void,
  onDelete: (item: IDistrictItem) => void
): React.ReactNode => {
  switch (columnKey) {
    case "state":
      return (
        <span className="text-xs font-semibold text-slate-800">
          {typeof item.stateId === "object"
            ? item.stateId?.stateName || "--"
            : "--"}
        </span>
      );

    case "zone":
      return (
        <span className="text-xs text-slate-600">
          {typeof item.zoneId === "object"
            ? item.zoneId?.zoneName || "--"
            : "--"}
        </span>
      );

    case "range":
      return (
        <span className="text-xs text-slate-600">
          {typeof item.rangeId === "object"
            ? item.rangeId?.rangeName || "--"
            : "--"}
        </span>
      );

    case "districtName":
      return (
        <span className="text-xs font-bold text-slate-900">
          {item.districtName}
        </span>
      );

    case "actions":
      return (
        <ActionButtons
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

    default:
      return null;
  }
};
