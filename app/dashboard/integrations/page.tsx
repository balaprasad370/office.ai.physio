import React from "react"
import Image from "next/image"


const fileServerUrl = process.env.NEXT_PUBLIC_IMAGE_CDN_ENDPOINT


export default function Integrations() {

  const integrationGroups = [
    {
      title: "Payment Gateways",
      items: [
        {
          name: "Stripe",
          description:
            "Process payments securely with Stripe's global payment infrastructure. Accept credit cards, digital wallets and local payment methods.",
          icon: fileServerUrl + "uploads/1752560381stripeicon.svg",
          connected: false,
        },
        {
          name: "Razorpay",
          description:
            "India's preferred payment solution offering 100+ payment methods including UPI, cards, netbanking and EMI options.",
          icon: fileServerUrl + "uploads/1752560381razorpay-icon.svg",
          connected: false,
        },
        {
          name: "Paypal",
          description:
            "Enable fast and secure PayPal payments. Accept payments in 25 currencies from 200+ markets worldwide.",
          icon: fileServerUrl + "uploads/1752560381paypalicon.svg",
          connected: false,
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
          icon: fileServerUrl + "uploads/1752560381calendaricon.svg",
          connected: false,
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
          icon: fileServerUrl + "uploads/1752560381PhysioLogo_New.png",
          connected: false,
        },
      ],
    }

  ]

  return (
    <div className="p-6 space-y-8">
      <h1 className="h2 text-n-1">Integrations</h1>

      <div className="space-y-6">
        {integrationGroups.map((group, index) => (
          <div key={index} className="space-y-4">
            <h2 className="h5 text-n-1">{group.title}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-4">
              {group.items.map((item, i) => (
                <div
                  key={i}
                  className="p-4 max-h-[250px] border border-n-4 rounded-lg hover:border-color-1 transition-all bg-n-7 flex flex-col justify-between gap-4 w-full"
                >
                  <div className="space-y-3">
                    <div className="relative w-10 h-10 bg-white rounded-xl p-2  ">
                      <Image
                        src={item.icon}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div>
                      <h3 className="body-2 text-n-1 mb-1">{item.name}</h3>
                      <p className="caption text-n-3 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <button
                    className={`w-full mt-3 px-3 py-2 rounded-md button-sm ${
                      item.connected
                        ? "bg-n-6 text-n-3"
                        : "bg-color-1 text-n-1 hover:bg-color-1/90"
                    }`}
                  >
                    {item.connected ? "Connected" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

