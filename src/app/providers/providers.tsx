"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMeThunk } from "@/store/slices/authSlice";
import { fetchIntakeDropdowns } from "@/store/slices/mastersSlice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMeThunk());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("[LexWrit Masters] Pre-fetching master dropdown bundle...");
      dispatch(fetchIntakeDropdowns());
    }
  }, [isAuthenticated, dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <Provider store={store}>
      <NextUIProvider navigate={router.push}>
        <AuthInitializer>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#0f172a",
                color: "#f8fafc",
                fontSize: "12px",
                fontWeight: "500",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              },
            }}
          />
          {children}
        </AuthInitializer>
      </NextUIProvider>
    </Provider>
  );
}