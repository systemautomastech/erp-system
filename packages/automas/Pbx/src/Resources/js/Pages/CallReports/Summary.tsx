import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    BarChart3,
    CheckCircle2,
    Clock,
    FileText,
    Headphones,
    PhoneCall,
    PhoneIncoming,
    PhoneMissed,
    PhoneOff,
    PhoneOutgoing,
    RefreshCw,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart as RechartsBarChart,
    Bar,
    Cell,
    CartesianGrid,
    Legend,
    PieChart as RechartsPieChart,
    Pie,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';


interface Extension {
    id: number;
    extension: string;
    user_id: number | null;
    user_name: string | null;
}

interface Summary {
    totalCalls: number;
    incoming: number;
    outgoing: number;
    totalDuration: number;
    totalTalkTime: number;
    answered: number;
    noAnswer: number;
    rejected: number;
    otherStatuses: number;
    avgDuration?: number;
    avgTalkTime?: number;
    answerRate?: number;
}

interface ChartItem {
    name: string;
    value: number;
    color: string;
}

interface ExtensionChartItem {
    extension: string;
    total: number;
    answered: number;
    duration: number;
}

interface TrendChartItem {
    date: string;
    total: number;
    answered: number;
    missed: number;
}

interface ChartsData {
    direction: ChartItem[];
    status: ChartItem[];
    extensions: ExtensionChartItem[];
    trend: TrendChartItem[];
}

interface CallReportPermissions {
    view_all: boolean;
    view_own: boolean;
}

interface SummaryProps {
    summary: Summary;
    charts: ChartsData;
    extensions: Extension[];
    filters: {
        extension: string;
        date_range: string;
    };
    callReportPermissions: CallReportPermissions;
}

