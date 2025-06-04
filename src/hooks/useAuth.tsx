import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

type AuthResponse = {
  user: {
    email: string;
    id: string;
  };
};

type ErrorResponse = {
  errors?: Record<string, string[]>;
  error?: string;
};

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<
    AuthResponse,
    ErrorResponse,
    { email: string; password: string }
  >({
    mutationFn: async (data) => {
      try {
        const res = await api.post("/api/auth/login", data);
        return res.data;
      } catch (err: unknown) {
        const axiosError = err as AxiosError<ErrorResponse>;

        if (axiosError.response?.data) {
          throw axiosError.response.data;
        }

        throw { error: "Unknown error" };
      }
    },
    onSuccess: (data) => {
      if (data?.user) {
        setUser(data.user);
        router.push("/");
      }
    }
  });
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation<
    AuthResponse,
    ErrorResponse,
    { email: string; password: string; confirmPassword: string }
  >({
    mutationFn: async (data) => {
      try {
        const res = await api.post("/api/auth/register", data);
        return res.data;
      } catch (err: unknown) {
        const axiosError = err as AxiosError<ErrorResponse>;

        if (axiosError.response?.data) {
          throw axiosError.response.data;
        }

        throw { error: "Unknown error" };
      }
    },
    onSuccess: (data) => {
      if (data?.user) {
        setUser(data.user);
        router.push("/");
      }
    }
  });
}

export function useLogout() {
  const clearUser = useAuthStore((s) => s.clearUser);
  const router = useRouter();

  return useMutation<void, ErrorResponse>({
    mutationFn: async () => {
      await api.post("/api/auth/logout");
    },
    onSuccess: () => {
      clearUser();
      router.push("/auth/login");
    },
    onError: (err) => {
      console.error(err);
    }
  });
}
