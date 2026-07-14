import { useCallback } from 'react'
import axios from 'axios'

import type { CallStore } from '../store/callStore'

interface CallerLookupResponse {
  found: boolean
  type?: string
  id?: number | string
  name?: string
  phone?: string
  email?: string
  organization?: string
  address?: string
  extra?: Record<string, unknown>
}

declare global {
  interface Window {
    Dialer?: {
      api?: {
        callerLookup?: string
      }
    }
  }
}

export function useCallerLookup(callStore: CallStore) {
  const performCallerLookup = useCallback(
    async (phoneNumber: string): Promise<void> => {
      const callerLookupUrl = window.Dialer?.api?.callerLookup

      if (!callerLookupUrl || !phoneNumber.trim()) {
        return
      }

      try {
        const { data } = await axios.get<CallerLookupResponse>(
          callerLookupUrl,
          {
            params: {
              number: phoneNumber,
            },
          },
        )

        if (data.found) {
          callStore.callerInfo = {
            found: true,
            type: data.type,
            id: data.id,
            name: data.name,
            phone: data.phone,
            email: data.email,
            organization: data.organization,
            address: data.address,
            extra: data.extra,
          }

          callStore.contactName = data.name ?? ''
          return
        }

        callStore.callerInfo = {
          found: false,
          number: phoneNumber,
        }

        callStore.contactName = ''
      } catch (error) {
        console.warn('Caller lookup failed:', error)

        callStore.callerInfo = {
          found: false,
          number: phoneNumber,
        }

        callStore.contactName = ''
      }
    },
    [callStore],
  )

  return {
    performCallerLookup,
  }
}