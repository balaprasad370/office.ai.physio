"use client"

import React,{useRef} from "react"
import Button from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Label } from "@/components/atoms/label"
import Configuration from "@/components/sections/dashboard/voice/configuration"
import Outbound from "@/components/sections/dashboard/voice/outbound"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/axios"
    
type StepProps = {
  nextStep: () => void
  prevStep: () => void
}

export default function VoiceConfigStep({ nextStep, prevStep }: StepProps) {
  const [phone, setPhone] = React.useState("")
  const router = useRouter()
  const configRef = React.useRef(null)
  const onSave = async () => {
    try {

      configRef.current.handleSave();

      const res = await apiClient.post("/onboarding/voice-config", { phone })
      console.log("[Onboarding] Voice Config save response", res.data)
      router.push("/dashboard")
    } catch (error) {
      console.error("[Onboarding] Voice Config save error", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5">


        <div className="grid grid-cols-1 gap-5">
          <Outbound />
          <Configuration ref={configRef} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button className="px-5" onClick={prevStep}>
          Prev
        </Button>
        <Button className="px-6" onClick={onSave}>
          Save and Finish
        </Button>
      </div>
    </div>
  )
}
