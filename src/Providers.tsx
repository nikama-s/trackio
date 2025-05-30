"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient()); // ← Створюємо клієнт всередині useState

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
