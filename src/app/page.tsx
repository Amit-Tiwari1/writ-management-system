"use client";

import React, { useState, useEffect } from "react";
import { Button, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginThunk, clearAuthError } from "@/store/slices/authSlice";
import { loginSchema, LoginFormData } from "@/schemas/authSchema";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData) => {
    dispatch(clearAuthError());
    const resultAction = await dispatch(loginThunk(data));

    if (loginThunk.fulfilled.match(resultAction)) {
      const officer = resultAction.payload.user;
      toast.success(`Access Authorized: Welcome, ${officer.name || "Officer"}!`, {
        icon: "🛡️",
      });
      router.replace("/admin");
    } else {
      const errorMsg =
        (resultAction.payload as string) || "Invalid credentials or unauthorized account.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#071322] p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-600/15 blur-[100px] md:h-[450px] md:w-[450px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-600/15 blur-[100px] md:h-[450px] md:w-[450px]" />

      <div className="relative z-10 grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/95 shadow-2xl backdrop-blur-xl md:grid-cols-12 max-h-[92vh]">
        <div className="relative flex flex-col justify-between border-b border-slate-800 bg-gradient-to-br from-[#0f2744] to-[#071322] p-6 sm:p-8 md:col-span-5 md:border-b-0 md:border-r">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 p-1.5 ring-1 ring-white/20 shadow-md">
                {!logoError ? (
                  <img
                    src="https://uppbpb.gov.in/Content/images/LOGO.bmp"
                    alt="UPPRPB Official Emblem"
                    className="h-full w-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="material-symbols-rounded text-2xl text-blue-400">gavel</span>
                )}
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                  UPPRPB WCMS
                </h1>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                  Apex Legal Registry Portal
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h2 className="text-lg font-bold leading-snug text-white sm:text-xl">
                Writ & Compliance Management System
              </h2>
              <p className="text-xs leading-relaxed text-slate-300 line-clamp-4 sm:line-clamp-none">
                Official secretariat case ledger for the Uttar Pradesh Police Recruitment and
                Promotion Board. Tracking High Court petitions, stay orders, green-sheet notings,
                and time-bound compliance radar.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Judicial Gateway</span>
              <Chip size="sm" color="success" variant="flat" className="h-5 text-[10px] font-bold">
                Online (180ms)
              </Chip>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="material-symbols-rounded text-sm text-emerald-400">verified</span>
              <span>SHA-256 Tamper-Evident Ledger Active</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-white p-6 sm:p-8 md:col-span-7 md:p-10">
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Officer Secure Access</h2>
              <Chip size="sm" className="bg-slate-100 text-[10px] font-mono font-semibold text-slate-700">
                v2.0 Production
              </Chip>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Enter official board credentials to access the legal case repository
            </p>
          </div>

          {/* Backend Error Alert */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
              <span className="material-symbols-rounded text-sm text-rose-600">error</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Officer ID / Mobile Number / Official Email
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-rounded absolute left-3 text-slate-400 text-sm">
                  badge
                </span>
                <input
                  type="text"
                  autoComplete="username"
                  {...register("username")}
                  placeholder="e.g. admin or 9454400100 or admin@legalboard.in"
                  className={`w-full rounded-lg border bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:bg-white focus:ring-1 ${
                    errors.username
                      ? "border-rose-400 focus:border-rose-600 focus:ring-rose-600"
                      : "border-slate-200 focus:border-blue-600 focus:ring-blue-600"
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {errors.username.message}
                </p>
              )}
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
                  autoComplete="current-password"
                  {...register("password")}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border bg-slate-50 py-2.5 pl-9 pr-10 text-xs text-slate-900 outline-none transition focus:bg-white focus:ring-1 ${
                    errors.password
                      ? "border-rose-400 focus:border-rose-600 focus:ring-rose-600"
                      : "border-slate-200 focus:border-blue-600 focus:ring-blue-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-rounded text-sm">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="md"
              radius="sm"
              className="mt-3 w-full bg-[#0f2744] font-semibold text-white shadow-md transition-all hover:bg-[#163a66] disabled:opacity-70"
              isLoading={isLoading || isSubmitting}
              startContent={
                !isLoading &&
                !isSubmitting && <span className="material-symbols-rounded text-sm">login</span>
              }
            >
              Sign In to Legal Portal
            </Button>
          </form>

          <div className="mt-6 text-center text-[10px] text-slate-400">
            Internal Legal Information System · Authorized UPPRPB Personnel Only
          </div>
        </div>
      </div>
    </div>
  );
}