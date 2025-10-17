"use client"

import React from 'react';
import ProfileNavbar from "../components/profile/ProfileNavbar";
import SettingsGroup from "../components/settings/SettingsGroup";
import BackButton from "../components/ui/BackButton";
import { accountItems, financialItems, helpItems } from "../lib/setting/settings";
import { User, CreditCard, HelpCircle } from "lucide-react";
import { useAuthStore } from '@/stores/store';

export default function SettingsPage() {
  const { user: currentUser } = useAuthStore();


  return (
    <div className="h-full flex flex-col">
      <ProfileNavbar title="Settings" />

      <div className="flex-1 w-full bg-white mt-0 md:mt-4 overflow-hidden">
        <div className="max-w-4xl mx-auto p-6">
          {/* Back Button */}
          {/* <div className="mb-6">
            <BackButton variant="outlined" />
          </div> */}

          <div className="space-y-6">
            {/* Account Settings */}
            {currentUser?.id && (
            <SettingsGroup
              heading="Account"
              items={accountItems}
              description="Manage your account settings and preferences"
              icon={<User className="h-5 w-5 text-primary" />}
            />
            )}
            {/* Financial Settings */}
            {currentUser?.id && (
            <SettingsGroup
              heading="Financial"
              items={financialItems}
              description="Manage your payment methods and view transaction history"
              icon={<CreditCard className="h-5 w-5 text-primary" />}
            />
            )}
            {/* Help & Support */}
            <SettingsGroup
              heading="Help & Support"
              items={helpItems}
              description="Get help and learn more about CRWD"
              icon={<HelpCircle className="h-5 w-5 text-primary" />}
            />
          </div>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
}
