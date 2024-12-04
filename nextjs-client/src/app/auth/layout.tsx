"use client";
import PageLoader from "@/components/PageLoader";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { loading } = useAuthGuard();
  return loading ? <PageLoader /> : children;
}
