import CreateProposalForm from "@/components/CreateProposalForm";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function SubmitProposal() {
  return (
    <div className="container py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Submit a Proposal</h1>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
      
      <div className="bg-gray-900/50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Guidelines for Successful Proposals</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Be specific about your project goals and timeline</li>
          <li>Explain how your project benefits the Metis ecosystem</li>
          <li>Provide realistic funding goals and resource requirements</li>
          <li>Detail how community funds will be utilized</li>
          <li>Highlight the eco-friendly aspects of your project</li>
        </ul>
      </div>
      
      <CreateProposalForm />
    </div>
  );
}