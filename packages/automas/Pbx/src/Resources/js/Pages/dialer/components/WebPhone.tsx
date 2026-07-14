import Dialer from './Dialer'
import { useDialerTabOwner } from '../hooks/useDialerTabOwner'

export default function WebPhone() {
    const {
        isOwnerTab,
        openDialerPopup,
    } = useDialerTabOwner()

    if (isOwnerTab) {
        return <Dialer />
    }

    return (
        <button
            type="button"
            className="phone-tab"
            onClick={() => {
                void openDialerPopup()
            }}
            title="Dialer active in another tab"
        >
            Dialer running in another tab
        </button>
    )
}