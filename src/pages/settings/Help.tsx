"use client";
import React, { useState } from 'react';
import ProfileNavbar from '@/components/profile/ProfileNavbar';
import { ChevronDown, ChevronRight, MessageCircle, Mail, Phone, Search, Users, Heart, DollarSign, Settings, Shield, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '@/components/ui/BackButton';

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

  const helpTopics = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Getting Started",
      description: "Learn the basics of using CRWD",
      link: "#getting-started"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Joining Causes",
      description: "How to find and join CRWDs",
      link: "#joining-causes"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Donations & Payments",
      description: "Understanding how donations work",
      link: "#donations"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Account Settings",
      description: "Manage your profile and preferences",
      link: "#account-settings"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy & Security",
      description: "Keep your account safe",
      link: "#privacy-security"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Notifications",
      description: "Customize your notification preferences",
      link: "#notifications"
    }
  ];

  return (
    <div className="w-full flex flex-col items-center justify-start space-y-6 min-h-screen bg-gray-50">
      <ProfileNavbar title="Help & Support" titleClassName="text-2xl" />
      
      <div className="w-full max-w-4xl mx-auto px-4">
        <BackButton className='mb-4' variant='outlined' />
        {/* Welcome Section */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we help you?</h2>
          <p className="text-gray-600 mb-4">
            Find answers to common questions or get in touch with our support team.
          </p>
          
          {/* Search Bar */}
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div> */}
        </div>

        {/* Quick Help Topics */}
        {/* <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Help Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {helpTopics.map((topic, index) => (
              <a
                key={index}
                href={topic.link}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-blue-600 group-hover:text-blue-700">
                    {topic.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900">{topic.title}</h4>
                </div>
                <p className="text-sm text-gray-600">{topic.description}</p>
              </a>
            ))}
          </div>
        </div> */}

        {/* FAQ Section */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {filteredFAQs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 pr-4">{faq.question}</h4>
                    {expandedFAQ === index ? (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
                {expandedFAQ === index && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <p className="text-gray-600 pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {filteredFAQs.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-gray-500">No results found for "{searchQuery}"</p>
              <p className="text-sm text-gray-400 mt-1">Try different search terms or contact support</p>
            </div>
          )}
        </div>

        {/* Contact Support Section */}
        <div className="bg-white rounded-xl p-6 mb-20 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Still need help?</h3>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* <Link
              to="/contact"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Live Chat</h4>
                <p className="text-sm text-gray-600">Chat with our support team</p>
              </div>
            </Link> */}

            <a
              href="mailto:support@crwd.app"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Email Support</h4>
                <p className="text-sm text-gray-600">support@crwd.app</p>
              </div>
            </a>

            <a
              href="tel:+1-555-0123"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Phone Support</h4>
                <p className="text-sm text-gray-600">Mon-Fri, 9am-6pm EST</p>
              </div>
            </a>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-blue-600 mt-0.5">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Quick Tip</h4>
                <p className="text-sm text-blue-800">
                  For faster support, include your username and a description of the issue when contacting us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
