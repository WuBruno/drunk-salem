import { type AppType } from "next/app";
import { api } from "@/utils/api";
import "@/styles/globals.css";
import RootLayout from "./components/Layout";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
};

export default api.withTRPC(MyApp);
