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
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "placeholder_client_id";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThirdwebProvider 
      clientId={clientId}
      activeChain={activeChain}
      supportedChains={[activeChain]}
    >
      <App />
    </ThirdwebProvider>
  </QueryClientProvider>
);
