import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import {
    BarChart3,
    CheckCircle,
    CheckCircle2,
    Clock,
    Headphones,
    Phone,
    PhoneCall,
    PhoneIncoming,
    PhoneMissed,
    PhoneOff,
    PhoneOutgoing,
    RefreshCw,
    XCircle,
} from 'lucide-react';

import AuthenticatedLayout from '@/layouts/authenticated-layout';

import {
    Card,
    CardContent,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { DataTable } from '@/components/ui/data-table';
import { FilterButton } from '@/components/ui/filter-button';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { PerPageSelector } from '@/components/ui/per-page-selector';
import { DateRangePicker } from '@/components/ui/date-range-picker';

import NoRecordsFound from '@/components/no-records-found';

import { formatDate, formatTimeFromDate } from '@/utils/helpers';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface CallLog {
    calldate: string;

    extension: string;

    direction:
    | 'inbound'
    | 'outbound';

    number: string | null;

    did: string | null;

    status: string;

    duration: number;

    talk_time: number;

    recordingfile?: string | null;

    has_recording: boolean;

    recording_size?: number;

    linkedid: string;

    uniqueid: string;

    user_id?: number | null;

    user_name?: string | null;

    recording_url?: string | null;
}

interface ExtensionOption {
    id: number;

    extension: string;

    user_id?: number | null;

    user_name?: string | null;
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

interface CallFilters {
    search: string;

    extension: string;

    call_direction: string;

    status: string;

    date_range: string;
}

interface CallPaginator {
    data: CallLog[];

    current_page?: number;

    first_page_url?: string;

    from?: number | null;

    last_page?: number;

    last_page_url?: string;

    links?: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;

    next_page_url?: string | null;

    path?: string;

    per_page?: number;

    prev_page_url?: string | null;

    to?: number | null;

    total?: number;

    meta?: {
        current_page?: number;
        from?: number | null;
        last_page?: number;
        links?: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        path?: string;
        per_page?: number;
        to?: number | null;
        total?: number;
    };
}

interface CallReportPermissions {
    view_all: boolean;

    view_own: boolean;
}

interface Props {
    calls: CallPaginator;

    extensions: ExtensionOption[];

    summary: Summary;

    filters: CallFilters;

    callReportPermissions: CallReportPermissions;
}

/*
|--------------------------------------------------------------------------
| Duration
|--------------------------------------------------------------------------
*/

const formatDuration = (
    seconds?: number,
) => {
    const value = Math.max(
        Number(seconds || 0),
        0,
    );

    const hours = Math.floor(
        value / 3600,
    );

    const minutes = Math.floor(
        (value % 3600) / 60,
    );

    const secs = Math.floor(
        value % 60,
    );

    if (hours > 0) {
        return [
            hours
                .toString()
                .padStart(2, '0'),

            minutes
                .toString()
                .padStart(2, '0'),

            secs
                .toString()
                .padStart(2, '0'),
        ].join(':');
    }

    return [
        minutes
            .toString()
            .padStart(2, '0'),

        secs
            .toString()
            .padStart(2, '0'),
    ].join(':');
};

/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

const getStatusVariant = (
    status?: string,
):
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'success'
    | 'outline' => {
    switch (
    status
        ?.toUpperCase()
        .trim()
    ) {
        case 'ANSWERED':
            return 'success';

        case 'NO ANSWER':
        case 'NOANSWER':
            return 'secondary';

        case 'FAILED':
        case 'BUSY':
        case 'CONGESTION':
            return 'destructive';

        default:
            return 'outline';
    }
};

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function Index({
    calls,
    extensions,
    summary,
    filters: serverFilters,
    callReportPermissions,
}: Props) {
    const { t } = useTranslation();

    /*
    |--------------------------------------------------------------------------
    | URL
    |--------------------------------------------------------------------------
    */

    const urlParams =
        new URLSearchParams(
            window.location.search,
        );

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const [
        filters,
        setFilters,
    ] = useState<CallFilters>({
        search:
            urlParams.get(
                'search',
            )
            ?? serverFilters.search
            ?? '',

        extension:
            urlParams.get(
                'extension',
            )
            ?? serverFilters.extension
            ?? '',

        call_direction:
            urlParams.get(
                'call_direction',
            )
            ?? serverFilters.call_direction
            ?? '',

        status:
            urlParams.get(
                'status',
            )
            ?? serverFilters.status
            ?? '',

        date_range:
            urlParams.get(
                'date_range',
            )
            ?? serverFilters.date_range
            ?? '',
    });

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    const [
        showFilters,
        setShowFilters,
    ] = useState(false);

    const [
        loading,
        setLoading,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Per Page
    |--------------------------------------------------------------------------
    */

    const perPage =
        urlParams.get(
            'per_page',
        ) || '10';

    /*
    |--------------------------------------------------------------------------
    | Statuses
    |--------------------------------------------------------------------------
    */

    const statusOptions =
        useMemo(
            () => {
                const values =
                    new Set<string>([
                        'ANSWERED',
                        'NO ANSWER',
                        'BUSY',
                        'FAILED',
                        'CONGESTION',
                    ]);

                calls?.data?.forEach(
                    (call) => {
                        if (
                            call.status
                        ) {
                            values.add(
                                call.status,
                            );
                        }
                    },
                );

                if (
                    filters.status
                ) {
                    values.add(
                        filters.status,
                    );
                }

                return Array.from(
                    values,
                );
            },
            [
                calls?.data,
                filters.status,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Active Filter Count
    |--------------------------------------------------------------------------
    */

    const activeFilters =
        [
            filters.extension,
            filters.call_direction,
            filters.status,
            filters.date_range,
        ].filter(
            (value) =>
                value !== ''
                && value !== null
                && value !== undefined,
        ).length;

    /*
    |--------------------------------------------------------------------------
    | Request Filters
    |--------------------------------------------------------------------------
    */

    const buildRequestFilters =
        () => ({
            search:
                filters.search
                || undefined,

            extension:
                filters.extension
                || undefined,

            call_direction:
                filters.call_direction
                || undefined,

            status:
                filters.status
                || undefined,

            date_range:
                filters.date_range
                || undefined,

            per_page:
                perPage,
        });

    /*
    |--------------------------------------------------------------------------
    | Apply Filter
    |--------------------------------------------------------------------------
    */

    const handleFilter = () => {
        router.get(
            route(
                'pbx.call-reports.index',
            ),

            buildRequestFilters(),

            {
                preserveState: true,

                preserveScroll: true,

                replace: true,

                onStart: () =>
                    setLoading(
                        true,
                    ),

                onFinish: () =>
                    setLoading(
                        false,
                    ),
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Clear Filter
    |--------------------------------------------------------------------------
    */

    const clearFilters = () => {
        const emptyFilters: CallFilters =
        {
            search: '',
            extension: '',
            call_direction: '',
            status: '',
            date_range: '',
        };

        setFilters(
            emptyFilters,
        );

        router.get(
            route(
                'pbx.call-reports.index',
            ),

            {
                per_page:
                    perPage,
            },

            {
                preserveState:
                    false,

                preserveScroll:
                    true,

                replace: true,

                onStart: () =>
                    setLoading(
                        true,
                    ),

                onFinish: () =>
                    setLoading(
                        false,
                    ),
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Table Columns
    |--------------------------------------------------------------------------
    */

    const tableColumns = [
        /*
        |--------------------------------------------------------------------------
        | User
        |--------------------------------------------------------------------------
        */

        {
            key: 'user_name',

            header: t('User'),

            sortable: false,

            render: (
                value: string,
                row: CallLog,
            ) => (
                <div>
                    <div className="font-medium text-foreground">
                        {value || '-'}
                    </div>

                    <div className="text-xs text-muted-foreground">
                        {row.extension || '-'}
                    </div>
                </div>
            ),
        },


        /*
        |--------------------------------------------------------------------------
        | Date
        |--------------------------------------------------------------------------
        */
        {
            key: 'calldate',

            header:
                t('Date & Time'),

            sortable: false,

            render: (
                value: string,
            ) => (
                <div className="whitespace-nowrap text-sm">
                    <div className="text-foreground">
                        {formatDate(value)}
                    </div>

                    <div className="text-xs text-muted-foreground">
                        {formatTimeFromDate(value)}
                    </div>
                </div>
            ),
        },

        /*
        |--------------------------------------------------------------------------
        | Direction
        |--------------------------------------------------------------------------
        */
        {
            key: 'direction',

            header:
                t('Direction'),

            sortable: false,

            render: (
                value: string,
            ) => {
                const inbound =
                    value ===
                    'inbound';

                return (
                    <span
                        className={
                            inbound
                                ? 'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
                                : 'inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700'
                        }
                    >
                        {inbound ? (
                            <PhoneIncoming className="h-3.5 w-3.5" />
                        ) : (
                            <PhoneOutgoing className="h-3.5 w-3.5" />
                        )}

                        {inbound
                            ? t(
                                'Incoming',
                            )
                            : t(
                                'Outgoing',
                            )}
                    </span>
                );
            },
        },

        /*
        |--------------------------------------------------------------------------
        | Number
        |--------------------------------------------------------------------------
        */
        {
            key: 'number',

            header:
                t('Number'),

            sortable: false,

            render: (
                value: string,
                row: CallLog,
            ) => (
                <div>
                    <div className="font-medium">
                        {value || '-'}
                    </div>

                    {row.did ? (
                        <div className="text-xs text-muted-foreground">
                            DID: {row.did}
                        </div>
                    ) : null}
                </div>
            ),
        },

        /*
        |--------------------------------------------------------------------------
        | Status
        |--------------------------------------------------------------------------
        */
        {
            key: 'status',

            header:
                t('Status'),

            sortable: false,

            render: (
                value: string,
            ) => (
                <Badge
                    variant={getStatusVariant(
                        value,
                    )}
                >
                    {value || '-'}
                </Badge>
            ),
        },

        /*
        |--------------------------------------------------------------------------
        | Duration
        |--------------------------------------------------------------------------
        */

        {
            key: 'duration',

            header:
                t('Duration'),

            sortable: false,

            render: (
                value: number,
            ) => (
                <span className="whitespace-nowrap font-medium">
                    {formatDuration(
                        value,
                    )}
                </span>
            ),
        },

        /*
        |--------------------------------------------------------------------------
        | Talk Time
        |--------------------------------------------------------------------------
        */

        {
            key: 'talk_time',

            header:
                t('Talk Time'),

            sortable: false,

            render: (
                value: number,
            ) => (
                <span className="whitespace-nowrap font-medium">
                    {formatDuration(
                        value,
                    )}
                </span>
            ),
        },

        /*
        |--------------------------------------------------------------------------
        | Recording
        |--------------------------------------------------------------------------
        */

        {
            key: 'recording_url',

            header:
                t('Recording'),

            sortable: false,

            render: (
                value: string,
                row: CallLog,
            ) => {
                if (
                    !row.has_recording
                    || !value
                ) {
                    return (
                        <span className="text-muted-foreground">
                            -
                        </span>
                    );
                }

                return (
                    <div className="flex min-w-[225px] items-center gap-2">
                        <audio
                            controls
                            // preload="none"
                            src={value}
                            className="h-8 w-full"
                        />
                    </div>
                );
            },
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                {
                    label:
                        t('PBX'),
                },
                {
                    label:
                        t(
                            'Call Reports',
                        ),
                },
            ]}
        >

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            {t('Call Reports')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Detailed call history, search, audio playback, and exports.')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => router.get(route('pbx.call-reports.summary'))}
                        >
                            <BarChart3 className="h-4 w-4" />
                            {t('View Call Analytics & Charts')}
                        </Button>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* Standard System Table */}
                {/* ========================================================= */}

                <Card className="shadow-sm">

                    {/* Toolbar */}

                    <CardContent className="border-b bg-gray-50/50 p-6">

                        <div className="flex items-center justify-between gap-4">

                            <div className="max-w-md flex-1">

                                <SearchInput
                                    value={
                                        filters.search
                                    }
                                    onChange={(
                                        value,
                                    ) =>
                                        setFilters(
                                            {
                                                ...filters,

                                                search:
                                                    value,
                                            },
                                        )
                                    }
                                    onSearch={
                                        handleFilter
                                    }
                                    placeholder={t(
                                        'Search number or extension...',
                                    )}
                                />

                            </div>

                            <div className="flex items-center gap-3">

                                <PerPageSelector
                                    routeName="pbx.call-reports.index"
                                    filters={buildRequestFilters()}
                                />

                                <div className="relative">

                                    <FilterButton
                                        showFilters={
                                            showFilters
                                        }
                                        onToggle={() =>
                                            setShowFilters(
                                                !showFilters,
                                            )
                                        }
                                    />

                                    {activeFilters >
                                        0 && (

                                            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">

                                                {
                                                    activeFilters
                                                }

                                            </span>

                                        )}

                                </div>

                            </div>

                        </div>

                    </CardContent>

                    {/* Filters */}

                    {showFilters && (

                        <CardContent className="border-b bg-blue-50/30 p-6">

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                                {/* Extension */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-gray-700">

                                        {callReportPermissions.view_all
                                            ? t(
                                                'User / Extension',
                                            )
                                            : t(
                                                'My Extension',
                                            )}

                                    </label>

                                    <Select
                                        value={
                                            filters.extension
                                            || 'all'
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            setFilters(
                                                {
                                                    ...filters,

                                                    extension:
                                                        value ===
                                                            'all'
                                                            ? ''
                                                            : value,
                                                },
                                            )
                                        }
                                    >

                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={t(
                                                    'All Extensions',
                                                )}
                                            />
                                        </SelectTrigger>

                                        <SelectContent searchable>

                                            <SelectItem value="all">
                                                {callReportPermissions.view_all
                                                    ? t(
                                                        'All Extensions',
                                                    )
                                                    : t(
                                                        'All My Extensions',
                                                    )}
                                            </SelectItem>

                                            {extensions.map(
                                                (
                                                    item,
                                                ) => (

                                                    <SelectItem
                                                        key={
                                                            item.id
                                                        }
                                                        value={
                                                            item.extension
                                                        }
                                                    >
                                                        {item.user_name
                                                            ? `${item.user_name} (${item.extension})`
                                                            : item.extension}
                                                    </SelectItem>

                                                ),
                                            )}

                                        </SelectContent>

                                    </Select>

                                </div>

                                {/* Direction */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t(
                                            'Direction',
                                        )}
                                    </label>

                                    <Select
                                        value={
                                            filters.call_direction
                                            || 'all'
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            setFilters(
                                                {
                                                    ...filters,

                                                    call_direction:
                                                        value ===
                                                            'all'
                                                            ? ''
                                                            : value,
                                                },
                                            )
                                        }
                                    >

                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={t(
                                                    'All Directions',
                                                )}
                                            />
                                        </SelectTrigger>

                                        <SelectContent>

                                            <SelectItem value="all">
                                                {t(
                                                    'All Directions',
                                                )}
                                            </SelectItem>

                                            <SelectItem value="inbound">
                                                {t(
                                                    'Incoming',
                                                )}
                                            </SelectItem>

                                            <SelectItem value="outbound">
                                                {t(
                                                    'Outgoing',
                                                )}
                                            </SelectItem>

                                        </SelectContent>

                                    </Select>

                                </div>

                                {/* Status */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t(
                                            'Status',
                                        )}
                                    </label>

                                    <Select
                                        value={
                                            filters.status
                                            || 'all'
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            setFilters(
                                                {
                                                    ...filters,

                                                    status:
                                                        value ===
                                                            'all'
                                                            ? ''
                                                            : value,
                                                },
                                            )
                                        }
                                    >

                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={t(
                                                    'All Statuses',
                                                )}
                                            />
                                        </SelectTrigger>

                                        <SelectContent>

                                            <SelectItem value="all">
                                                {t(
                                                    'All Statuses',
                                                )}
                                            </SelectItem>

                                            {statusOptions.map(
                                                (
                                                    status,
                                                ) => (

                                                    <SelectItem
                                                        key={
                                                            status
                                                        }
                                                        value={
                                                            status
                                                        }
                                                    >
                                                        {
                                                            status
                                                        }
                                                    </SelectItem>

                                                ),
                                            )}

                                        </SelectContent>

                                    </Select>

                                </div>

                                {/* Date */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t(
                                            'Call Date Range',
                                        )}
                                    </label>

                                    <DateRangePicker
                                        value={
                                            filters.date_range
                                        }
                                        onChange={(
                                            value,
                                        ) =>
                                            setFilters(
                                                {
                                                    ...filters,

                                                    date_range:
                                                        value,
                                                },
                                            )
                                        }
                                        placeholder={t(
                                            'Select date range',
                                        )}
                                    />

                                </div>

                            </div>

                            <div className="mt-4 flex gap-2">

                                <Button
                                    size="sm"
                                    onClick={
                                        handleFilter
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    {loading && (
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    )}

                                    {t(
                                        'Apply',
                                    )}
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={
                                        clearFilters
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    {t(
                                        'Clear',
                                    )}
                                </Button>

                            </div>

                        </CardContent>

                    )}

                    {/* Table */}

                    <CardContent className="p-0">

                        <div className="max-h-[70vh] w-full overflow-y-auto rounded-none scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400">

                            <div className="min-w-[1200px]">

                                <DataTable
                                    data={
                                        calls?.data
                                        || []
                                    }
                                    columns={
                                        tableColumns
                                    }
                                    className="rounded-none"
                                    emptyState={
                                        <NoRecordsFound
                                            icon={
                                                Phone
                                            }
                                            title={t(
                                                'No call logs found',
                                            )}
                                            description={t(
                                                'No calls match the selected filters.',
                                            )}
                                            hasFilters={
                                                !!(
                                                    filters.search
                                                    || filters.extension
                                                    || filters.call_direction
                                                    || filters.status
                                                    || filters.date_range
                                                )
                                            }
                                            onClearFilters={
                                                clearFilters
                                            }
                                            className="h-auto"
                                        />
                                    }
                                />

                            </div>

                        </div>

                    </CardContent>

                    {/* Pagination */}

                    <CardContent className="border-t bg-gray-50/30 px-4 py-2">

                        <Pagination
                            data={
                                calls || {
                                    data: [],
                                    links: [],
                                    meta: {},
                                }
                            }
                            routeName="pbx.call-reports.index"
                            filters={
                                buildRequestFilters()
                            }
                        />

                    </CardContent>

                </Card>

            </div>

        </AuthenticatedLayout>
    );
}