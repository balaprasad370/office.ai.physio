import React from "react"
import Outbound from "@/components/sections/dashboard/voice/outbound"
import Configuration from "@/components/sections/dashboard/voice/configuration"
import ButtonGradient from "@/components/svg/button-gradient";

const VoicePage = () => {
  return (
    <>
      <div className="p-6 w-full">
        <div>
          <h1 className="text-2xl font-bold">Voice</h1>
        </div>

        <div className="p-4 flex w-full gap-4">
          <div className="w-1/3">
            <Outbound />
          </div>
          <div className="flex-1 w-2/3">
          <Configuration />
        </div>
        </div>
      </div>
      <ButtonGradient />
    </>
  )
}

export default VoicePage
