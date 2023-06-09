import Head from "next/head";
import Navbar from "./Navbar";
import { Toaster } from "./ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Head>
        <title>Drunk Mafia</title>
        <meta name="description" content="Drunk Salem Game" />
      </Head>
      <Navbar />
      <Toaster />
      <main className="flex min-h-screen flex-col items-center">
        {children}
      </main>
    </>
  );
}
