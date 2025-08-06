"use client"

import React, { useEffect, useState } from "react"
import Button from "@/components/atoms/button"
import ButtonGradient from "@/components/svg/button-gradient"
import Navbar from "@/components/layout/navbar"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { apiClient } from "@/lib/axios"
import { useRouter } from "next/navigation"

const formSchema = z
  .object({
    firstName: z.string().min(1, { message: "Please enter your first name" }),
    lastName: z.string().min(1, { message: "Please enter your last name" }),
    email: z.string().min(1, { message: "Please enter your email" }).email(),
    mobile: z
      .string()
      .min(8, { message: "Mobile number must be at least 8 digits" })
      .max(15, { message: "Mobile number cannot exceed 15 digits" })
      .regex(/^\+?[1-9]\d{7,14}$/, { message: "Please enter a valid  phone number" }),
    password: z
      .string()
      .min(7, { message: "Password must be at least 7 characters" }),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

const Register = () => {
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 700)

    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (data: any) => {
    setLoading(true)

    try {
      const obj= {
        firstName : data.firstName,
        lastName : data.lastName,
        email : data.email,
        mobileNumber : data.mobile,
        password : data.password,
        confirmPassword : data.confirmPassword,
      }
      console.log(obj);
      

      const response = await apiClient.post("/portal/register", obj)
      console.log(response.data);
      
      // Handle successful registration


      toast.success("Account created successfully!")
      sessionStorage.setItem("token", response.data.token)
      router.push("/otp", { state: { token: response.data.token } })
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-n-8">
        <div className="text-2xl text-n-1">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-n-8 pt-20">
        <div className="container mx-auto px-4 pt-20">
          <div className="mx-auto max-w-[520px] rounded-2xl bg-n-7 p-8">
            <h1 className="mb-8 text-center text-3xl font-bold text-n-1">
              Create Account
            </h1>
            <form
              autoComplete="off"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-n-1">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full rounded-lg border border-n-6 bg-n-8 px-4 py-3 text-n-1 outline-none focus:border-color-1"
                    {...form.register("firstName")}
                  />
                  {form.formState.errors.firstName && (
                    <span className="text-red-500 text-sm">
                      {form.formState.errors.firstName.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-n-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full rounded-lg border border-n-6 bg-n-8 px-4 py-3 text-n-1 outline-none focus:border-color-1"
                    {...form.register("lastName")}
                  />
                  {form.formState.errors.lastName && (
                    <span className="text-red-500 text-sm">
                      {form.formState.errors.lastName.message}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-n-1">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-n-6 bg-n-8 px-4 py-3 text-n-1 outline-none focus:border-color-1"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <span className="text-red-500 text-sm">
                    {form.formState.errors.email.message}
                  </span>
                )}
              </div>
              <div>
                <label className="mb-2 block text-n-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="0123456789"
                  className="w-full rounded-lg border border-n-6 bg-n-8 px-4 py-3 text-n-1 outline-none focus:border-color-1"
                  {...form.register("mobile")}
                />
                {form.formState.errors.mobile && (
                  <span className="text-red-500 text-sm">
                    {form.formState.errors.mobile.message}
                  </span>
                )}
              </div>
              <div>
                <label className="mb-2 block text-n-1">Password</label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full rounded-lg border border-n-6 bg-n-8 px-4 py-3 text-n-1 outline-none focus:border-color-1"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <span className="text-red-500 text-sm">
                    {form.formState.errors.password.message}
                  </span>
                )}
              </div>
              <div>
                <label className="mb-2 block text-n-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full rounded-lg border border-n-6 bg-n-8 px-4 py-3 text-n-1 outline-none focus:border-color-1"
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword && (
                  <span className="text-red-500 text-sm">
                    {form.formState.errors.confirmPassword.message}
                  </span>
                )}
              </div>
              <Button
                className="mt-4 w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </div>
        </div>
        <ButtonGradient />
      </div>
    </>
  )
}

export default Register
