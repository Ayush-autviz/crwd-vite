import React from 'react';
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Card, CardContent } from "@/components/ui/card";
import BackButton from "@/components/ui/BackButton";

export default function SettingsTerms() {

  return (
    <div className="h-full flex flex-col">
      <ProfileNavbar title="Terms of Service" />

      <div className="flex-1 w-full bg-white md:rounded-2xl mt-0 md:mt-8 overflow-hidden">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              {/* <div className="mb-6">
                <BackButton variant="outlined" />
              </div> */}
              <div className="prose prose-blue max-w-none">
                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-600 mb-4">
                    By accessing and using CRWD, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
                  <p className="text-gray-600 mb-4">
                    Permission is granted to temporarily use CRWD for personal, non-commercial transitory viewing only.
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 mb-4">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for commercial purposes</li>
                    <li>Attempt to reverse engineer any software</li>
                    <li>Remove any copyright or proprietary notations</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                  <p className="text-gray-600 mb-4">
                    You are responsible for maintaining the confidentiality of your account and password.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">4. Donations</h2>
                  <p className="text-gray-600 mb-4">
                    All donations made through CRWD are final and non-refundable unless required by law.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
                  <p className="text-gray-600 mb-4">
                    You may not use our service:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 mb-4">
                    <li>For any unlawful purpose</li>
                    <li>To harass, abuse, or harm others</li>
                    <li>To transmit spam or malicious content</li>
                    <li>To violate any laws or regulations</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
                  <p className="text-gray-600 mb-4">
                    We may terminate your access to the service at any time for violations of these terms.
                  </p>
                </section>

                <div className="text-sm text-gray-500 mt-8 pt-8 border-t">
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
