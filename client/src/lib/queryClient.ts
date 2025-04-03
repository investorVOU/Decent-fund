import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { withBaseUrl } from "./baseUrl";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  input: string | Request,
  init?: RequestInit
): Promise<T> {
  // If input is a string (URL) and init is undefined, it's a simple GET request
  // If input is a string and init has method, body, etc. then it's a POST/PUT/DELETE
  
  // Apply base URL if input is a string path
  const url = typeof input === 'string' ? withBaseUrl(input) : input;
  
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.headers || {}),
      ...(init?.body ? { "Content-Type": "application/json" } : {})
    }
  });

  await throwIfResNotOk(res);
  
  // Try to parse as JSON, fall back to text if it fails
  try {
    const contentType = res.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      return await res.json() as T;
    }
    
    return (await res.text()) as unknown as T;
  } catch (e) {
    return (await res.text()) as unknown as T;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Apply base URL to the query key (which should be the API path)
    const url = withBaseUrl(queryKey[0] as string);
    
    const res = await fetch(url, {
      credentials: "include",
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
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
