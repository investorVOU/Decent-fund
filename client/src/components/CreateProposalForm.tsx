import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useConnect, useAddress } from "@thirdweb-dev/react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(2, "Please select a valid category"),
  fundingGoal: z.number().min(100, "Funding goal must be at least 100 METIS"),
  duration: z.number().min(1, "Duration must be at least 1 day").max(180, "Duration cannot exceed 180 days"),
  energyEfficiency: z.number().min(1, "Energy Efficiency score must be at least 1").max(10, "Energy Efficiency score cannot exceed 10"),
  communityBenefit: z.number().min(1, "Community Benefit score must be at least 1").max(10, "Community Benefit score cannot exceed 10"),
  innovationFactor: z.number().min(1, "Innovation Factor score must be at least 1").max(10, "Innovation Factor score cannot exceed 10"),
});

type FormValues = z.infer<typeof formSchema>;

const CreateProposalForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const address = useAddress();
  // Cast useConnect with any for compatibility with ThirdWeb version
  const { connect, connectors } = useConnect() as any;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Technology",
      fundingGoal: 1000,
      duration: 30,
      energyEfficiency: 5,
      communityBenefit: 5,
      innovationFactor: 5,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a proposal",
        variant: "destructive",
      });
      
      // Connect wallet if MetaMask is available
      const metaMaskConnector = connectors.find((c: any) => c.id === "metaMask" || c.id === "injected");
      if (metaMaskConnector) {
        connect({ connector: metaMaskConnector });
      }
      
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('/api/proposals', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          creatorAddress: address,
        }),
      });
      
      toast({
        title: "Proposal submitted",
        description: "Your proposal has been submitted for review",
      });
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Failed to submit proposal:', error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Failed to submit proposal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Proposal</CardTitle>
        <CardDescription>
          Submit your project for community funding on the Metis network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your project title" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, concise title for your project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project in detail"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Explain what your project aims to achieve, its benefits, and implementation strategy
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Technology, Art, Finance" {...field} />
                  </FormControl>
                  <FormDescription>
                    The category that best describes your project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fundingGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funding Goal (METIS)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={100}
                      placeholder="Enter amount in METIS" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    The amount of METIS tokens you need to raise
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      max={180}
                      placeholder="Number of days" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How long your funding campaign will run (1-180 days)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-6 border p-4 rounded-md">
              <h3 className="text-lg font-medium">Metis Impact Score Metrics</h3>
              <p className="text-sm text-muted-foreground">
                These metrics help calculate your project's alignment with Metis' eco-scalable vision
              </p>

              <FormField
                control={form.control}
                name="energyEfficiency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Energy Efficiency (1-10)</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-4">
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-center font-medium">{field.value}</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      How energy-efficient is your project? (1 = least, 10 = most)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communityBenefit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Benefit (1-10)</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-4">
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-center font-medium">{field.value}</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      How much does your project benefit the community? (1 = least, 10 = most)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="innovationFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Innovation Factor (1-10)</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-4">
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-center font-medium">{field.value}</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      How innovative is your project? (1 = least, 10 = most)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CardFooter className="flex justify-between px-0">
              <Button variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateProposalForm;