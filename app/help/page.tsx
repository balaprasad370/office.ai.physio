import React from "react"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer";


const Help = () => {
  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">Help</h1>
      </div>
      <Footer />
    </div>
  )
}

export default Help
