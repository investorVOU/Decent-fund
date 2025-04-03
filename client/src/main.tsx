import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";

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

createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider activeChain={activeChain}>
    <App />
  </ThirdwebProvider>
);
