"use client"

import React, { useState } from "react"
import Button from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Switch } from "@/components/atoms/switch"
import Profile from "@/components/sections/dashboard/settings/profile"
import Password from "@/components/sections/dashboard/settings/password"
import { Settings, User, Bell, Shield, Globe, Moon,Mail } from "lucide-react"

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general")

  const tabs = [
    { value: "general", label: "General", icon: <Globe className="w-5 h-5" /> },
    { value: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    { value: "notifications", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
    { value: "security", label: "Security", icon: <Shield className="w-5 h-5" /> }
  ]

  const renderContent = () => {
    switch(activeTab) {
      case "general":
        return (
          <div>
            <h2 className="text-2xl font-bold text-n-1 mb-6 flex items-center gap-3">
              <Globe className="w-6 h-6 text-color-1" />
              General Settings
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-n-7 rounded-xl">
                <div>
                  <h3 className="text-n-1 font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Language
                  </h3>
                  <p className="text-n-3">Select your preferred language</p>
                </div>
                <select className="bg-n-6 text-n-1 border border-n-5 rounded-lg p-2 focus:border-color-1 focus:ring-2 focus:ring-color-1">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-4 bg-n-7 rounded-xl">
                <div>
                  <h3 className="text-n-1 font-semibold flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Dark Mode
                  </h3>
                  <p className="text-n-3">Toggle dark/light theme</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        )

      case "profile":
        return <Profile />

      case "notifications":
        return (
          <div>
            <h2 className="text-2xl font-bold text-n-1 mb-6 flex items-center gap-3">
              <Bell className="w-6 h-6 text-color-1" />
              Notification Preferences
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-n-7 rounded-xl">
                <div>
                  <h3 className="text-n-1 font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Notifications
                  </h3>
                  <p className="text-n-3">Receive updates via email</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 bg-n-7 rounded-xl">
                <div>
                  <h3 className="text-n-1 font-semibold flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Push Notifications
                  </h3>
                  <p className="text-n-3">Receive push notifications</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        )

      case "security":
        return <Password />
    }
  }

  return (
    <div className="flex min-h-screen bg-n-8 p-6">
      <div className="flex w-full flex-col border border-n-4 rounded-md overflow-hidden">
        <div className="border-b border-n-6 bg-n-7 p-6">
          <h1 className="text-3xl font-bold text-n-1 flex items-center gap-3">
            <Settings className="w-8 h-8 text-color-1" />
            Settings
          </h1>
          <p className="text-n-3 mt-2 ml-11">Manage your account preferences and settings</p>
        </div>

        <div className="flex flex-1">
          {/* Custom Sidebar Tabs */}
          <div className="flex h-full w-64 flex-col border-r border-n-6 bg-n-7">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`text-left px-6 py-4 transition-colors duration-200 flex items-center gap-3 ${
                  activeTab === tab.value 
                  ? "bg-n-6 text-color-1 border-l-2 border-color-1" 
                  : "text-n-1 hover:bg-n-6"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
