import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Target, FileText, Calendar, Clock, Users, BarChart3, Phone } from 'lucide-react';
import CalendarView from '@/components/calendar-view';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart } from '@/components/charts';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/helpers';

interface SalesProps {
    message: string;
    stats?: {
        total_quotes: number;
        total_orders: number;
        total_opportunities: number;
        active_opportunities: number;
        total_revenue: number;
        pipeline_value: number;
        conversion_rate: number;
        converted_quotes: number;
    };
    recent_quotes?: any[];
    recent_orders?: any[];
    top_opportunities?: any[];
    charts?: {
        opportunity_stages: any[];
        sales_trend: any[];
        revenue_by_user: any[];
        orders_by_user: any[];
    };
    calendar_events?: any[];
}

export default function CompanyDashboard({ message, stats, recent_quotes, recent_orders, top_opportunities, charts, calendar_events }: SalesProps) {
    const { t } = useTranslation();
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEventClick = (event: any) => {
        const originalEvent = calendar_events?.find(e => e.id === event.id);
        if (originalEvent) {
            setSelectedEvent(originalEvent);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
    };
    
    return (
        <AuthenticatedLayout
            breadcrumbs={[{label: t('Sales')}]}
            pageTitle={t('Sales Dashboard')}
        >
            <Head title={t('Sales')} />
            
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.visit(route('sales.quotes.index'))}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-blue-700">{t('Total Quotes')}</CardTitle>
                            <FileText className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-800">{stats?.total_quotes || 0}</div>
                            <p className="text-xs text-blue-600 mt-1">
                                {stats?.converted_quotes || 0} {t('converted')} ({stats?.conversion_rate || 0}%)
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.visit(route('sales.orders.index'))}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-green-700">{t('Total Orders')}</CardTitle>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800">{stats?.total_orders || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.visit(route('sales.opportunities.index'))}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-purple-700">{t('Opportunities')}</CardTitle>
                            <Target className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-800">{stats?.total_opportunities || 0}</div>
                            <p className="text-xs text-purple-600 mt-1">
                                {stats?.active_opportunities || 0} {t('active')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-orange-700">{t('Total Revenue')}</CardTitle>
                            <DollarSign className="h-5 w-5 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-800">{formatCurrency(stats?.total_revenue || 0)}</div>
                            <p className="text-xs text-orange-600 mt-1">
                                {formatCurrency(stats?.pipeline_value || 0)} {t('in pipeline')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Sales Calendar */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-4 w-4" />
                                {t('Sales Activities Calendar')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CalendarView
                                events={calendar_events?.map(event => ({
                                    id: event.id,
                                    title: event.title,
                                    startDate: event.startDate,
                                    endDate: event.endDate,
                                    time: event.time || '00:00',
                                    color: event.color || 'hsl(var(--primary))',
                                    description: `${t(event.type?.charAt(0).toUpperCase() + event.type?.slice(1) || t('Event'))}: ${event.title} - ${t('Status')}: ${t(event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || t('Unknown'))}`,
                                    type: event.type || 'Event',
                                })) || []}
                                onEventClick={handleEventClick}
                                onDateClick={(date) => { }}
                            />
                        </CardContent>
                    </Card>

                    {/* Charts Column */}
                    <div className="space-y-4">
                        {/* Opportunities by Stage */}
                        <Card className="h-[320px]">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Target className="h-4 w-4 text-primary" />
                                    {t('Opportunities by Stage')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[260px]">
                                {charts?.opportunity_stages && charts.opportunity_stages.length > 0 && charts.opportunity_stages.some(stage => stage.value > 0) ? (
                                    <PieChart
                                        data={charts.opportunity_stages}
                                        dataKey="value"
                                        nameKey="name"
                                        height={260}
                                        donut={true}
                                        showTooltip={true}
                                        showLegend={false}
                                    />
                                ) : (
                                    <PieChart
                                        data={[{ name: t('No Data'), value: 1, color: '#e5e7eb' }]}
                                        dataKey="value"
                                        nameKey="name"
                                        height={260}
                                        donut={true}
                                        showTooltip={false}
                                        showLegend={false}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Revenue by User */}
                        <Card className="h-[320px]">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Users className="h-4 w-4 text-green-600" />
                                    {t('Revenue by User')} <span className="text-xs text-gray-500">({t('Top 5')})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[260px]">
                                {charts?.revenue_by_user && charts.revenue_by_user.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={charts.revenue_by_user}>
                                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                            <XAxis dataKey="name" className="text-xs" />
                                            <YAxis className="text-xs" />
                                            <Tooltip formatter={(value) => [formatCurrency(value || 0), t('Revenue')]} />
                                            <Bar dataKey="value" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[260px] flex items-center justify-center text-gray-500">
                                        <p className="text-sm">{t('No revenue data available')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        <Card className="h-[320px]">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                    {t('Orders by User')} <span className="text-xs text-gray-500">({t('Top 5')})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[260px]">
                                {charts?.orders_by_user && charts.orders_by_user.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={charts.orders_by_user}>
                                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                            <XAxis dataKey="name" className="text-xs" />
                                            <YAxis className="text-xs" />
                                            <Tooltip formatter={(value) => [value, t('Orders')]} />
                                            <Bar dataKey="value" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[260px] flex items-center justify-center text-gray-500">
                                        <p className="text-sm">{t('No orders data available')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sales Trend Chart */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            {t('Sales Trend (Last 6 Months)')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {charts?.sales_trend && charts.sales_trend.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={charts.sales_trend}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis dataKey="month" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="orders" stroke="#3b82f6" name={t('Orders')} />
                                    <Line type="monotone" dataKey="revenue" stroke="#10b981" name={t('Revenue')} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">
                                <p className="text-sm">{t('No sales trend data available')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Quotes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-4 w-4 text-primary" />
                                {t('Recent Quotes')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recent_quotes && recent_quotes.length > 0 ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {recent_quotes.map((quote) => (
                                        <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm text-gray-900">{quote.name}</h4>
                                                <p className="text-xs text-gray-600 mt-1">{quote.account?.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">{formatDate(quote.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">{t('No recent quotes')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                {t('Recent Orders')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recent_orders && recent_orders.length > 0 ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {recent_orders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm text-gray-900">{order.name}</h4>
                                                <p className="text-xs text-gray-600 mt-1">{order.account?.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">{t('No recent orders')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Opportunities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Target className="h-4 w-4 text-primary" />
                                {t('Top Opportunities')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {top_opportunities && top_opportunities.length > 0 ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {top_opportunities.map((opportunity) => (
                                        <div key={opportunity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm text-gray-900">{opportunity.name}</h4>
                                                <p className="text-xs text-gray-600 mt-1">{opportunity.stage?.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-green-600">{formatCurrency(opportunity.amount || 0)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">{t('No opportunities')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Event Detail Modal */}
                <Dialog open={isModalOpen} onOpenChange={closeModal}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {selectedEvent?.type === 'call' ? (
                                    <Phone className="h-5 w-5 text-primary" />
                                ) : (
                                    <Calendar className="h-5 w-5 text-primary" />
                                )}
                                {selectedEvent?.title}
                            </DialogTitle>
                        </DialogHeader>
                        
                        {selectedEvent && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500 font-medium">{t('Status')}</span>
                                        <div className="mt-1">
                                            <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                                selectedEvent.status?.toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                selectedEvent.status?.toLowerCase() === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                selectedEvent.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                                                selectedEvent.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {selectedEvent.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 font-medium">{t('Type')}</span>
                                        <div className="mt-1">
                                            <span className="px-2 py-1 rounded-full text-sm bg-primary/10 text-primary capitalize">
                                                {selectedEvent.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500 font-medium">{t('Start Date & Time')}</span>
                                        <p className="mt-1 font-medium text-gray-900">{formatDateTime(selectedEvent.start_date)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 font-medium">{t('End Date & Time')}</span>
                                        <p className="mt-1 font-medium text-gray-900">{formatDateTime(selectedEvent.end_date)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500 font-medium">{t('Account')}</span>
                                        <p className="mt-1 font-medium text-gray-900">{selectedEvent.account?.name || t('No account assigned')}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 font-medium">{t('Assigned User')}</span>
                                        <p className="mt-1 font-medium text-gray-900">{selectedEvent.assigned_user?.name || t('Unassigned')}</p>
                                    </div>
                                </div>

                                {selectedEvent.type === 'call' && selectedEvent.direction && (
                                    <div>
                                        <span className="text-sm text-gray-500 font-medium">{t('Direction')}</span>
                                        <div className="mt-1">
                                            <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                                selectedEvent.direction?.toLowerCase() === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {selectedEvent.direction}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {selectedEvent.type === 'meeting' && selectedEvent.meeting_type && (
                                    <div>
                                        <span className="text-sm text-gray-500 font-medium">{t('Meeting Type')}</span>
                                        <div className="mt-1">
                                            <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                                selectedEvent.meeting_type?.toLowerCase() === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {selectedEvent.meeting_type?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {selectedEvent.description && (
                                    <div>
                                        <span className="text-sm text-gray-500 font-medium">{t('Description')}</span>
                                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}