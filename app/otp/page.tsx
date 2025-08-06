"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import Button from "@/components/atoms/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/atoms/form"
import { PinInput, PinInputField } from "@/components/atoms/inputotp"
import { Input } from "@/components/atoms/input"
import { cn } from "@/lib/utils"
import ButtonGradient from "./../../components/svg/button-gradient"
import { apiClient } from "@/lib/axios"

const formSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
})

type FormSchema = z.infer<typeof formSchema>

export default function OtpPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: "" },
  })

  const onSubmit = async (data: FormSchema) => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem("token")
      if (!token) {
        toast.error("please create account again")
        router.push("/")
        return
      }
      const response = await apiClient.post(
        "verifyOtp",
        {
          otp: data.otp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      localStorage.setItem("token", response.data.token)
      sessionStorage.removeItem("token")
      toast.success("Account verified successfully")
      router.push("/onboarding")
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-3xl font-bold">Verify OTP</h1>
          <p className="text-muted-foreground">
            Please enter the verification code sent to your email
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PinInput {...field} className="flex justify-between gap-2">
                      {Array.from({ length: 6 }, (_, i) => (
                        <PinInputField
                          key={i}
                          component={Input}
                          className={cn(
                            "h-12 w-12 text-center text-lg",
                            form.formState.errors.otp && "border-destructive",
                          )}
                        />
                      ))}
                    </PinInput>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              loading={loading}
            >
              Verify
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          <button
            onClick={() => router.push("/resend-otp")}
            className="text-primary hover:underline"
          >
            Didn't receive code? Resend
          </button>
        </div>
      </div>
      <ButtonGradient />
    </div>
  )
}
