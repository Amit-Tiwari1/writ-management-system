"use client";

import React, { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import axiosClient from "@/api/axiosClient";

interface ExportButtonProps {
  endpoint: string;
  filterParams: Record<string, any>;
  fileBaseName?: string;
  allowExcel?: boolean;
  allowPdf?: boolean;
}

export default function ExportButton({
  endpoint,
  filterParams,
  fileBaseName = "UPPRPB_Export",
  allowExcel = true,
  allowPdf = true,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    setIsExporting(true);
    const toastId = toast.loading(`Generating filtered ${format.toUpperCase()} export...`);

    try {
      const response = await axiosClient.get(endpoint, {
        params: {
          ...filterParams,
          format,
        },
        responseType: format === "pdf" ? "text" : "blob",
      });

      if (format === "pdf") {
        const blob = new Blob([response.data], { type: "text/html" });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, "_blank");
        if (win) {
          win.focus();
        }
        toast.success("Printable PDF report opened successfully!", { id: toastId });
      } else {
        const blob = new Blob([response.data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `${fileBaseName}_${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Excel (.CSV) exported successfully!", { id: toastId });
      }
    } catch (err: any) {
      console.error("[Export Error]:", err);
      toast.error(err.response?.data?.message || "Export generation failed.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const items = [];
  if (allowExcel) {
    items.push(
      <DropdownItem
        key="csv"
        startContent={<span className="material-symbols-rounded text-emerald-600 text-sm">table_view</span>}
        description="Filtered dataset in CSV / Excel format"
      >
        Export Filtered Excel (.CSV)
      </DropdownItem>
    );
  }
  if (allowPdf) {
    items.push(
      <DropdownItem
        key="pdf"
        startContent={<span className="material-symbols-rounded text-rose-600 text-sm">picture_as_pdf</span>}
        description="Printable Official Dossier with Emblem Watermark"
      >
        Export Filtered PDF Report
      </DropdownItem>
    );
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          size="sm"
          variant="bordered"
          radius="sm"
          isLoading={isExporting}
          className="border-slate-300 bg-white text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          startContent={
            !isExporting && (
              <span className="material-symbols-rounded text-sm text-slate-500">
                download
              </span>
            )
          }
        >
          Export Data
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Export Options"
        onAction={(key) => handleExport(key as any)}
      >
        {items}
      </DropdownMenu>
    </Dropdown>
  );
}