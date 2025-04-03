import { useState } from "react";
import { useConnect, useAddress, useContract, useContractWrite } from "@thirdweb-dev/react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Interface matching our database schema
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

interface ProposalCardProps {
  proposal: Proposal;
  onVoteSuccess?: () => void;
}

export default function ProposalCard({ proposal, onVoteSuccess }: ProposalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(10); // Default stake amount
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [voteType, setVoteType] = useState<'for' | 'against' | null>(null);
  
  const { toast } = useToast();
  const address = useAddress();
  
  // For future implementation with actual staking contract
  // const { contract } = useContract("YOUR_STAKING_CONTRACT_ADDRESS");
  // const { mutateAsync: stake } = useContractWrite(contract, "stake");

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  const handleVoteClick = (type: 'for' | 'against') => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote using the button in the header",
        variant: "destructive",
      });
      
      return;
    }
    
    setVoteType(type);
    setVoteDialogOpen(true);
  };

  const submitVote = async () => {
    if (!address || !voteType || stakeAmount <= 0) return;
    
    setIsVoting(true);
    try {
      // For future implementation with actual staking contract
      // 1. First stake tokens in contract
      // await stake({ args: [proposal.id, stakeAmount] });
      
      // 2. Then record vote in database
      await apiRequest('/api/votes', {
        method: 'POST',
        body: JSON.stringify({
          proposalId: proposal.id,
          voterAddress: address,
          support: voteType === 'for',
          stakedAmount: stakeAmount
        })
      });
      
      toast({
        title: "Vote submitted",
        description: `You have successfully voted ${voteType} this proposal with ${stakeAmount} ETH`,
      });
      
      setVoteDialogOpen(false);
      
      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      toast({
        title: "Vote failed",
        description: error instanceof Error ? error.message : "Failed to submit your vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  // Calculate funding progress percentage
  const progressPercent = Math.min((proposal.raisedAmount / proposal.fundingGoal) * 100, 100);

  // Calculate days remaining
  const createdDate = new Date(proposal.createdAt);
  const endDate = new Date(createdDate);
  endDate.setDate(endDate.getDate() + proposal.duration);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isExpired = daysRemaining === 0;

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <div>
              <CardTitle className="text-xl font-bold text-white">{proposal.title}</CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                by {proposal.creatorAddress.substring(0, 6)}...{proposal.creatorAddress.substring(proposal.creatorAddress.length - 4)}
              </CardDescription>
            </div>
            <Badge className="bg-blue-600 hover:bg-blue-700">{proposal.category}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="space-y-4">
            <p className={`text-gray-300 ${expanded ? '' : 'line-clamp-3'}`}>
              {proposal.description}
            </p>
            
            {expanded && (
              <div className="pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Votes For</h4>
                    <p className="text-green-400">{proposal.votesFor}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Votes Against</h4>
                    <p className="text-red-400">{proposal.votesAgainst}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Tokens Staked</h4>
                    <p className="text-blue-400">{proposal.tokenStake} ETH</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Days Remaining</h4>
                    <p className={isExpired ? "text-red-400" : "text-gray-300"}>
                      {isExpired ? "Expired" : `${daysRemaining} days`}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-medium text-gray-400">Impact Score</h4>
                    <span className="text-blue-400 font-semibold">
                      {proposal.metisImpactScore.toFixed(1)}/10
                    </span>
                  </div>
                  <Progress 
                    value={proposal.metisImpactScore * 10} 
                    className="h-2 bg-gray-700" 
                  />
                  
                  {(proposal.energyEfficiency || proposal.communityBenefit || proposal.innovationFactor) && (
                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-400">
                      {proposal.energyEfficiency && (
                        <div className="text-center">
                          <span>Energy: {proposal.energyEfficiency}/10</span>
                        </div>
                      )}
                      {proposal.communityBenefit && (
                        <div className="text-center">
                          <span>Community: {proposal.communityBenefit}/10</span>
                        </div>
                      )}
                      {proposal.innovationFactor && (
                        <div className="text-center">
                          <span>Innovation: {proposal.innovationFactor}/10</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-400 hover:text-blue-300" 
              onClick={handleExpandToggle}
            >
              {expanded ? "Show Less" : "Show More"}
            </Button>
            
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium text-gray-400">Funding Progress</h4>
                <span className="text-gray-400 font-semibold">
                  {proposal.raisedAmount} / {proposal.fundingGoal} ETH
                </span>
              </div>
              <Progress 
                value={progressPercent} 
                className="h-2 bg-gray-700" 
              />
              <p className="text-right text-xs text-gray-500 mt-1">
                {progressPercent.toFixed(1)}% Complete
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-3">
          <Button 
            variant="outline" 
            className="border-red-600 text-red-500 hover:bg-red-900/20"
            onClick={() => handleVoteClick('against')}
            disabled={isExpired}
          >
            Vote Against
          </Button>
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleVoteClick('for')}
            disabled={isExpired}
          >
            Vote For
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Vote {voteType === 'for' ? 'For' : 'Against'}: {proposal.title}
            </DialogTitle>
            <DialogDescription>
              Stake your ETH tokens to vote on this proposal. Your tokens will be locked until the proposal is completed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Amount to Stake (ETH)</h4>
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Math.max(0.01, Number(e.target.value)))}
                min={0.01}
                step={0.01}
                placeholder="Enter amount to stake"
              />
              <p className="text-sm text-muted-foreground">
                Minimum stake: 0.01 ETH
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitVote} 
              disabled={isVoting || !stakeAmount || stakeAmount < 0.01}
              className={voteType === 'for' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isVoting ? 'Processing...' : `Stake & Vote ${voteType === 'for' ? 'For' : 'Against'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}