import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosinstance";
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
        const res = await axiosInstance.post("/auth/login", data);
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
    },
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
        const res = await axiosInstance.post("/auth/register", data);
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
    },
  });
}
