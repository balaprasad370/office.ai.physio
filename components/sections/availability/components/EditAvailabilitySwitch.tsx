import React, { useState, useEffect } from 'react'
import { Switch } from '@/components/atoms/switch'

const EditAvailabilitySwitch = ({
  dayStatus,
  day,
  handleToggleDay
}: {
  dayStatus: boolean
  day: string
  handleToggleDay: (day: string, enabled: boolean) => void
}) => {
  const [state, setState] = useState(dayStatus)

  useEffect(() => {
    setState(dayStatus)
  }, [dayStatus])

  return (
    <>
      <Switch
        checked={state}
        onCheckedChange={() => {
          setState(!state)
          handleToggleDay(day, !state)
        }}
      />
    </>
  )
}

export default EditAvailabilitySwitch
