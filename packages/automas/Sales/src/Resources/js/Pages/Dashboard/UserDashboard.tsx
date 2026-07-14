import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, FileText, Target, Calendar, Clock, CheckCircle, DollarSign, Phone } from 'lucide-react';
import CalendarView from '@/components/calendar-view';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/helpers';

interface UserDashboardProps {
    message: string;
    stats?: {
        assigned_quotes: number;
        assigned_orders: number;
        assigned_opportunities: number;
        completed_orders: number;
        total_sales_value: number;
    };
    recent_quotes?: any[];
    recent_orders?: any[];
    recent_opportunities?: any[];
    calendar_events?: any[];
    performance_chart?: any[];
}

function UserDashboard({ message, stats, recent_quotes, recent_orders, recent_opportunities, calendar_events, performance_chart }: UserDashboardProps) {
    const { t } = useTranslation();
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
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
            breadcrumbs={[{label: t('Dashboard')}]}
            pageTitle={t('User Dashboard')}
        >
            <Head title={t('User Dashboard')} />
            
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-blue-700">{t('Assigned Quotes')}</CardTitle>
                            <FileText className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-800">{stats?.assigned_quotes || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-green-700">{t('Assigned Orders')}</CardTitle>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800">{stats?.assigned_orders || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-purple-700">{t('Opportunities')}</CardTitle>
                            <Target className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-800">{stats?.assigned_opportunities || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-orange-700">{t('Completed Orders')}</CardTitle>
                            <CheckCircle className="h-5 w-5 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-800">{stats?.completed_orders || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-indigo-700">{t('Sales Value')}</CardTitle>
                            <DollarSign className="h-5 w-5 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-800">{formatCurrency(stats?.total_sales_value || 0)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Calendar */}
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
                                    description: `${t(event.type?.charAt(0).toUpperCase() + event.type?.slice(1) || t('Event'))}: ${event.title} - ${t('Status')}: ${t(event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || 'Unknown')}`,
                                    type: event.type || 'Event',
                                })) || []}
                                onEventClick={handleEventClick}
                                onDateClick={(date) => { }}
                            />
                        </CardContent>
                    </Card>

                    {/* Charts and Stats */}
                    <div className="space-y-4 h-full flex flex-col">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    {t('Performance Overview')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {performance_chart && performance_chart.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={performance_chart}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                dataKey="value"
                                                nameKey="name"
                                            >
                                                {performance_chart.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                                        <p className="text-sm">{t('No performance data available')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Target className="h-4 w-4 text-primary" />
                                    {t('Assignment Summary')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm font-medium text-blue-700">{t('Quotes')}</span>
                                        <span className="text-lg font-bold text-blue-800">{stats?.assigned_quotes || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm font-medium text-green-700">{t('Orders')}</span>
                                        <span className="text-lg font-bold text-green-800">{stats?.assigned_orders || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <span className="text-sm font-medium text-purple-700">{t('Opportunities')}</span>
                                        <span className="text-lg font-bold text-purple-800">{stats?.assigned_opportunities || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                        <span className="text-sm font-medium text-orange-700">{t('Completion Rate')}</span>
                                        <span className="text-lg font-bold text-orange-800">
                                            {stats?.assigned_orders && stats.assigned_orders > 0 
                                                ? Math.round(((stats?.completed_orders || 0) / stats.assigned_orders) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                                        <span className="text-sm font-medium text-indigo-700">{t('Total Assigned')}</span>
                                        <span className="text-lg font-bold text-indigo-800">
                                            {(stats?.assigned_quotes || 0) + (stats?.assigned_orders || 0) + (stats?.assigned_opportunities || 0)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Assigned Quotes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-4 w-4 text-primary" />
                                {t('Recent Assigned Quotes')}
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
                                    <p className="text-sm font-medium">{t('No assigned quotes')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Assigned Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                {t('Recent Assigned Orders')}
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
                                    <p className="text-sm font-medium">{t('No assigned orders')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Assigned Opportunities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Target className="h-4 w-4 text-primary" />
                                {t('Recent Opportunities')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recent_opportunities && recent_opportunities.length > 0 ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {recent_opportunities.map((opportunity) => (
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
                                    <p className="text-sm font-medium">{t('No assigned opportunities')}</p>
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

export default UserDashboard;