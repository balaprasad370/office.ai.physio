"use client"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { apiClient } from "@/lib/axios"
import axios from "axios"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Cropper from "react-easy-crop"

const filesServerUrl = process.env.NEXT_PUBLIC_IMAGE_CDN_ENDPOINT

// Custom Modal Component
type CustomModalProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

function CustomModal({ open, onClose, children }: CustomModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      style={{ backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="max-w-full rounded-lg bg-n-7 p-0 shadow-lg"
        style={{ minWidth: 320, minHeight: 100 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-2">
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-xl font-bold text-n-3 hover:text-n-1"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  )
}

const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: "First name must be at least 2 characters.",
    })
    .max(30, {
      message: "First name must not be longer than 30 characters.",
    }),
  lastName: z
    .string()
    .min(2, {
      message: "Last name must be at least 2 characters.",
    })
    .max(30, {
      message: "Last name must not be longer than 30 characters.",
    }),
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
  photo: z.string().optional(),
  photo_filepath: z.string().optional(),
  description: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const defaultValues: Partial<ProfileFormValues> = {
  firstName: "",
  lastName: "",
  email: "",
  photo: "",
  photo_filepath: "",
  description: "",
}

// Helper to crop image using canvas
function getCroppedImg(
  imageSrc: string,
  crop: any,
  zoom: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.crossOrigin = "anonymous"
    image.src = imageSrc
    image.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return reject("No ctx")
      canvas.width = crop.width
      canvas.height = crop.height

      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      )
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"))
          return
        }
        resolve(blob)
      }, "image/jpeg")
    }
    image.onerror = (e) => reject(e)
  })
}

const Profile = ({
  nextStep,
  prevStep,
}: {
  nextStep: () => void
  prevStep: () => void
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Cropper state
  const [showCropper, setShowCropper] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalFileName, setOriginalFileName] = useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const getData = async () => {
    try {
      const response = await apiClient.get("/profile/getDetails")
      const data = response.data.data

      form.setValue("firstName", data.first_name || "")
      form.setValue("lastName", data.last_name || "")
      form.setValue("email", data.email || "")
      if (data.profile_pic) {
        form.setValue("photo", data.profile_pic)
      } else if (data.photo) {
        form.setValue("photo", data.photo)
      }
      if (data.photo_filepath) {
        form.setValue("photo_filepath", data.photo_filepath)
      }
      if (data.description) {
        form.setValue("description", data.description)
      }
    } catch (error) {
      toast.error("Failed to fetch profile data")
      console.error(error)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setOriginalFileName(file.name)
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string)
      setShowCropper(true)
    })
    reader.readAsDataURL(file)
  }

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  function getUniqueFileName(originalName: string) {
    const dotIdx = originalName.lastIndexOf(".")
    const base =
      dotIdx !== -1 ? originalName.substring(0, dotIdx) : originalName
    const ext = dotIdx !== -1 ? originalName.substring(dotIdx) : ""
    const timestamp = Date.now()
    return `${base}_${timestamp}${ext}`
  }

  const uploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setIsUploading(true)
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, zoom)
      const formData = new FormData()
      const fileNameToUse = originalFileName
        ? getUniqueFileName(originalFileName)
        : `profile_${Date.now()}.jpg`
      formData.append("file", croppedBlob, fileNameToUse)
      const response = await axios.post(
        `https://server.indephysio.com/upload/image`,
        formData
      )

      const filepath = response.data.filepath
      const cdnUrl = filesServerUrl + filepath

      form.setValue("photo", cdnUrl)
      form.setValue("photo_filepath", filepath)
      toast.success("Profile photo uploaded!")
      setShowCropper(false)
      setImageSrc(null)
      setSelectedFile(null)
      setOriginalFileName(null)
    } catch (err) {
      toast.error("Failed to upload image")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const obj = {
        first_name: data.firstName,
        last_name: data.lastName,
        photo: data.photo,
        photo_filepath: data.photo_filepath,
        description: data.description,
      }

      const response = await apiClient.post("/profile/onboarding/update-details", obj)

      if (response.data.status) {
        toast.success(response.data.message)
        nextStep()
      } else {
        toast.error(response.data.message)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || "An error occurred")
    }
  }

  return (
    <>
      {showCropper && imageSrc && (
        <CustomModal open={showCropper} onClose={() => setShowCropper(false)}>
          <div className="flex flex-col items-center p-4">
            <div className="relative h-[300px] w-[300px] bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
                cropShape="rect"
                showGrid={false}
              />
            </div>
            <div className="mt-4 flex gap-4">
              <button
                type="button"
                className="rounded-lg px-6 py-3 text-n-1 border border-n-6 bg-n-7 hover:bg-n-6 transition-colors"
                onClick={() => setShowCropper(false)}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg px-6 py-3 text-n-1 bg-color-1 hover:bg-color-1/90 transition-colors"
                onClick={uploadCroppedImage}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Save"}
              </button>
            </div>
          </div>
        </CustomModal>
      )}

      <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="text-n-1 text-xl font-semibold">
          Complete Your Profile
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div
              className={`w-32 h-32 rounded-full overflow-hidden border-2 border-color-1 ${!form.watch("photo") ? "bg-n-7" : ""} flex items-center justify-center`}
            >
              {form.watch("photo") ? (
                <Image
                  src={form.watch("photo")}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="object-cover"
                  unoptimized={true}
                />
              ) : (
                <span className="text-4xl text-n-3">👤</span>
              )}
            </div>

            <button
              type="button"
              className="absolute bottom-0 right-0 bg-color-1 p-2 rounded-full cursor-pointer hover:bg-color-1/90 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <svg
                className="w-5 h-5 text-n-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-n-3 text-sm">First Name</label>
            <input
              type="text"
              {...form.register("firstName")}
              placeholder="John"
              className="rounded-lg bg-n-7 px-4 py-3 text-n-1 border border-n-6 focus:border-color-1 focus:outline-none transition-colors"
            />
            {form.formState.errors.firstName && (
              <span className="text-red-500 text-sm">
                {form.formState.errors.firstName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-n-3 text-sm">Last Name</label>
            <input
              type="text"
              {...form.register("lastName")}
              placeholder="Doe"
              className="rounded-lg bg-n-7 px-4 py-3 text-n-1 border border-n-6 focus:border-color-1 focus:outline-none transition-colors"
            />
            {form.formState.errors.lastName && (
              <span className="text-red-500 text-sm">
                {form.formState.errors.lastName.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-n-3 text-sm">Email</label>
          <input
            type="email"
            {...form.register("email")}
            readOnly
            disabled
            className="rounded-lg bg-n-7 px-4 py-3 text-n-1 border border-n-6 focus:border-color-1 focus:outline-none transition-colors opacity-50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-n-3 text-sm">Bio</label>
          <textarea
            {...form.register("description")}
            placeholder="Tell us about yourself..."
            className="rounded-lg bg-n-7 px-4 py-3 text-n-1 border border-n-6 focus:border-color-1 focus:outline-none transition-colors h-24 resize-none"
          />
        </div>

        <div className="flex gap-4 w-full justify-between mt-4">
          <button
            type="button"
            onClick={() => prevStep()}
            disabled={true}
            className="rounded-lg px-6 py-3 text-n-1 border border-n-6 bg-n-7 hover:bg-n-6 transition-colors disabled:opacity-50"
          >
            Back
          </button>

          <button
            type="submit"
            className="rounded-lg px-6 py-3 text-n-1 bg-color-1 hover:bg-color-1/90 transition-colors disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </form>
    </>
  )
}

export default Profile
