import { 
  User, 
  Mail, 
  Lock, 
  CreditCard, 
  History, 
  HelpCircle, 
  FileText, 
  Shield, 
  Info, 
  MessageSquare 
} from "lucide-react";
import React from 'react';

export const accountItems = [
  // {
  //   label: "Profile",
  //   href: "/settings/profile",
  //   icon: React.createElement(User, { className: "h-5 w-5" })
  // },
  {
    label: "Email",
    href: "/settings/email",
    icon: React.createElement(Mail, { className: "h-5 w-5" })
  },
  {
    label: "Password",
    href: "/settings/password",
    icon: React.createElement(Lock, { className: "h-5 w-5" })
  }
];

export const financialItems = [
  // {
  //   label: "Payment Methods",
  //   href: "/settings/payments",
  //   icon: React.createElement(CreditCard, { className: "h-5 w-5" })
  // },
  {
    label: "Transaction History",
    href: "/transaction-history",
    icon: React.createElement(History, { className: "h-5 w-5" })
  }
];

export const helpItems = [
  {
    label: "Help Center",
    href: "/settings/help",
    icon: React.createElement(HelpCircle, { className: "h-5 w-5" })
  },
  {
    label: "Terms of Use",
    href: "/settings/terms",
    icon: React.createElement(FileText, { className: "h-5 w-5" })
  },
  {
    label: "Privacy Policy",
    href: "/settings/privacy",
    icon: React.createElement(Shield, { className: "h-5 w-5" })
  },
  {
    label: "About",
    href: "/settings/about",
    icon: React.createElement(Info, { className: "h-5 w-5" })
  },
  {
    label: "Report an Issue",
    href: "/settings/report",
    icon: React.createElement(MessageSquare, { className: "h-5 w-5" })
  }
];
