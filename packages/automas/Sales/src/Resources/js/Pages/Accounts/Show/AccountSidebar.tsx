import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Building2, Users, UserCheck, FileText, Package, ShoppingCart, Receipt, Briefcase, Activity, Phone, Calendar } from 'lucide-react';

interface AccountSidebarProps {
    activeItem: string;
    onSectionChange: (section: string) => void;
    auth: any;
}

export default function AccountSidebar({ activeItem, onSectionChange, auth }: AccountSidebarProps) {
    const { t } = useTranslation();
    
    const sidebarItems = [
        { key: 'general', label: t('General'), icon: Building2, permission: null },
        { key: 'streams', label: t('Streams'), icon: Activity, permission: 'manage-sales-streams' },
        { key: 'contacts', label: t('Contacts'), icon: UserCheck, permission: 'manage-sales-contacts' },
        { key: 'opportunities', label: t('Opportunities'), icon: Package, permission: 'manage-sales-opportunities' },
        { key: 'cases', label: t('Cases'), icon: Briefcase, permission: 'manage-sales-cases' },
        { key: 'quotes', label: t('Quotes'), icon: FileText, permission: 'manage-sales-quotes' },
        { key: 'sales-orders', label: t('Sales Orders'), icon: ShoppingCart, permission: 'manage-sales-orders' },

        { key: 'calls', label: t('Calls'), icon: Phone, permission: 'manage-sales-calls' },
        { key: 'meetings', label: t('Meetings'), icon: Calendar, permission: 'manage-sales-meetings' },
        { key: 'documents', label: t('Documents'), icon: FileText, permission: 'manage-sales-documents' }
    ].filter(item => !item.permission || auth.user?.permissions?.includes(item.permission));

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