"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import moment from "moment"
import { apiClient } from '@/lib/axios';
import {
  Plus,
  Trash,
  ExternalLink,
  Calendar,
} from "lucide-react"

export default function Domains() {
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [domainToDelete, setDomainToDelete] = useState(null)
  const router = useRouter()

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

  const confirmDelete = domainId => {
    setDomainToDelete(domainId)
    setShowDeleteDialog(true)
  }

  const handleDelete = async domainId => {
    try {
      await apiClient.delete(`/v1/domains/${domainId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      toast.success("Domain deleted successfully")
      fetchDomains()
    } catch (error) {
      console.error("Error deleting domain:", error)
      toast.error("Failed to delete domain")
    } finally {
      setShowDeleteDialog(false)
      setDomainToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-color-1"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto min-h-screen max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">My Domains</h1>
            <p className="text-n-3 text-sm">
              Manage your registered domains
            </p>
          </div>
          <button 
            onClick={() => router.push("/dashboard/domains/add")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-n-1 bg-color-1 rounded-md hover:bg-opacity-80 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Domain
          </button>
        </div>

        <div className="space-y-6">
          {domains.length > 0 ? (
            domains.map((domain, index) => (
              <div key={index} className="p-6 rounded-lg border border-n-12 bg-n-7">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold text-n-1">
                        {domain.subdomain}
                      </h3>
                      <a
                        href={`https://${domain.subdomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-n-3 hover:text-n-1 transition-colors"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                    <div className="flex items-center text-sm text-n-3">
                      <Calendar className="mr-2 h-4 w-4" />
                      Created: {moment(domain.domain_created_date).format("MMMM Do YYYY")}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => confirmDelete(domain.domain_id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-opacity-80 transition-colors"
                    >
                      <Trash className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-n-3">No domains found</p>
              <button
                className="mt-4 px-4 py-2 text-sm font-medium text-n-1 bg-color-1 rounded-md hover:bg-opacity-80 transition-colors"
                onClick={() => router.push("/dashboard/domains/add")}
              >
                Register Your First Domain
              </button>
            </div>
          )}
        </div>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-n-7 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-n-1 mb-2">
              Are you sure you want to delete this domain?
            </h3>
            <p className="text-n-3 text-sm mb-6">
              This action cannot be undone. This will permanently delete your domain.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-n-1 bg-n-6 rounded-md hover:bg-n-5 transition-colors"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-color-2 rounded-md hover:bg-opacity-80 transition-colors"
                onClick={() => handleDelete(domainToDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
