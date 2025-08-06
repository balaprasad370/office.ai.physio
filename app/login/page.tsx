'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'
import Navbar from '@/components/layout/navbar'
import ButtonGradient from './../../components/svg/button-gradient'
import Button from "@/components/atoms/button"

export default function Login() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [pageLoading, setPageLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard')
    }
    setPageLoading(false) // Add this line to stop the loading state
  }, [router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      return toast.error('Please fill in all required fields.')
    }

    if (password.length < 6) {
      return toast.error('Password must be greater than 6 characters.')
    }

    setLoading(true)

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + '/portal/signin',
        {
          email,
          password,
        }
      )

      const { token } = response.data;
      
      // Also store in localStorage as backup
      localStorage.setItem('token', token)
      
      toast.success("Login successful")
      router.push('/dashboard')
    } catch (error: any) { // Add type annotation for error
      setLoading(false)
      const errorMessage = error.response?.data?.message || 'An error occurred during login'
      toast.error(errorMessage)
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-n-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary">
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container relative h-screen flex-col items-center justify-center">
        <div className="flex h-full w-full items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-2 rounded-xl bg-background/95 border border-n-3 p-6 shadow-lg backdrop-blur sm:w-[350px]">
            <div className="mb-4 flex items-center justify-center">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/assets/starforge-symbol.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                />
                <h1 className="text-xl font-medium">Cal.ai.physio</h1>
              </Link>
            </div>

            <div className="flex flex-col space-y-2 text-left">
              <h1 className="text-2xl font-semibold tracking-tight">
                Log In
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and password below to log into your account
              </p>
              <div className="flex flex-row my-2">
                <p>Don't have an account?</p>
                <Link href="/register" className="ml-1">
                  <p className="text-md font-bold text-primary">Sign Up</p>
                </Link>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-md my-2 font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-md border bg-background px-3 py-2 text-black"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex w-full justify-between">
                    <label className="text-md mb-2 font-medium">Password</label>
                    <Link href="/forgot-password" className="text-md mb-2 font-medium text-muted-foreground hover:opacity-50">
                      Forgot Password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    className="w-full rounded-md border bg-background px-3 py-2 text-black"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="mt-4 w-full rounded-md bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking login, you agree to our{' '}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <ButtonGradient />
        </div>
      </div>
    </>
  )
}
