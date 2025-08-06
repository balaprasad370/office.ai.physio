import React, { useState } from 'react'
import { Switch } from '@/components/atoms/switch'

const EventStatus = ({ eventId, eventStatus, handleEventStatus }) => {
  const [status, setStatus] = useState(eventStatus)

  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className='flex items-center gap-2 border-b border-t border-n-5 py-3'
      >
        <Switch
          checked={status == 1}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(checked) => {
            setStatus(checked)
            handleEventStatus(eventId, checked)
          }}
        />
        <span className='flex items-center gap-1 text-sm'>
          Hide from profile
        </span>
      </div>
    </>
  )
}

export default EventStatus
