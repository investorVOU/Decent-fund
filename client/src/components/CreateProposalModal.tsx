import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertProposalSchema } from "@shared/schema";
import { z } from "zod";
import { useAddress } from "@thirdweb-dev/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateProposalModalProps {
  open: boolean;
  onClose: () => void;
}

// Extend the insert schema with additional validation
const formSchema = insertProposalSchema.extend({
  fundingGoal: z.coerce.number().min(1, "Funding goal must be at least 1 METIS"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day").max(60, "Duration cannot exceed 60 days"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateProposalModal({ open, onClose }: CreateProposalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const address = useAddress();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      fundingGoal: 1000,
      duration: 30,
      creatorAddress: address || "",
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a proposal",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/proposals", {
        ...values,
        creatorAddress: address,
      });
      
      // Invalidate proposals query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      
      toast({
        title: "Proposal created",
        description: "Your proposal has been successfully created.",
        variant: "default",
      });
      
      // Close modal and reset form
      onClose();
      form.reset();
    } catch (error) {
      console.error("Proposal creation error:", error);
      toast({
        title: "Proposal creation failed",
        description: error instanceof Error ? error.message : "An error occurred while creating the proposal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Proposal</DialogTitle>
          <DialogDescription className="text-gray-400">
            Fill out the form below to create a new funding proposal.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Project Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter project title" 
                      className="bg-gray-700 border-gray-600 text-white" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="Art & Culture">Art & Culture</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="DeFi">DeFi</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your project" 
                      className="bg-gray-700 border-gray-600 text-white" 
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fundingGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Funding Goal (METIS)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      placeholder="Enter amount" 
                      className="bg-gray-700 border-gray-600 text-white" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Duration (days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min={1}
                      max={60}
                      placeholder="Enter duration in days" 
                      className="bg-gray-700 border-gray-600 text-white" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:brightness-125 transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Proposal"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
