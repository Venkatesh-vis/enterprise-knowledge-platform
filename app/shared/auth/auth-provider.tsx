"use client";

import {useEffect,type ReactNode,} from "react";
import type {AuthSnapshot,} from "@/app/shared/lib/auth/types";
import {useAuthStore,} from "@/app/shared/store/auth-store";

type AuthProviderProps = {
  initialAuth: AuthSnapshot;
  children: ReactNode;
};

export function AuthProvider({
  initialAuth,
  children,
}: AuthProviderProps) {
  const setAuth = useAuthStore((state) => state.setAuth,);

  useEffect(() => {
    setAuth(initialAuth);
}, [initialAuth,setAuth,]);

  return children;
}