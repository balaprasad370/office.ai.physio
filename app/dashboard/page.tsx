import Button from "@/components/atoms/button"
import Image from "next/image"
import {
  CalendarDaysIcon,
  PhoneIcon,
  ClockIcon,
  PuzzlePieceIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import Bookings from "@/components/sections/dashboard/page/bookings"
import Voice from "@/components/sections/dashboard/page/voice"
import Payments from "@/components/sections/dashboard/page/payments"
import Domains from "@/components/sections/dashboard/page/domain"
import Integrations from "@/components/sections/dashboard/page/integrations"

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-2 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
        <div className="rounded-lg shadow-md p-2 col-span-1 md:col-span-2 lg:col-span-2 w-full">
          <Bookings />
        </div>
        <div className="rounded-lg shadow-md p-2 w-full">
          <Voice />
        </div>
        <div className="rounded-lg shadow-md p-2 w-full">
          <Payments />
        </div>
        <div className="rounded-lg shadow-md p-2 w-full">
          <Domains />
        </div>
        <div className="rounded-lg shadow-md p-2 w-full">
          <Integrations />
        </div>
      </div>
    </main>
  )
}
