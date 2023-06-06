import Navbar from "./Navbar";
import { Toaster } from "./ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Toaster />
      {children}
    </>
  );
}
