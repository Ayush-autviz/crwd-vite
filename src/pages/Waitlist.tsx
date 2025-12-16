"use client"

import React, { useRef, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Users, Heart, ArrowRight, Zap, Sparkles } from "lucide-react"
import Footer from "@/components/Footer"
import { toast } from "sonner"
import { joinWaitlist } from "@/services/api/auth"
import NewLogo from '@/assets/newLogo'

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

// Define two sets of causes with their styling
const causeSets = [
  [
    { name: "refugees", bgColor: "bg-slate-400", hoverColor: "hover:bg-slate-500" },
    { name: "sanctuaries", bgColor: "bg-purple-300", hoverColor: "hover:bg-purple-400" },
    { name: "veteran housing", bgColor: "bg-green-300", hoverColor: "hover:bg-green-400" },
    { name: "pediatric care", bgColor: "bg-orange-300", hoverColor: "hover:bg-orange-400" },
  ],
  [
    { name: "food banks", bgColor: "bg-slate-400", hoverColor: "hover:bg-slate-500" },
    { name: "animal shelters", bgColor: "bg-purple-300", hoverColor: "hover:bg-purple-400" },
    { name: "homeless shelters", bgColor: "bg-green-300", hoverColor: "hover:bg-green-400" },
    { name: "cancer research", bgColor: "bg-orange-300", hoverColor: "hover:bg-orange-400" },
  ],
  [
      { name: "disaster relief", bgColor: "bg-slate-400", hoverColor: "hover:bg-slate-500" },
      { name: "wildlife rescue", bgColor: "bg-purple-300", hoverColor: "hover:bg-purple-400" },
      { name: "affordable housing", bgColor: "bg-green-300", hoverColor: "hover:bg-green-400" },
      { name: "mental health", bgColor: "bg-orange-300", hoverColor: "hover:bg-orange-400" },
  ]
];

