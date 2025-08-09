"use client"

import React, { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Button from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Textarea } from "@/components/atoms/textarea"
import { Label } from "@/components/atoms/label"
import { Badge } from "@/components/atoms/badge"

type StepProps = {
  nextStep: () => void
  prevStep: () => void
}

const MAX_BIO = 500

const schema = z.object({
  // Photo moved to Personal step
  // Basic details moved to Personal step
  about: z
    .string()
    .min(1, "About me is required")
    .max(MAX_BIO, `Max ${MAX_BIO} characters`),
  certifications: z.array(z.string()).min(1, "Add at least 1 certification"),
  specializations: z.array(z.string()).min(1, "Add at least 1 specialization"),
})

type FormValues = z.infer<typeof schema>

const COMMON_CERTS = [
  "Licensed Physiotherapist",
  "Sports Rehabilitation Specialist",
  "Manual Therapy Certified",
  "Dry Needling Certified",
  "Orthopedic Certified Specialist",
  "Pediatric Physical Therapy",
  "Geriatric Certified Specialist",
]

const COMMON_SPECIALIZATIONS = [
  "Sports Injury Recovery",
  "Post-Surgical Rehabilitation",
  "Chronic Pain Management",
  "Movement Analysis",
  "Orthopedic Therapy",
  "Neurological Rehabilitation",
  "Pediatric Physical Therapy",
  "Geriatric Care",
  "Workplace Injury Prevention",
]

export default function ProfessionalStep({ nextStep, prevStep }: StepProps) {
  // Photo handlers removed (moved to Personal step)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      // Basic details moved to Personal step
      about: "",
      certifications: [],
      specializations: [],
    },
  })

  const about = watch("about")
  const certifications = watch("certifications")
  const specializations = watch("specializations")
  const [certInput, setCertInput] = useState("")
  const [specInput, setSpecInput] = useState("")

  // Photo handlers removed

  const onSubmit = (values: FormValues) => {
    const payload = {
      about: values.about,
      certifications,
      specializations,
    }
    console.log("[Onboarding] Professional save payload", payload)
    nextStep()
  }

  const handleAddToken = (field: "certifications" | "specializations", token: string) => {
    const current = field === "certifications" ? certifications : specializations
    if (current.includes(token)) return
    const next = [...current, token]
    setValue(field, next, { shouldValidate: true })
  }

  const handleRemoveToken = (field: "certifications" | "specializations", token: string) => {
    const current = field === "certifications" ? certifications : specializations
    const next = current.filter((t) => t !== token)
    setValue(field, next, { shouldValidate: true })
  }

  const handleCustomAdd = (
    field: "certifications" | "specializations",
    value: string,
    clear: () => void
  ) => {
    const trimmed = value.trim()
    if (!trimmed) return
    handleAddToken(field, trimmed)
    clear()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Photo moved to Personal step */}

      {/* Basic details moved to Personal step */}

      {/* About */}
      <div>
        <Label htmlFor="about">About Me *</Label>
        <Textarea
          id="about"
          rows={5}
          placeholder="Share your professional background, experience, and approach to patient care..."
          {...register("about")}
        />
        <div className="mt-1 flex items-center justify-between text-xs text-n-4">
          <span>Tell patients what makes you unique and why they should choose you</span>
          <span>
            {about?.length || 0}/{MAX_BIO}
          </span>
        </div>
        {errors.about && <p className="mt-1 text-xs text-color-3">{errors.about.message}</p>}
      </div>

      {/* Certifications */}
      <div className="space-y-2">
        <Label>Certifications *</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a certification..."
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleCustomAdd("certifications", certInput, () => setCertInput(""))
              }
            }}
          />
          <Button
            type="button"
            className="px-4"
            onClick={() => handleCustomAdd("certifications", certInput, () => setCertInput(""))}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {certifications.map((c) => (
            <Badge
              key={c}
              variant="outline"
              className="cursor-pointer hover:bg-n-7 border-color-1 bg-color-1 text-n-1"
              onClick={() => handleRemoveToken("certifications", c)}
            >
              {c}
            </Badge>
          ))}
        </div>
        <div className="text-xs text-n-4">Common certifications (click to add):</div>
        <div className="flex flex-wrap gap-2">
          {COMMON_CERTS.map((c) => {
            const isSelected = certifications.includes(c)
            return (
              <Badge
                key={c}
                variant="outline"
                className={`cursor-pointer hover:bg-n-7 ${
                  isSelected ? "border-color-1 bg-color-1 text-n-1" : ""
                }`}
                onClick={() => handleAddToken("certifications", c)}
              >
                {c}
              </Badge>
            )
          })}
        </div>
        {errors.certifications && (
          <p className="mt-1 text-xs text-color-3">{errors.certifications.message as string}</p>
        )}
      </div>

      {/* Specializations */}
      <div className="space-y-2">
        <Label>Treatment Specializations *</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a specialization..."
            value={specInput}
            onChange={(e) => setSpecInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleCustomAdd("specializations", specInput, () => setSpecInput(""))
              }
            }}
          />
          <Button
            type="button"
            className="px-4"
            onClick={() => handleCustomAdd("specializations", specInput, () => setSpecInput(""))}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {specializations.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="cursor-pointer hover:bg-n-7 border-color-1 bg-color-1 text-n-1"
              onClick={() => handleRemoveToken("specializations", s)}
            >
              {s}
            </Badge>
          ))}
        </div>
        <div className="text-xs text-n-4">Common specializations (click to add):</div>
        <div className="flex flex-wrap gap-2">
          {COMMON_SPECIALIZATIONS.map((s) => {
            const isSelected = specializations.includes(s)
            return (
              <Badge
                key={s}
                variant="outline"
                className={`cursor-pointer hover:bg-n-7 ${
                  isSelected ? "border-color-1 bg-color-1 text-n-1" : ""
                }`}
                onClick={() => handleAddToken("specializations", s)}
              >
                {s}
              </Badge>
            )
          })}
        </div>
        {errors.specializations && (
          <p className="mt-1 text-xs text-color-3">{errors.specializations.message as string}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="button" className="px-5" onClick={prevStep}>
          Prev
        </Button>
        <Button type="submit" className="px-6">
          Save and Continue
        </Button>
      </div>
    </form>
  )
}


