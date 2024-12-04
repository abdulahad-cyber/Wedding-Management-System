"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, User } from "../stores/authStore";
import api from "@/services/apiService";

export const useAuthGuard = () => {
  const setUser = useAuthStore((state) => state.setUser); ///loaded from localstorage by zustand
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const isAuthRoute = window.location.pathname.startsWith("/auth");
    const isAdminRoute = window.location.pathname.startsWith("/dashboard");
    (async () => {
      try {
        const response = await api.get("/users/me"); ///validate user from db
        const user: User = response.data;

        if (isAuthRoute) router.push("/");
        else if (isAdminRoute && !user.is_admin)
          router.push("/"); ///users cant access dashboard
        else if (!isAdminRoute && user.is_admin)
          router.push("/dashboard"); ///admins cant access home page /
        else {
          setUser(user);
          setLoading(false);
        }
      } catch {
        if (!isAuthRoute) router.push("/auth/login");
        else setLoading(false);
      }
    })();
  }, [setUser, router, setLoading]);

  return { loading }; // This hook doesn't need to return anything
};
