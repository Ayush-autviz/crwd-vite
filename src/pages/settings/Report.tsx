"use client"
import React, { useState } from 'react';
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createReportIssue } from "@/services/api/social";
import { useMutation } from "@tanstack/react-query";

export default function SettingsReport() {
  const [formData, setFormData] = useState({
    type: "",
    title: "No title",
    description: "",
    steps: "No steps",
  });

  const reportIssueMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      issue_type: string;
      status: string;
      reproduce_steps: string;
    }) => createReportIssue(data),
    onSuccess: () => {
      toast.success("Your report has been submitted successfully. We'll review it shortly.");
      setFormData({
        type: "",
        title: "",
        description: "",
        steps: "",
      });
    },
    onError: (error: any) => {
      console.error('Error submitting report:', error);
      toast.error("Failed to submit report. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.type || !formData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Prepare payload according to API requirements
    const payload = {
      title: 'no title',
      description: formData.description,
      issue_type: formData.type,
      status: "pending",
      reproduce_steps: 'no steps',
    };

    reportIssueMutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value
    }));
  };

  return (
    <div className="h-full flex flex-col">
      <ProfileNavbar title="Report an Issue" />

      <div className="flex-1 w-full bg-white md:rounded-2xl mt-0 md:mt-8 overflow-hidden">
        <div className="max-w-2xl mx-auto p-3 md:p-4 lg:p-6">
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              {/* <div className="mb-6">
                <BackButton variant="outlined" />
              </div> */}
              <div className="mb-6 md:mb-8">
                <h1 className="text-xl md:text-2xl font-bold mb-1.5 md:mb-2">Report an Issue</h1>
                <p className="text-sm md:text-base text-gray-600">
                  Help us improve CRWD by reporting any issues you encounter or providing feedback.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="type" className="text-sm md:text-base">Issue Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className="text-sm md:text-base">
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="security">Security Issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="title" className="text-sm md:text-base">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Brief description of the issue"
                    required
                    className="text-sm md:text-base"
                  />
                </div> */}

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="description" className="text-sm md:text-base">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please provide a detailed description of the issue"
                    required
                    className="min-h-[80px] md:min-h-[100px] text-sm md:text-base"
                  />
                </div>

                {/* <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="steps" className="text-sm md:text-base">Steps to Reproduce</Label>
                  <Textarea
                    id="steps"
                    name="steps"
                    value={formData.steps}
                    onChange={handleChange}
                    placeholder="1. First step&#10;2. Second step&#10;3. And so on..."
                    className="min-h-[80px] md:min-h-[100px] text-sm md:text-base"
                  />
                </div> */}

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-3 md:pt-4">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-sm md:text-base py-2 md:py-2.5"
                    disabled={reportIssueMutation.isPending}
                  >
                    {reportIssueMutation.isPending ? "Submitting..." : "Submit Report"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({
                      type: "",
                      title: "",
                      description: "",
                      steps: "",
                    })}
                    className="text-sm md:text-base py-2 md:py-2.5"
                  >
                    Clear Form
                  </Button>
                </div>
              </form>

              <div className="mt-6 md:mt-8 p-3 md:p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-1.5 md:mb-2 text-sm md:text-base">Tips for Submitting a Good Report</h3>
                <ul className="list-disc pl-5 md:pl-6 text-xs md:text-sm text-gray-600 space-y-0.5 md:space-y-1">
                  <li>Be specific and provide clear details about the issue</li>
                  <li>Include steps to reproduce the problem</li>
                  <li>Add screenshots or screen recordings if relevant</li>
                  <li>Mention your browser and operating system</li>
                  <li>Check if the issue has already been reported</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="h-16 md:h-20" />
    </div>
  );
}
