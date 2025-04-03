import { useState } from "react";
import { useAddress } from "@thirdweb-dev/react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Proposal } from "@shared/schema";

interface ProposalCardProps {
  proposal: Proposal;
}

export default function ProposalCard({ proposal }: ProposalCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const address = useAddress();
  const { toast } = useToast();
  
  const calculateProgress = () => {
    return (proposal.raisedAmount / proposal.fundingGoal) * 100;
  };
  
  const handleVote = async (support: boolean) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote on proposals",
        variant: "destructive",
      });
      return;
    }
    
    setIsVoting(true);
    
    try {
      await apiRequest("POST", "/api/votes", {
        proposalId: proposal.id,
        voterAddress: address,
        support,
      });
      
      // Invalidate proposals query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      
      setHasVoted(true);
      toast({
        title: "Vote submitted",
        description: `You have ${support ? "supported" : "declined"} this proposal.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Voting error:", error);
      toast({
        title: "Voting failed",
        description: error instanceof Error ? error.message : "An error occurred while voting",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02] duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold font-roboto">{proposal.title}</h3>
          <span className="bg-purple-800 text-white text-xs px-2 py-1 rounded-full">{proposal.category}</span>
        </div>
        <p className="text-gray-100 mb-4 font-roboto">{proposal.description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{proposal.raisedAmount} / {proposal.fundingGoal} METIS</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${Math.min(calculateProgress(), 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm mb-4">
          <div>
            <span className="text-gray-300">Created by</span>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-600 mr-2"></div>
              <span className="text-white">{proposal.creatorAddress}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-gray-300">Ends in</span>
            <p>{proposal.duration} days</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className={`flex-1 ${hasVoted ? 'bg-gray-600' : 'bg-green-500 hover:brightness-125'} text-white font-medium py-2 px-4 rounded-lg transition-all`}
            onClick={() => handleVote(true)}
            disabled={isVoting || hasVoted}
          >
            {isVoting ? "Processing..." : hasVoted ? "Supported" : "Support"}
          </button>
          <button 
            className={`flex-1 ${hasVoted ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'} text-white font-medium py-2 px-4 rounded-lg transition-colors`}
            onClick={() => handleVote(false)}
            disabled={isVoting || hasVoted}
          >
            {isVoting ? "Processing..." : hasVoted ? "Declined" : "Decline"}
          </button>
        </div>
      </div>
    </div>
  );
}
