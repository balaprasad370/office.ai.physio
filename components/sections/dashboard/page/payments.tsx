"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/axios"
import {
  CreditCardIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  GlobeAltIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline"

const Payments = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentData, setPaymentData] = useState({
    totalEarnings: 0,
    currency: "INR",
    locale: "en-IN",
    payments: [],
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  async function fetchPayments() {
    try {
      setIsLoading(true)
      const { data } = await apiClient.get("/payments/recent")
      if (data.status) {
        setPaymentData(data.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  function formatCurrency(
    amount: number,
    currency: string,
    locale = paymentData.locale,
  ) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-4 border border-n-12 rounded-lg p-2 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-n-1">Recent Payments</h2>
          <div className="flex items-center gap-2">
            <p className="text-n-3 text-xs mt-0.5">Total Earnings: </p>
            <p className="text-n-1 text-xs mt-0.5 font-bold">
              {formatCurrency(
                Number(paymentData.totalEarnings),
                paymentData.currency,
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard/payments")}
          className="px-2 py-1 text-xs font-medium text-n-1 shadow-md shadow-n-12 rounded-md transition-all bg-color-1 hover:bg-color-1/70"
        >
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 border border-n-12 rounded-lg p-2">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-n-12 border-t-color-1 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : paymentData.payments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {paymentData.payments.map(
            payment =>
              payment.booking_id && (
                <div
                  key={payment.id}
                  className="p-3 rounded-lg border border-n-12 bg-n-7"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-n-6 flex items-center justify-center">
                        <UserCircleIcon className="w-5 h-5 text-color-1" />
                      </div>
                      <div>
                        <span className="font-medium text-n-1 block text-sm">
                          {payment.user.name}
                        </span>
                        <span className="text-[10px] text-n-3">
                          {payment.user.email}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-color-4">
                      {formatCurrency(
                        Number(payment.amount),
                        paymentData.currency,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <GlobeAltIcon className="w-3 h-3 text-n-3" />
                    <span className="text-xs text-n-2">
                      {payment.domain || "N/A"}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <CalendarDaysIcon className="w-3 h-3 text-n-3" />
                      <span className="text-xs text-n-2">{payment.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-n-2">{payment.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PhoneIcon className="w-3 h-3 text-n-3" />
                      <span className="text-xs text-n-2">
                        {payment.user.mobile}
                      </span>
                    </div>
                  </div>
                </div>
              ),
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg border-2 border-dashed border-n-12 bg-n-7">
          <div className="w-12 h-12 mb-3 rounded-full bg-color-1/10 flex items-center justify-center">
            <CreditCardIcon className="w-6 h-6 text-color-1" />
          </div>
          <h3 className="text-lg font-medium text-n-1 mb-2 text-center">
            No Payment Found
          </h3>
          <p className="text-sm text-n-3 text-center mb-4">
            No payment found for your business
          </p>
          <button
            onClick={() => router.push("/dashboard/payments/")}
            className="px-4 py-2 text-sm font-medium text-n-1 bg-color-1 rounded-md hover:bg-opacity-80 transition-all"
          >
            Go to Payments
          </button>
        </div>
      )}
    </div>
  )
}

export default Payments
