import React from 'react';
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default function SettingsPayments() {

  return (
    <div className="h-full flex flex-col">
      <ProfileNavbar title="Payment Settings" />

      <div className="flex-1 w-full bg-white md:rounded-2xl mt-0 md:mt-8 overflow-hidden">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <div className="mb-6">
            <BackButton variant="outlined" />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Saved Payment Methods</CardTitle>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Card
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-600">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Remove</Button>
              </div>

              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No additional payment methods</p>
                <p className="text-sm">Add a card to make donations easier</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> John Doe</p>
                <p><span className="font-medium">Email:</span> john.doe@example.com</p>
                <p><span className="font-medium">Address:</span> 123 Main St, City, State 12345</p>
              </div>
              <Button variant="outline" className="mt-4">Update Billing Info</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
