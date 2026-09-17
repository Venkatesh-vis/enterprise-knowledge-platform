import axios from "axios";
import { redirect } from "next/navigation";

import { useAuthStore } from "@/app/shared/store/auth-store";

const api = axios.create({
  headers: {
    "Content-Type":
      "application/json",
  },
});

interface ApiRequestOptions {
  path: string;
  method?:
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";
  body?: unknown;
}

export async function apiRequest<T>({
  path,
  method = "GET",
  body,
}: ApiRequestOptions): Promise<T> {
  try {
    const response =
      await api.request<T>({
        url: path,
        method,
        data: body,
      });

    return response.data;
  } catch (error) {
    if (
      typeof window !==
        "undefined" &&
      axios.isAxiosError(error) &&
      error.response?.status ===
        401
    ) {
      useAuthStore
        .getState()
        .clearAuth();

      redirect("/login");
    }

    throw error;
  }
}