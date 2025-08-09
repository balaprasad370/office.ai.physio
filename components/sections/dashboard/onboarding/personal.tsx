"use client"

import React, { useRef, useState } from "react"
import Button from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Label } from "@/components/atoms/label"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

type StepProps = {
  nextStep: () => void
  prevStep: () => void
}

const schema = z.object({
  photo: z
    .any()
    .refine((file) => !file || (file instanceof File && file.size <= 5 * 1024 * 1024), "Max 5MB")
    .refine(
      (file) =>
        !file ||
        (file instanceof File && ["image/jpeg", "image/png", "image/webp"].includes(file.type)),
      "JPG, PNG, or WebP only"
    )
    .optional(),
  fullName: z.string().min(1, "Full name is required"),
  title: z.string().min(1, "Professional title is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Practice location is required"),
})

type FormValues = z.infer<typeof schema>

export default function PersonalStep({ nextStep, prevStep }: StepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      photo: undefined,
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
    },
  })

  const onSubmit = (values: FormValues) => {
    const payload = {
      fullName: values.fullName,
      title: values.title,
      email: values.email,
      phone: values.phone,
      location: values.location,
      hasPhoto: !!(values as any).photo,
    }
    console.log("[Onboarding] Personal save payload", payload)
    nextStep()
  }

  const onDropFiles = (files?: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    setValue("photo", file, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Photo uploader */}
      <div className="space-y-3">
        <Label>Profile Photo (optional)</Label>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragActive(false)
            onDropFiles(e.dataTransfer?.files)
          }}
          className={`rounded-xl border border-dashed border-n-6 p-6 text-center transition-colors ${
            dragActive ? "bg-n-7" : "bg-n-8"
          }`}
        >
          <p className="text-sm text-n-2 font-medium mb-1">
            Add a professional photo to make your profile stand out
          </p>
          <p className="text-xs text-n-4 mb-4">Drag & drop your photo here</p>
          <p className="text-xs text-n-4">
            JPG, PNG, or WebP • Max 5MB • Recommended: 512x512px
          </p>
          <div className="mt-4">
            <Button
              type="button"
              className="px-4"
              onClick={() => inputRef.current?.click()}
            >
              Choose File
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => onDropFiles(e.target.files)}
            />
          </div>
          {errors.photo && (
            <p className="mt-2 text-xs text-color-3">{errors.photo.message as string}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input id="fullName" placeholder="Dr. Sarah Patterson" {...register("fullName")} />
          {errors.fullName && (
            <p className="mt-1 text-xs text-color-3">{errors.fullName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="title">Professional Title *</Label>
          <Input id="title" placeholder="Licensed Physiotherapist" {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-color-3">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input id="email" placeholder="sarah@example.com" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-color-3">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input id="phone" placeholder="(555) 123-4567" {...register("phone")} />
          {errors.phone && <p className="mt-1 text-xs text-color-3">{errors.phone.message}</p>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="location">Practice Location *</Label>
          <Input
            id="location"
            placeholder="Downtown Physiotherapy Clinic"
            {...register("location")}
          />
          {errors.location && (
            <p className="mt-1 text-xs text-color-3">{errors.location.message}</p>
          )}
        </div>
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


