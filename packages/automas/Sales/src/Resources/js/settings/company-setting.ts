import { TrendingUp } from 'lucide-react';

export interface SettingMenuItem {
  order: number;
  title: string;
  href: string;
  icon: any;
  permission: string;
  component: string;
}

export interface SalesSettings {
  quote_prefix: string;
  order_prefix: string;

  case_prefix: string;
}

export const defaultSalesSettings: SalesSettings = {
  quote_prefix: 'QUO',
  order_prefix: 'ORD',

  case_prefix: 'CASE',
};

export const getSalesCompanySettings = (t: (key: string) => string): SettingMenuItem[] => [
  {
    order: 210,
    title: t('Sales Settings'),
    href: '#sales-settings',
    icon: TrendingUp,
    permission: 'edit-sales-settings',
    component: 'sales-settings'
  }
];