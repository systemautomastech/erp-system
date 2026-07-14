import { useMemo, useState } from 'react'
import {
    ArrowDownLeft,
    ArrowUpRight,
    PhoneIcon,
    PhoneMissed,
    X,
} from 'lucide-react'

import type {
    CallStore,
    RecentCall,
} from '../store/callStore'

interface DialerHistoryProps {
    callStore: CallStore
    recentSearch: string
    missedUnreadCount: number
    filteredRecentCalls: RecentCall[]
    redialLastCall: () => void
    markMissedRead: () => void
    confirmClearMissed: () => void
    callFromHistory: (item: RecentCall) => void
    onRecentSearchChange: (value: string) => void
}

function getCallLabel(item: RecentCall): string {
    if (item.status === 'missed') return 'Missed'
    if (item.status === 'failed') return 'Failed'
    if (item.status === 'rejected') return 'Rejected'

    if (item.direction === 'inbound') return 'Incoming'
    if (item.direction === 'outbound') return 'Outgoing'

    return 'Call'
}

function getHistoryTextClass(item: RecentCall): string {
    if (
        item.status === 'missed' ||
        item.status === 'failed' ||
        item.status === 'rejected'
    ) {
        return 'text-danger'
    }

    if (
        item.direction === 'outbound' &&
        item.status === 'answered'
    ) {
        return 'text-primary'
    }

    if (item.status === 'answered') {
        return 'text-success'
    }

    return ''
}

export default function DialerHistory({
    recentSearch,
    filteredRecentCalls,
    callFromHistory,
    onRecentSearchChange,
}: DialerHistoryProps) {
    const [copiedNumber, setCopiedNumber] =
        useState<string | null>(null)

    const showNoResultCallPopover = useMemo(
        () =>
            recentSearch.trim().length >= 3 &&
            filteredRecentCalls.length === 0,
        [
            recentSearch,
            filteredRecentCalls.length,
        ],
    )

    const copyNumber = async (
        number: string,
    ): Promise<void> => {
        try {
            await navigator.clipboard.writeText(
                number,
            )

            setCopiedNumber(number)

            window.setTimeout(() => {
                setCopiedNumber(
                    (currentCopiedNumber) =>
                        currentCopiedNumber === number
                            ? null
                            : currentCopiedNumber,
                )
            }, 1500)
        } catch (error) {
            console.error(
                'Failed to copy:',
                error,
            )
        }
    }

    const callSearchNumber = (): void => {
        const number = recentSearch.trim()

        if (!number) return

        callFromHistory({
            number,
            direction: 'outbound',
            status: 'answered',
        })
    }

    return (
        <div className="history-panel panel-transition">
            <div className="panel-header">
                <h2>Recent calls</h2>
            </div>

            <div className="search-row mb-2 position-relative">
                <input
                    value={recentSearch}
                    onChange={(event) =>
                        onRecentSearchChange(
                            event.target.value,
                        )
                    }
                    type="text"
                    className="form-control"
                    placeholder="Search recent calls"
                />

                {showNoResultCallPopover && (
                    <div className="no-result-popover shadow-sm">
                        <div className="small text-muted mb-1">
                            No result found
                        </div>

                        <div className="fw-semibold mb-2">
                            {recentSearch}
                        </div>

                        <button
                            type="button"
                            className="btn btn-sm btn-primary w-100"
                            onClick={callSearchNumber}
                        >
                            <PhoneIcon className="me-1 action-icon" />
                            Call
                        </button>
                    </div>
                )}
            </div>

            {filteredRecentCalls.length > 0 ? (
                <div className="history-list">
                    {filteredRecentCalls.map(
                        (item) => (
                            <div
                                key={
                                    item.id ??
                                    `${item.number}-${item.created_at ?? item.time ?? ''}`
                                }
                                className="history-item border-bottom py-2 px-1"
                            >
                                <button
                                    type="button"
                                    className={`ms-1 w-100 text-start border-0 bg-transparent p-0 ${getHistoryTextClass(
                                        item,
                                    )}`}
                                    onClick={() => {
                                        void copyNumber(
                                            item.number,
                                        )
                                    }}
                                >
                                    <span className="fw-semibold history-number">
                                        {item.number}

                                        {copiedNumber ===
                                            item.number && (
                                            <small className="text-success text-muted ms-2">
                                                ✓ Copied
                                            </small>
                                        )}
                                    </span>

                                    <span className="history-meta d-flex gap-2 align-items-center">
                                        <small className="d-flex align-items-center">
                                            {item.status ===
                                            'missed' ? (
                                                <PhoneMissed className="history-direction-icon text-danger" />
                                            ) : item.status ===
                                                  'failed' ||
                                              item.status ===
                                                  'rejected' ? (
                                                <X className="history-direction-icon text-danger" />
                                            ) : item.direction ===
                                              'outbound' ? (
                                                <ArrowDownLeft className="history-direction-icon text-success" />
                                            ) : item.direction ===
                                              'inbound' ? (
                                                <ArrowUpRight className="history-direction-icon text-success" />
                                            ) : null}
                                        </small>

                                        <small className="text-muted">
                                            {getCallLabel(
                                                item,
                                            )}
                                        </small>

                                        <small className="text-muted">
                                            {item.time}
                                        </small>
                                    </span>
                                </button>

                                <div className="history-item-right">
                                    <button
                                        type="button"
                                        className="history-avatar border-0"
                                        onClick={() =>
                                            callFromHistory(
                                                item,
                                            )
                                        }
                                        aria-label={`Call ${item.number}`}
                                    >
                                        <PhoneIcon className="action-icon" />
                                    </button>
                                </div>
                            </div>
                        ),
                    )}
                </div>
            ) : (
                <div className="text-center text-muted py-3">
                    No recent calls found
                </div>
            )}
        </div>
    )
}