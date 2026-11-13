import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Technical Communication & Writing Notes - Academic Portal",
  description: "Course syllabus, lecture modules, and reference materials for engineering communication.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-slate-200 selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
