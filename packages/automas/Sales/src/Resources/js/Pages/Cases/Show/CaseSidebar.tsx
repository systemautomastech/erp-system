import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { FileText, Activity, Phone, Calendar } from 'lucide-react';

interface CaseSidebarProps {
    activeItem: string;
    onSectionChange: (section: string) => void;
}

export default function CaseSidebar({ activeItem, onSectionChange }: CaseSidebarProps) {
    const { t } = useTranslation();
    
    const sidebarItems = [
        { key: 'general', label: t('General'), icon: FileText },
        { key: 'streams', label: t('Streams'), icon: Activity },
        { key: 'calls', label: t('Calls'), icon: Phone },
        { key: 'meetings', label: t('Meetings'), icon: Calendar }
    ];

    return (
        <div className="sticky top-4">
            <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="pr-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.key;

                        return (
                            <Button
                                key={item.key}
                                variant="ghost"
                                className={cn('w-full justify-start', {
                                    'bg-muted font-medium': isActive,
                                })}
                                onClick={() => onSectionChange(item.key)}
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {item.label}
                            </Button>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}