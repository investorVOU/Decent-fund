import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

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
  energyEfficiency: number;
  communityBenefit: number;
  innovationFactor: number;
  tokenStake: number;
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedProposal, setExpandedProposal] = useState<number | null>(null);

  // Get all proposals (including unapproved ones)
  const { data: proposals, isLoading, error } = useQuery({
    queryKey: ['/api/proposals'],
    queryFn: async () => {
      return await apiRequest<Proposal[]>('/api/proposals');
    }
  });

  // Mutation for approving/rejecting proposals
  const mutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number, approved: boolean }) => {
      return apiRequest('/api/proposals/approve', {
        method: 'POST',
        body: JSON.stringify({ id, approved })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
      toast({
        title: "Success",
        description: "Proposal status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update proposal status",
        variant: "destructive"
      });
    }
  });

  const handleApproval = (id: number, approved: boolean) => {
    mutation.mutate({ id, approved });
  };

  const toggleExpandProposal = (id: number) => {
    setExpandedProposal(expandedProposal === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="container py-10 space-y-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle>Error Loading Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load proposals. Please try again later.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/proposals'] })}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Manage Proposals</h2>
        
        {proposals && proposals.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <p className="text-muted-foreground">No proposals to review at this time.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {proposals?.map(proposal => (
              <Card key={proposal.id} className={`${proposal.approved ? 'border-green-500/50' : 'border-yellow-500/50'}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{proposal.title}</CardTitle>
                      <CardDescription>Created by {proposal.creatorAddress.substring(0, 8)}...</CardDescription>
                    </div>
                    <Badge variant="outline" className={proposal.approved ? "bg-green-500/20 text-green-500 border-green-500" : ""}>
                      {proposal.approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <p className={expandedProposal === proposal.id ? "" : "line-clamp-2"}>
                      {proposal.description}
                    </p>
                    
                    {expandedProposal === proposal.id && (
                      <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm">Category</h4>
                            <p>{proposal.category}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Funding Goal</h4>
                            <p>{proposal.fundingGoal} METIS</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Duration</h4>
                            <p>{proposal.duration} days</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Created At</h4>
                            <p>{new Date(proposal.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <h4 className="font-medium text-sm mb-2">Metis Impact Score: {proposal.metisImpactScore.toFixed(1)}/10</h4>
                          <Progress value={proposal.metisImpactScore * 10} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 pt-2">
                          <div>
                            <h4 className="font-medium text-sm">Energy Efficiency</h4>
                            <p>{proposal.energyEfficiency}/10</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Community Benefit</h4>
                            <p>{proposal.communityBenefit}/10</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Innovation Factor</h4>
                            <p>{proposal.innovationFactor}/10</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="link" 
                      className="p-0 h-auto" 
                      onClick={() => toggleExpandProposal(proposal.id)}
                    >
                      {expandedProposal === proposal.id ? "Show Less" : "Show More"}
                    </Button>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end space-x-2">
                  {proposal.approved ? (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleApproval(proposal.id, false)}
                      disabled={mutation.isPending}
                    >
                      Reject
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => handleApproval(proposal.id, false)}
                        disabled={mutation.isPending}
                      >
                        Reject
                      </Button>
                      <Button 
                        variant="default" 
                        onClick={() => handleApproval(proposal.id, true)}
                        disabled={mutation.isPending}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}