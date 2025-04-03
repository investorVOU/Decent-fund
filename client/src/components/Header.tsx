import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const address = useAddress();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6 lg:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              DecentraFund
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                className="text-sm font-medium"
              >
                Browse
              </Button>
            </Link>
            <Link href="/submit">
              <Button
                variant={isActive("/submit") ? "default" : "ghost"}
                className="text-sm font-medium"
              >
                Submit Proposal
              </Button>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ConnectWallet
            theme="dark"
            btnTitle="Connect Wallet"
            modalTitle="Choose your wallet"
            modalSize="wide"
            welcomeScreen={{
              title: "DecentraFund Dapp",
              subtitle: "Connect your wallet to participate in funding proposals",
              img: {
                src: "https://ethereum.org/static/4f10d2777b2d14759feb01c65b2765f7/b7d3e/eth-glyph-colored.png",
                width: 150,
                height: 150,
              },
            }}
            modalTitleIconUrl="https://ethereum.org/static/4f10d2777b2d14759feb01c65b2765f7/b7d3e/eth-glyph-colored.png"
          />
          
          <div className="block md:hidden">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
            
            {mobileMenuOpen && (
              <div className="absolute top-16 right-0 w-full bg-gray-900 border-b border-gray-800 p-4 z-20">
                <div className="flex flex-col gap-2">
                  <Link href="/">
                    <Button
                      variant={isActive("/") ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Browse
                    </Button>
                  </Link>
                  <Link href="/submit">
                    <Button
                      variant={isActive("/submit") ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Submit Proposal
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}