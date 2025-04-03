import { 
  users, type User, type InsertUser,
  proposals, type Proposal, type InsertProposal,
  votes, type Vote, type InsertVote 
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Proposal operations
  getProposals(filterApproved?: boolean): Promise<Proposal[]>;
  getProposalById(id: number): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: number, proposal: Partial<Proposal>): Promise<Proposal | undefined>;
  approveProposal(id: number, approved: boolean): Promise<Proposal | undefined>;
  calculateMetisImpactScore(id: number): Promise<number>;
  
  // Vote operations
  getVotesByProposalId(proposalId: number): Promise<Vote[]>;
  getVoteByAddressAndProposal(proposalId: number, voterAddress: string): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  unlockTokens(proposalId: number, voterAddress: string): Promise<void>;
  unlockAllTokensForProposal(proposalId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize sample data if needed
    this.initializeSampleData().catch(err => {
      console.error("Failed to initialize sample data:", err);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Proposal methods
  async getProposals(filterApproved: boolean = false): Promise<Proposal[]> {
    if (filterApproved) {
      return await db.select().from(proposals).where(eq(proposals.approved, true));
    }
    return await db.select().from(proposals);
  }
  
  async getProposalById(id: number): Promise<Proposal | undefined> {
    const result = await db.select().from(proposals).where(eq(proposals.id, id));
    return result[0];
  }
  
  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const now = new Date();
    
    // Calculate initial Metis Impact Score if provided
    const energyEfficiency = insertProposal.energyEfficiency || 0;
    const communityBenefit = insertProposal.communityBenefit || 0;
    const innovationFactor = insertProposal.innovationFactor || 0;
    
    // Calculate the score (weighted average)
    const metisImpactScore = energyEfficiency > 0 || communityBenefit > 0 || innovationFactor > 0 
      ? (energyEfficiency * 0.4 + communityBenefit * 0.4 + innovationFactor * 0.2) 
      : 0;
    
    const result = await db.insert(proposals).values({
      ...insertProposal,
      raisedAmount: 0,
      votesFor: 0,
      votesAgainst: 0,
      createdAt: now,
      approved: false,
      metisImpactScore,
      tokenStake: 0
    }).returning();
    
    return result[0];
  }
  
  async updateProposal(id: number, updatedFields: Partial<Proposal>): Promise<Proposal | undefined> {
    const result = await db.update(proposals)
      .set(updatedFields)
      .where(eq(proposals.id, id))
      .returning();
    return result[0];
  }
  
  async approveProposal(id: number, approved: boolean): Promise<Proposal | undefined> {
    const result = await db.update(proposals)
      .set({ approved })
      .where(eq(proposals.id, id))
      .returning();
    return result[0];
  }
  
  async calculateMetisImpactScore(id: number): Promise<number> {
    const proposal = await this.getProposalById(id);
    if (!proposal) {
      throw new Error(`Proposal with ID ${id} not found`);
    }
    
    // Calculate the score (weighted average)
    const energyEfficiency = proposal.energyEfficiency || 0;
    const communityBenefit = proposal.communityBenefit || 0;
    const innovationFactor = proposal.innovationFactor || 0;
    
    const metisImpactScore = (energyEfficiency * 0.4 + communityBenefit * 0.4 + innovationFactor * 0.2);
    
    // Update the score in the database
    await this.updateProposal(id, { metisImpactScore });
    
    return metisImpactScore;
  }
  
  // Vote methods
  async getVotesByProposalId(proposalId: number): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.proposalId, proposalId));
  }
  
  async getVoteByAddressAndProposal(proposalId: number, voterAddress: string): Promise<Vote | undefined> {
    const result = await db.select().from(votes).where(
      and(
        eq(votes.proposalId, proposalId),
        eq(votes.voterAddress, voterAddress)
      )
    );
    return result[0];
  }
  
  async createVote(insertVote: InsertVote): Promise<Vote> {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Insert the vote with tokens staked
      const voteResult = await tx.insert(votes).values({
        ...insertVote,
        locked: true
      }).returning();
      const vote = voteResult[0];
      
      // Get the proposal
      const proposalResult = await tx.select().from(proposals).where(eq(proposals.id, vote.proposalId));
      const proposal = proposalResult[0];
      
      if (!proposal) {
        throw new Error(`Proposal with ID ${vote.proposalId} not found`);
      }
      
      // Update the proposal based on the vote
      const stakedAmount = vote.stakedAmount || 0;
      
      if (vote.support) {
        await tx.update(proposals)
          .set({ 
            votesFor: (proposal.votesFor || 0) + 1,
            raisedAmount: (proposal.raisedAmount || 0) + stakedAmount, // Add staked amount to raised amount
            tokenStake: (proposal.tokenStake || 0) + stakedAmount // Track total staked tokens
          })
          .where(eq(proposals.id, proposal.id));
      } else {
        await tx.update(proposals)
          .set({ 
            votesAgainst: (proposal.votesAgainst || 0) + 1,
            tokenStake: (proposal.tokenStake || 0) + stakedAmount // Track total staked tokens
          })
          .where(eq(proposals.id, proposal.id));
      }
      
      return vote;
    });
  }
  
  async unlockTokens(proposalId: number, voterAddress: string): Promise<void> {
    await db.transaction(async (tx) => {
      const voteResult = await tx.update(votes)
        .set({ locked: false })
        .where(
          and(
            eq(votes.proposalId, proposalId),
            eq(votes.voterAddress, voterAddress)
          )
        )
        .returning();
      
      if (voteResult.length === 0) {
        throw new Error(`No vote found for proposal ${proposalId} from address ${voterAddress}`);
      }
    });
  }
  
  async unlockAllTokensForProposal(proposalId: number): Promise<void> {
    await db.transaction(async (tx) => {
      // Get the proposal to check if funding goal is met
      const proposalResult = await tx.select().from(proposals).where(eq(proposals.id, proposalId));
      const proposal = proposalResult[0];
      
      if (!proposal) {
        throw new Error(`Proposal with ID ${proposalId} not found`);
      }
      
      const raisedAmount = proposal.raisedAmount || 0;
      const fundingGoal = proposal.fundingGoal || 0;
      
      // Check if proposal succeeded (raisedAmount >= fundingGoal)
      if (raisedAmount >= fundingGoal) {
        // Only unlock supporting votes tokens if goal is met
        await tx.update(votes)
          .set({ locked: false })
          .where(
            and(
              eq(votes.proposalId, proposalId),
              eq(votes.support, true)
            )
          );
      } else {
        // Unlock all votes tokens if goal is not met
        await tx.update(votes)
          .set({ locked: false })
          .where(eq(votes.proposalId, proposalId));
      }
    });
  }
  
  // Helper method to initialize with sample data
  async initializeSampleData() {
    try {
      const existingProposals = await db.select().from(proposals);
      
      // Only initialize if there are no proposals
      if (existingProposals.length === 0) {
        console.log("Initializing sample data...");
        
        const sampleProposals: InsertProposal[] = [
          {
            title: "Metaverse Art Gallery",
            description: "A virtual gallery to showcase NFT artwork from emerging artists in an immersive environment.",
            category: "Art & Culture",
            creatorAddress: "0x7fe3...4c21",
            fundingGoal: 5000,
            duration: 14
          },
          {
            title: "DeFi Education Platform",
            description: "Interactive learning platform to help newcomers understand blockchain technology and DeFi protocols.",
            category: "Education",
            creatorAddress: "0x3ab1...9e57",
            fundingGoal: 10000,
            duration: 3
          },
          {
            title: "Carbon Offset DAO",
            description: "Decentralized organization focused on funding verified carbon offset projects worldwide.",
            category: "Environment",
            creatorAddress: "0xc4d2...1f88",
            fundingGoal: 25000,
            duration: 21
          }
        ];
        
        // Add sample proposals with initial raised amounts
        const proposal1 = await this.createProposal(sampleProposals[0]);
        await this.updateProposal(proposal1.id, { raisedAmount: 2450 });
        
        const proposal2 = await this.createProposal(sampleProposals[1]);
        await this.updateProposal(proposal2.id, { raisedAmount: 8340 });
        
        const proposal3 = await this.createProposal(sampleProposals[2]);
        await this.updateProposal(proposal3.id, { raisedAmount: 12230 });
        
        console.log("Sample data initialized successfully");
      } else {
        console.log("Database already contains data, skipping initialization");
      }
    } catch (error) {
      console.error("Error initializing sample data:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
