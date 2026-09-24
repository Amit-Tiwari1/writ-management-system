"use client";

import React, { useState } from "react";
import { Button, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      if (username === "admin" && password === "1234") {
        router.push("/admin");
      } else {
        setError("Invalid credentials! Enter username 'admin' and password '1234'");
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#071322] p-4">
      {/* Background Graphic Rings */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative z-10 grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-2xl backdrop-blur-xl md:grid-cols-12">
        {/* Left Branding Panel (5 cols) */}
        <div className="relative flex flex-col justify-between border-b border-slate-800 bg-gradient-to-br from-[#0f2744] to-[#071322] p-8 md:col-span-5 md:border-b-0 md:border-r">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                <span className="material-symbols-rounded text-2xl">gavel</span>
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-white">LexWrit CMS</h2>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                  Enterprise Legal Suite
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-bold leading-snug text-white">
                Institutional Writ & Compliance Management System
              </h3>
              <p className="text-xs leading-relaxed text-slate-300">
                End-to-end judicial lifecycle tracking: High Court eCourts/NAPIX sync, stay orders roster, digital green-sheet notings, and contempt risk radar.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Court Gateway Sync</span>
              <Chip size="sm" color="success" variant="flat" className="h-5 text-[10px] font-bold">
                Online (180ms)
              </Chip>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="material-symbols-rounded text-sm text-emerald-400">verified</span>
              <span>AES-256 Tamper-Proof Audit Active</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel (7 cols) - Clean Tailwind inputs without label overlap */}
        <div className="flex flex-col justify-center bg-white p-8 md:col-span-7 md:p-10">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Officer Secure Access</h2>
              <Chip size="sm" className="bg-slate-100 text-[10px] font-mono font-semibold text-slate-700">
                v2.6 Secure
              </Chip>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Enter official board credentials to access the legal case repository
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
              <span className="material-symbols-rounded text-sm text-rose-600">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Staff Officer ID / Username
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-rounded absolute left-3 text-slate-400 text-sm">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter staff login ID"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Secret Passcode
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-rounded absolute left-3 text-slate-400 text-sm">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <span className="material-symbols-rounded text-sm">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Demo Credentials Info */}
            <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-2.5 text-[11px] text-blue-900">
              <span className="font-bold">Pre-configured Demo Credentials:</span>
              <div className="mt-0.5 flex items-center justify-between text-[11px] font-mono text-blue-800">
                <span>Username: <b>admin</b></span>
                <span>Password: <b>1234</b></span>
              </div>
            </div>

            <Button
              type="submit"
              size="md"
              radius="sm"
              className="mt-2 w-full bg-[#0f2744] font-semibold text-white shadow-md hover:bg-[#163a66]"
              isLoading={isLoading}
              startContent={!isLoading && <span className="material-symbols-rounded text-sm">login</span>}
            >
              Sign In to Legal Portal
            </Button>
          </form>

          <div className="mt-6 text-center text-[10px] text-slate-400">
            Internal Legal Information System · Authorized Personnel Only
          </div>
        </div>
      </div>
    </div>
  );
}