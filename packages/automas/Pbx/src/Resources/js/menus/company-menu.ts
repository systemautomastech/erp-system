import {
    FileCheck,
    Settings,
    PhoneCall,
    Users,
} from 'lucide-react';

declare global {
    function route(name: string, params?: Record<string, unknown>): string;
}

export const pbxCompanyMenu = (t: (key: string) => string) => [
    {
        title: t('PBX'),
        icon: PhoneCall,
        permission: '',
        order: 265,
        children: [
            {
                title: t('Extensions'),
                icon: Users,
                permission: '',
                href: route('pbx.extensions.index'),
            },
            {
                title: t('Call Logs'),
                icon: FileCheck,
                permission: '',
                href: route('pbx.call-logs.index'),
            },
            {
                title: t('PBX Settings'),
                icon: Settings,
                permission: '',
                href: route('pbx.settings.index'),
            },
        ],
    },
];
