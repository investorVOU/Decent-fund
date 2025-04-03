import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Proposal schema
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  creatorAddress: text("creator_address").notNull(),
  fundingGoal: integer("funding_goal").notNull(),
  raisedAmount: integer("raised_amount").default(0),
  votesFor: integer("votes_for").default(0),
  votesAgainst: integer("votes_against").default(0),
  duration: integer("duration").notNull(), // in days
  createdAt: timestamp("created_at").defaultNow(),
  // New fields
  approved: boolean("approved").default(false),
  metisImpactScore: real("metis_impact_score").default(0),
  energyEfficiency: integer("energy_efficiency").default(0), // 1-10 score
  communityBenefit: integer("community_benefit").default(0), // 1-10 score
  innovationFactor: integer("innovation_factor").default(0), // 1-10 score
  tokenStake: integer("token_stake").default(0), // Total tokens staked
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  raisedAmount: true,
  votesFor: true,
  votesAgainst: true,
  createdAt: true,
  approved: true,
  metisImpactScore: true,
  tokenStake: true,
});

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

// Vote schema
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull(),
  voterAddress: text("voter_address").notNull(),
  support: boolean("support").notNull(), // true for support, false for decline
  stakedAmount: integer("staked_amount").default(0), // Amount of tokens staked
  locked: boolean("locked").default(true), // Whether tokens are locked
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  locked: true,
}).extend({
  stakedAmount: z.number().min(1, "Must stake at least 1 token")
});

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
