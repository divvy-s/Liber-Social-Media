import "@/app/globals.css";
import type { AppProps } from "next/app";
import { Web3Provider } from "@/components/web3-provider";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <Component {...pageProps} />
    </Web3Provider>
  );
} 