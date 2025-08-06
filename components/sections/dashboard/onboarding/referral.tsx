"use client"
import Button from "@/components/atoms/button"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { apiClient } from "@/lib/axios"

const Referral = ({
  nextStep,
  prevStep,
}: {
  nextStep: () => void
  prevStep: () => void
}) => {
  const [selectedOption, setSelectedOption] = useState("")

  const referralOptions = [
    { value: "socialmedia", label: "Social Media" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "twitter", label: "Twitter" },
    { value: "facebook", label: "Facebook" },
    { value: "friendcolleague", label: "Friend/Colleague" },
    { value: "searchengine", label: "Search Engine" },
    { value: "blogarticle", label: "Blog/Article" },
    { value: "conference", label: "Conference/Event" },
    { value: "advertisement", label: "Online Advertisement" },
    { value: "emailcampaign", label: "Email Campaign" },
    { value: "otherreferral", label: "Others" },
  ]

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    try {
      const response = await apiClient.get("/profile/getDetails")
      const data = response.data.data
      setSelectedOption(data.referred_from || "")
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch profile data")
    }
  }

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast.error("Please select an option")
      return
    }

    try {
      const response = await apiClient.post("/referral/onboarding/update-details", {
        referred_from: selectedOption,
      })

      if (response.data.status) {
        toast.success("Successfully updated referral information")
        nextStep()
      } else {
        toast.error(response.data.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Failed to update referral information")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-n-1 text-lg font-medium">
        How did you hear about us?
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {referralOptions.map(option => (
          <label
            key={option.value}
            className={`
              flex items-center gap-3 p-4 rounded-lg cursor-pointer
              border transition-all duration-200
              ${
                selectedOption === option.value
                  ? "border-color-1 bg-color-1/10"
                  : "border-n-6 hover:border-color-1/50"
              }
            `}
          >
            <input
              type="radio"
              name="referral"
              value={option.value}
              checked={selectedOption === option.value}
              onChange={e => setSelectedOption(e.target.value)}
              className="w-5 h-5 accent-color-1 bg-n-7 border-n-6"
            />
            <span className="text-n-1">{option.label}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-4 w-full justify-between mt-4">
        <Button
          onClick={prevStep}
          className="rounded-lg px-6 py-3 text-n-1 border border-n-6 bg-n-7 hover:bg-n-6 transition-colors"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="rounded-lg px-6 py-3  transition-colors disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default Referral
