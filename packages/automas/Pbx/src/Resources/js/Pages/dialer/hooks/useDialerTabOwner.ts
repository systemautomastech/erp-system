import { ref, onMounted, onBeforeUnmount } from 'vue'

const OWNER_KEY = 'cti_dialer_owner'
const HEARTBEAT_KEY = 'cti_dialer_heartbeat'
const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const TIMEOUT = 45000 // 45 seconds heartbeat timeout, robust against background throttling
const CHECK_INTERVAL = 10000 // 10 seconds between ownership checks when not owner
const CLAIM_CONFIRMATION_DELAY = 120 // wait briefly to let concurrent ownership claims settle
const CHANNEL_NAME = 'cti_dialer_channel'
const OWNER_ALIVE_CHECK = 'OWNER_ALIVE_CHECK'
const OWNER_ALIVE_ACK = 'OWNER_ALIVE_ACK'
const MAKE_CALL = 'MAKE_CALL'

function getStoredOwner() {
    return localStorage.getItem(OWNER_KEY)
}

function getStoredHeartbeat() {
    return Number(localStorage.getItem(HEARTBEAT_KEY) || 0)
}

function currentOwnerAlive() {
    const owner = getStoredOwner()
    const heartbeat = getStoredHeartbeat()
    return owner && Date.now() - heartbeat < TIMEOUT
}

async function ownerAliveCheckExternal() {
    const owner = getStoredOwner()
    const heartbeat = getStoredHeartbeat()

    if (!owner || owner === TAB_ID) {
        return owner === TAB_ID
    }

    if (Date.now() - heartbeat < TIMEOUT) {
        return true
    }

    return new Promise(resolve => {
        const channel = new BroadcastChannel(CHANNEL_NAME)
        const requestId = `${TAB_ID}-${Date.now()}`
        let timeoutId = null

        function onAliveAck(event) {
            const data = event.data
            if (!data || data.type !== OWNER_ALIVE_ACK || data.requestId !== requestId) return
            if (data.from === owner) {
                clearTimeout(timeoutId)
                channel.removeEventListener('message', onAliveAck)
                channel.close()
                resolve(true)
            }
        }

        channel.addEventListener('message', onAliveAck)
        channel.postMessage({
            type: OWNER_ALIVE_CHECK,
            from: TAB_ID,
            requestId,
        })

        timeoutId = setTimeout(() => {
            channel.removeEventListener('message', onAliveAck)
            channel.close()
            resolve(false)
        }, 1500)
    })
}

function sendMakeCallMessage(number) {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.postMessage({
        type: MAKE_CALL,
        from: TAB_ID,
        number,
    })
    channel.close()
}

export async function forwardMakeCallToOwner(number) {
    const owner = getStoredOwner()
    if (!owner || owner === TAB_ID) {
        return false
    }

    if (currentOwnerAlive()) {
        sendMakeCallMessage(number)
        return true
    }

    const alive = await ownerAliveCheckExternal()
    if (alive) {
        sendMakeCallMessage(number)
        return true
    }

    return false
}

