import { FileCheck } from 'lucide-react';

declare global {
    function route(name: string): string;
}

export const pbxCompanyMenu = (t: (key: string) => string) => [
    {
        title: t('PBX'),
        icon: FileCheck,
        permission: 'manage-pbx',
        href: route('pbx.index'),
        order: 265,
    },
];