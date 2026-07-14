import { useTranslation } from 'react-i18next';
import { usePage } from '@inertiajs/react';
import StreamSection from '../../../Components/StreamSection';

interface StreamsProps {
    account: any;
}

export default function Streams({ account }: StreamsProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { streams, imageUrlPrefix, auth } = pageProps;

    return (
        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[75vh] rounded-none w-full">
            <StreamSection
                moduleType="account"
                moduleName={account.name}
                moduleId={account.id}
                streams={streams || []}
                imageUrlPrefix={imageUrlPrefix}
                auth={auth}
            />
        </div>
    );
}