export function useDialerTabOwner() {
    const isOwnerTab = ref(false)
    const channel = new BroadcastChannel(CHANNEL_NAME)

    let heartbeatTimer = null
    let checkTimer = null
    let aliveCheckTimer = null
    let aliveCheckRequestId = null
    let aliveCheckResolve = null

    const now = () => Date.now()

    function currentOwnerAlive() {
        const owner = localStorage.getItem(OWNER_KEY)
        const heartbeat = Number(localStorage.getItem(HEARTBEAT_KEY) || 0)
        return owner && now() - heartbeat < TIMEOUT
    }

    function refreshHeartbeat() {
        if (localStorage.getItem(OWNER_KEY) === TAB_ID) {
            localStorage.setItem(HEARTBEAT_KEY, String(now()))
        }
    }

    function ownerAliveCheck() {
        return new Promise(resolve => {
            if (aliveCheckResolve) {
                aliveCheckResolve(false)
                aliveCheckResolve = null
            }

            const owner = localStorage.getItem(OWNER_KEY)
            const heartbeat = Number(localStorage.getItem(HEARTBEAT_KEY) || 0)

            if (!owner) {
                // No owner in storage, safe to consider dead.
                return resolve(false)
            }

            if (owner === TAB_ID) {
                // This tab is the owner.
                return resolve(true)
            }

            if (now() - heartbeat < TIMEOUT) {
                // Recent heartbeat means the owner is alive without needing BC.
                return resolve(true)
            }

            aliveCheckRequestId = `${TAB_ID}-${now()}`
            aliveCheckResolve = resolve

            function cleanup() {
                if (aliveCheckTimer) {
                    clearTimeout(aliveCheckTimer)
                    aliveCheckTimer = null
                }
                aliveCheckRequestId = null
                aliveCheckResolve = null
            }

            function onAliveAck(event) {
                const data = event.data
                if (!data || data.type !== OWNER_ALIVE_ACK || data.requestId !== aliveCheckRequestId) return
                if (data.from === owner) {
                    refreshHeartbeat()
                    cleanup()
                    channel.removeEventListener('message', onAliveAck)
                    resolve(true)
                }
            }

            channel.addEventListener('message', onAliveAck)
            channel.postMessage({
                type: OWNER_ALIVE_CHECK,
                from: TAB_ID,
                requestId: aliveCheckRequestId,
            })

            // Give the current owner a brief window to respond before assuming it is gone.
            aliveCheckTimer = setTimeout(() => {
                cleanup()
                channel.removeEventListener('message', onAliveAck)
                resolve(false)
            }, 1500)
        })
    }

    function startHeartbeat() {
        stopHeartbeat()

        heartbeatTimer = setInterval(() => {
            if (localStorage.getItem(OWNER_KEY) === TAB_ID) {
                localStorage.setItem(HEARTBEAT_KEY, String(now()))
            }
        }, 1000)
    }

    function stopHeartbeat() {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer)
            heartbeatTimer = null
        }
    }

    async function claimOwnership() {
        const owner = localStorage.getItem(OWNER_KEY)
        const heartbeat = Number(localStorage.getItem(HEARTBEAT_KEY) || 0)

        // If current owner appears alive, do not attempt to steal ownership.
        if (owner && owner !== TAB_ID && now() - heartbeat < TIMEOUT) {
            isOwnerTab.value = false
            return
        }

        // If owner heartbeat looks stale, ask the owner directly whether it is still alive.
        if (owner && owner !== TAB_ID) {
            const alive = await ownerAliveCheck()
            if (alive) {
                isOwnerTab.value = false
                return
            }
        }

        // Attempt to claim ownership through a write/read double-check.
        localStorage.setItem(OWNER_KEY, TAB_ID)
        localStorage.setItem(HEARTBEAT_KEY, String(now()))

        // Wait a short time to allow any concurrent tab to overwrite the claim.
        await new Promise(resolve => setTimeout(resolve, CLAIM_CONFIRMATION_DELAY))

        // Confirm ownership after the race window.
        if (localStorage.getItem(OWNER_KEY) === TAB_ID) {
            isOwnerTab.value = true
            startHeartbeat()
        } else {
            isOwnerTab.value = false
        }
    }

    async function syncOwnershipFromStorage() {
        const owner = localStorage.getItem(OWNER_KEY)
        const heartbeat = Number(localStorage.getItem(HEARTBEAT_KEY) || 0)

        if (owner && owner === TAB_ID) {
            isOwnerTab.value = true
            startHeartbeat()
            return
        }

        if (owner && now() - heartbeat < TIMEOUT) {
            isOwnerTab.value = false
            return
        }

        // The current owner appears dead or missing; try to claim ownership.
        await claimOwnership()
    }

    function releaseOwnership() {
        if (localStorage.getItem(OWNER_KEY) === TAB_ID) {
            localStorage.removeItem(OWNER_KEY)
            localStorage.removeItem(HEARTBEAT_KEY)
            try {
                channel.postMessage({ type: 'OWNER_RELEASED', from: TAB_ID })
            } catch (e) {
                // ignore
            }
        }

        stopHeartbeat()
        isOwnerTab.value = false
    }

    // UI attention helpers moved here from Dialer.vue to keep UI code clean.
    const originalTitle = typeof document !== 'undefined' ? document.title : ''
    let titleBlinkInterval = null

    function blinkTitle(duration = 6000) {
        if (typeof document === 'undefined') return
        const alt = 'Dialer — Attention'
        let shownAlt = false
        const start = Date.now()
        if (titleBlinkInterval) clearInterval(titleBlinkInterval)
        titleBlinkInterval = setInterval(() => {
            if (Date.now() - start > duration) {
                clearInterval(titleBlinkInterval)
                titleBlinkInterval = null
                document.title = originalTitle
                return
            }
            document.title = shownAlt ? originalTitle : alt
            shownAlt = !shownAlt
        }, 500)
    }

    let faviconBlink

    function setFavicon(icon) {
        let link = document.querySelector("link[rel*='icon']")

        if (!link) {
            link = document.createElement("link")
            link.rel = "icon"
            document.head.appendChild(link)
        }

        link.href = icon
    }

    function blinkFavicon() {
        let state = false

        faviconBlink = setInterval(() => {
            state = !state
            setFavicon(state ? "/phone-red.ico" : "/phone-green.ico")
        }, 500)
    }

    function stopBlinkFavicon() {
        clearInterval(faviconBlink)
        setFavicon("/favicon.ico")
    }

    function playBeep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)()
            const o = ctx.createOscillator()
            const g = ctx.createGain()
            o.type = 'sine'
            o.frequency.value = 880
            o.connect(g)
            g.connect(ctx.destination)
            g.gain.value = 0.05
            o.start()
            setTimeout(() => { o.stop(); ctx.close() }, 200)
        } catch (e) {
            // ignore
        }
    }

    function openDialerPopup() {
        const owner = localStorage.getItem(OWNER_KEY)

        if (!currentOwnerAlive()) {
            claimOwnership()
            return
        }

        if (owner === TAB_ID) {
            window.focus()
            return
        }

        // Send a focus request and wait briefly for an owner response.
        let responded = false

        function onOwnerResponse(event) {
            const d = event.data
            if (!d || d.from === TAB_ID) return
            if (d.type === 'OWNER_FOCUSED') {
                responded = true
                // If owner reports it gained focus, nothing else to do. If not, show explanatory alert.
                if (!d.focused) {
                    alert(
                        'The dialer is already running in another browser tab.\n\nFor security reasons, browsers do not allow websites to automatically switch to another tab.\n\nPlease switch to the tab where the dialer is currently active.'
                    )
                }

                channel.removeEventListener('message', onOwnerResponse)
            }
        }

        channel.addEventListener('message', onOwnerResponse)

        channel.postMessage({
            type: 'FOCUS_DIALER_OWNER',
            from: TAB_ID,
        })

        // If owner doesn't respond within reasonable time, show explanatory alert per browser limits.
        setTimeout(() => {
            if (!responded) {
                channel.removeEventListener('message', onOwnerResponse)
                alert(
                    'The dialer is already running in another browser tab.\n\nFor security reasons, browsers do not allow websites to automatically switch to another tab.\n\nPlease switch to the tab where the dialer is currently active.'
                )
            }
        }, 800)
    }

    function handleChannelMessage(event) {
        const data = event.data

        if (!data || data.from === TAB_ID) return

        if (data.type === OWNER_ALIVE_CHECK) {
            // Another tab is checking whether the current owner is still alive.
            // This is the core protection against stale heartbeats that are paused by browser throttling.
            if (isOwnerTab.value) {
                refreshHeartbeat()
                channel.postMessage({
                    type: OWNER_ALIVE_ACK,
                    from: TAB_ID,
                    requestId: data.requestId,
                })
            }
            return
        }

        // When another tab asks us to focus/open the dialer.
        if (data.type === 'FOCUS_DIALER_OWNER' && isOwnerTab.value) {
            // Try to focus this window/tab.
            try {
                window.focus()
            } catch (e) {
                // ignore
            }

            // Let local app logic open and highlight the dialer panel.
            window.dispatchEvent(new CustomEvent('cti:open-dialer-panel'))

            // Owner should also provide additional attention signals (title blink, sound).
            try {
                blinkTitle(2000)
                playBeep()
            } catch (e) {
                // ignore
            }

            // Reply to caller whether we have document focus now.
            channel.postMessage({
                type: 'OWNER_FOCUSED',
                from: TAB_ID,
                focused: document.hasFocus(),
            })
            return
        }

        // Incoming MAKE_CALL from other tab: owner should handle placing the call.
        if (data.type === 'MAKE_CALL' && isOwnerTab.value) {
            // provide attention and then instruct the dialer to populate and call
            try {
                blinkTitle(2000)
                playBeep()
            } catch (e) { }

            window.dispatchEvent(new CustomEvent('cti:make-call', { detail: { number: data.number } }))
            return
        }

        // If caller announces owner release, try to claim ownership faster.
        if (data.type === 'OWNER_RELEASED') {
            // Let the storage sync or periodic check handle claim; but attempt immediate claim.
            if (!isOwnerTab.value) {
                claimOwnership()
            }
            return
        }
    }

    function handleStorageChange(event) {
        if (event.key === OWNER_KEY || event.key === HEARTBEAT_KEY) {
            syncOwnershipFromStorage()
        }
    }

    onMounted(() => {
        claimOwnership()

        checkTimer = setInterval(() => {
            if (!isOwnerTab.value) {
                claimOwnership()
            }
        }, CHECK_INTERVAL)

        channel.addEventListener('message', handleChannelMessage)
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('beforeunload', releaseOwnership)
    })

    onBeforeUnmount(() => {
        releaseOwnership()

        if (checkTimer) {
            clearInterval(checkTimer)
            checkTimer = null
        }

        channel.removeEventListener('message', handleChannelMessage)
        channel.close()

        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('beforeunload', releaseOwnership)
        // clear any title blink left running
        try {
            if (titleBlinkInterval) {
                clearInterval(titleBlinkInterval)
                titleBlinkInterval = null
                if (typeof document !== 'undefined') document.title = originalTitle
            }
        } catch (e) { }
    })

    return {
        isOwnerTab,
        openDialerPopup,
    }
}