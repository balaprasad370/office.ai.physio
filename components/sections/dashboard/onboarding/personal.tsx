"use client"

import React, { useCallback, useRef, useState,useEffect } from "react"
import Button from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Label } from "@/components/atoms/label"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import apiClient from "@/lib/axios/apiClient"
import Cropper from "react-easy-crop"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/atoms/dialog"

type StepProps = {
  nextStep: () => void
  prevStep: () => void
}

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"), 
  title: z.string().min(1, "Professional title is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Practice location is required"),
})

type FormValues = z.infer<typeof schema>

export default function PersonalStep({ nextStep, prevStep }: StepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const filesServerUrl = process.env.NEXT_PUBLIC_IMAGE_CDN_ENDPOINT
  const imageApiEndpoint = process.env.NEXT_PUBLIC_IMAGE_API_ENDPOINT
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | undefined>(undefined)
  const [uploadedFilepath, setUploadedFilepath] = useState<string | undefined>(undefined)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [profilePic, setProfilePic] = useState<string | undefined>(undefined)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      photo: undefined,
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
    },
  })

  useEffect(() => {
    try {
      async function getProfileDetails() {
        const res = await apiClient.get("/onboarding/personal")
        console.log("[Onboarding] Personal get response", res.data)
        if (res.data.status) {
          const data = res.data.data
          setValue("firstName", data.first_name)
          setValue("lastName", data.last_name)
          setValue("title", data.designation)
          setValue("email", data.email)
          setValue("photo", data.profile_pic)
          setValue("phone", data.mobile)
          setValue("location", data.company)
          setProfilePic(data.profile_pic)
        }
      }
      getProfileDetails()
    } catch (error) {
      console.error("[Onboarding] Personal get error", error)
    }
  }, [setValue])

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      const payload = {
        first_name: values.firstName,
        last_name: values.lastName,
        professional_title: values.title,
        email: values.email,
        phone_number: values.phone,
        location: values.location,
      }

      if (uploadedUrl && uploadedFilepath) {
        payload.photo = uploadedUrl
        payload.photo_filepath = uploadedFilepath
      }

      console.log("[Onboarding] Personal save payload", payload)
      await apiClient.post("/onboarding/personal", payload)
      nextStep()
    } catch (error) {
      console.error("[Onboarding] Personal save error", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDropFiles = (files?: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string)
      setIsCropperOpen(true)
    })
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_croppedArea: any, pixels: any) => {
    setCroppedAreaPixels(pixels)
  }, [])

  function getCroppedBlob(imageSrcLocal: string, pixels: any): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = "anonymous"
      image.src = imageSrcLocal
      image.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("No 2d context"))
        canvas.width = pixels.width
        canvas.height = pixels.height
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height
        ctx.drawImage(
          image,
          pixels.x * scaleX,
          pixels.y * scaleY,
          pixels.width * scaleX,
          pixels.height * scaleY,
          0,
          0,
          pixels.width,
          pixels.height
        )
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Canvas empty"))
          resolve(blob)
        }, "image/jpeg")
      }
      image.onerror = (e) => reject(e)
    })
  }

  const uploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels || !imageApiEndpoint) {
      setIsCropperOpen(false)
      return
    }
    try {
      setIsUploading(true)
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels)
      const formData = new FormData()
      formData.append("file", blob, `profile_${Date.now()}.jpg`)
      const resp = await apiClient.post(`${imageApiEndpoint}/upload/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const filepath = resp?.data?.filepath
      const cdnUrl = filepath && filesServerUrl ? `${filesServerUrl}${filepath}` : undefined
      setUploadedFilepath(filepath)
      setUploadedUrl(cdnUrl)
      console.log("[Onboarding] Personal image uploaded", { filepath, cdnUrl })
    } catch (e) {
      console.error("[Onboarding] Personal image upload error", e)
    } finally {
      setIsUploading(false)
      setIsCropperOpen(false)
      setImageSrc(null)
    }
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
            JPG, PNG, or WebP files accepted
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              type="button"
              className="px-4"
              onClick={() => inputRef.current?.click()}
            >
              Choose File
            </Button>
            {(uploadedUrl || profilePic) && (
              <img src={uploadedUrl || profilePic} alt="Profile preview" className="h-16 w-16 rounded-full border border-n-6 object-cover" />
            )}
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

      {/* Cropper Dialog */}
      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop your photo</DialogTitle>
          </DialogHeader>
          <div className="relative h-[300px] w-full bg-n-7 rounded-lg overflow-hidden">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={false}
              />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" className="px-4">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              className="px-4 bg-color-1 text-n-1 border border-color-1 hover:bg-color-1/90"
              onClick={uploadCroppedImage}
            >
              {isUploading ? "Uploading..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" placeholder="Sarah" {...register("firstName")} />
          {errors.firstName && (
            <p className="mt-1 text-xs text-color-3">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" placeholder="Patterson" {...register("lastName")} />
          {errors.lastName && (
            <p className="mt-1 text-xs text-color-3">{errors.lastName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="title">Professional Title *</Label>
          <Input id="title" placeholder="Licensed Physiotherapist" {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-color-3">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input id="email" placeholder="sarah@example.com" {...register("email")} readOnly disabled className="bg-n-7 cursor-not-allowed" />
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
          {isSubmitting ? "Saving..." : "Save and Continue"}
        </Button>
      </div>
    </form>
  )
}
