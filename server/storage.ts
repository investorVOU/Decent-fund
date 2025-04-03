import { 
  users, type User, type InsertUser,
  proposals, type Proposal, type InsertProposal,
  votes, type Vote, type InsertVote 
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private proposals: Map<number, Proposal>;
  private votes: Map<number, Vote>;
  
  private currentUserId: number;
  private currentProposalId: number;
  private currentVoteId: number;

  constructor() {
    this.users = new Map();
    this.proposals = new Map();
    this.votes = new Map();
    
    this.currentUserId = 1;
    this.currentProposalId = 1;
    this.currentVoteId = 1;
    
    // Initialize with sample proposals
    this.initializeSampleProposals();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Proposal methods
  async getProposals(): Promise<Proposal[]> {
    return Array.from(this.proposals.values());
  }
  
  async getProposalById(id: number): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }
  
  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const id = this.currentProposalId++;
    const now = new Date();
    const proposal: Proposal = { 
      ...insertProposal, 
      id, 
      raisedAmount: 0, 
      createdAt: now 
    };
    this.proposals.set(id, proposal);
    return proposal;
  }
  
  async updateProposal(id: number, updatedFields: Partial<Proposal>): Promise<Proposal | undefined> {
    const proposal = this.proposals.get(id);
    if (!proposal) return undefined;
    
    const updatedProposal = { ...proposal, ...updatedFields };
    this.proposals.set(id, updatedProposal);
    return updatedProposal;
  }
  
  // Vote methods
  async getVotesByProposalId(proposalId: number): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(
      (vote) => vote.proposalId === proposalId
    );
  }
  
  async getVoteByAddressAndProposal(proposalId: number, voterAddress: string): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      (vote) => vote.proposalId === proposalId && vote.voterAddress === voterAddress
    );
  }
  
  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.currentVoteId++;
    const vote: Vote = { ...insertVote, id };
    this.votes.set(id, vote);
    return vote;
  }
  
  // Helper method to initialize with sample data
  private initializeSampleProposals() {
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
    
    // Add initial raised amounts
    this.createProposal(sampleProposals[0]).then(proposal => 
      this.updateProposal(proposal.id, { raisedAmount: 2450 })
    );
    this.createProposal(sampleProposals[1]).then(proposal => 
      this.updateProposal(proposal.id, { raisedAmount: 8340 })
    );
    this.createProposal(sampleProposals[2]).then(proposal => 
      this.updateProposal(proposal.id, { raisedAmount: 12230 })
    );
  }
}

export const storage = new MemStorage();
