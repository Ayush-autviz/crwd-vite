"use client"
import React from 'react';
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Card, CardContent } from "@/components/ui/card";
import BackButton from "@/components/ui/BackButton";

export default function SettingsAbout() {
  return (
    <div className="h-full flex flex-col">
      <ProfileNavbar title="About" />

      <div className="flex-1 w-full bg-white md:rounded-2xl mt-0 md:mt-8 overflow-hidden">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              {/* <div className="mb-6">
                <BackButton variant="outlined" />
              </div> */}
              <div className="prose prose-blue max-w-none">
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <h1 className="text-3xl font-bold mb-8">CRWD About Page</h1>
                </div>

                {/* Quick Links */}
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <a href="#about-crwd" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <h3 className="font-medium text-blue-900">About CRWD</h3>
                    </a>
                    <a href="#how-crwd-works" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <h3 className="font-medium text-blue-900">How CRWD Works</h3>
                    </a>
                    <a href="#about-tax-deductibility" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <h3 className="font-medium text-blue-900">About Tax Deductibility</h3>
                    </a>
                    <a href="#what-are-crwds" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <h3 className="font-medium text-blue-900">What Are Giving Circles?</h3>
                    </a>
                    <a href="#why-crwd" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <h3 className="font-medium text-blue-900">Why CRWD</h3>
                    </a>
                  </div>
                </section>

                {/* About CRWD Section */}
                <section id="about-crwd" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">About CRWD</h2>
                  <p className="text-gray-600 mb-4">
                    CRWD makes it easy to give to multiple nonprofits in one place.
                  </p>
                  <p className="text-gray-600 mb-4">
                    You can build a personalized donation box, add nonprofits you care about, and give once or monthly. CRWD handles the rest—including distributing your donation and keeping everything organized.
                  </p>
                  <p className="text-gray-600 font-medium">
                    We're here to simplify generosity.
                  </p>
                </section>

                {/* How CRWD Works Section */}
                <section id="how-crwd-works" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-6">How CRWD Works</h2>

                  <div className="space-y-8">
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-xl font-medium mb-2">Build your donation box.</h3>
                      <p className="text-gray-600">
                        Search or browse for verified nonprofits and add the ones you want to support. You can update your box at any time.
                      </p>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-xl font-medium mb-2">Donate once or monthly.</h3>
                      <p className="text-gray-600">
                        Your donation is split evenly across all nonprofits in your box. CRWD processes the payment and distributes funds on your behalf.
                      </p>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-xl font-medium mb-2">We send the funds.</h3>
                      <p className="text-gray-600">
                        CRWD distributes donations to nonprofits within 45 days, bundled as a single payment that includes all contributions made to that nonprofit across the platform.
                      </p>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-xl font-medium mb-2">Track your giving.</h3>
                      <p className="text-gray-600">
                        You'll have access to a clear record of your donation history, the nonprofits you've supported, and when distributions were made.
                      </p>
                    </div>
                  </div>
                </section>

                {/* About Tax Deductibility Section */}
                <section id="about-tax-deductibility" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">About Tax Deductibility</h2>
                  <p className="text-gray-600 mb-4">
                    Because CRWD uses a collective giving model, where donations are pooled and distributed on your behalf, most donations are not currently tax deductible, even if they support 501(c)(3) organizations.
                  </p>

                  <h3 className="text-xl font-medium mb-3 text-blue-900">That's changing.</h3>
                  <p className="text-gray-600 mb-4">
                    Some nonprofits on CRWD have already enrolled to receive direct payments, which makes donations to them tax deductible and helps reduce processing time and costs. These nonprofits are clearly labeled across the platform, and you'll receive a tax receipt when you give to them.
                  </p>
                  <p className="text-gray-600 mb-6">
                    We're working daily to expand this option—so more nonprofits can accept direct donations, and more of your giving can qualify for tax benefits.
                  </p>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-medium mb-3">In the meantime:</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Nonprofits still receive 100% of your donation (minus processing fees)</li>
                      <li>• You'll receive a giving summary from CRWD for your records</li>
                    </ul>
                  </div>
                </section>

                {/* What Are CRWDs Section */}
                <section id="what-are-crwds" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">What Are Giving Circles?</h2>
                  <p className="text-gray-600 mb-4">
                    CRWDs are curated collections of nonprofits tied to a shared cause or identity.
                  </p>
                  <p className="text-gray-600 mb-6">
                    You can join a CRWD, create one, or share it with others.
                  </p>

                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="text-xl font-medium mb-4">Each CRWD includes:</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600">A set of nonprofits selected around a theme or issue</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600">A name, description, and cover image</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600">A discussion feed where members can post articles, ideas, and updates</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600">
                    Joining a CRWD adds its nonprofits to your donation box. You can keep them all, or remove any you don't want to support.
                  </p>
                </section>

                {/* Why CRWD Section */}
                <section id="why-crwd" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">Why CRWD</h2>
                  <p className="text-gray-600 mb-6">
                    Giving to multiple nonprofits shouldn't require multiple accounts, receipts, or payment forms.
                  </p>
                  <p className="text-gray-600 mb-8">
                    CRWD simplifies the process—so you can focus on giving, not managing it.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <h3 className="text-xl font-medium mb-3 text-blue-900">One place to organize your giving</h3>
                      <p className="text-gray-600">
                        Keep all your favorite nonprofits in one convenient donation box.
                      </p>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <h3 className="text-xl font-medium mb-3 text-blue-900">One donation, split automatically</h3>
                      <p className="text-gray-600">
                        Make a single payment that gets distributed to all your chosen causes.
                      </p>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <h3 className="text-xl font-medium mb-3 text-blue-900">One platform built for everyday generosity</h3>
                      <p className="text-gray-600">
                        Designed to make regular giving simple, transparent, and impactful.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
}
