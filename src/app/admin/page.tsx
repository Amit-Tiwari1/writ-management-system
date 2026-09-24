"use client";

import React from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const recentWrits = [
    { id: 1, caseNo: "WRIT/2481/2026", parties: "State vs. R. Mehta", court: "High Court", status: "Overdue", due: "12 Sep", officer: "K. Verma" },
    { id: 2, caseNo: "WRIT/1102/2026", parties: "A. Qureshi vs. Home Dept.", court: "High Court", status: "Due soon", due: "18 Sep", officer: "P. Singh" },
    { id: 3, caseNo: "WRIT/2455/2026", parties: "Bharat Ltd. vs. Land Board", court: "District Court", status: "Assigned", due: "22 Sep", officer: "S. Khan" },
    { id: 4, caseNo: "WRIT/0988/2026", parties: "M. Gupta vs. PWD", court: "Civil Court", status: "Assigned", due: "25 Sep", officer: "K. Verma" },
    { id: 5, caseNo: "WRIT/2401/2026", parties: "R. Iyer vs. Transport Dept.", court: "High Court", status: "Served", due: "09 Sep", officer: "P. Singh" },
  ];

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ACTIVE WRITS</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">142</span>
              <Chip size="sm" variant="flat" color="success" className="text-[10px] font-bold">18 this week</Chip>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Total cases under active trial</p>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DUE WITHIN 7 DAYS</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-600">31</span>
              <Chip size="sm" variant="flat" color="warning" className="text-[10px] font-bold">9 urgent</Chip>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Hearing dates scheduled this week</p>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">OVERDUE REPLIES</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-rose-600">5</span>
              <Chip size="sm" variant="flat" color="danger" className="text-[10px] font-bold">Escalated</Chip>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Para-wise comments delayed</p>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-slate-200/80 bg-white">
          <CardBody className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">COMPLIANCE RATE</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-blue-700">94%</span>
              <Chip size="sm" variant="flat" color="primary" className="text-[10px] font-bold">Target 90%</Chip>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Orders complied within timeframe</p>
          </CardBody>
        </Card>
      </div>

      {/* Main Grid: Recent Writs Table + Right Needs Attention */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Table (8 cols) */}
        <Card shadow="none" className="border border-slate-200/80 bg-white lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Writs Repository</h3>
              <p className="text-[11px] text-slate-400">Updated today at 14:02 IST via eCourts NAPIX</p>
            </div>
            <Link href="/admin/cases">
              <Button size="sm" variant="light" className="text-xs font-semibold text-blue-700">
                View All Writs →
              </Button>
            </Link>
          </div>
          <CardBody className="p-0">
            <Table removeWrapper aria-label="Recent Writs Table">
              <TableHeader>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">CASE NO</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">PARTIES</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">COURT</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">STATUS</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">DUE DATE</TableColumn>
                <TableColumn className="text-[10px] font-bold uppercase text-slate-400">OFFICER</TableColumn>
              </TableHeader>
              <TableBody items={recentWrits}>
                {(item) => (
                  <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <TableCell className="font-mono text-xs font-bold text-blue-900">{item.caseNo}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-800">{item.parties}</TableCell>
                    <TableCell className="text-xs text-slate-500">{item.court}</TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={item.status === "Overdue" ? "danger" : item.status === "Due soon" ? "warning" : "default"}
                        className="text-[10px] font-bold"
                      >
                        {item.status}
                      </Chip>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{item.due}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-700">{item.officer}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Right Alerts & Actions (4 cols) */}
        <div className="space-y-4 lg:col-span-4">
          <Card shadow="none" className="border border-rose-200/70 bg-rose-50/30">
            <CardBody className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-800">
                <span className="material-symbols-rounded text-lg">warning</span>
                <h4 className="text-xs font-bold uppercase tracking-wider">Needs Immediate Attention (3)</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="rounded-lg border border-rose-200 bg-white p-2.5">
                  <p className="font-bold text-rose-900">CS/2481/2026 — Service Lapsed</p>
                  <p className="text-[11px] text-slate-500">4 days past deadline · OIC: K. Verma</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-white p-2.5">
                  <p className="font-bold text-amber-900">WRIT/1102/2026 — Reply Due</p>
                  <p className="text-[11px] text-slate-500">Due in 3 days · OIC: P. Singh</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card shadow="none" className="border border-slate-200/80 bg-white">
            <CardBody className="p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Operations</h4>
              <Link href="/admin/cases/register" className="block">
                <Button size="sm" variant="bordered" className="w-full justify-start text-xs font-semibold" startContent={<span className="material-symbols-rounded text-sm">post_add</span>}>
                  Add / Ingest New Writ
                </Button>
              </Link>
              <Link href="/admin/cases/discovery" className="block">
                <Button size="sm" variant="bordered" className="w-full justify-start text-xs font-semibold" startContent={<span className="material-symbols-rounded text-sm">travel_explore</span>}>
                  Scan Daily Cause List
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}