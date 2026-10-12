"use client";

import React, { useState } from "react";
import { Card, CardBody, Input, Button } from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  forgotPasswordThunk,
  resetPasswordThunk,
  clearRecoveryState,
} from "@/store/slices/authSlice";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isRecoveryLoading, recoveryMaskedEmail } = useAppSelector(
    (state) => state.auth
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Step 1: Request 6-digit OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId) {
      toast.error("Please enter your Username, Email, or Mobile");
      return;
    }

    try {
      const res = await dispatch(forgotPasswordThunk(cleanId)).unwrap();
      toast.success(res.message || "Verification code dispatched!");
      setStep(2);
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to dispatch verification code");
    }
  };

  // Step 2: Verify OTP & Commit New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      toast.error("Please provide the complete 6-digit OTP");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must contain at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await dispatch(
        resetPasswordThunk({
          identifier: identifier.trim(),
          otp: cleanOtp,
          newPassword,
        })
      ).unwrap();

      toast.success(res.message || "Password updated successfully!", {
        duration: 4000,
      });

      dispatch(clearRecoveryState());
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to reset password");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4 font-sans text-slate-800">
      <Card shadow="sm" className="w-full max-w-md border border-slate-200 bg-white">
        <CardBody className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-base font-extrabold text-[#0f2744] uppercase tracking-wider">
              UPPRPB Legal Secretariat
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Official Credential Recovery System (WCMS)
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your Secretariat User ID, official Email, or registered Mobile number to receive a secure 6-digit verification code.
              </p>

              <Input
                size="sm"
                label="Login ID / Email / Mobile"
                labelPlacement="outside"
                placeholder="e.g. oic or codeaurerror@gmail.com"
                value={identifier}
                onValueChange={setIdentifier}
                className="bg-white"
                isRequired
              />

              <Button
                type="submit"
                size="sm"
                radius="sm"
                className="w-full bg-[#0f2744] font-semibold text-white shadow hover:bg-[#163a66] mt-2"
                isLoading={isRecoveryLoading}
              >
                Dispatch Security OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                Verification code dispatched to:{" "}
                <strong className="font-mono text-slate-900">
                  {recoveryMaskedEmail || identifier}
                </strong>
                . Code expires in 10 minutes.
              </div>

              <Input
                size="sm"
                label="6-Digit Verification OTP"
                labelPlacement="outside"
                placeholder="e.g. 849201"
                value={otp}
                onValueChange={setOtp}
                maxLength={6}
                className="font-mono"
                isRequired
              />

              <Input
                size="sm"
                type="password"
                label="New Password"
                labelPlacement="outside"
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onValueChange={setNewPassword}
                isRequired
              />

              <Input
                size="sm"
                type="password"
                label="Confirm New Password"
                labelPlacement="outside"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                isRequired
              />

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="bordered"
                  radius="sm"
                  onClick={() => setStep(1)}
                  disabled={isRecoveryLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  radius="sm"
                  className="flex-1 bg-emerald-700 font-semibold text-white hover:bg-emerald-800"
                  isLoading={isRecoveryLoading}
                >
                  Commit New Password
                </Button>
              </div>
            </form>
          )}

          <div className="text-center mt-6 border-t border-slate-100 pt-4">
            <Link
              href="/"
              onClick={() => dispatch(clearRecoveryState())}
              className="text-xs font-semibold text-[#0f2744] hover:underline"
            >
              ← Back to Portal Entry
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}