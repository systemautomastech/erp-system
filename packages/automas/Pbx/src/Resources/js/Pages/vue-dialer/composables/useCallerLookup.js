import axios from 'axios'

export function useCallerLookup(callStore) {
  async function performCallerLookup(phoneNumber) {
    if (!window.Dialer?.api?.callerLookup) return

    try {
      const { data } = await axios.get(window.Dialer.api.callerLookup, {
        params: { number: phoneNumber },
      })

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

        callStore.contactName = data.name
      } else {
        callStore.callerInfo = {
          found: false,
          number: phoneNumber,
        }
      }
    } catch (error) {
      console.warn('Caller lookup failed:', error)

      callStore.callerInfo = {
        found: false,
        number: phoneNumber,
      }
    }
  }

  return {
    performCallerLookup,
  }
}