import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

import Header from "@/components/Header";
import ProposalCard from "@/components/ProposalCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Proposal {
  id: number;
  title: string;
  description: string;
  category: string;
  creatorAddress: string;
  fundingGoal: number;
  raisedAmount: number;
  votesFor: number;
  votesAgainst: number;
  duration: number;
  createdAt: string;
  approved: boolean;
  metisImpactScore: number;
  energyEfficiency?: number;
  communityBenefit?: number;
  innovationFactor?: number;
  tokenStake: number;
}

export default function Home() {
  // Fetch only approved proposals
  const { data: proposals, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/proposals', true],
    queryFn: async () => {
      return await apiRequest<Proposal[]>('/api/proposals?approved=true');
    }
  });

  const handleVoteSuccess = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header />
      
      <main className="container py-10">
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Funding the Future on Metis</h1>
            <p className="text-gray-400 mt-2">
              Support innovative projects building on the Metis L2 network
            </p>
          </div>
          
          <Link href="/submit">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Submit Proposal
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-lg border border-gray-800 p-4">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load proposals. Please try again later.
            </AlertDescription>
          </Alert>
        ) : proposals && proposals.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No Approved Proposals Yet</h2>
            <p className="text-gray-400 mb-6">
              Be the first to submit a proposal for funding!
            </p>
            <Link href="/submit">
              <Button size="lg">
                Create a Proposal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {proposals?.map(proposal => (
              <ProposalCard 
                key={proposal.id} 
                proposal={proposal} 
                onVoteSuccess={handleVoteSuccess}
              />
            ))}
          </div>
        )}
      </main>
      
      <footer className="border-t border-gray-800 py-6 mt-20">
        <div className="container flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>© 2025 MetisFund. All rights reserved.</p>
          
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="https://metisdao.org" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Metis DAO
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}