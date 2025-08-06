import { z } from 'zod'
import { useForm } from 'react-hook-form'
import {Button} from '@/components/atoms/pbutton'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/atoms/form'
import { Input } from '@/components/atoms/input'
import { Textarea } from '@/components/atoms/textarea'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, useRef, useCallback } from 'react'
import { apiClient } from '@/lib/axios'
import Cropper from 'react-easy-crop'

const filesServerUrl = process.env.NEXT_PUBLIC_IMAGE_CDN_ENDPOINT
const apiEndPoint = process.env.NEXT_PUBLIC_IMAGE_API_ENDPOINT

type CustomModalProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

function CustomModal({ open, onClose, children }: CustomModalProps) {
  if (!open) return null
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'
      style={{ backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className='max-w-full rounded-lg bg-n-1 p-0 shadow-lg'
        style={{ minWidth: 320, minHeight: 100 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex justify-end p-2'>
          <Button
            onClick={onClose}
            aria-label='Close'
            className='text-xl font-bold text-n-4 hover:text-n-3'
            type='button'
          >
            ×
          </Button>
        </div>
        <div className='px-6 pb-6'>{children}</div>
      </div>
    </div>
  )
}

interface UserData {
  first_name: string
  last_name: string
  username: string
  email: string
  designation: string
  company: string
  description: string
  status: string
  photo?: string
  photo_filepath?: string
  profile_pic?: string
}

const profileFormSchema = z.object({
  first_name: z
    .string()
    .min(2, {
      message: 'First name must be at least 2 characters.',
    })
    .max(30, {
      message: 'First name must not be longer than 30 characters.',
    }),
  last_name: z
    .string()
    .min(2, {
      message: 'Last name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Last name must not be longer than 30 characters.',
    }),
  designation: z.string().max(30, {
    message: 'Designation must not be longer than 30 characters.',
  }),
  company: z.string().max(30, {
    message: 'Company must not be longer than 30 characters.',
  }),
  email: z
    .string({
      required_error: 'Please select an email to display.',
    })
    .email(),
  bio: z
    .string()
    .max(160, { message: 'Bio must not be longer than 160 characters.' })
    .min(4, { message: 'Bio must be at least 4 characters.' }),
  photo: z.string().optional(),
  photo_filepath: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const defaultValues: Partial<ProfileFormValues> = {
  first_name: '',
  last_name: '',
  designation: '',
  company: '',
  email: '',
  bio: '',
  photo: '',
  photo_filepath: '',
}

function getCroppedImg(
  imageSrc: string,
  crop: any,
  zoom: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    image.src = imageSrc
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject('No ctx')
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
          reject(new Error('Canvas is empty'))
          return
        }
        resolve(blob)
      }, 'image/jpeg')
    }
    image.onerror = (e) => reject(e)
  })
}

 function Profile() {
  const [formDataUser, setformDataUser] = useState<UserData | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
    mode: 'onChange',
  })

  const getData = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      toast.error('Missing authentication data.')
      return
    }

    try {
      const response = await apiClient.get<{ data: UserData }>(
        '/profile/getDetails'
      )
      setformDataUser(response.data.data)

      form.setValue('first_name', response.data.data.first_name || '')
      form.setValue('last_name', response.data.data.last_name || '')
      form.setValue('email', response.data.data.username || '')
      form.setValue('bio', response.data.data.description || '')
      form.setValue('designation', response.data.data.designation || '')
      form.setValue('company', response.data.data.company || '')
      if (response.data.data.profile_pic) {
        form.setValue('photo', response.data.data.profile_pic)
      } else if (response.data.data.photo) {
        form.setValue('photo', response.data.data.photo)
      }
      if (response.data.data.photo_filepath) {
        form.setValue('photo_filepath', response.data.data.photo_filepath)
      }
    } catch (error) {
      toast.error('Failed to fetch profile data')
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
    reader.addEventListener('load', () => {
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
    const dotIdx = originalName.lastIndexOf('.')
    const base =
      dotIdx !== -1 ? originalName.substring(0, dotIdx) : originalName
    const ext = dotIdx !== -1 ? originalName.substring(dotIdx) : ''
    const timestamp = Date.now()
    return `${base}_${timestamp}${ext}`
  }

  const uploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setIsUploading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Missing authentication data.')
      setIsUploading(false)
      return
    }

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, zoom)
      const formData = new FormData()
      const fileNameToUse = originalFileName
        ? getUniqueFileName(originalFileName)
        : `profile_${Date.now()}.jpg`
      formData.append('file', croppedBlob, fileNameToUse)
      const response = await apiClient.post(
        `${apiEndPoint}/upload/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      const filepath = response.data.filepath
      const cdnUrl = filesServerUrl + filepath

      form.setValue('photo', cdnUrl)
      form.setValue('photo_filepath', filepath)
      toast.success('Profile photo uploaded!')
      setShowCropper(false)
      setImageSrc(null)
      setSelectedFile(null)
      setOriginalFileName(null)
    } catch (err) {
      toast.error('Failed to upload image')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    const token = localStorage.getItem('token')

    if (!token) {
      toast.error('Missing authentication data.')
      return
    }

    const obj = {
      first_name: data.first_name,
      last_name: data.last_name,
      description: data.bio,
      designation: data.designation,
      company: data.company,
      photo: data.photo,
      photo_filepath: data.photo_filepath,
    }

    try {
      await apiClient.post('/profile/update-details', obj)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    }
  }

  return (
    <>
      {showCropper && imageSrc && (
        <CustomModal open={showCropper} onClose={() => setShowCropper(false)}>
          <div className='flex flex-col items-center p-4'>
            <div className='relative h-[300px] w-[300px] bg-n-8'>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
                cropShape='rect'
                showGrid={false}
              />
            </div>
            <div className='mt-4 flex gap-4'>
              <Button
                variant='stroke'
                onClick={() => setShowCropper(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={uploadCroppedImage}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Save'}
              </Button>
            </div>
          </div>
        </CustomModal>
      )}

      <Form {...form}>
        <form className='space-y-8' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='mb-6 flex items-center justify-between'>
            <div />
            <Button type='submit' disabled={isUploading}>
              Update profile
            </Button>
          </div>
          <FormLabel className="text-n-1">Profile Photo</FormLabel>
          <div className='flex flex-col items-center gap-2'>
            <div className='relative'>
              <div className='flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-n-6 bg-n-7'>
                {form.watch('photo') ? (
                  <img
                    src={form.watch('photo')}
                    alt='Profile'
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <span className='text-4xl text-n-4'>👤</span>
                )}
              </div>
              <button
                type='button'
                className='absolute bottom-0 right-0 rounded-full border border-n-6 bg-n-1 p-1 shadow hover:bg-n-2'
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label='Change profile photo'
              >
                <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                  <path
                    d='M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Zm7-7.5h-2.586l-1.707-1.707A1 1 0 0 0 14.586 6h-5.172a1 1 0 0 0-.707.293L7 8H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Z'
                    stroke='#4B5563'
                    strokeWidth='1.5'
                  />
                </svg>
              </button>
              <input
                type='file'
                accept='image/*'
                ref={fileInputRef}
                className='hidden'
                onChange={handlePhotoChange}
                disabled={isUploading}
              />
            </div>
            {isUploading && (
              <span className='text-xs text-n-3'>Uploading...</span>
            )}
          </div>
          <FormField
            control={form.control}
            name='first_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-n-1">First Name</FormLabel>
                <FormControl>
                  <Input placeholder='First Name' className="bg-n-7 text-n-1 border-n-6" {...field} />
                </FormControl>
                <FormDescription className="text-n-3">Enter your first name</FormDescription>
                <FormMessage className="text-color-3" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='last_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-n-1">Last Name</FormLabel>
                <FormControl>
                  <Input placeholder='Last Name' className="bg-n-7 text-n-1 border-n-6" {...field} />
                </FormControl>
                <FormDescription className="text-n-3">Enter your last name</FormDescription>
                <FormMessage className="text-color-3" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='designation'
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-n-1">Designation</FormLabel>
                <FormControl>
                  <Input placeholder='Designation' className="bg-n-7 text-n-1 border-n-6" {...field} />
                </FormControl>
                <FormDescription className="text-n-3">Enter your designation</FormDescription>
                <FormMessage className="text-color-3" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='company'
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-n-1">Company</FormLabel>
                <FormControl>
                  <Input placeholder='Company' className="bg-n-7 text-n-1 border-n-6" {...field} />
                </FormControl>
                <FormDescription className="text-n-3">Enter your company</FormDescription>
                <FormMessage className="text-color-3" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='bio'
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-n-1">Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us a little bit about yourself'
                    className='resize-none bg-n-7 text-n-1 border-n-6'
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-color-3" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-n-1">Email</FormLabel>
                <FormControl>
                  <Input placeholder='Email' className="bg-n-7 text-n-1 border-n-6" {...field} readOnly disabled />
                </FormControl>
                <FormMessage className="text-color-3" />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  )
}

export default Profile
