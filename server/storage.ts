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
  getProposals(): Promise<Proposal[]>;
  getProposalById(id: number): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: number, proposal: Partial<Proposal>): Promise<Proposal | undefined>;
  
  // Vote operations
  getVotesByProposalId(proposalId: number): Promise<Vote[]>;
  getVoteByAddressAndProposal(proposalId: number, voterAddress: string): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
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
  async getProposals(): Promise<Proposal[]> {
    return await db.select().from(proposals);
  }
  
  async getProposalById(id: number): Promise<Proposal | undefined> {
    const result = await db.select().from(proposals).where(eq(proposals.id, id));
    return result[0];
  }
  
  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const now = new Date();
    const result = await db.insert(proposals).values({
      ...insertProposal,
      raisedAmount: 0,
      votesFor: 0,
      votesAgainst: 0,
      createdAt: now
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
      // Insert the vote
      const voteResult = await tx.insert(votes).values(insertVote).returning();
      const vote = voteResult[0];
      
      // Get the proposal
      const proposalResult = await tx.select().from(proposals).where(eq(proposals.id, vote.proposalId));
      const proposal = proposalResult[0];
      
      if (!proposal) {
        throw new Error(`Proposal with ID ${vote.proposalId} not found`);
      }
      
      // Update the proposal based on the vote
      if (vote.support) {
        await tx.update(proposals)
          .set({ 
            votesFor: (proposal.votesFor || 0) + 1,
            raisedAmount: (proposal.raisedAmount || 0) + 100 // Each positive vote contributes 100 METIS (for demo)
          })
          .where(eq(proposals.id, proposal.id));
      } else {
        await tx.update(proposals)
          .set({ votesAgainst: (proposal.votesAgainst || 0) + 1 })
          .where(eq(proposals.id, proposal.id));
      }
      
      return vote;
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