export default function WaitlistPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"waitlist" | "collective">("waitlist")
  const [donationAmount, setDonationAmount] = useState(5) // Default $35/month
  const [currentCauseSet, setCurrentCauseSet] = useState(0)
  
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Rotate cause sets every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCauseSet((prev) => (prev + 1) % causeSets.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Join Waitlist form state
  const [waitlistForm, setWaitlistForm] = useState({
    name: "",
    email: "",
    causes: [] as string[],
    monthlyAmount: ""
  })
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)
  const [emailError, setEmailError] = useState("")
  
  // Start a Collective form state
  const [collectiveForm, setCollectiveForm] = useState({
    name: "",
    email: "",
    socialHandle: "",
    idea: "",
    vibe: ""
  })

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!waitlistForm.email.trim() || !waitlistForm.name.trim()) return
    if (!isValidEmail(waitlistForm.email)) {
      setEmailError("Enter a valid email address.")
      return
    }
    setEmailError("")
    
    setIsSubmitting(true)
    setWaitlistSuccess(false)
    
    // Extract category from causes (first one or null)
    const category = waitlistForm.causes.length > 0 ? waitlistForm.causes[0] : null
    
    // Extract amount from monthlyAmount string (e.g., "$5-10" -> "5" or "-1" if not provided)
    let amount = "-1"
    if (waitlistForm.monthlyAmount) {
      const amountMatch = waitlistForm.monthlyAmount.match(/\d+/g)
      if (amountMatch && amountMatch.length > 0) {
        // Take the first number from the range (e.g., "$5-10" -> "5")
        amount = amountMatch[0]
      }
    }

    try {
      await joinWaitlist({
        type: "waitlist",
        name: waitlistForm.name.trim(),
        email: waitlistForm.email.trim(),
        category: category || null,
        amount: amount,
        social_media_handle: null,
        idea: null,
        vibe: null,
      })
      toast.success("You're on the waitlist! We'll be in touch soon.")
      setWaitlistForm({
        name: "",
        email: "",
        causes: [],
        monthlyAmount: ""
      })
      setWaitlistSuccess(true)
    } catch (error) {
      console.error("Waitlist submission failed:", error)
      toast.error("We couldn't join the waitlist. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCollectiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collectiveForm.name.trim() || !collectiveForm.email.trim() || !collectiveForm.idea.trim()) return
    
    setIsSubmitting(true)
    
    try {
      await joinWaitlist({
        type: "collective",
        name: collectiveForm.name.trim(),
        email: collectiveForm.email.trim(),
        category: collectiveForm.vibe || null,
        amount: "-1",
        social_media_handle: collectiveForm.socialHandle.trim() || null,
        idea: collectiveForm.idea.trim() || null,
        vibe: collectiveForm.vibe || null,
      })
      toast.success("Thanks for your interest! We'll be in touch soon.")
      setCollectiveForm({
        name: "",
        email: "",
        socialHandle: "",
        idea: "",
        vibe: ""
      })
    } catch (error) {
      console.error("Collective submission failed:", error)
      toast.error("We couldn't submit your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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
      {/* <ProfileNavbar
        title="Waitlist"
        showMobileMenu={true}
        showDesktopMenu={true}
        showBackButton={false}
      /> */}


{/* Navbar */}
<div className="sticky top-0 z-10 w-full flex items-center justify-between p-4 border-b bg-background">
  {/* <img src="/logo3.png" width={100} height={100} alt="CRWD Logo" /> */}
  <NewLogo />
  <Button variant="ghost" className="px-4 font-bold text-xs sm:text-sm md:text-base lg:text-lg" onClick={() => navigate("/")}>
    See How It Works
  </Button>
</div>

      {/* Hero Section */}
      <div className="bg-card pt-6 pb-12 md:pt-8 md:pb-16 px-4 md:px-6">
        {/* Launch Banner */}
        <div className="max-w-4xl mx-auto text-center mt-10 md:mt-20  mb-6 md:mb-8">
          <div className="w-fit mx-auto bg-[#aeff30] text-black px-4 py-1 rounded-full text-sm font-[800] mb-4 md:mb-6">
            LAUNCHING EARLY 2026
          </div>
          
          <h1 className="font-[900] text-foreground mb-3 md:mb-4 leading-tight" style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}>
            Stop Choosing Between the
            <span className="text-[#1600ff]"> Causes You Care About.</span>
          </h1>
          
          <p className="text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
            One monthly gift. All your causes. Automatic impact. Join the waitlist to become someone who actually shows up.
          </p>
          
          <Button
            onClick={scrollToSection}
            size="lg"
            className="h-14 px-8 rounded-full bg-[#1600ff] text-white font-bold text-lg"
          >
            Join the Waitlist
          </Button>
         
        </div>
      </div>

      {/* See the Magic in Action Section */}
      <div className="bg-gradient-to-br from-[#f1f6ff] via-[#f7f6ff] to-[#fdf3f8] py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-[800] text-foreground mb-3 md:mb-4 text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            See the <span className="text-[#1600ff]">Magic</span> in Action
          </h2>
          <p className="text-muted-foreground mb-8 md:mb-12 text-center" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
            Pick your causes. Give once. Multiply your impact.
          </p>

          {/* Demo Card */}
          <Card className="max-w-[80%] lg:max-w-3xl mx-auto">
            <CardContent className="p-4 md:p-8 lg:p-12">
              <div className="text-gray-500 mb-4 text-center" style={{ fontSize: 'clamp(0.875rem, 2vw, 1.125rem)' }}>
                You can give <span className="text-[#1600ff] font-[900]" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>${donationAmount}</span> /month to
              </div>
              
              {/* Slider */}
              <div className="mb-4 md:mb-6 relative">
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Math.round(Number(e.target.value) / 5) * 5)}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#fff] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1600ff] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1600ff] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
                  style={{
                    background: `linear-gradient(to right, #1600ff 0%, #1600ff ${((donationAmount - 5) / 95) * 100}%, #e5e7eb ${((donationAmount - 5) / 95) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              
              {/* Cause Buttons */}
              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3 mb-4 md:mb-6 justify-center">
                {causeSets[currentCauseSet].map((cause) => (
                  <button
                    key={`${cause.name}-${currentCauseSet}`}
                    className={`px-2 py-1 md:px-4 md:py-2 rounded-full text-primary-foreground text-xs sm:text-sm md:text-base font-medium ${cause.bgColor} ${cause.hoverColor} transition-colors`}
                  >
                    {cause.name}
                  </button>
                ))}
              </div>

              <div className="font-bold text-[#1600ff] mb-3 md:mb-4 text-center" style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)' }}>
                <span className="font-[700]" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.875rem)' }}>= ${donationAmount * 12}</span> /year of impact
              </div>

              {/* Distribution Bar */}
              <div className="flex h-3 md:h-4 rounded-full overflow-hidden mb-3 md:mb-4">
                <div className="bg-pink-500 flex-1" />
                <div className="bg-orange-500 flex-1" />
                <div className="bg-green-500 flex-1" />
                <div className="bg-[#1600ff] flex-1" />
              </div>

              <p className="text-gray-700 mb-6 md:mb-8 text-center font-[600] mt-6" style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                One gift. Multiple causes.
              </p>

              <Button
                onClick={scrollToSection}
                size="lg"
                className="w-full h-11 md:h-12 rounded-full font-bold text-xs xs:text-sm sm:text-base lg:text-lg"
              >
                Get Early Access <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Problem Statement Section */}
      <div className="bg-[#f6f7f9] flex py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
          <h2 className="font-[900] text-foreground mb-3 md:mb-4 text-center" style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}>
            You Care About Everything.<br />
            <span className="text-[#1600ff]">But You Give to Nothing.</span>
          </h2>
          
          <div className="text-center space-y-3 md:space-y-4 text-muted-foreground mt-6 md:mt-8" style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)' }}>
            <p className='text-black font-[600]'>
              Clean water. Education. Climate. Animals. Mental health. Maybe one. Maybe all.
            </p>
            <p>
              But choosing between causes feels impossible. Managing multiple gifts is overwhelming. And deep down, you wonder if it even makes a difference.
            </p>
            <p className="font-[800] text-black">
              So giving gets put off. Again and again.
            </p>
          </div>
        </div>
      </div>

      {/* Headline and Mission Statement Section */}
      <div className="bg-card py-10 md:py-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center py-10">
          <h2 className="font-[900] text-foreground mb-4 md:mb-6" style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}>
            What If You Could Support <span className="text-[#1600ff]">Every Cause With One Decision?</span>
          </h2>
          <p className="font-[700] text-center text-gray-900 mt-10" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.875rem)' }}>
            The most powerful thing about your giving isn't the amount. It's the commitment.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-card py-10 px-4 md:px-6 pb-40">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-[800] text-foreground mb-8 md:mb-12 text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            How It Works:
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#1600ff] flex items-center justify-center mb-4">
                <span className="text-primary-foreground text-xl font-bold">1</span>
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">Pick Your Causes</h4>
              <p className="text-muted-foreground">Add every nonprofit you care about.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#a955f7] flex items-center justify-center mb-4">
                <span className="text-primary-foreground text-xl font-bold">2</span>
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">Set Your Monthly Amount</h4>
              <p className="text-muted-foreground">Start small. Even $5/month makes real Impact.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#ff3366] flex items-center justify-center mb-4">
                <span className="text-primary-foreground text-xl font-bold">3</span>
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">Give to All of Them</h4>
              <p className="text-muted-foreground">While you live your life, you're changing lives every month.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Who We're Building For Section */}
      <div className="bg-[#f8f9ff] py-10 md:py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center font-[900] text-foreground mb-4 md:mb-6" style={{ fontSize: 'clamp(1.875rem, 5vw, 3rem)' }}>
            This is who <span className="text-[#a955f7]">we're building for.</span>
          </h2>
          <p className="mt-10 text-center text-foreground font-[800] max-w-3xl mx-auto" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.875rem)' }}>
            Not the people who already give $1,000/year to one charity. The people who want to give something to everything they care about. 
          </p>
          <p className="mt-8 text-center text-foreground font-[600] max-w-3xl mx-auto" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.875rem)' }}>
            You're one of them. That's why you're here.
          </p>
        </div>
      </div>

      {/* The Question Isn't Section */}
      <div className="bg-gradient-to-br from-[#f0f6ff] via-[#faf3fd] to-[#fdf3f8] py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div>
              <h2 className="font-[800] text-foreground mb-4 md:mb-6" style={{ fontSize: 'clamp(1.875rem, 5vw, 3rem)' }}>
                The Question Isn't <span className="text-[#1600ff]">"Can I Afford to Give?"</span>
              </h2>
              <p className="text-foreground font-[800]" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.875rem)' }}>
                The Question Is: "Can I Afford Not to Become Someone Who Shows Up?"
              </p>
              <p className="text-muted-foreground mb-6 md:mb-8 mt-8" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
                You've been meaning to give. You've been caring from the sidelines. 
              </p>

              <p className="text-black font-[800] mb-6 md:mb-8 mt-8" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
                Today, that changes. 
              </p>

              <p className="text-muted-foreground mb-6 md:mb-8 mt-8" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
                Join the waitlist. Support multiple causes with one decision. Set it once. Change everything.
              </p>

              <Button
                onClick={scrollToSection}
                size="lg"
                className="h-14 md:h-12 px-6 md:px-8 font-[800] rounded-full"
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
                {/* <div className="absolute top-4 left-4 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md">
                  <div className="w-6 h-6 bg-[#1600ff] rounded-full" />
                </div>
                <div className="absolute bottom-4 left-4 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md">
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-green-500" />
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md">
                  <div className="w-6 h-6 bg-purple-500 rounded" />
                </div>
                <div className="absolute bottom-4 right-4 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md">
                  <div className="w-6 h-6 bg-pink-500 rounded-full" />
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div ref={sectionRef} className="w-full bg-[#edeff1]  md:top-0 z-40 flex justify-center">
        <div className="pt-16 w-full">
        <div className=" max-w-[90%] md:max-w-[80%] lg:max-w-[70%] mx-auto px-4 py-1.5 md:py-2 flex justify-center gap-3 md:gap-4 bg-[#eae0f8] rounded-xl">
          <button
            onClick={() => {
              setActiveTab("waitlist")
              const element = document.getElementById('tab-content')
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={`rounded-xl px-4 w-full py-1.5 md:px-6 md:py-3 font-medium transition-all ${
              activeTab !== "waitlist"
                ? "bg-[#eae0f8] text-gray-700 font-[800]"
                : "bg-white text-gray-700 border border-[#eae0f8] font-[800]"
            }`}
            style={{ fontSize: 'clamp(0.875rem, 2vw, 1.125rem)' }}
          >
            Join Waitlist
          </button>
          <button
            onClick={() => {
              setActiveTab("collective")
              const element = document.getElementById('tab-content')
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={`rounded-xl w-full px-4 py-1.5 md:px-6 md:py-3 font-medium transition-all ${
              activeTab !== "collective"
                ? "bg-[#eae0f8] text-gray-700 font-[800]"
                : "bg-white text-gray-700 border border-[#eae0f8] font-[800]"
            }`}
            style={{ fontSize: 'clamp(0.875rem, 2vw, 1.125rem)' }}
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
            <div className="bg-[#edeff1] py-10 md:py-16 px-4 md:px-6">
              <div className="max-w-2xl mx-auto">
                <h2 className="font-[900] text-[#1600ff] mb-3 md:mb-4 text-center" style={{ fontSize: 'clamp(1.875rem, 3vw, 2.5rem)' }}>
                  Join people who are ready to stop choosing and start giving.
                </h2>
                <p className="text-muted-foreground mb-8 md:mb-12 text-center" style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>
                  Get early access when we launch in 2026
                </p>

                {/* Form Card */}
                <Card>
                  <CardContent className="p-4 md:p-8 lg:p-12">
            <form onSubmit={handleWaitlistSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Address*
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={waitlistForm.email}
                  onChange={(e) => {
                    const value = e.target.value
                    setWaitlistForm(prev => ({ ...prev, email: value }))
                    if (emailError && isValidEmail(value)) {
                      setEmailError("")
                    }
                  }}
                  className="w-full h-12 bg-gray-100"
                  required
                />
                {emailError && (
                  <p className="text-xs text-rose-500 mt-2">
                    {emailError}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name*
                </label>
                <Input
                  type="text"
                  placeholder="Alex"
                  value={waitlistForm.name}
                  onChange={(e) => setWaitlistForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-12 bg-gray-100"
                  required
                />
              </div>

              {/* Causes */}
              <div>
                <label className="block text-sm font-semibold mb-3">
                  Which causes do you care about? (optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {causes.map((cause) => (
                    <label
                      key={cause}
                      className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={waitlistForm.causes.includes(cause)}
                        onChange={() => toggleCause(cause)}
                        className="w-4 h-4 text-[#1600ff] border-gray-300 rounded-sm focus:ring-[#1600ff]"
                      />
                      <span className="text-gray-700" style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>{cause}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Monthly Amount */}
              <div>
                <label className="block text-sm font-semibold mb-3">
                  How much would you donate monthly? (optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["$5-10", "$10-25", "$25-50", "$50+"].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setWaitlistForm(prev => ({ ...prev, monthlyAmount: amount }))}
                      className={`h-12 rounded-full border-2 transition-colors ${
                        waitlistForm.monthlyAmount === amount
                          ? "border-[#1600ff] bg-[#1600ff] font-bold text-white"
                          : "border-gray-300 bg-white font-bold text-gray-700 hover:border-[#1600ff]"
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
                className="w-full h-12 rounded-full font-semi bold text-lg"
              >
                {isSubmitting ? "Joining..." : "Join the Waitlist"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {waitlistSuccess && (
                <p className="text-sm text-emerald-700 text-center mt-2">
                  Thanks! We'll be in touch as soon as we launch.
                </p>
              )}

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
            <div className="bg-[#edeff1] py-10 md:py-16 px-4 md:px-6">
              <div className="max-w-4xl mx-auto">
                {/* Early Founder Program Tag */}
                <div className="text-center mb-4 md:mb-6">
                  <div className="inline-block bg-[#aeff30] text-black px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold">
                    EARLY FOUNDER PROGRAM
                  </div>
                </div>

                {/* Title */}
                <h2 className="font-[800] text-[#1600ff] mb-3 md:mb-4 text-center" style={{ fontSize: 'clamp(1.875rem, 3vw, 2.5rem)' }}>
                  Start a Collective
                </h2>
                <h3 className="font-[800] text-gray-700 mb-3 md:mb-4 text-center" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>
                  Lead a Giving Community Around What You Care About.
                </h3>
                <p className="text-muted-foreground mb-8 md:mb-12 text-center max-w-3xl mx-auto" style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>
            Rally your friends, family, followers, or anyone who shares your passion. Pick the causes. They join and give monthly. Watch your collective impact grow.
          </p>

                {/* Feature Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 md:gap-6 mb-10 md:mb-16">
            {/* We'll Match Donations */}
            <Card>
              <CardContent className="px-6">
              <div className="w-12 h-12 bg-[#aeff30] rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-[800] text-foreground mb-2" style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)' }}>We'll Match Donations</h4>
              <p className="text-muted-foreground" style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>Get up to $200 in matched donations to jumpstart your collective's impact.</p>
            </CardContent>
            </Card>

            {/* Get In First */}
            <Card>
              <CardContent className="px-6">
              <div className="w-12 h-12 bg-[#a854f7] rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-[800] text-foreground mb-2" style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)' }}>Get In First</h4>
              <p className="text-muted-foreground" style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>Early access means you get to build your community before everyone else even knows we exist.</p>
            </CardContent>
            </Card>

            {/* We'll Help You Grow */}
            <Card>
              <CardContent className="px-6">
              <div className="w-12 h-12 bg-[#ff3366] rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-[800] text-foreground mb-2" style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)' }}>We'll Help You Grow</h4>
              <p className="text-muted-foreground" style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>Your collective gets featured in our campaigns so you can rally more people to your cause.</p>
            </CardContent>
            </Card>

            {/* Build With Us */}
            <Card>
              <CardContent className="px-6">
              <div className="w-12 h-12 bg-[#1600ff] rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-[800] text-foreground mb-2" style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)' }}>Build With Us</h4>
              <p className="text-muted-foreground" style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>Work directly with the CRWD team to shape features and make the platform better for everyone.</p>
            </CardContent>
            </Card>
          </div>

                {/* Become a Collective Founder Form */}
                <Card>
                  <CardContent className="p-4 md:p-8 lg:p-12">
                  <h3 className="font-[800] text-gray-900 mb-6 md:mb-8 text-center" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.875rem)' }}>Become a Collective Founder</h3>
            
            <form onSubmit={handleCollectiveSubmit} className="space-y-6">
              {/* Your Name */}
              <div>
                <label className="block font-bold text-gray-900 mb-2" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1rem)' }}>
                  Your Name*
                </label>
                <Input
                  type="text"
                  value={collectiveForm.name}
                  onChange={(e) => setCollectiveForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-12 bg-gray-100"
                  required
                  placeholder="Alex Johnson"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block font-bold text-gray-900 mb-2" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1rem)' }}>
                  Email Address*
                </label>
                <Input
                  type="email"
                  value={collectiveForm.email}
                  onChange={(e) => setCollectiveForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-12 bg-gray-100"
                  required
                  placeholder="you@example.com"
                />
              </div>

              {/* Social Media Handle */}
              <div>
                <label className="block font-bold text-gray-900 mb-2" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1rem)' }}>
                  Social Media Handle (optional)
                </label>
                <Input
                  type="text"
                  value={collectiveForm.socialHandle}
                  onChange={(e) => setCollectiveForm(prev => ({ ...prev, socialHandle: e.target.value }))}
                  className="w-full h-12 bg-gray-100"
                  placeholder="@yourusername"
                />
                <p className="text-sm text-gray-500 mt-1">Instagram, TikTok, X/Twitter, or any platform.</p>
              </div>

              {/* Collective Idea */}
              <div>
                <label className="block font-bold text-gray-900 mb-2" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1rem)' }}>
                  What's your collective idea?*
                </label>
                <Textarea
                  value={collectiveForm.idea}
                  onChange={(e) => setCollectiveForm(prev => ({ ...prev, idea: e.target.value }))}
                  className="w-full min-h-[120px] bg-gray-100"
                  required
                  placeholder='E.g., "Ocean Lovers" - For people who want to protect our oceans and marine life.'
                />
                <p className="text-sm text-gray-500 mt-1">What causes? Who would join? What's the vibe? Dream big!</p>
              </div>

              {/* Main Vibe */} 
              <div>
                <label className="block font-bold text-gray-900 mb-2" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1rem)' }}>
                  Main vibe? (optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {collectiveCauses.map((cause) => (
                    <button
                      key={cause}
                      type="button"
                      onClick={() => setCollectiveForm(prev => ({ ...prev, vibe: cause }))}
                      className={`h-10 md:h-12 rounded-full border-2 transition-colors text-sm md:text-base ${
                        collectiveForm.vibe === cause
                          ? "border-[#1600ff] bg-[#1600ff] text-white"
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
                className="w-full h-12 bg-[#a955f7] hover:bg-[#8a3feb] text-white font-[800] rounded-full"
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

