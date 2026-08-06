import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Rocket, Calendar, Clock, Target, CheckCircle, BarChart3, CalendarDays, Award, Phone, Trophy, XCircle, Flame, PhoneCall, PhoneIncoming } from 'lucide-react';
import CalendarView from '@/components/calendar-view';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import { formatDate } from '@/utils/helpers';

interface UserDashboardProps {
    message: string;
    stats?: {
        assigned_leads: number;
        assigned_deals: number;
        completed_tasks: number;
        pending_tasks: number;
        todayLeads?: number;
        yesterdayLeads?: number;
        monthlyLeads?: number;
        totalLeads?: number;
        convertedDeals?: number;
        activeDeals?: number;
        wonDeals?: number;
        lostDeals?: number;
        todayCalls?: number;
        yesterdayCalls?: number;
        monthlyCalls?: number;
        totalCalls?: number;
    };
    recentDeals?: any[];
    recentLeads?: any[];
    calendarEvents?: any[];
    taskStatusChart?: any[];
}

function UserDashboard({ message, stats, recentDeals, recentLeads, calendarEvents, taskStatusChart }: UserDashboardProps) {
    const { t } = useTranslation();
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <AuthenticatedLayout
            breadcrumbs={[{ label: t('Dashboard') }]}
            pageTitle={t('User Dashboard')}
        >
            <Head title={t('User Dashboard')} />

            <div className="space-y-6">
                {/* Summary Cards */}

                {/* Lead Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-teal-700">{t('Today Assigned Lead')}</CardTitle>
                            <Target className="h-5 w-5 text-teal-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-teal-800">{stats?.todayLeads || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-pink-700">{t('Yesterday Lead')}</CardTitle>
                            <Clock className="h-5 w-5 text-pink-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-pink-800">{stats?.yesterdayLeads || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-purple-700">{t('Monthly Lead')}</CardTitle>
                            <Award className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-800">{stats?.monthlyLeads || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-indigo-700">{t('Total Lead')}</CardTitle>
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-800">{stats?.totalLeads || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Deal Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-blue-700">{t('Converted Deals')}</CardTitle>
                            <Rocket className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-800">{stats?.convertedDeals || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-amber-700">{t('Active Deals')}</CardTitle>
                            <Flame className="h-5 w-5 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-800">{stats?.activeDeals || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-emerald-700">{t('Won Deals')}</CardTitle>
                            <Trophy className="h-5 w-5 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-800">{stats?.wonDeals || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-rose-700">{t('Lost Deals')}</CardTitle>
                            <XCircle className="h-5 w-5 text-rose-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-800">{stats?.lostDeals || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Call Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-red-700">{t('Today Call')}</CardTitle>
                            <PhoneCall className="h-5 w-5 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-800">{stats?.todayCalls || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-cyan-700">{t('Yesterday Call')}</CardTitle>
                            <PhoneIncoming className="h-5 w-5 text-cyan-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-cyan-800">{stats?.yesterdayCalls || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-lime-50 to-lime-100 border-lime-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-lime-700">{t('Monthly Calls')}</CardTitle>
                            <CalendarDays className="h-5 w-5 text-lime-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-lime-800">{stats?.monthlyCalls || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-violet-700">{t('Total Call')}</CardTitle>
                            <Phone className="h-5 w-5 text-violet-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-violet-800">{stats?.totalCalls || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Calendar */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                {t('Tasks Calendar')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CalendarView
                                events={calendarEvents?.map(event => ({
                                    id: event.id,
                                    title: event.title,
                                    startDate: event.startDate,
                                    endDate: event.endDate,
                                    time: event.time || '00:00',
                                    color: 'hsl(var(--primary))',
                                    description: `${t('Task')}: ${event.title} - ${t('Deal')}: ${event.name || ''} - ${t('Status')}: ${t(event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || 'Unknown')}`,
                                    type: 'Task',
                                })) || []}
                                onEventClick={(event) => { }}
                                onDateClick={(date) => { }}
                            />
                        </CardContent>
                    </Card>

                    {/* Charts */}
                    <div className="space-y-4 h-full flex flex-col">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    {t('Task Status')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {taskStatusChart && taskStatusChart.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={taskStatusChart}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                dataKey="value"
                                                nameKey="name"
                                            >
                                                {taskStatusChart.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                                        <p className="text-sm">{t('No task data available')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Rocket className="h-5 w-5 text-primary" />
                                    {t('Assignment Overview')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm font-medium text-blue-700">{t('Deals')}</span>
                                        <span className="text-lg font-bold text-blue-800">{stats?.assigned_deals || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm font-medium text-green-700">{t('Leads')}</span>
                                        <span className="text-lg font-bold text-green-800">{stats?.assigned_leads || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <span className="text-sm font-medium text-purple-700">{t('Total Tasks')}</span>
                                        <span className="text-lg font-bold text-purple-800">{(stats?.completed_tasks || 0) + (stats?.pending_tasks || 0)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                        <span className="text-sm font-medium text-orange-700">{t('Completion Rate')}</span>
                                        <span className="text-lg font-bold text-orange-800">
                                            {((stats?.completed_tasks || 0) + (stats?.pending_tasks || 0)) > 0
                                                ? Math.round(((stats?.completed_tasks || 0) / ((stats?.completed_tasks || 0) + (stats?.pending_tasks || 0))) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <span className="text-sm font-medium text-red-700">{t('Total Assigned')}</span>
                                        <span className="text-lg font-bold text-red-800">{(stats?.assigned_deals || 0) + (stats?.assigned_leads || 0)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                                        <span className="text-sm font-medium text-indigo-700">{t('Total Amount')}</span>
                                        <span className="text-lg font-bold text-indigo-800">${stats?.total_amount || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Assigned Deals */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                {t('Recent Assigned Deals')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentDeals && recentDeals.length > 0 ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {recentDeals.map((deal) => (
                                        <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm text-gray-900">{deal.name}</h4>
                                                <p className="text-xs text-gray-600 mt-1">{deal.stage?.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">{formatDate(deal.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">{t('No assigned deals')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Assigned Leads */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                {t('Recent Assigned Leads')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentLeads && recentLeads.length > 0 ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {recentLeads.map((lead) => (
                                        <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm text-gray-900">{lead.name}</h4>
                                                <p className="text-xs text-gray-600 mt-1">{lead.subject}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">{formatDate(lead.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30 text-primary" />
                                    <p className="text-sm font-medium">{t('No assigned leads')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default UserDashboard;
