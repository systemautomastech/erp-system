import { Link } from '@inertiajs/react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Settings,
    Image as ImageIcon,
    FileText,
    File,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type SetupTabKey = 'general-settings' | 'template-branding' | 'default-terms' | 'default-pages';

interface SidebarItem {
    key: SetupTabKey;
    label: string;
    icon: React.ElementType;
    route: string;
}

interface SetupSidebarProps {
    activeTab: SetupTabKey;
}

export default function SetupSidebar({ activeTab }: SetupSidebarProps) {
    const { t } = useTranslation();

    const setupSidebarItems: SidebarItem[] = [
        {
            key: 'general-settings',
            label: t('General Settings'),
            icon: Settings,
            route: route('proposal-setup.general-settings'),
        },
        {
            key: 'template-branding',
            label: t('Logo & Template'),
            icon: ImageIcon,
            route: route('proposal-setup.template-branding'),
        },
        {
            key: 'default-terms',
            label: t('Default Terms & Conditions'),
            icon: FileText,
            route: route('proposal-setup.default-terms'),
        },
        {
            key: 'default-pages',
            label: t('Default Pages'),
            icon: File,
            route: route('proposal-setup.default-pages'),
        },
    ];

    return (
        <div className="md:w-64 flex-shrink-0">
            <div className="sticky top-4">
                <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="pr-4 space-y-1">
                        {setupSidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.key;
                            return (
                                <Button
                                    key={item.key}
                                    variant="ghost"
                                    className={cn('w-full justify-start', {
                                        'bg-muted font-medium': isActive,
                                    })}
                                    asChild
                                >
                                    <Link href={item.route} preserveState>
                                        <Icon className="h-4 w-4 mr-2" />
                                        {item.label}
                                    </Link>
                                </Button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
