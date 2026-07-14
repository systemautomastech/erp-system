import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { FileText, Building2 } from 'lucide-react';

interface DocumentSidebarProps {
    activeItem: string;
    onSectionChange: (section: string) => void;
}

export default function DocumentSidebar({ activeItem, onSectionChange }: DocumentSidebarProps) {
    const { t } = useTranslation();
    
    const sidebarItems = [
        { key: 'general', label: t('General'), icon: FileText },
        { key: 'accounts', label: t('Accounts'), icon: Building2 }
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