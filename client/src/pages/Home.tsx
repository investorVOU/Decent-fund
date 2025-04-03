import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAddress } from "@thirdweb-dev/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProposalCard from "@/components/ProposalCard";
import CreateProposalModal from "@/components/CreateProposalModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Proposal } from "@shared/schema";

export default function Home() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState("recent");
  
  const address = useAddress();
  const { toast } = useToast();
  
  const openCreateModal = () => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a proposal",
        variant: "destructive",
      });
      return;
    }
    
    setCreateModalOpen(true);
  };
  
  const { data: proposals, isLoading, error } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
  });
  
  const sortProposals = (proposals: Proposal[] | undefined) => {
    if (!proposals) return [];
    
    const proposalsCopy = [...proposals];
    
    switch (sortOption) {
      case "recent":
        return proposalsCopy.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "funded":
        return proposalsCopy.sort((a, b) => 
          b.raisedAmount - a.raisedAmount
        );
      case "ending":
        return proposalsCopy.sort((a, b) => 
          a.duration - b.duration
        );
      default:
        return proposalsCopy;
    }
  };
  
  const sortedProposals = sortProposals(proposals);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white font-roboto">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="py-12 mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Decentralized Funding for Community Projects</h1>
            <p className="text-xl text-gray-300 mb-8">Fund innovative ideas, vote on proposals, and engage with the community through blockchain technology</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium py-3 px-6 rounded-lg hover:brightness-125 transition-all"
              >
                Browse Projects
              </Button>
              <Button 
                className="bg-gray-800 text-white border border-purple-500 font-medium py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                onClick={openCreateModal}
              >
                Create Proposal
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <p className="text-purple-400 text-sm uppercase font-medium mb-2">Total Funded</p>
              <p className="text-3xl font-bold">
                {isLoading 
                  ? <Skeleton className="h-8 w-24 bg-gray-700 mx-auto" /> 
                  : `${proposals?.reduce((sum, p) => sum + p.raisedAmount, 0) || 0} METIS`
                }
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <p className="text-purple-400 text-sm uppercase font-medium mb-2">Active Proposals</p>
              <p className="text-3xl font-bold">
                {isLoading 
                  ? <Skeleton className="h-8 w-12 bg-gray-700 mx-auto" /> 
                  : proposals?.length || 0
                }
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <p className="text-purple-400 text-sm uppercase font-medium mb-2">Community Members</p>
              <p className="text-3xl font-bold">2,891</p>
            </div>
          </div>
        </section>

        {/* Proposals Section */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Active Proposals</h2>
            <div className="flex items-center space-x-2">
              <select 
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="funded">Most Funded</option>
                <option value="ending">Ending Soon</option>
              </select>
            </div>
          </div>

          {/* Proposal Grid */}
          {error ? (
            <div className="text-center py-10">
              <p className="text-lg text-red-400">Error loading proposals. Please try again later.</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg p-6">
                  <Skeleton className="h-8 w-3/4 bg-gray-700 mb-4" />
                  <Skeleton className="h-4 w-full bg-gray-700 mb-2" />
                  <Skeleton className="h-4 w-full bg-gray-700 mb-2" />
                  <Skeleton className="h-4 w-3/4 bg-gray-700 mb-6" />
                  <Skeleton className="h-2 w-full bg-gray-700 mb-6" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 w-full bg-gray-700" />
                    <Skeleton className="h-10 w-full bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
              
              {sortedProposals.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-lg text-gray-400">No proposals available. Be the first to create one!</p>
                  <Button 
                    className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    onClick={openCreateModal}
                  >
                    Create Proposal
                  </Button>
                </div>
              )}
            </>
          )}
          
          {sortedProposals.length > 0 && (
            <div className="mt-8 text-center">
              <Button className="bg-gray-800 text-white px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors">
                Load More Projects
              </Button>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
      
      <CreateProposalModal 
        open={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
      />
    </div>
  );
}
