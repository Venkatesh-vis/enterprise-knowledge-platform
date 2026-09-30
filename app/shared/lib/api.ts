import axios from "axios";
import { redirect } from "next/navigation";

import { useAuthStore } from "@/app/shared/store/auth-store";

const api = axios.create({
  withCredentials: true,
});

type ApiRequestOptions = {
  path: string;
  method?:
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";
  body?: unknown;
};

export async function apiRequest<T>({
  path,
  method = "GET",
  body,
}: ApiRequestOptions): Promise<T> {
  try {
    const isFormData =
      typeof FormData !== "undefined" &&
      body instanceof FormData;

    const response = await api.request<T>({
      url: path,
      method,
      data: body,
      headers: isFormData
        ? undefined
        : {
            "Content-Type": "application/json",
          },
    });

    return response.data;
  } catch (error) {
    if (
      typeof window !== "undefined" &&
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      useAuthStore.getState().clearAuth();
      redirect("/login");
    }

    // Preserve the original Axios error so callers can inspect the
    // server status and response body instead of receiving a generic Error.
    throw error;
  }
}
