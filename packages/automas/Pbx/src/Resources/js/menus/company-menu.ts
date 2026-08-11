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
        permission: 'manage pbx',
        order: 265,
        children: [
            {
                title: t('Extensions'),
                icon: Users,
                permission: 'manage extensions',
                href: route('pbx.extensions.index'),
            },
            {
                title: t('Call Reports'),
                icon: FileCheck,
                permission: 'manage call logs',
                href: route('pbx.call-reports.index'),
            },
            {
                title: t('System Setup'),
                icon: Settings,
                permission: 'manage settings',
                href: route('pbx.settings.index'),
            },
        ],
    },
];
