"use client";
import React, { useState } from 'react';
import ProfileNavbar from '@/components/profile/ProfileNavbar';
import { ChevronDown, ChevronRight, MessageCircle, Mail, Phone, Search, Users, Heart, DollarSign, Settings, Shield, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FAQItem {
  question: string;
  answer: string;
}

export default function SettingsHelp() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const faqData: FAQItem[] = [
    {
      question: "What is CRWD and how does it work?",
      answer: "CRWD is a social platform that connects people with causes they care about. You can join or create CRWDs (communities) focused on specific charitable causes, participate in group donations, and track your collective impact."
    },
    {
      question: "How do I join a CRWD?",
      answer: "You can join a CRWD by browsing our community directory, searching for causes you're interested in, or receiving an invitation from a friend. Simply click 'Join' on any CRWD that interests you."
    },
    {
      question: "How do donations work?",
      answer: "CRWD facilitates group donations to verified non-profit organizations. When your CRWD decides to support a cause, members can contribute any amount they're comfortable with. All donations are secure and go directly to the chosen organization."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes, we take privacy seriously. Your personal information is encrypted and never shared with third parties without your consent. You control what information is visible to other CRWD members."
    },
    {
      question: "How do I create my own CRWD?",
      answer: "To create a CRWD, go to 'Your CRWDs' and click 'Create New CRWD'. Choose a cause, write a description, and invite friends to join your community."
    },
    {
      question: "Can I leave a CRWD?",
      answer: "Yes, you can leave any CRWD at any time by going to the CRWD page and selecting 'Leave CRWD' from the menu."
    },
    {
      question: "How are non-profits verified?",
      answer: "We verify all non-profit organizations through official databases and documentation to ensure they are legitimate 501(c)(3) organizations in good standing."
    },
    {
      question: "What happens if a CRWD becomes inactive?",
      answer: "Inactive CRWDs are archived after 90 days of no activity. Members are notified and can reactivate the CRWD or join similar active communities."
    }
  ];

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const helpCategories = [
    { icon: Users, title: "Getting Started", description: "Learn the basics of using CRWD" },
    { icon: Heart, title: "Joining CRWDs", description: "How to find and join communities" },
    { icon: DollarSign, title: "Donations", description: "Understanding how donations work" },
    { icon: Settings, title: "Account Settings", description: "Managing your profile and preferences" },
    { icon: Shield, title: "Privacy & Security", description: "Keeping your information safe" },
    { icon: Bell, title: "Notifications", description: "Managing your notification preferences" }
  ];

  return (
    <div className="min-h-screen bg-white pb-16">
      <ProfileNavbar title="Help & Support" />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Quick Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {helpCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <category.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex items-center justify-between w-full text-left py-2 hover:text-blue-600 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFAQ === index ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="mt-2 text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Still need help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center space-x-2 h-12">
                <MessageCircle className="h-4 w-4" />
                <span>Live Chat</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 h-12">
                <Mail className="h-4 w-4" />
                <span>Email Support</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 h-12">
                <Phone className="h-4 w-4" />
                <span>Call Us</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
