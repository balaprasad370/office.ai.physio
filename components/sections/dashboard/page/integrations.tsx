"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/axios'

const Integrations = () => {
  const router = useRouter()

  const integrations = [
    { name: "Google Calendar", status: "Connected" },
    { name: "Physio Plus Tech", status: "Pending" },
    { name: "Stripe", status: "Not Connected" }
  ]

  return (
    <div className="flex flex-col gap-4 border border-n-12 rounded-lg p-2 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-n-1">Integrations</h2>
          <p className="text-n-3 text-xs mt-0.5">Manage your connected services</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/integrations')}
          className="px-2 py-1 text-xs font-medium text-n-1 shadow-md shadow-n-12 rounded-md transition-all bg-color-1 hover:bg-color-1/70"
      >
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {integrations.map((integration, index) => (
          <div
            key={index}
            className="p-3 rounded-lg border border-n-12 bg-n-7 flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-n-6 flex items-center justify-center">
                <ArrowPathIcon className="w-4 h-4 text-color-1" />
              </div>
              <span className="text-sm font-medium text-n-1">{integration.name}</span>
            </div>
            <span className={`px-2 py-1 text-[10px] font-medium rounded-full ${
              integration.status === "Connected"
                ? "bg-color-4/10 text-color-4 border border-color-4/20"
                : integration.status === "Pending"
                ? "bg-color-2/10 text-color-2 border border-color-2/20"
                : "bg-n-3/10 text-n-3 border border-n-3/20"
            }`}>
              {integration.status}
            </span>
          </div>
        ))}

        <button
          onClick={() => router.push('/dashboard/integrations')}
          className="w-full p-2 text-sm font-medium text-n-1 bg-n-7 border border-n-12 rounded-md hover:border-color-1 transition-all text-center"
        >
          Manage Payment Gateways
        </button>
      </div>
    </div>
  )
}

export default Integrations
