import { ref, computed } from 'vue'

const RECENT_CALLS_KEY = 'pbx_recent_calls'
const MISSED_CALLS_KEY = 'pbx_missed_calls'


export function useCallHistory(callStore) {
    const recentSearch = ref('')
    const missedUnreadCount = ref(0)

    const filteredRecentCalls = computed(() => {
        if (!recentSearch.value) return callStore.recentCalls

        return callStore.recentCalls.filter(call =>
            String(call.number || '').includes(recentSearch.value) ||
            String(call.direction || '').toLowerCase().includes(recentSearch.value.toLowerCase()) ||
            String(call.status || '').toLowerCase().includes(recentSearch.value.toLowerCase())
        )
    })

    const MAX_RECENT_CALLS = 30
    const MAX_MISSED_CALLS = 30
    function uniqueByNumber(items, limit = 30) {
        const seen = new Set()
        const unique = []

        for (const item of items || []) {
            const key = String(item?.number || '').trim()
            if (!key || seen.has(key)) continue

            seen.add(key)
            unique.push(item)

            if (unique.length >= limit) break
        }

        return unique
    }

    function getCachedCalls(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]')
        } catch (e) {
            localStorage.removeItem(key)
            return []
        }
    }

    function loadCallCache() {
        callStore.recentCalls = uniqueByNumber(getCachedCalls(RECENT_CALLS_KEY), MAX_RECENT_CALLS)
        callStore.missedCalls = uniqueByNumber(getCachedCalls(MISSED_CALLS_KEY), MAX_MISSED_CALLS)
        missedUnreadCount.value = callStore.missedCalls.filter(call => !call.read).length
    }

    function saveCallCache() {
        callStore.recentCalls = uniqueByNumber(callStore.recentCalls)
        callStore.missedCalls = uniqueByNumber(callStore.missedCalls)

        localStorage.setItem(RECENT_CALLS_KEY, JSON.stringify(callStore.recentCalls))
        localStorage.setItem(MISSED_CALLS_KEY, JSON.stringify(callStore.missedCalls))

        missedUnreadCount.value = callStore.missedCalls.filter(call => !call.read).length
    }

    function addRecentCall(number, direction = 'outbound', status = 'answered') {
        if (!number) return

        const item = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            number,
            direction, // inbound | outbound
            status,    // answered | missed | failed | rejected
            read: status !== 'missed',
            time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
            created_at: new Date().toISOString(),
        }

        callStore.recentCalls = [
            item,
            ...callStore.recentCalls.filter(x => x?.number !== number),
        ]

        if (status === 'missed') {
            callStore.missedCalls = [
                item,
                ...callStore.missedCalls.filter(x => x?.number !== number),
            ]
        }

        saveCallCache()
    }

    function markMissedRead() {
        callStore.missedCalls = callStore.missedCalls.map(call => ({
            ...call,
            read: true,
        }))

        saveCallCache()
    }

    function clearMissedCalls() {
        callStore.missedCalls = []
        saveCallCache()
    }

    function confirmClearMissed() {
        if (!callStore.missedCalls.length) return

        if (window.confirm('Clear all missed calls? This cannot be undone.')) {
            clearMissedCalls()
        }
    }

    return {
        recentSearch,
        missedUnreadCount,
        filteredRecentCalls,
        loadCallCache,
        saveCallCache,
        addRecentCall,
        markMissedRead,
        clearMissedCalls,
        confirmClearMissed,
    }
}