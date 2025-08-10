"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Button from "@/components/atoms/button"
import ButtonGradient from "@/components/svg/button-gradient"
import PersonalStep from "@/components/sections/dashboard/onboarding/personal"
import ProfessionalStep from "@/components/sections/dashboard/onboarding/professional" 
import ExperienceStep from "@/components/sections/dashboard/onboarding/experience"
import VoiceConfigStep from "@/components/sections/dashboard/onboarding/voice-config"
import { apiClient } from "@/lib/axios"
import { Check } from "lucide-react"

type StepProps = { nextStep: () => void; prevStep: () => void }

const ONBOARDING_STEPS: { key: string; title: string; component: React.ComponentType<StepProps> }[] = [
  {
    key: "PERSONAL",
    title: "Personal",
    component: PersonalStep,
  },
  {
    key: "PROFESSIONAL", 
    title: "Professional",
    component: ProfessionalStep,
  },
  {
    key: "EXPERIENCE",
    title: "Experience", 
    component: ExperienceStep,
  },
  {
    key: "VOICE_CONFIG",
    title: "Voice Configuration",
    component: VoiceConfigStep,
  }
]

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(new Set())
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipToEnd = () => {
    setCurrentStep(ONBOARDING_STEPS.length - 1)
  }

  // Map API step keys to local step keys
  const apiToLocalKey: Record<string, string> = useMemo(() => ({
    PROFILE: "PERSONAL",
    PROFESSIONAL: "PROFESSIONAL",
    EXPERIENCE: "EXPERIENCE",
    VOICE: "VOICE_CONFIG",
    VOICE_CONFIG: "VOICE_CONFIG",
  }), [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await apiClient.get("/accounts/status")
        const obj = res?.data?.obj
        if (!obj) return
        const completedFromApi: string[] = (() => {
          try {
            return JSON.parse(obj.completedSteps || "[]")
          } catch {
            return []
          }
        })()
        const mappedCompleted = new Set(
          completedFromApi.map((k) => apiToLocalKey[k] || k).filter(Boolean)
        )
        const mappedCurrent = apiToLocalKey[obj.currentStep] || obj.currentStep
        const idx = ONBOARDING_STEPS.findIndex((s) => s.key === mappedCurrent)
        if (mounted) {
          setCompletedKeys(mappedCompleted)
          if (idx >= 0) setCurrentStep(idx)
        }
      } catch (e) {
        // silent fail for onboarding UI
      } finally {
        if (mounted) setIsLoadingStatus(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [apiToLocalKey])

  return (
    <div className="min-h-screen bg-n-8 p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Left sidebar: steps (desktop) */}
        <aside className="hidden md:block md:col-span-4 rounded-xl border border-n-6 bg-n-8 p-6 h-fit sticky top-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-n-1">Onboarding</h2>
            <p className="text-xs text-n-4">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</p>
          </div>
          <ol className="space-y-2">
            {ONBOARDING_STEPS.map((step, index) => {
              const isActive = index === currentStep
              const isCompleted = completedKeys.has(step.key) || index < currentStep
              return (
                <li key={step.key}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                      isCompleted
                        ? "border-color-1 bg-color-1/10"
                        : isActive
                        ? "border-color-1 bg-n-7"
                        : "border-n-6 bg-n-8 hover:bg-n-7"
                    }`}
                  >
                    <span className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-medium ${
                      isCompleted ? "bg-color-1 text-n-1" : isActive ? "bg-n-6 text-n-1" : "bg-n-7 text-n-3"
                    }`}>
                      {isCompleted ? <Check className="size-4" /> : index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-n-1">{step.title}</div>
                      <div className="text-[11px] text-n-4">{isCompleted ? "Completed" : isActive ? "In progress" : "Pending"}</div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ol>
        </aside>

        {/* Mobile stepper */}
        <div className="md:hidden rounded-xl border border-n-6 bg-n-8 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-n-1">Onboarding</h2>
            <span className="text-xs text-n-4">{currentStep + 1}/{ONBOARDING_STEPS.length}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {ONBOARDING_STEPS.map((step, index) => {
              const isActive = index === currentStep
              const isCompleted = completedKeys.has(step.key) || index < currentStep
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${
                    isCompleted
                      ? "border-color-1 bg-color-1 text-n-1"
                      : isActive
                      ? "border-color-1 bg-n-7 text-n-1"
                      : "border-n-6 bg-n-8 text-n-2"
                  }`}
                >
                  {step.title}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right content: active step */}
        <section className="md:col-span-8 rounded-xl border border-n-6 bg-n-8 p-4 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-n-1">{ONBOARDING_STEPS[currentStep].title}</h1>
            {currentStep < ONBOARDING_STEPS.length - 1 && (
              <button
                onClick={skipToEnd}
                className="rounded-md border border-color-1 px-4 py-2 text-color-1 hover:bg-color-1 hover:text-n-1 transition-colors disabled:opacity-50"
              >
                Skip for now
              </button>
            )}
          </div>
          {(() => {
            const StepComp = ONBOARDING_STEPS[currentStep].component
            return <StepComp nextStep={nextStep} prevStep={prevStep} />
          })()}
        </section>
      </div>
      <div className="mx-auto max-w-6xl">
        <ButtonGradient />
      </div>
    </div>
  )
}
