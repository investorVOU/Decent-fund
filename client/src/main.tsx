import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Sepolia } from "@thirdweb-dev/chains";

// We're now using Sepolia testnet
const infuraProjectId = import.meta.env.INFURA_PROJECT_ID;

// Create a custom Sepolia configuration with our Infura RPC
const sepoliaWithInfura = {
  ...Sepolia,
  // Override the RPC URLs with our Infura endpoint first in the list
  rpc: infuraProjectId 
    ? [`https://sepolia.infura.io/v3/${infuraProjectId}`, ...(Sepolia.rpc || [])]
    : Sepolia.rpc
};

console.log("Using Sepolia testnet configuration");
const activeChain = sepoliaWithInfura;

// You can get this key from your Thirdweb dashboard
// For now, using a placeholder - you'll need to replace this with your actual key
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "c406dd51cf4ec9a6d3d116658b18c8aa";

createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider 
    clientId={clientId}
    activeChain={activeChain}
    supportedChains={[activeChain]}
  >
    <App />
  </ThirdwebProvider>
);
