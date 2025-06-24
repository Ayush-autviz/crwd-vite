"use client"

import React, { useState } from 'react';
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default function SettingsEmail() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentEmail: '',
    newEmail: '',
    confirmEmail: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    currentEmail: '',
    newEmail: '',
    confirmEmail: '',
    password: ''
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({
      currentEmail: '',
      newEmail: '',
      confirmEmail: '',
      password: ''
    });

    // Validate current email
    const currentEmailError = validateEmail(formData.currentEmail);
    if (currentEmailError) {
      setErrors(prev => ({ ...prev, currentEmail: currentEmailError }));
      setLoading(false);
      return;
    }

    // Validate new email
    const newEmailError = validateEmail(formData.newEmail);
    if (newEmailError) {
      setErrors(prev => ({ ...prev, newEmail: newEmailError }));
      setLoading(false);
      return;
    }

    // Validate email confirmation
    if (formData.newEmail !== formData.confirmEmail) {
      setErrors(prev => ({ ...prev, confirmEmail: 'Email addresses do not match' }));
      setLoading(false);
      return;
    }

    // Validate password
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Email updated successfully');
      setFormData({
        currentEmail: '',
        newEmail: '',
        confirmEmail: '',
        password: ''
      });
    } catch (error) {
      toast.error('Failed to update email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ProfileNavbar title="Change Email" />

      <div className="flex-1 w-full bg-white mt-0 md:mt-8 overflow-hidden">
        <div className="max-w-2xl mx-auto p-6">
          <Card className="border-none shadow-none">
            <CardHeader>
              <BackButton />
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Change Email</CardTitle>
              </div>
              <CardDescription>
                Update your email address. You'll need to verify your new email address after the change.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className='flex flex-col gap-2'>
                    <Label htmlFor="currentEmail">Current Email</Label>
                    <Input
                      id="currentEmail"
                      type="email"
                      value={formData.currentEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentEmail: e.target.value }))}
                      className={errors.currentEmail ? "border-red-500" : ""}
                    />
                    {errors.currentEmail && (
                      <p className="text-sm text-red-500 mt-1">{errors.currentEmail}</p>
                    )}
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Label htmlFor="newEmail">New Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={formData.newEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, newEmail: e.target.value }))}
                      className={errors.newEmail ? "border-red-500" : ""}
                    />
                    {errors.newEmail && (
                      <p className="text-sm text-red-500 mt-1">{errors.newEmail}</p>
                    )}
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Label htmlFor="confirmEmail">Confirm New Email</Label>
                    <Input
                      id="confirmEmail"
                      type="email"
                      value={formData.confirmEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmEmail: e.target.value }))}
                      className={errors.confirmEmail ? "border-red-500" : ""}
                    />
                    {errors.confirmEmail && (
                      <p className="text-sm text-red-500 mt-1">{errors.confirmEmail}</p>
                    )}
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Label htmlFor="password">Current Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Email'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        currentEmail: '',
                        newEmail: '',
                        confirmEmail: '',
                        password: ''
                      });
                      setErrors({
                        currentEmail: '',
                        newEmail: '',
                        confirmEmail: '',
                        password: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
}
