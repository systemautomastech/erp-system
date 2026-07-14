import { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/helpers';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Target, CheckCircle, XCircle, Clock, TrendingUp, Users, Award } from 'lucide-react';
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { PieChart } from '@/components/charts/PieChart';

interface OpportunityReportsProps {
    opportunitySummary: {
        total: number;
        active: number;
        inactive: number;
        won: number;
        lost: number;
    };
    opportunityStageDistribution: any[];
    opportunityStatusDistribution: any[];

    conversionMetrics: {
        totalOpportunities: number;
        wonOpportunities: number;
        conversionRate: number;
    };
    staffOpportunities: any[];
    perMonthOpportunities: any[];
    amountSummary: {
        total: number;
        active: number;
        inactive: number;
        won: number;
        lost: number;
    };
    monthlyAmounts: any[];
    users: any[];
    stages: any[];
}

export default function OpportunityReports() {
    const { t } = useTranslation();
    const { opportunitySummary, opportunityStageDistribution, opportunityStatusDistribution, conversionMetrics, staffOpportunities, perMonthOpportunities, amountSummary, monthlyAmounts, users, stages } = usePage<OpportunityReportsProps>().props;
    
    const [dateRange, setDateRange] = useState(() => {
        const fromDate = new URLSearchParams(window.location.search).get('from_date');
        const toDate = new URLSearchParams(window.location.search).get('to_date');
        if (fromDate && toDate) {
            return `${fromDate} - ${toDate}`;
        }
        return '';
    });
    const [salesUser, setSalesUser] = useState(new URLSearchParams(window.location.search).get('sales_user') || 'all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedAmountMonth, setSelectedAmountMonth] = useState('all');



    const COLORS = ['#00C49F', '#FF8042', '#6B7280', '#0088FE', '#8B5CF6']; // Green, Orange, Gray, Blue, Purple

    const summaryCards = [
        {
            title: t('Total Opportunities'),
            value: opportunitySummary.total,
            icon: Target,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: t('Active Opportunities'),
            value: opportunitySummary.active,
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: t('Won Opportunities'),
            value: opportunitySummary.won,
            icon: Award,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
        },
        {
            title: t('Lost Opportunities'),
            value: opportunitySummary.lost,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
        {
            title: t('Inactive Opportunities'),
            value: opportunitySummary.inactive,
            icon: Clock,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
        },
    ];

    const handleFilterApply = () => {
        const params = new URLSearchParams();
        if (dateRange) {
            const [fromDate, toDate] = dateRange.split(' - ');
            if (fromDate) params.set('from_date', fromDate);
            if (toDate) params.set('to_date', toDate);
        }
        if (salesUser && salesUser !== 'all') params.set('sales_user', salesUser);

        router.get(route('sales.reports.opportunities'), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                {label: t('Sales'), url: route('sales.index')},
                {label: t('Reports')},
                {label: t('Opportunity Reports')}
            ]}
            pageTitle={t('Opportunity Reports')}
        >
            <Head title={t('Opportunity Reports')} />

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">{t('General Report')}</TabsTrigger>
                    <TabsTrigger value="amount">{t('Amount Report')}</TabsTrigger>
                    <TabsTrigger value="staff">{t('Staff Performance')}</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {summaryCards.map((card, index) => (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {card.title}
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {card.value}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {card.title === 'Total Opportunities' ? 'All time' : 
                                             `${((card.value / opportunitySummary.total) * 100).toFixed(1)}% of total`}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-full ${card.bgColor}`}>
                                        <card.icon className={`h-6 w-6 ${card.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[450px]">
                    <Card className="flex flex-col">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-medium">{t('Opportunity Stage Distribution')}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                            <div className="w-full h-full">
                                <PieChart
                                    data={opportunityStageDistribution}
                                    dataKey="value"
                                    nameKey="name"
                                    height={350}
                                    donut
                                    showLabels
                                    showLegend
                                    showTooltip
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-medium">{t('Active/Inactive Status')}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                            <div className="w-full h-full">
                                <PieChart
                                    data={opportunityStatusDistribution}
                                    dataKey="value"
                                    nameKey="name"
                                    height={350}
                                    donut
                                    showLabels
                                    showLegend
                                    showTooltip
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                {t('Performance Metrics')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4 p-4">
                            <div className="text-center p-4 bg-white/60 rounded-lg">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    {conversionMetrics.conversionRate}%
                                </div>
                                <div className="text-sm text-gray-600 mb-3 font-medium">
                                    {t('Win Rate')} ({conversionMetrics.wonOpportunities}/{conversionMetrics.totalOpportunities})
                                </div>
                                <div className="relative w-full bg-green-100 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000" 
                                        style={{ width: `${Math.min(conversionMetrics.conversionRate, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-700">{t('Success Rate')}</span>
                                    </div>
                                    <span className="text-lg font-bold text-green-600">
                                        {opportunitySummary.total > 0 ? ((opportunitySummary.won / opportunitySummary.total) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-700">{t('Loss Rate')}</span>
                                    </div>
                                    <span className="text-lg font-bold text-red-600">
                                        {opportunitySummary.total > 0 ? ((opportunitySummary.lost / opportunitySummary.total) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-700">{t('Active Opportunities')}</span>
                                    </div>
                                    <span className="text-lg font-bold text-blue-600">
                                        {opportunitySummary.active}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Per Month Opportunities */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-medium">{t('Per Month Opportunities')}</CardTitle>
                        <div className="flex items-center gap-2">
                            <Select value={selectedMonth} onValueChange={(value) => setSelectedMonth(value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('Select Month')}</SelectItem>
                                    <SelectItem value="1">{t('January')}</SelectItem>
                                    <SelectItem value="2">{t('February')}</SelectItem>
                                    <SelectItem value="3">{t('March')}</SelectItem>
                                    <SelectItem value="4">{t('April')}</SelectItem>
                                    <SelectItem value="5">{t('May')}</SelectItem>
                                    <SelectItem value="6">{t('June')}</SelectItem>
                                    <SelectItem value="7">{t('July')}</SelectItem>
                                    <SelectItem value="8">{t('August')}</SelectItem>
                                    <SelectItem value="9">{t('September')}</SelectItem>
                                    <SelectItem value="10">{t('October')}</SelectItem>
                                    <SelectItem value="11">{t('November')}</SelectItem>
                                    <SelectItem value="12">{t('December')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button 
                                onClick={() => setSelectedMonth('all')} 
                                variant="outline" 
                                size="sm"
                            >
                                {t('Clear')}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={selectedMonth === 'all' ? perMonthOpportunities : 
                                [{
                                    name: perMonthOpportunities?.find(item => item.month === parseInt(selectedMonth))?.name || ({
                                        1: 'Jan 2025', 2: 'Feb 2025', 3: 'Mar 2025', 4: 'Apr 2025',
                                        5: 'May 2025', 6: 'Jun 2025', 7: 'Jul 2025', 8: 'Aug 2025',
                                        9: 'Sep 2025', 10: 'Oct 2025', 11: 'Nov 2025', 12: 'Dec 2025'
                                    }[parseInt(selectedMonth)] || 'No Data'),
                                    opportunities: perMonthOpportunities?.find(item => item.month === parseInt(selectedMonth))?.opportunities || 0
                                }]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="opportunities" fill="#0EA5E9" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                </TabsContent>

                <TabsContent value="amount" className="space-y-6">
                {/* Amount Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('Total Amount')}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(amountSummary.total)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {t('All time')}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-50">
                                    <TrendingUp className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('Active Amount')}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(amountSummary.active)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {amountSummary.total > 0 ? ((amountSummary.active / amountSummary.total) * 100).toFixed(1) : 0}% of total
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-green-50">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('Inactive Amount')}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(amountSummary.inactive)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {amountSummary.total > 0 ? ((amountSummary.inactive / amountSummary.total) * 100).toFixed(1) : 0}% of total
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-gray-50">
                                    <Clock className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Amount Chart */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-medium">{t('Monthly Opportunity Amounts')}</CardTitle>
                        <div className="flex items-center gap-2">
                            <Select value={selectedAmountMonth} onValueChange={(value) => setSelectedAmountMonth(value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('Select Month')}</SelectItem>
                                    <SelectItem value="1">{t('January')}</SelectItem>
                                    <SelectItem value="2">{t('February')}</SelectItem>
                                    <SelectItem value="3">{t('March')}</SelectItem>
                                    <SelectItem value="4">{t('April')}</SelectItem>
                                    <SelectItem value="5">{t('May')}</SelectItem>
                                    <SelectItem value="6">{t('June')}</SelectItem>
                                    <SelectItem value="7">{t('July')}</SelectItem>
                                    <SelectItem value="8">{t('August')}</SelectItem>
                                    <SelectItem value="9">{t('September')}</SelectItem>
                                    <SelectItem value="10">{t('October')}</SelectItem>
                                    <SelectItem value="11">{t('November')}</SelectItem>
                                    <SelectItem value="12">{t('December')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button 
                                onClick={() => setSelectedAmountMonth('all')} 
                                variant="outline" 
                                size="sm"
                            >
                                {t('Clear')}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={selectedAmountMonth === 'all' ? monthlyAmounts : 
                                [{
                                    name: monthlyAmounts?.find(item => item.month === parseInt(selectedAmountMonth))?.name || ({
                                        1: 'Jan 2025', 2: 'Feb 2025', 3: 'Mar 2025', 4: 'Apr 2025',
                                        5: 'May 2025', 6: 'Jun 2025', 7: 'Jul 2025', 8: 'Aug 2025',
                                        9: 'Sep 2025', 10: 'Oct 2025', 11: 'Nov 2025', 12: 'Dec 2025'
                                    }[parseInt(selectedAmountMonth)] || 'No Data'),
                                    amount: monthlyAmounts?.find(item => item.month === parseInt(selectedAmountMonth))?.amount || 0
                                }]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis 
                                    tickFormatter={(value) => formatCurrency(value)}
                                    width={120}
                                    tick={{ fontSize: 16 }}
                                />
                                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                                <Bar dataKey="amount" fill="#F59E0B" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                </TabsContent>

                <TabsContent value="staff" className="space-y-6">
                {/* Staff Performance */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <CardTitle className="text-lg font-medium">{t('Staff Performance')}</CardTitle>
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <Label className="text-sm font-medium">{t('Date Range')}</Label>
                                    <DateRangePicker
                                        value={dateRange}
                                        onChange={(value) => setDateRange(value)}
                                        placeholder={t('Select date range')}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">{t('Sales User')}</Label>
                                    <Select value={salesUser} onValueChange={(value) => setSalesUser(value)}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder={t('All Users')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('All Users')}</SelectItem>
                                            {users?.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button onClick={handleFilterApply} size="sm">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {t('Generate')}
                                    </Button>
                                    <Button 
                                        onClick={() => {
                                            setDateRange('');
                                            setSalesUser('all');
                                            router.get(route('sales.reports.opportunities'), {}, {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }} 
                                        variant="outline" 
                                        size="sm"
                                    >
                                        {t('Clear')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={staffOpportunities}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="opportunities" fill="#8B5CF6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                </TabsContent>
            </Tabs>
        </AuthenticatedLayout>
    );
}