"use client"

import React from "react"
import Image from "next/image"
import GoogleCalendarComponent from "@/components/sections/dashboard/integrations/GoogleCalendar"

const fileServerUrl = process.env.NEXT_PUBLIC_IMAGE_CDN_ENDPOINT

const StripeComponent = () => {
  return (
    <div>
      <h1>Stripe</h1>
    </div>
  )
}

const RazorpayComponent = () => {
  return (
    <div>
      <h1>Razorpay</h1>
    </div>
  )
}

const PaypalComponent = () => {
  return (
    <div>
      <h1>Paypal</h1>
    </div>
  )
}

const PhysioplustechComponent = () => {
  return (
    <div>
      <h1>Physio Plus Tech</h1>
    </div>
  )
}

export default function Integrations() {
  const integrationGroups = [
    {
      title: "Payment Gateways",
      items: [
        {
          name: "Stripe",
          description:
            "Process payments securely with Stripe's global payment infrastructure. Accept credit cards, digital wallets and local payment methods.",
          icon: fileServerUrl + "/uploads/1752560381stripeicon.svg",
          connected: false,
          component: <StripeComponent />,
        },
        {
          name: "Razorpay",
          description:
            "India's preferred payment solution offering 100+ payment methods including UPI, cards, netbanking and EMI options.",
          icon: fileServerUrl + "/uploads/1752560381razorpay-icon.svg",
          connected: false,
          component: <RazorpayComponent />,
        },
        {
          name: "Paypal",
          description:
            "Enable fast and secure PayPal payments. Accept payments in 25 currencies from 200+ markets worldwide.",
          icon: fileServerUrl + "/uploads/1752560381paypalicon.svg",
          connected: false,
          component: <PaypalComponent />,
        },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          name: "Google Calendar",
          description:
            "Seamlessly schedule and manage meetings, set reminders, and coordinate team events with Google Calendar integration.",
          icon: fileServerUrl + "/uploads/1752560381calendaricon.svg",
          connected: false,
          component: <GoogleCalendarComponent />,
        },
      ],
    },
    {
      title: "Clinic Management",
      items: [
        {
          name: "Physio Plus Tech",
          description:
            "Complete clinic management software for physiotherapy practices. Manage patient records, appointments, billing, exercise prescriptions, and treatment plans in one integrated platform.",
          icon: fileServerUrl + "/uploads/1752560381PhysioLogo_New.png",
          connected: false,
          component: <PhysioplustechComponent />,
        },
      ],
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <h1 className="h2 text-n-1">Integrations</h1>

      <div className="space-y-6">
        {integrationGroups.map((group, index) => (
          <div key={index} className="space-y-4">
            <h2 className="h5 text-n-1">{group.title}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((item, i) => (
                <div
                  key={i}
                  className="p-4 border border-n-4 rounded-lg hover:border-color-1 transition-all bg-n-7 flex flex-col justify-between gap-4"
                >
                  {item.component && (
                    <div className="mt-2">{item.component}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
