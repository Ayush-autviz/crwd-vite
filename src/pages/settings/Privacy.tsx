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
              <div className="prose prose-blue max-w-none">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Privacy Policy</h1>
                <p className="text-sm md:text-base text-gray-600 mb-6 font-medium">
                  Effective Date: January 15, 2026
                </p>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">1. Introduction</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    At CRWD, we are committed to protecting your privacy and ensuring the security of your personal information. CRWD operates through CRWD Foundation Inc. (a 501(c)(3) nonprofit) and CRWD Collective Giving LLC. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you use the CRWD platform.
                  </p>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    By using CRWD, you consent to the data practices described in this policy.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">2. Information We Collect</h2>
                  <h3 className="text-lg md:text-xl font-medium mb-1.5 md:mb-2">2.1 Personal Information</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-2">
                    We collect information that you voluntarily provide to us when you register on the platform, express an interest in obtaining information about us or our products and services, when you participate in activities on the platform, or otherwise when you contact us.
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Name and contact details (email address, phone number)</li>
                    <li>Account credentials</li>
                    <li>Payment information (processed securely by third-party payment processors)</li>
                    <li>Transaction history and donation preferences</li>
                  </ul>

                  <h3 className="text-lg md:text-xl font-medium mb-1.5 md:mb-2">2.2 Usage Data</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-2">
                    We automatically collect certain information when you visit, use, or navigate the platform. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our platform, and other technical information.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">3. How We Use Your Information</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    We use the information we collect or receive to:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Facilitate account creation and logon process</li>
                    <li>Process your donations and disbursements to nonprofits</li>
                    <li>Send you administrative information, giving summaries, and tax receipts</li>
                    <li>Protect our services and legal rights</li>
                    <li>Respond to legal requests and prevent harm</li>
                  </ul>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">4. Sharing Your Information</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li><strong>Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., payment processing, data analysis, email delivery, hosting services).</li>
                    <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
                    <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                  </ul>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    <strong>Note on Nonprofits:</strong> We generally do not share your personal contact information with the nonprofits you support unless you explicitly opt-in or it is required to facilitate a specific transaction or benefit. We may share aggregated, anonymous data with nonprofits to help them understand their support base.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">5. Data Security</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our platform is at your own risk. You should only access the services within a secure environment.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">6. Your Privacy Rights</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete the data we hold about you. You may review and change your account information at any time by logging into your account settings. To request to delete your account, please contact us at info@crwdfund.org.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">7. Contact Us</h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    If you have questions or comments about this policy, you may email us at info@crwdfund.org.
                  </p>
                </section>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
