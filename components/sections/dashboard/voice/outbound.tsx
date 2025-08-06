"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select"
import { ArrowUpRight, Plus } from "lucide-react"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import { apiClient } from "@/lib/axios"

const Outbound = () => {
  const [fromNumbers, setFromNumbers] = useState<
    Array<{ phone_id: number; phone_number: string }>
  >([])
  const [selectedFromNumber, setSelectedFromNumber] = useState("")
  const [destinationNumber, setDestinationNumber] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddPhoneModal, setShowAddPhoneModal] = useState(false)
  const [newPhoneData, setNewPhoneData] = useState({
    phone_number: "",
    twilio_account_sid: "",
    twilio_auth_token: "",
    phone_label: "",
  })
  const [loadingNumbers, setLoadingNumbers] = useState(false)


  useEffect(() => {
    fetchFromNumbers()
  }, [])

  const fetchFromNumbers = async () => {
    try {
      setLoadingNumbers(true)
      const response = await apiClient.get("voice-assistant/get-phone-numbers")

      if (response.data.status) {
        setFromNumbers(response.data.phoneNumbers || [])
        if (response.data.phoneNumbers?.length > 0) {
          setSelectedFromNumber(response.data.phoneNumbers[0].phone_number)
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch phone numbers")
    } finally {
      setLoadingNumbers(false)
    }
  }

  const handleAddPhone = async () => {
    try {
      if (!newPhoneData.phone_number.startsWith("+")) {
        newPhoneData.phone_number = "+" + newPhoneData.phone_number
      }

      const response = await apiClient.post(
        "voice-assistant/add-phone-number",
        newPhoneData,
      )

      if (response.data.status) {
        toast.success("Phone number added successfully!")
        setShowAddPhoneModal(false)
        setNewPhoneData({
          phone_number: "",
          twilio_account_sid: "",
          twilio_auth_token: "",
          phone_label: "",
        })
        fetchFromNumbers()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add phone number")
    }
  }

  const startCall = async () => {
    if (!selectedFromNumber) {
      setError("Please select a from number.")
      return
    }
    if (!destinationNumber.trim()) {
      setError("Please enter a destination number.")
      return
    }
    setError(null)
    setIsLoading(true)

    try {
      const formattedDestinationNumber = destinationNumber.startsWith("+")
        ? destinationNumber
        : "+" + destinationNumber

      const response = await apiClient.post("voice-assistant/voice-call", {
        fromNumber: selectedFromNumber,
        phoneNumber: formattedDestinationNumber,
      })

      if (response.data.status) {
        toast.success(response.data.message || "Call initiated successfully!")
      } else {
        setError(response.data.message || "Failed to initiate call")
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to start call")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-n-6 bg-n-8 p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-n-1">Voice Assistant Call</h2>
        <button
          onClick={() => setShowAddPhoneModal(true)}
          className="flex items-center gap-1 rounded-md bg-color-1 px-3 py-2 text-sm text-n-1 transition-colors hover:bg-color-1/80"
        >
          <Plus className="h-4 w-4" />
          Add Phone
        </button>
      </div>

      {fromNumbers.length === 0 && !loadingNumbers && (
        <div className="mb-6 rounded-lg bg-n-7 p-4 text-sm text-n-1">
          <p className="mb-2">
            No phone numbers configured. Please add a Twilio phone number to
            make calls. Please login to your twilio account before you click
            this account.
          </p>
          <a
            href="https://console.twilio.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-color-1 underline hover:text-color-1/80"
          >
            Get the twilio account sid and auth token
          </a>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label
            htmlFor="from-number-select"
            className="mb-2 block text-sm font-medium text-n-1"
          >
            Select From Number:
          </label>
          <Select
            value={selectedFromNumber}
            onValueChange={setSelectedFromNumber}
            disabled={isLoading || loadingNumbers}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a from number" />
            </SelectTrigger>
            <SelectContent>
              {fromNumbers.map(phone => (
                <SelectItem key={phone.phone_id} value={phone.phone_number}>
                  {phone.phone_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-n-1">
            Enter Destination Number:
          </label>
          <PhoneInput
            country={"de"}
            value={destinationNumber}
            onChange={setDestinationNumber}
            containerClass="mb-2 relative"
            inputClass="w-full p-2.5 pl-12 border rounded-md bg-n-7 text-n-1 border-n-6 focus:ring-2 focus:ring-color-1 focus:border-color-1 placeholder-n-3 bg-black"
            // buttonClass="absolute top-0 left-0 h-full px-3 flex items-center justify-center border-r border-n-6 bg-n-7 rounded-l-md"
            // dropdownClass="bg-n-7 border border-n-6 rounded-md mt-1 shadow-lg max-h-60 overflow-auto"
            // searchClass="w-full p-2 border-b border-n-6 bg-n-7 text-n-1 placeholder-n-3 focus:outline-none"
            enableSearch={true}
            searchPlaceholder="Search country..."
        
          />
        </div>
      </div>

      <button
        onClick={startCall}
        disabled={isLoading}
        className={`mt-6 w-full rounded-md px-4 py-3 font-medium text-n-1 transition-colors
          ${
            isLoading
              ? "cursor-not-allowed bg-n-6"
              : "bg-color-1 hover:bg-color-1/80"
          }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-n-1 border-t-transparent" />
            Making Call...
          </span>
        ) : (
          "Make Call"
        )}
      </button>

      {error && (
        <div className="mt-4 rounded-md bg-color-3/20 p-3 text-sm text-color-3">
          {error}
        </div>
      )}

      {showAddPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-n-8/50">
          <div className="w-full max-w-md rounded-lg bg-n-8 p-6 border border-n-6">
            <h3 className="mb-4 text-lg font-semibold text-n-1">
              Add Twilio Phone Number
            </h3>
            <div
              className="mb-4 rounded-lg bg-n-7 p-4 text-sm text-n-1 border border-n-6"
              role="alert"
            >
              <a
                href="https://console.twilio.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-color-1 hover:text-color-1/80 transition-colors group"
              >
                <span className="group-hover:underline">
                  Get the twilio account sid and auth token and phone number
                </span>
                <button className="bg-color-1 hover:bg-color-1/80 rounded-md p-1 flex ">
                <span className="text-n-1">Click here</span>
                </button>
              </a>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-n-1">
                  Phone Number
                </label>
                <PhoneInput
                  country={"de"}
                  className="w-full"
                  enableSearch={true}
                  searchPlaceholder="Search country..."
                  value={newPhoneData.phone_number}
                  onChange={value => {
                    setNewPhoneData({ ...newPhoneData, phone_number: value })
                  }}
                  inputClass="w-full p-2 border rounded-md focus:ring-2 focus:ring-color-1 focus:border-color-1 bg-black text-n-1 border-n-6"
                  containerClass="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-n-1">
                  Twilio Account SID
                </label>
                <input
                  type="text"
                  placeholder="Eg: ACb1234567890xxxxxxxx"
                  autoComplete="off"
                  value={newPhoneData.twilio_account_sid}
                  onChange={e =>
                    setNewPhoneData({
                      ...newPhoneData,
                      twilio_account_sid: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-n-6 bg-n-7 p-2 text-n-1 focus:border-color-1 focus:ring-2 focus:ring-color-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-n-1">
                  Twilio Auth Token
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Eg: cb5840e83392e92c35xxxxxxx"
                  value={newPhoneData.twilio_auth_token}
                  onChange={e =>
                    setNewPhoneData({
                      ...newPhoneData,
                      twilio_auth_token: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-n-6 bg-n-7 p-2 text-n-1 focus:border-color-1 focus:ring-2 focus:ring-color-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-n-1">
                  Phone Label
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Main Office Phone"
                  value={newPhoneData.phone_label}
                  onChange={e =>
                    setNewPhoneData({
                      ...newPhoneData,
                      phone_label: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-n-6 bg-n-7 p-2 text-n-1 focus:border-color-1 focus:ring-2 focus:ring-color-1"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddPhoneModal(false)}
                className="rounded-md border border-n-6 px-4 py-2 text-n-1 transition-colors hover:bg-n-7"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPhone}
                className="rounded-md bg-color-1 px-4 py-2 text-n-1 transition-colors hover:bg-color-1/80"
              >
                Add Phone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Outbound
