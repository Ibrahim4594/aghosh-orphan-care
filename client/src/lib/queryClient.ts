import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Admin session token storage - initialize from localStorage immediately
let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('admin-token') : null;

// Donor session token storage - initialize from localStorage immediately
let donorToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('donor-token') : null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('admin-token', token);
    } else {
      localStorage.removeItem('admin-token');
    }
  }
}

export function getAuthToken(): string | null {
  // Always check localStorage in case it was updated in another tab
  if (typeof window !== 'undefined' && !authToken) {
    authToken = localStorage.getItem('admin-token');
  }
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  localStorage.removeItem('admin-token');
}

// Donor token management
export function setDonorToken(token: string | null) {
  donorToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('donor-token', token);
    } else {
      localStorage.removeItem('donor-token');
    }
  }
}

export function getDonorToken(): string | null {
  // Always check localStorage in case it was updated in another tab
  if (typeof window !== 'undefined' && !donorToken) {
    donorToken = localStorage.getItem('donor-token');
  }
  return donorToken;
}

export function clearDonorToken() {
  donorToken = null;
  localStorage.removeItem('donor-token');
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// API request with donor token
export async function donorApiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const token = getDonorToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const headers: Record<string, string> = {};
      const token = getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(queryKey.join("/") as string, {
        credentials: "include",
        headers,
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: false,
    },
  },
});
