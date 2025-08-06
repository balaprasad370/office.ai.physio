"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarDaysIcon, ExternalLink } from "lucide-react"
import { apiClient } from "@/lib/axios"
import { toast } from "sonner"
import moment from "moment"

const Domains = () => {
  const router = useRouter()
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDomains()
  }, [])

  const fetchDomains = async () => {
    try {
      const response = await apiClient.get(`/v1/domains`)
      setDomains(response.data.data || [])
    } catch (error) {
      console.error("Error fetching domains:", error)
      toast.error("Failed to fetch domains")
    } finally {
      setLoading(false)
    }
  }

  const Loader = () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-color-1"></div>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 border border-n-12 rounded-lg p-2 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-n-1">AI Domains</h2>
          <p className="text-n-3 text-xs mt-0.5">
            Manage your AI assistant domains
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/domains")}
          className="px-2 py-1 text-xs font-medium text-n-1 shadow-md shadow-n-12 rounded-md transition-all bg-color-1 hover:bg-color-1/70"
        >
          Manage Domains
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : domains.length > 0 ? (
        <div className="flex flex-col gap-3">
          {domains.map(domain => (
            <div
              key={domain.domain_id}
              className="p-3 rounded-lg border border-n-12 bg-n-7"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-n-1">
                    {domain.subdomain}
                  </span>
                  <a
                    href={`https://${domain.subdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-n-3 hover:text-n-1 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-n-2">
                <div className="flex items-center gap-1.5">
                  <CalendarDaysIcon className="w-3 h-3 text-n-3" />
                  <span>
                    Created:{" "}
                    {moment(domain.domain_created_date).format("MMMM Do YYYY")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarDaysIcon className="w-3 h-3 text-n-3" />
                  <span>
                    Expiry: {moment(domain.expiry_date).format("MMMM Do YYYY")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-3 rounded-xl border-2 border-dashed border-n-12 bg-n-7">
          <div className="w-12 h-12 mb-3 rounded-full bg-color-1/10 flex items-center justify-center">
            {/* <GlobeAltIcon className="w-6 h-6 text-color-1" /> */}
          </div>
          <h3 className="text-sm font-medium text-n-1 mb-1">No Domains Yet</h3>
          <p className="text-xs text-n-3 text-center mb-3">
            Get your personalized AI assistant domain now before someone else
            takes it!
          </p>
          <button
            onClick={() => router.push("/dashboard/domains/add")}
            className="px-3 py-1.5 text-xs font-medium text-n-1 bg-color-1 rounded-md hover:bg-opacity-50 transition-all"
          >
            Register Your First Domain
          </button>
        </div>
      )}
    </div>
  )
}

export default Domains
