import { PhoneIcon } from 'lucide-react'

interface DialerForwardProps {
    forwardNumber: string
    forwardEnabled: boolean
    enableForwarding: () => void
    disableForwarding: () => void
    forwardCurrentCall: (destination?: string) => Promise<void>
    onForwardNumberChange: (value: string) => void
}

export default function DialerForward({
    forwardNumber,
    forwardEnabled,
    enableForwarding,
    disableForwarding,
    forwardCurrentCall,
    onForwardNumberChange,
}: DialerForwardProps) {
    const hasForwardNumber =
        forwardNumber.trim().length > 0

    return (
        <div className="forward-panel panel-transition">
            <div className="panel-header">
                <h2>Forward call</h2>
            </div>

            <div className="forward-body">
                <label
                    htmlFor="forwardNumber"
                    className="form-label mb-0"
                >
                    Forward current call to
                </label>

                <input
                    id="forwardNumber"
                    value={forwardNumber}
                    onChange={(event) =>
                        onForwardNumberChange(
                            event.target.value,
                        )
                    }
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter extension or number"
                />

                <div className="d-flex gap-2">
                    {!forwardEnabled ? (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary w-50 mb-2"
                            disabled={!hasForwardNumber}
                            onClick={enableForwarding}
                        >
                            Enable
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger w-50 mb-2"
                            onClick={disableForwarding}
                        >
                            Disable
                        </button>
                    )}

                    <button
                        type="button"
                        className="btn btn-sm btn-primary w-50 mb-2"
                        disabled={!hasForwardNumber}
                        onClick={() => {
                            void forwardCurrentCall(
                                forwardNumber,
                            )
                        }}
                        aria-label="Forward current call"
                    >
                        <PhoneIcon className="me-1" />
                    </button>
                </div>

                <p className="text-muted small mt-2">
                    If a call is active, dialing a
                    number will forward the call to
                    that number.
                </p>
            </div>
        </div>
    )
}