import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {Button} from '@/components/atoms/pbutton'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/atoms/form'
import { Input } from '@/components/atoms/input'
import {apiClient} from '@/lib/axios'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'


const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, '🔑 Password should be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "🚫 Oops! Passwords don't match",
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export default function AccountForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange'
  })

  async function onSubmit(data: PasswordFormValues) {
    setIsLoading(true)
    try {
        const response = await apiClient.post(`/profile/update-password`, data)

      if (response.data.status) {
        toast.success('🎉 Password updated successfully!')
        form.reset()
        localStorage.clear()
        setTimeout(() => {
          router.push('/sign-in')
        }, 1500)
      } else {
        toast.error(response.data.message || '😕 Failed to update password')
      }
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast.error(
        error?.response?.data?.message || 
        '❌ Oops! Something went wrong while updating your password'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-n-1 mb-2">Change Your Password</h2>
          <p className="text-n-3">Keep your account secure by creating a new password</p>
        </div>
        
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-n-1 font-medium">Current Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your current secret code"
                  className="bg-n-7 text-n-1 border-n-6 focus:border-color-1 focus:ring-2 focus:ring-color-1"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-color-3" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword" 
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-n-1 font-medium">New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Create a new secret code"
                  className="bg-n-7 text-n-1 border-n-6 focus:border-color-1 focus:ring-2 focus:ring-color-1"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-color-3" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-n-1 font-medium">Confirm New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your new secret code"
                  className="bg-n-7 text-n-1 border-n-6 focus:border-color-1 focus:ring-2 focus:ring-color-1"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-color-3" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-color-1 hover:bg-color-1/90 text-n-1 rounded-xl py-3 text-lg font-medium"
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? '🔄 Updating...' : '🔒 Update Password'}
        </Button>
      </form>
    </Form>
  )
}