export default function SummaryIndex({
    summary,
    charts,
    extensions = [],
    filters,
    callReportPermissions,
}: SummaryProps) {
    const { t } = useTranslation();

    const [selectedExtension, setSelectedExtension] = useState<string>(
        filters?.extension || ''
    );
    const [dateRange, setDateRange] = useState<string>(
        filters?.date_range || ''
    );
    const [isRefreshing, setIsRefreshing] = useState(false);

    const formatDuration = (seconds: number): string => {
        if (!seconds || seconds <= 0) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins === 0) return `${secs}s`;
        const hours = Math.floor(mins / 60);
        const remMins = mins % 60;
        if (hours === 0) return `${mins}m ${secs}s`;
        return `${hours}h ${remMins}m ${secs}s`;
    };

    const handleFilterChange = () => {
        setIsRefreshing(true);
        router.get(
            route('pbx.call-reports.summary'),
            {
                extension: selectedExtension || undefined,
                date_range: dateRange || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsRefreshing(false),
            }
        );
    };

    const handleReset = () => {
        setSelectedExtension('');
        setDateRange('');
        setIsRefreshing(true);
        router.get(
            route('pbx.call-reports.summary'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsRefreshing(false),
            }
        );
    };

    const calcPercent = (value: number, total: number) => {
        if (!total || total <= 0) return '0%';
        return `${((value / total) * 100).toFixed(1)}%`;
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('PBX') },
                { label: t('Call Summary & Analytics') },
            ]}
        >
            <Head title={t('PBX Call Summary')} />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Header Title Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            {t('PBX Call Analytics')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Comprehensive statistical summary and visual call performance insights.')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => router.get(route('pbx.call-reports.index'))}
                        >
                            <FileText className="h-4 w-4" />
                            {t('View Detailed Call Logs')}
                        </Button>
                    </div>
                </div>

                {/* Filter Control Bar */}
                <Card className="border border-border/60 shadow-sm">
                    <CardContent className="p-4 sm:p-5">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Extension Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {callReportPermissions.view_all
                                        ? t('User / Extension')
                                        : t('My Extension')}
                                </label>
                                <Select
                                    value={selectedExtension || 'all'}
                                    onValueChange={(value) =>
                                        setSelectedExtension(
                                            value === 'all' ? '' : value
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder={
                                                callReportPermissions.view_all
                                                    ? t('All Extensions')
                                                    : t('All My Extensions')
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent searchable>
                                        <SelectItem value="all">
                                            {callReportPermissions.view_all
                                                ? t('All Extensions')
                                                : t('All My Extensions')}
                                        </SelectItem>
                                        {extensions.map((ext) => (
                                            <SelectItem key={ext.id} value={ext.extension}>
                                                {ext.user_name
                                                    ? `${ext.user_name} (${ext.extension})`
                                                    : ext.extension}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Range Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t('Date Range')}
                                </label>
                                <DateRangePicker
                                    value={dateRange}
                                    onChange={(value) => setDateRange(value)}
                                    placeholder={t('Select date range')}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
                                <Button
                                    onClick={handleFilterChange}
                                    disabled={isRefreshing}
                                    className="gap-2"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    {t('Apply Filters')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={isRefreshing}
                                >
                                    {t('Reset')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 8 Primary Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Calls */}
                    <Card className="border border-border/60 shadow-sm transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('Total Calls')}
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                                        {summary.totalCalls}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {summary.totalCalls > 0
                                            ? `${calcPercent(summary.incoming, summary.totalCalls)} ${t('Inbound')} • ${calcPercent(summary.outgoing, summary.totalCalls)} ${t('Outbound')}`
                                            : t('No call activity')}
                                    </p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Headphones className="h-5.5 w-5.5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Incoming */}
                    <Card className="border border-border/60 shadow-sm transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('Incoming Calls')}
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                                        {summary.incoming}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-blue-600">
                                        {calcPercent(summary.incoming, summary.totalCalls)} {t('of total volume')}
                                    </p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                    <PhoneIncoming className="h-5.5 w-5.5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Outgoing */}
                    <Card className="border border-border/60 shadow-sm transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('Outgoing Calls')}
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                                        {summary.outgoing}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-purple-600">
                                        {calcPercent(summary.outgoing, summary.totalCalls)} {t('of total volume')}
                                    </p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                                    <PhoneOutgoing className="h-5.5 w-5.5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Answered */}
                    <Card className="border border-border/60 shadow-sm transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('Answered Calls')}
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                                        {summary.answered}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-emerald-600">
                                        {summary.answerRate !== undefined
                                            ? `${summary.answerRate}% ${t('Answer Rate')}`
                                            : calcPercent(summary.answered, summary.totalCalls) + ` ${t('Answer Rate')}`}
                                    </p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    <CheckCircle2 className="h-5.5 w-5.5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* No Answer */}
                    <Card className="border border-border/60 shadow-sm transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('No Answer')}
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                                        {summary.noAnswer}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-amber-600">
                                        {calcPercent(summary.noAnswer, summary.totalCalls)} {t('Missed')}
                                    </p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                                    <PhoneMissed className="h-5.5 w-5.5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rejected / Failed */}
                    <Card className="border border-border/60 shadow-sm transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('Rejected / Failed')}
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                                        {summary.rejected}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-rose-600">
                                        {calcPercent(summary.rejected, summary.totalCalls)} {t('Failed')}
                                    </p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                                    <PhoneOff className="h-5.5 w-5.5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Duration */}
                    <Card className="border border-border/60 shadow-sm transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('Total Duration')}
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                                        {formatDuration(summary.totalDuration)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {summary.avgDuration !== undefined
                                            ? `~${formatDuration(summary.avgDuration)} ${t('avg / call')}`
                                            : t('Cumulative time')}
                                    </p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                                    <Clock className="h-5.5 w-5.5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Talk Time */}
                    <Card className="border border-border/60 shadow-sm transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('Total Talk Time')}
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold tracking-tight">
                                        {formatDuration(summary.totalTalkTime)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {summary.avgTalkTime !== undefined
                                            ? `~${formatDuration(summary.avgTalkTime)} ${t('avg / answered')}`
                                            : t('Billable talk time')}
                                    </p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
                                    <PhoneCall className="h-5.5 w-5.5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Visualizations Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Chart 1: Call Trend (Area Chart) */}
                    <Card className="border border-border/60 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">
                                        {t('Call Volume Trend')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('Daily distribution of total and answered calls')}
                                    </CardDescription>
                                </div>
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="h-[280px] w-full">
                                {charts?.trend && charts.trend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={charts.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                                </linearGradient>
                                                <linearGradient id="answeredColor" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                            <YAxis tickLine={false} axisLine={false} fontSize={12} />
                                            <Tooltip />
                                            <Legend />
                                            <Area type="monotone" dataKey="total" name={t('Total Calls')} stroke="#3b82f6" fillOpacity={1} fill="url(#totalColor)" strokeWidth={2} />
                                            <Area type="monotone" dataKey="answered" name={t('Answered Calls')} stroke="#10b981" fillOpacity={1} fill="url(#answeredColor)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        {t('No trend data available')}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart 2: Call Status Disposition (Donut / Pie Chart) */}
                    <Card className="border border-border/60 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">
                                        {t('Call Disposition Breakdown')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('Outcome ratios across all processed calls')}
                                    </CardDescription>
                                </div>
                                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="h-[280px] w-full">
                                {charts?.status && charts.status.some((i) => i.value > 0) ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={charts.status}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={95}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {charts.status.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        {t('No disposition data available')}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart 3: Call Direction Ratio (Bar Chart) */}
                    <Card className="border border-border/60 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">
                                        {t('Inbound vs. Outbound Traffic')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('Call traffic direction distribution')}
                                    </CardDescription>
                                </div>
                                <PhoneCall className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="h-[280px] w-full">
                                {charts?.direction && charts.direction.some((i) => i.value > 0) ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsBarChart data={charts.direction} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                                            <YAxis tickLine={false} axisLine={false} fontSize={12} />
                                            <Tooltip />
                                            <Bar dataKey="value" name={t('Calls')} radius={[6, 6, 0, 0]}>
                                                {charts.direction.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        {t('No direction data available')}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart 4: Extension Activity (Horizontal Bar Chart) */}
                    <Card className="border border-border/60 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">
                                        {t('Top Active Extensions')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('Call volume handled per extension')}
                                    </CardDescription>
                                </div>
                                <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="h-[280px] w-full">
                                {charts?.extensions && charts.extensions.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsBarChart
                                            layout="vertical"
                                            data={charts.extensions}
                                            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                            <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                                            <YAxis dataKey="extension" type="category" tickLine={false} axisLine={false} fontSize={12} width={65} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="total" name={t('Total Calls')} fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                            <Bar dataKey="answered" name={t('Answered')} fill="#10b981" radius={[0, 4, 4, 0]} />
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        {t('No extension activity data')}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
