"use client"
import React from 'react';
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Card, CardContent } from "@/components/ui/card";
import BackButton from "@/components/ui/BackButton";

export default function SettingsPrivacy() {

  return (
    <div className="h-full flex flex-col">
      <ProfileNavbar title="Privacy Policy" />

      <div className="flex-1 w-full bg-white md:rounded-2xl mt-0 md:mt-8 overflow-hidden">
        <div className="max-w-4xl mx-auto p-3 md:p-4 lg:p-6">
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              {/* <div className="mb-6">
                <BackButton variant="outlined" />
              </div> */}
              <div className="prose prose-blue max-w-none">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Privacy Policy</h1>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">1. Introduction</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    At CRWD, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">2. Information We Collect</h2>
                  <h3 className="text-lg md:text-xl font-medium mb-1.5 md:mb-2">2.1 Personal Information</h3>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Name and contact information</li>
                    <li>Email address</li>
                    <li>Payment information</li>
                    <li>Profile information</li>
                    <li>Communication preferences</li>
                  </ul>

                  <h3 className="text-lg md:text-xl font-medium mb-1.5 md:mb-2">2.2 Usage Information</h3>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Device information</li>
                    <li>IP address</li>
                    <li>Browser type</li>
                    <li>Pages visited</li>
                    <li>Time spent on pages</li>
                  </ul>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">3. How We Use Your Information</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Provide and maintain our services</li>
                    <li>Process donations and transactions</li>
                    <li>Communicate with you about your account</li>
                    <li>Send you updates about causes you support</li>
                    <li>Improve our platform and user experience</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">4. Information Sharing</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy. We may share information with:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Service providers who assist in our operations</li>
                    <li>Non-profit organizations you choose to support</li>
                    <li>Legal authorities when required by law</li>
                    <li>Other users as part of your public profile (with your consent)</li>
                  </ul>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">5. Data Security</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">6. Your Rights</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Export your data</li>
                  </ul>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">7. Changes to This Policy</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">8. Contact Us</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    If you have any questions about this Privacy Policy, please contact us at privacy@crwd.com
                  </p>
                </section>

                <div className="text-xs md:text-sm text-gray-500 mt-6 md:mt-8 pt-6 md:pt-8 border-t">
                  Last updated: December 2024
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
