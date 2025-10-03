import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Converso",
  description: "Admin Panel for Converso Platform",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}
