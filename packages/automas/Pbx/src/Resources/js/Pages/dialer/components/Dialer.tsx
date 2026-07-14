import { useCallback, useEffect, useMemo } from 'react'
import {
  Delete,
  Forward,
  History,
  Mic,
  MicOff,
  Minimize2,
  Pause,
  PhoneIcon,
  Play,
  Radio,
  Undo2,
  X,
} from 'lucide-react'

import '../styles/dialer/variables.css'
import '../styles/dialer/base.css'
import '../styles/dialer/topbar.css'
import '../styles/dialer/buttons.css'
import '../styles/dialer/dialpad.css'
import '../styles/dialer/incoming.css'
import '../styles/dialer/history.css'
import '../styles/dialer/panels.css'
import '../styles/dialer/active.css'

import { useDialer } from '../hooks/useDialer'
import { useDialerTabOwner } from '../hooks/useDialerTabOwner'

import DialerForward from './DialerForward'
import DialerHistory from './DialerHistory'

export default function Dialer() {
  const {
    isOpen,
    setIsOpen,

    number,
    setNumber,

    currentTime,

    panelRef,
    headerRef,

    activePanel,
    setActivePanel,

    forwardNumber,
    setForwardNumber,
    forwardEnabled,

    recentSearch,
    setRecentSearch,

    missedUnreadCount,
    filteredRecentCalls,

    panelStyle,
    startDragging,

    keys,
    callStore,

    pressKey,
    backspaceNumber,
    clearNumber,

    handlePrimaryAction,
    callFromHistory,

    answerCurrentCall,
    rejectCurrentCall,
    endCurrentCall,

    toggleMuteCurrentCall,
    toggleHoldCurrentCall,
    manualRegister,

    redialLastCall,
    markMissedRead,
    confirmClearMissed,

    enableForwarding,
    disableForwarding,
    forwardCurrentCall,

    inputPlaceholder,
    helperText,
    hasDigits,
    canPlaceCall,
    activeCallTitle,
    statusLabel,
    isIncomingCall,
    isActiveCall,
  } = useDialer()

  const {
    isOwnerTab,
    openDialerPopup,
  } = useDialerTabOwner()

  const panelTransitionKey = useMemo(
    () => `${activePanel}-${callStore.callStatus}`,
    [activePanel, callStore.callStatus],
  )

  const openHistoryPanel = useCallback((): void => {
    setActivePanel('calls')
    markMissedRead()
  }, [markMissedRead, setActivePanel])

  const closeDialer = useCallback((): void => {
    setIsOpen(false)
  }, [setIsOpen])

  useEffect(() => {
    const beforeUnloadHandler = (
      event: BeforeUnloadEvent,
    ): string | void => {
      try {
        const blockingStatuses = [
          'active',
          'calling',
          'ringing',
        ]

        if (
          isOwnerTab &&
          blockingStatuses.includes(
            callStore.callStatus,
          )
        ) {
          const message =
            'A call is in progress. Please end or reject the call before leaving this page.'

          event.preventDefault()
          event.returnValue = message

          return message
        }
      } catch {
        // Allow page unload if status detection fails.
      }
    }

    window.addEventListener(
      'beforeunload',
      beforeUnloadHandler,
    )

    return () => {
      window.removeEventListener(
        'beforeunload',
        beforeUnloadHandler,
      )
    }
  }, [callStore.callStatus, isOwnerTab])

  if (!isOwnerTab) {
    return (
      <button
        type="button"
        className="phone-tab"
        onClick={() => {
          void openDialerPopup()
        }}
        title="Dialer active in another tab"
      >
        <PhoneIcon className="phone-tab-icon" />

        <span className="call-alert-badge">
          !
        </span>
      </button>
    )
  }

  return (
    <div>
      <audio
        id="remoteAudio"
        autoPlay
        aria-hidden="true"
      />

      {!isOpen && (
        <button
          type="button"
          className="phone-tab"
          onClick={() => setIsOpen(true)}
          title="Open Dialer"
        >
          <PhoneIcon className="phone-tab-icon" />

          {missedUnreadCount > 0 && (
            <span className="call-alert-badge">
              {missedUnreadCount > 9
                ? '9+'
                : missedUnreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div
          ref={panelRef}
          className="webphone"
          style={panelStyle}
        >
          <div className="phone-screen">
            <div
              ref={headerRef}
              className="phone-topbar"
              onPointerDown={startDragging}
            >
              <div className="phone-topbar-left">
                {currentTime}
              </div>

              <div className="dynamic-island">
                <span
                  className={`status-pill ${callStore.agentStatus}`}
                >
                  {callStore.agentStatus}
                </span>

                <span className="dynamic-status">
                  {callStore.callStatus ===
                    'active'
                    ? callStore.callDuration
                    : statusLabel}
                </span>
              </div>

              <div className="phone-topbar-right">
                {callStore.registered ? (
                  <span className="signal-dots">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  <X className="connection-cross" />
                )}

                <span className="battery">
                  80%
                </span>
              </div>
            </div>

            <div
              className={`phone-content ${callStore.callStatus}`}
            >
              <div className="dialer-window-actions">
                <div className="dialer-window-actions">
                  <button
                    type="button"
                    className="phone-close"
                    onClick={closeDialer}
                    title="Minimize dialer"
                  >
                    <Minimize2 />
                  </button>

                  {activePanel !==
                    'dialpad' && (
                      <button
                        type="button"
                        className="phone-close"
                        onClick={() =>
                          setActivePanel(
                            'dialpad',
                          )
                        }
                        title="Back to dial pad"
                      >
                        <Undo2 />
                      </button>
                    )}
                </div>

                <div className="dialer-window-actions">
                  <button
                    type="button"
                    className={[
                      'close-btn',
                      'phone-close',
                      'position-relative',
                      missedUnreadCount >
                        0
                        ? 'history-alert-badge'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={
                      openHistoryPanel
                    }
                    title="Call history"
                  >
                    <History />
                  </button>

                  <button
                    type="button"
                    className="close-btn phone-close"
                    onClick={() =>
                      setActivePanel(
                        'forward',
                      )
                    }
                    title="Call forwarding"
                  >
                    <Forward />
                  </button>
                </div>
              </div>

              <div
                key={panelTransitionKey}
                className={
                  activePanel ===
                    'dialpad'
                    ? 'idle-panel'
                    : undefined
                }
              >
                {isIncomingCall ? (
                  <div className="incoming-panel">
                    <div className="incoming-hero">
                      <div className="incoming-kicker">
                        <span className="status-pill incoming">
                          Incoming
                        </span>
                      </div>

                      <h3>
                        {callStore.caller ||
                          callStore.incomingNumber}
                      </h3>

                      <p>
                        Answer to start
                        the conversation
                        or reject to
                        decline the call.
                      </p>
                    </div>

                    <div className="incoming-meta">
                      <div className="meta-row">
                        <div className="lookup-item">
                          <span className="meta-label">
                            Contact
                          </span>

                          <span className="meta-value">
                            {callStore
                              .callerInfo
                              ?.name ||
                              callStore.contactName ||
                              'Unknown'}
                          </span>
                        </div>

                        {callStore
                          .callerInfo
                          ?.organization && (
                            <div className="lookup-item">
                              <span className="meta-label">
                                Organization
                              </span>

                              <span className="meta-value">
                                {
                                  callStore
                                    .callerInfo
                                    .organization
                                }
                              </span>
                            </div>
                          )}

                        {callStore
                          .callerInfo
                          ?.email && (
                            <div className="lookup-item">
                              <span className="meta-label">
                                Email
                              </span>

                              <span className="meta-value">
                                {
                                  callStore
                                    .callerInfo
                                    .email
                                }
                              </span>
                            </div>
                          )}

                        {callStore
                          .callerInfo
                          ?.extra
                          ?.lead_subject && (
                            <div className="lookup-item">
                              <span className="meta-label">
                                Subject
                              </span>

                              <span className="meta-value">
                                {String(
                                  callStore
                                    .callerInfo
                                    .extra
                                    .lead_subject,
                                )}
                              </span>
                            </div>
                          )}

                        {callStore
                          .callerInfo
                          ?.extra
                          ?.lead_status && (
                            <div className="lookup-item">
                              <span className="meta-label">
                                Status
                              </span>

                              <span className="meta-value">
                                {String(
                                  callStore
                                    .callerInfo
                                    .extra
                                    .lead_status,
                                )}
                              </span>
                            </div>
                          )}

                        {callStore
                          .callerInfo
                          ?.extra
                          ?.lead_created_at && (
                            <div className="lookup-item">
                              <span className="meta-label">
                                Created
                              </span>

                              <span className="meta-value">
                                {String(
                                  callStore
                                    .callerInfo
                                    .extra
                                    .lead_created_at,
                                )}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="main-actions incoming">
                      <button
                        type="button"
                        className="dialer-action-btn answer"
                        onClick={
                          answerCurrentCall
                        }
                      >
                        <PhoneIcon className="action-icon" />
                        <span>
                          Answer
                        </span>
                      </button>

                      <button
                        type="button"
                        className="dialer-action-btn reject"
                        onClick={
                          rejectCurrentCall
                        }
                      >
                        <PhoneIcon className="action-icon rotate-135" />
                        <span>
                          Reject
                        </span>
                      </button>
                    </div>
                  </div>
                ) : isActiveCall ? (
                  <div className="active-panel">
                    <div className="active-hero">
                      <div className="active-identity">
                        <div className="active-avatar">
                          <PhoneIcon className="active-avatar-icon" />
                        </div>

                        <div className="active-copy">
                          <div className="label-row">
                            <span className="label">
                              Live
                              call
                            </span>
                          </div>

                          <h3>
                            {
                              activeCallTitle
                            }
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="active-badges">
                      {callStore.muted && (
                        <span className="active-badge">
                          Muted
                        </span>
                      )}

                      {callStore.onHold && (
                        <span className="active-badge">
                          On hold
                        </span>
                      )}

                      <span className="active-badge">
                        {
                          callStore.callQuality
                        }
                      </span>

                      {callStore.latency !==
                        null &&
                        callStore.latency !==
                        undefined && (
                          <span className="active-badge">
                            {
                              callStore.latency
                            }{' '}
                            ms
                          </span>
                        )}
                    </div>

                    <div className="active-controls">
                      <div className="active-controls-row">
                        <button
                          type="button"
                          className={[
                            'dialer-action-btn',
                            'icon-only',
                            'mute',
                            callStore.muted
                              ? 'active'
                              : '',
                          ]
                            .filter(
                              Boolean,
                            )
                            .join(
                              ' ',
                            )}
                          onClick={
                            toggleMuteCurrentCall
                          }
                          title={
                            callStore.muted
                              ? 'Unmute'
                              : 'Mute'
                          }
                        >
                          {callStore.muted ? (
                            <MicOff className="action-icon" />
                          ) : (
                            <Mic className="action-icon" />
                          )}
                        </button>

                        <button
                          type="button"
                          className={[
                            'dialer-action-btn',
                            'icon-only',
                            'hold',
                            callStore.onHold
                              ? 'active'
                              : '',
                          ]
                            .filter(
                              Boolean,
                            )
                            .join(
                              ' ',
                            )}
                          onClick={
                            toggleHoldCurrentCall
                          }
                          title={
                            callStore.onHold
                              ? 'Resume'
                              : 'Hold'
                          }
                        >
                          {callStore.onHold ? (
                            <Play className="action-icon" />
                          ) : (
                            <Pause className="action-icon" />
                          )}
                        </button>

                        <button
                          type="button"
                          className="dialer-action-btn icon-only hangup"
                          onClick={
                            endCurrentCall
                          }
                          title="End call"
                        >
                          <PhoneIcon className="action-icon rotate-135" />
                        </button>
                      </div>
                    </div>

                    <div className="active-keypad">
                      <div className="dialpad">
                        {keys.map(
                          (
                            key,
                          ) => (
                            <button
                              type="button"
                              key={
                                key.value
                              }
                              className="dialpad-key"
                              onClick={() =>
                                pressKey(
                                  key.value,
                                )
                              }
                            >
                              <span className="dialpad-value">
                                {
                                  key.value
                                }
                              </span>

                              <span className="dialpad-label">
                                {
                                  key.label
                                }
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="idle-panel">
                    {activePanel ===
                      'dialpad' && (
                        <>
                          <div className="display">
                            <input
                              value={
                                number
                              }
                              placeholder={
                                inputPlaceholder
                              }
                              inputMode="tel"
                              autoComplete="off"
                              onChange={(
                                event,
                              ) =>
                                setNumber(
                                  event
                                    .target
                                    .value,
                                )
                              }
                              onKeyDown={(
                                event,
                              ) => {
                                if (
                                  event.key ===
                                  'Enter'
                                ) {
                                  event.preventDefault()
                                  handlePrimaryAction()
                                }
                              }}
                            />

                            <div className="status-row">
                              <span className="status-copy">
                                {
                                  helperText
                                }
                              </span>
                            </div>

                            {callStore.connectionMessage && (
                              <div className="status-row">
                                <span className="status-copy text-danger">
                                  {
                                    callStore.connectionMessage
                                  }
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="dialpad">
                            {keys.map(
                              (
                                key,
                              ) => (
                                <button
                                  type="button"
                                  key={
                                    key.value
                                  }
                                  className="dialpad-key"
                                  onClick={() =>
                                    pressKey(
                                      key.value,
                                    )
                                  }
                                >
                                  <span className="dialpad-value">
                                    {
                                      key.value
                                    }
                                  </span>

                                  <span className="dialpad-label">
                                    {
                                      key.label
                                    }
                                  </span>
                                </button>
                              ),
                            )}
                          </div>

                          <div
                            className={`utility-actions dialer-actions ${callStore.callStatus}`}
                          >
                            <button
                              type="button"
                              className="utility-btn icon-only"
                              disabled={
                                !hasDigits
                              }
                              onClick={
                                clearNumber
                              }
                              title="Clear number"
                            >
                              <X />
                            </button>

                            {[
                              'ringing',
                              'calling',
                            ].includes(
                              callStore.callStatus,
                            ) ? (
                              <button
                                type="button"
                                className="dialer-action-btn hangup full icon-only"
                                onClick={
                                  endCurrentCall
                                }
                                title="Cancel call"
                              >
                                <PhoneIcon className="action-icon rotate-135" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="dialer-action-btn call full icon-only"
                                disabled={
                                  !canPlaceCall
                                }
                                onClick={
                                  handlePrimaryAction
                                }
                                title="Start call"
                              >
                                <PhoneIcon className="action-icon" />
                              </button>
                            )}

                            <button
                              type="button"
                              className="utility-btn icon-only"
                              disabled={
                                !hasDigits
                              }
                              onClick={
                                backspaceNumber
                              }
                              title="Backspace"
                            >
                              <Delete />
                            </button>
                          </div>

                          {!callStore.registered && (
                            <button
                              type="button"
                              className="register-btn"
                              onClick={
                                manualRegister
                              }
                            >
                              <Radio />
                              <span>
                                Register
                                Dialer
                              </span>
                            </button>
                          )}
                        </>
                      )}

                    {activePanel ===
                      'calls' && (
                        <DialerHistory
                          callStore={
                            callStore
                          }
                          recentSearch={
                            recentSearch
                          }
                          missedUnreadCount={
                            missedUnreadCount
                          }
                          filteredRecentCalls={
                            filteredRecentCalls
                          }
                          redialLastCall={
                            redialLastCall
                          }
                          markMissedRead={
                            markMissedRead
                          }
                          confirmClearMissed={
                            confirmClearMissed
                          }
                          callFromHistory={
                            callFromHistory
                          }
                          onClose={() =>
                            setActivePanel(
                              'dialpad',
                            )
                          }
                          onRecentSearchChange={
                            setRecentSearch
                          }
                        />
                      )}

                    {activePanel ===
                      'forward' && (
                        <DialerForward
                          forwardNumber={
                            forwardNumber
                          }
                          forwardEnabled={
                            forwardEnabled
                          }
                          enableForwarding={
                            enableForwarding
                          }
                          disableForwarding={
                            disableForwarding
                          }
                          forwardCurrentCall={
                            forwardCurrentCall
                          }
                          onClose={() =>
                            setActivePanel(
                              'dialpad',
                            )
                          }
                          onForwardNumberChange={
                            setForwardNumber
                          }
                        />
                      )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="home-indicator"
              onClick={closeDialer}
              aria-label="Minimize dialer"
            />
          </div>
        </div>
      )}
    </div>
  )
}