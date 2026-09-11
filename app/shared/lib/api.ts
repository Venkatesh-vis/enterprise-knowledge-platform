import axios from "axios";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

interface ApiRequestOptions {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function apiRequest<T>({
  path,
  method = "GET",
  body,
}: ApiRequestOptions): Promise<T> {
  const response = await api.request<T>({
    url: path,
    method,
    data: body,
  });

  return response.data;
}