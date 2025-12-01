"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { ChevronRight, DollarSign, Settings, Users, Heart, ArrowRight } from "lucide-react"
import Footer from "@/components/Footer"
import ProfileNavbar from "@/components/profile/ProfileNavbar"

export default function WaitlistPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"waitlist" | "collective">("waitlist")
  const [donationAmount, setDonationAmount] = useState(35) // Default $35/month
  
  // Join Waitlist form state
  const [waitlistForm, setWaitlistForm] = useState({
    email: "",
    firstName: "",
    causes: [] as string[],
    monthlyAmount: ""
  })
  
  // Start a Collective form state
  const [collectiveForm, setCollectiveForm] = useState({
    name: "Alex Johnson",
    email: "you@example.com",
    socialHandle: "@yourusername",
    idea: "E.g., 'Ocean Lovers' - For people who want to protect our oceans and marine life.",
    vibe: ""
  })

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!waitlistForm.email.trim() || !waitlistForm.firstName.trim()) return
    
    setIsSubmitting(true)
    // TODO: Add API call to join waitlist
    setTimeout(() => {
      setIsSubmitting(false)
      // Show success message or redirect
    }, 1000)
  }

  const handleCollectiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collectiveForm.name.trim() || !collectiveForm.email.trim() || !collectiveForm.idea.trim()) return
    
    setIsSubmitting(true)
    // TODO: Add API call to start collective
    setTimeout(() => {
      setIsSubmitting(false)
      // Show success message or redirect
    }, 1000)
  }

  const toggleCause = (cause: string) => {
    setWaitlistForm(prev => ({
      ...prev,
      causes: prev.causes.includes(cause)
        ? prev.causes.filter(c => c !== cause)
        : [...prev.causes, cause]
    }))
  }

  const causes = [
    "Climate Action",
    "Healthcare",
    "Clean Water",
    "Social Justice",
    "Education",
    "Animal Welfare",
    "Hunger Relief",
    "Other"
  ]

  const collectiveCauses = [
    "Climate & Environment",
    "Healthcare",
    "Clean Water",
    "Social Justice",
    "Education",
    "Animal Welfare",
    "Hunger Relief",
    "Mix of Everything"
  ]

  return (
    <div className="min-h-screen bg-background">
      <ProfileNavbar
        title="Waitlist"
        showMobileMenu={true}
        showDesktopMenu={true}
        showBackButton={false}
      />
      {/* Hero Section */}
      <div className="bg-card pt-6 pb-12 md:pt-8 md:pb-16 px-4 md:px-6">
        {/* Launch Banner */}
        <div className="max-w-4xl mx-auto text-center mb-6 md:mb-8">
          <div className="w-fit mx-auto bg-green-500 text-primary-foreground px-4 py-2 rounded-full text-md font-medium mb-4 md:mb-6">
            LAUNCHING EARLY 2026
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-[800] text-foreground mb-3 md:mb-4 leading-tight">
            Stop Choosing Between<br />
            <span className="text-[#0047FF]">the Causes You Care About.</span>
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
            One monthly gift. All your causes. Automatic impact. Join the waitlist to become someone who actually shows up.
          </p>
          
          <Button
            onClick={() => {
              setActiveTab("waitlist")
              const element = document.getElementById('tab-content')
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            size="lg"
            className="h-12 px-8 rounded-full"
          >
            Join the Waitlist
          </Button>
        </div>
      </div>

      {/* See the Magic in Action Section */}
      <div className="bg-purple-50 py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-[800] text-foreground mb-3 md:mb-4 text-center">
            See the <span className="text-[#0047FF]">Magic</span> in Action
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-12 text-center">
            Pick your causes. Give once. Multiply your impact.
          </p>

          {/* Demo Card */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-4 md:p-8 lg:p-12">
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-4">
                You can give <span className="text-[#0047FF]">${donationAmount}</span>/month to
              </div>
              
              {/* Slider */}
              <div className="mb-4 md:mb-6 relative">
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0047FF] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0047FF] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
                  style={{
                    background: `linear-gradient(to right, #0047FF 0%, #0047FF ${((donationAmount - 5) / 95) * 100}%, #e5e7eb ${((donationAmount - 5) / 95) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              
              {/* Cause Buttons */}
              <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                <button className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-primary-foreground text-sm md:text-base font-medium bg-slate-400 hover:bg-slate-500 transition-colors">
                  refugees
                </button>
                <button className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-primary-foreground text-sm md:text-base font-medium bg-purple-300 hover:bg-purple-400 transition-colors">
                  sanctuaries
                </button>
                <button className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-primary-foreground text-sm md:text-base font-medium bg-green-300 hover:bg-green-400 transition-colors">
                  veteran housing
                </button>
                <button className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-primary-foreground text-sm md:text-base font-medium bg-orange-300 hover:bg-orange-400 transition-colors">
                  pediatric care
                </button>
              </div>

              <div className="text-lg md:text-xl font-bold text-[#0047FF] mb-3 md:mb-4">
                = ${donationAmount * 12}/year of impact
              </div>

              {/* Distribution Bar */}
              <div className="flex h-3 md:h-4 rounded-full overflow-hidden mb-3 md:mb-4">
                <div className="bg-pink-500 flex-1" />
                <div className="bg-orange-500 flex-1" />
                <div className="bg-green-500 flex-1" />
                <div className="bg-[#0047FF] flex-1" />
              </div>

              <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
                One gift. Multiple causes.
              </p>

              <Button
                onClick={() => navigate("/")}
                size="lg"
                className="w-full h-11 md:h-12 rounded-full"
              >
                Get Early Access <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Problem Statement Section */}
      <div className="bg-gray-50 flex py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
          <h2 className="text-3sxl md:text-4xl lg:text-5xl font-[800] text-foreground mb-3 md:mb-4">
            You Care About Everything.<br />
            <span className="text-[#0047FF]">But You Give to Nothing.</span>
          </h2>
          
          <div className="text-center space-y-3 md:space-y-4 text-lg md:text-xl lg:text-2xl text-muted-foreground mt-6 md:mt-8">
            <p className='text-black font-[600]'>
              Clean water. Education. Climate. Animals. Mental health. Maybe one. Maybe all.
            </p>
            <p>
              But choosing between causes feels impossible. Managing multiple gifts is overwhelming. And deep down, you wonder if it even makes a difference.
            </p>
            <p className="font-bold text-black">
              So giving gets put off. Again and again.
            </p>
          </div>
        </div>
      </div>

      {/* Headline and Mission Statement Section */}
      <div className="bg-card py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3sxl md:text-4xl lg:text-5xl font-[800] text-foreground mb-4 md:mb-6">
            What If You Could Support <span className="text-[#6A0DAD]">Every Cause</span> With <span className="text-[#6A0DAD]">One Decision</span>?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
            The most powerful thing about your giving isn't the amount. It's the commitment.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-card py-10 md:py-8px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-[800] text-foreground mb-8 md:mb-12 text-center">
            How It Works:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#0047FF] flex items-center justify-center mb-4">
                <span className="text-primary-foreground text-xl font-bold">1</span>
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">Pick Your Causes</h4>
              <p className="text-muted-foreground">Add every nonprofit you care about.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#6A0DAD] flex items-center justify-center mb-4">
                <span className="text-primary-foreground text-xl font-bold">2</span>
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">Set Your Monthly Amount</h4>
              <p className="text-muted-foreground">Start small. Even $5/month makes real Impact.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center mb-4">
                <span className="text-primary-foreground text-xl font-bold">3</span>
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">Give to All of Them</h4>
              <p className="text-muted-foreground">While you live your life, you're changing lives every month.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Who We're Building For Section */}
      <div className="bg-blue-50 py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl text-center  md:text-4xl lg:text-5xl font-[800] text-foreground mb-4 md:mb-6">
            This is who <span className="text-[#6A0DAD]">we're building for.</span>
          </h2>
          <p className="mt-10 text-xl text-center md:text-2xl lg:text-3xl text-foreground font-[800] max-w-3xl mx-auto">
            Not the people who already give $1,000/year to one charity. The people who want to give something to everything they care about. 
          </p>
          <p className="mt-8 text-xl text-center md:text-2xl lg:text-3xl text-foreground font-[800] max-w-3xl mx-auto">
            You're one of them. That's why you're here.
          </p>
        </div>
      </div>

      {/* The Question Isn't Section */}
      <div className="bg-card py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-[800] text-foreground mb-4 md:mb-6">
                The Question Isn't <span className="text-[#0047FF]">"Can I Afford to Give?"</span>
              </h2>
              <p className="text-xl md:text-2xl lg:text-3xl text-foreground font-[800] ">
                The Question Is: "Can I Afford Not to Become Someone Who Shows Up?"
              </p>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 mt-8">
                You've been meaning to give. You've been caring from the sidelines. 
              </p>

              <p className="text-base md:text-lg lg:text-xl text-black font-[800] mb-6 md:mb-8 mt-8">
                Today, that changes. 
              </p>

              <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 mt-8">
                Join the waitlist. Support multiple causes with one decision. Set it once. Change everything.
              </p>

              <Button
                onClick={() => {
                  setActiveTab("waitlist")
                  const element = document.getElementById('tab-content')
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                size="lg"
                className="h-11 md:h-12 px-6 md:px-8 rounded-full"
              >
                Join the Waitlist <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>

            {/* Image with Overlaid Icons */}
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop"
                  alt="People volunteering and making a difference"
                  className="w-full h-auto"
                />
                {/* Overlaid Icons */}
                <div className="absolute top-4 left-4 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md">
                  <div className="w-6 h-6 bg-[#0047FF] rounded-full" />
                </div>
                <div className="absolute bottom-4 left-4 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md">
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-green-500" />
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md">
                  <div className="w-6 h-6 bg-purple-500 rounded" />
                </div>
                <div className="absolute bottom-4 right-4 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md">
                  <div className="w-6 h-6 bg-pink-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full bg-muted  md:top-0 z-40">
        <div className="pt-16">
        <div className="max-w-7xl mx-[5%] px-4 py-1.5 md:py-2 flex justify-center gap-3 md:gap-4 bg-purple-100 rounded-xl">
          <button
            onClick={() => {
              setActiveTab("waitlist")
              const element = document.getElementById('tab-content')
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={`rounded-xl px-4 w-full py-1.5 md:px-6 md:py-3 text-base md:text-lg font-medium transition-all ${
              activeTab !== "waitlist"
                ? "bg-purple-100 text-gray-700"
                : "bg-white text-gray-700 border border-purple-200"
            }`}
          >
            Join Waitlist
          </button>
          <button
            onClick={() => {
              setActiveTab("collective")
              const element = document.getElementById('tab-content')
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={`rounded-xl w-full px-4 py-1.5 md:px-6 md:py-3 text-base md:text-lg font-medium transition-all ${
              activeTab !== "collective"
                ? "bg-purple-100 text-gray-700"
                : "bg-white text-gray-700 border border-purple-200"
            }`}
          >
            Start a Collective
          </button>
          </div>
          </div>
      </div>

      {/* Tab Content */}
      <div id="tab-content">
        {activeTab === "waitlist" && (
          <>
            {/* Join Waitlist Form Section */}
            <div className="bg-muted py-10 md:py-16 px-4 md:px-6">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-[800] text-[#0047FF] mb-3 md:mb-4 text-center">
                  Join people who are ready to stop choosing and start giving.
                </h2>
                <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12 text-center">
                  Get early access when we launch in 2026
                </p>

                {/* Form Card */}
                <Card>
                  <CardContent className="p-4 md:p-8 lg:p-12">
            <form onSubmit={handleWaitlistSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address*
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={waitlistForm.email}
                  onChange={(e) => setWaitlistForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-12"
                  required
                />
              </div>

              {/* First Name */}
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700 mb-2">
                  First Name*
                </label>
                <Input
                  type="text"
                  placeholder="Alex"
                  value={waitlistForm.firstName}
                  onChange={(e) => setWaitlistForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full h-12"
                  required
                />
              </div>

              {/* Causes */}
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700 mb-3">
                  Which causes do you care about? (optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {causes.map((cause) => (
                    <label
                      key={cause}
                      className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={waitlistForm.causes.includes(cause)}
                        onChange={() => toggleCause(cause)}
                        className="w-4 h-4 text-[#0047FF] border-gray-300 rounded focus:ring-[#0047FF]"
                      />
                      <span className="text-base text-gray-700">{cause}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Monthly Amount */}
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700 mb-3">
                  How much would you donate monthly? (optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["$5-10", "$10-25", "$25-50", "$50+"].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setWaitlistForm(prev => ({ ...prev, monthlyAmount: amount }))}
                      className={`h-12 rounded-lg border-2 transition-colors ${
                        waitlistForm.monthlyAmount === amount
                          ? "border-[#0047FF] bg-[#0047FF] text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-[#0047FF]"
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full h-12"
              >
                {isSubmitting ? "Joining..." : "Join the Waitlist"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Privacy Statement */}
              <p className="text-xs text-muted-foreground text-center">
                We'll never share your email. Unsubscribe anytime.
              </p>
            </form>
            </CardContent>
          </Card>
        </div>
      </div>
          </>
        )}

        {activeTab === "collective" && (
          <>
            {/* Start a Collective Section */}
            <div className="bg-muted py-10 md:py-16 px-4 md:px-6">
              <div className="max-w-4xl mx-auto">
                {/* Early Founder Program Tag */}
                <div className="text-center mb-4 md:mb-6">
                  <div className="inline-block bg-green-500 text-primary-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium">
                    EARLY FOUNDER PROGRAM
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-[800] text-[#6A0DAD] mb-3 md:mb-4 text-center">
                  Start a Collective
                </h2>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-[800] text-foreground mb-3 md:mb-4 text-center">
                  Lead a Giving Community Around What You Care About.
                </h3>
                <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12 text-center max-w-3xl mx-auto">
            Rally your friends, family, followers, or anyone who shares your passion. Pick the causes. They join and give monthly. Watch your collective impact grow.
          </p>

                {/* Feature Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10 md:mb-16">
            {/* We'll Match Donations */}
            <Card>
              <CardContent className="px-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl md:text-xl font-[800] text-foreground mb-2">We'll Match Donations</h4>
              <p className="text-base md:text-lg text-muted-foreground">Get up to $200 in matched donations to jumpstart your collective's impact.</p>
            </CardContent>
            </Card>

            {/* Get In First */}
            <Card>
              <CardContent className="px-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl md:text-xl font-[800] text-foreground mb-2">Get In First</h4>
              <p className="text-base md:text-lg text-muted-foreground">Early access means you get to build your community before everyone else even knows we exist.</p>
            </CardContent>
            </Card>

            {/* We'll Help You Grow */}
            <Card>
              <CardContent className="px-6">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="text-xl md:text-xl font-[800] text-foreground mb-2">We'll Help You Grow</h4>
              <p className="text-base md:text-lg text-muted-foreground">Your collective gets featured in our campaigns so you can rally more people to your cause.</p>
            </CardContent>
            </Card>

            {/* Build With Us */}
            <Card>
              <CardContent className="px-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[#0047FF]" />
              </div>
              <h4 className="text-xl md:text-xl font-[800] text-foreground mb-2">Build With Us</h4>
              <p className="text-base md:text-lg text-muted-foreground">Work directly with the CRWD team to shape features and make the platform better for everyone.</p>
            </CardContent>
            </Card>
          </div>

                {/* Become a Collective Founder Form */}
                <Card>
                  <CardContent className="p-4 md:p-8 lg:p-12">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-[800] text-foreground mb-6 md:mb-8">Become a Collective Founder</h3>
            
            <form onSubmit={handleCollectiveSubmit} className="space-y-6">
              {/* Your Name */}
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700 mb-2">
                  Your Name*
                </label>
                <Input
                  type="text"
                  value={collectiveForm.name}
                  onChange={(e) => setCollectiveForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-12"
                  required
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700 mb-2">
                  Email Address*
                </label>
                <Input
                  type="email"
                  value={collectiveForm.email}
                  onChange={(e) => setCollectiveForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-12"
                  required
                />
              </div>

              {/* Social Media Handle */}
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700 mb-2">
                  Social Media Handle (optional)
                </label>
                <Input
                  type="text"
                  value={collectiveForm.socialHandle}
                  onChange={(e) => setCollectiveForm(prev => ({ ...prev, socialHandle: e.target.value }))}
                  className="w-full h-12"
                  placeholder="@yourusername"
                />
                <p className="text-sm text-gray-500 mt-1">Instagram, TikTok, X/Twitter, or any platform.</p>
              </div>

              {/* Collective Idea */}
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700 mb-2">
                  What's your collective idea?*
                </label>
                <Textarea
                  value={collectiveForm.idea}
                  onChange={(e) => setCollectiveForm(prev => ({ ...prev, idea: e.target.value }))}
                  className="w-full min-h-[120px]"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">What causes? Who would join? What's the vibe? Dream big!</p>
              </div>

              {/* Main Vibe */}
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700 mb-3">
                  Main vibe? (optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {collectiveCauses.map((cause) => (
                    <button
                      key={cause}
                      type="button"
                      onClick={() => setCollectiveForm(prev => ({ ...prev, vibe: cause }))}
                      className={`h-12 rounded-lg border-2 transition-colors text-base ${
                        collectiveForm.vibe === cause
                          ? "border-[#6A0DAD] bg-[#6A0DAD] text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-[#6A0DAD]"
                      }`}
                    >
                      {cause}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full h-12 bg-[#6A0DAD] hover:bg-[#5A0B9D] text-primary-foreground"
              >
                {isSubmitting ? "Submitting..." : "Sign Me Up"}
              </Button>

              {/* Concluding Text */}
              <p className="text-base text-muted-foreground text-center">
                We're excited to see what you'll build!
              </p>
            </form>
            </CardContent>
          </Card>
        </div>
      </div>
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

