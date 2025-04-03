import { ConnectWallet } from "@thirdweb-dev/react";
import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gray-900 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-10 h-10 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">FundChain</span>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex space-x-6 mx-4 flex-grow justify-center">
          <Link href="/" className="text-white hover:text-purple-300 transition-colors px-2">Explore</Link>
          <Link href="#" className="text-white hover:text-purple-300 transition-colors px-2">How It Works</Link>
          <Link href="#" className="text-white hover:text-purple-300 transition-colors px-2">About</Link>
        </nav>

        {/* Connect Wallet Button - Always visible */}
        <div className="flex items-center">
          <ConnectWallet 
            btnTitle="Connect Wallet"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          />
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-300 hover:text-white focus:outline-none focus:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 pb-4 px-4">
          <nav className="flex flex-col space-y-3">
            <Link href="/" className="text-white hover:text-purple-300 transition-colors py-2">Explore</Link>
            <Link href="#" className="text-white hover:text-purple-300 transition-colors py-2">How It Works</Link>
            <Link href="#" className="text-white hover:text-purple-300 transition-colors py-2">About</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
