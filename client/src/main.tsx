import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Metis Goerli testnet chain config
const activeChain = {
  chainId: 599,
  rpc: ["https://goerli.gateway.metisdevops.link"],
  nativeCurrency: {
    decimals: 18,
    name: "Metis",
    symbol: "METIS",
  },
  shortName: "metis-goerli",
  slug: "metis-goerli",
  testnet: true,
  chain: "Metis Goerli",
  name: "Metis Goerli Testnet",
};

// You can get this key from your Thirdweb dashboard
// For now, using a placeholder - you'll need to replace this with your actual key
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "c406dd51cf4ec9a6d3d116658b18c8aa";

createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider 
    clientId={clientId}
    activeChain={activeChain}
    supportedChains={[activeChain]}
    queryClient={queryClient}
  >
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ThirdwebProvider>
);
