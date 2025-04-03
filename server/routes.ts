import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProposalSchema, insertVoteSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all proposals (can filter for only approved ones)
  app.get("/api/proposals", async (req: Request, res: Response) => {
    try {
      const showOnlyApproved = req.query.approved === 'true';
      const proposals = await storage.getProposals(showOnlyApproved);
      res.json(proposals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposals", error: (error as Error).message });
    }
  });

  // Get proposal by ID
  app.get("/api/proposals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid proposal ID" });
      }

      const proposal = await storage.getProposalById(id);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      res.json(proposal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposal", error: (error as Error).message });
    }
  });

  // Create a new proposal
  app.post("/api/proposals", async (req: Request, res: Response) => {
    try {
      const result = insertProposalSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          message: "Invalid proposal data", 
          errors: validationError.message 
        });
      }
      
      const newProposal = await storage.createProposal(result.data);
      
      // Calculate Metis Impact Score if values are provided
      if (newProposal.energyEfficiency || newProposal.communityBenefit || newProposal.innovationFactor) {
        await storage.calculateMetisImpactScore(newProposal.id);
      }
      
      res.status(201).json(newProposal);
    } catch (error) {
      res.status(500).json({ message: "Failed to create proposal", error: (error as Error).message });
    }
  });

  // Approve or reject a proposal
  app.post("/api/proposals/approve", async (req: Request, res: Response) => {
    try {
      const approvalSchema = z.object({
        id: z.number(),
        approved: z.boolean()
      });
      
      const result = approvalSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          message: "Invalid approval data", 
          errors: validationError.message 
        });
      }
      
      const proposal = await storage.getProposalById(result.data.id);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      
      const updatedProposal = await storage.approveProposal(result.data.id, result.data.approved);
      res.json(updatedProposal);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve proposal", error: (error as Error).message });
    }
  });

  // Unlock tokens for a proposal when goal is met
  app.post("/api/proposals/:id/unlock-tokens", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid proposal ID" });
      }

      const proposal = await storage.getProposalById(id);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      
      await storage.unlockAllTokensForProposal(id);
      res.json({ message: "Tokens unlocked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlock tokens", error: (error as Error).message });
    }
  });

  // Get votes for a proposal
  app.get("/api/proposals/:id/votes", async (req: Request, res: Response) => {
    try {
      const proposalId = parseInt(req.params.id);
      if (isNaN(proposalId)) {
        return res.status(400).json({ message: "Invalid proposal ID" });
      }

      const votes = await storage.getVotesByProposalId(proposalId);
      res.json(votes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch votes", error: (error as Error).message });
    }
  });

  // Submit a vote with staked tokens
  app.post("/api/votes", async (req: Request, res: Response) => {
    try {
      const result = insertVoteSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          message: "Invalid vote data", 
          errors: validationError.message 
        });
      }
      
      // Check if proposal exists and is approved
      const proposal = await storage.getProposalById(result.data.proposalId);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      
      if (!proposal.approved) {
        return res.status(400).json({ message: "Cannot vote on unapproved proposals" });
      }
      
      // Check if user already voted
      const existingVote = await storage.getVoteByAddressAndProposal(
        result.data.proposalId, 
        result.data.voterAddress
      );
      
      if (existingVote) {
        return res.status(400).json({ message: "User already voted on this proposal" });
      }
      
      const newVote = await storage.createVote(result.data);
      
      res.status(201).json(newVote);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit vote", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
