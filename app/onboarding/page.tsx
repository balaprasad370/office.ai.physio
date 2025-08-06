"use client"

import React, { useState } from "react"
import Link from "next/link"
import Button from "@/components/atoms/button"
import Profile from "@/components/sections/dashboard/onboarding/profile"
import Work from "@/components/sections/dashboard/onboarding/work"
import ButtonGradient from "@/components/svg/button-gradient";
import Referral from "@/components/sections/dashboard/onboarding/referral";
import Complete from "@/components/sections/dashboard/onboarding/complete";


export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipToEnd = () => {
    setCurrentStep(steps.length - 1)
  }

  const steps = [
    {
      title: "Profile",
      component: <Profile nextStep={nextStep} prevStep={prevStep} />,
    },
    {
      title: "Work Details",
      component: <Work nextStep={nextStep} prevStep={prevStep} />,
    },
    {
      title: "Referral",
      component: <Referral nextStep={nextStep} prevStep={prevStep} />,
    },
    {
      title: "complete",
      component: <Complete nextStep={nextStep} prevStep={prevStep} />,
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-n-8 p-6">
      <div className="w-full max-w-2xl rounded-xl border border-n-6 bg-n-8 p-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-n-1">
            {steps[currentStep].title}
          </h1>

          {currentStep < steps.length - 1 && (
            <button
              onClick={skipToEnd}
              className="rounded-md border border-color-1 px-4 py-2 text-color-1 hover:bg-color-1 hover:text-n-1 transition-colors disabled:opacity-50"
            >
              Skip for now
            </button>
          )}
        </div>

        {steps[currentStep].component}
      </div>
      <ButtonGradient />
    </div>
  )
}
