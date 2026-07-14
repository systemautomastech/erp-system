import { usePage } from '@inertiajs/react';
import StreamSection from '../../../Components/StreamSection';

interface StreamsProps {
    opportunity: any;
}

export default function Streams({ opportunity }: StreamsProps) {
    const { streams, imageUrlPrefix, auth } = usePage().props as any;

    return (
        <StreamSection
            moduleType="opportunity"
            moduleName={opportunity.name}
            moduleId={opportunity.id}
            streams={streams || []}
            imageUrlPrefix={imageUrlPrefix}
            auth={auth}
        />
    );
}