import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import {
    CalendarDays,
    CheckCircle,
    Clock,
    Headphones,
    PhoneIncoming,
    PhoneOutgoing,
    RefreshCw,
    XCircle,
} from 'lucide-react';

import AuthenticatedLayout from '@/layouts/authenticated-layout';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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

    recordingfile: string | null;

    has_recording: boolean;

    recording_size: number;

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

interface Pagination {
    page: number;

    per_page: number;

    total: number;

    last_page: number;
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
}

interface Filters {
    from?: string | null;

    to?: string | null;

    extension?: string | null;

    direction?: string | null;

    status?: string | null;
}

interface Props {
    calls: CallLog[];

    extensions: ExtensionOption[];

    pagination: Pagination;

    summary: Summary;

    filters: Filters;
}

/*
|--------------------------------------------------------------------------
| Duration formatter
|--------------------------------------------------------------------------
*/

const formatDuration = (
    seconds: number,
) => {
    const value = Number(
        seconds || 0,
    );

    const hours = Math.floor(
        value / 3600,
    );

    const minutes = Math.floor(
        (value % 3600) / 60,
    );

    const secs = value % 60;

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
| Date formatter
|--------------------------------------------------------------------------
*/

const formatDateTime = (
    value: string,
) => {
    if (!value) {
        return '—';
    }

    const normalized =
        value.replace(
            ' ',
            'T',
        );

    const date =
        new Date(normalized);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return date.toLocaleString();
};

/*
|--------------------------------------------------------------------------
| Status badge
|--------------------------------------------------------------------------
*/

const getStatusVariant = (
    status: string,
):
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline' => {
    switch (
        status
            ?.toUpperCase()
            .trim()
    ) {
        case 'ANSWERED':
            return 'default';

        case 'NO ANSWER':
        case 'NOANSWER':
            return 'secondary';

        case 'BUSY':
        case 'FAILED':
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
    pagination,
    summary,
    filters,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const [from, setFrom] =
        useState(
            filters.from ?? '',
        );

    const [to, setTo] =
        useState(
            filters.to ?? '',
        );

    const [
        extensionFilter,
        setExtensionFilter,
    ] = useState(
        filters.extension ?? 'all',
    );

    const [
        directionFilter,
        setDirectionFilter,
    ] = useState(
        filters.direction ?? 'all',
    );

    const [
        statusFilter,
        setStatusFilter,
    ] = useState(
        filters.status ?? 'all',
    );

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    const [
        loading,
        setLoading,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Available status options
    |--------------------------------------------------------------------------
    |
    | Include common PBX statuses even if current page does not contain them.
    |
    */

    const statuses = useMemo(
        () => {
            const values = new Set<string>([
                'ANSWERED',
                'NO ANSWER',
                'BUSY',
                'FAILED',
                'CONGESTION',
            ]);

            calls.forEach((call) => {
                if (call.status) {
                    values.add(
                        call.status,
                    );
                }
            });

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
            calls,
            filters.status,
        ],
    );

    /*
    |--------------------------------------------------------------------------
    | Build filter payload
    |--------------------------------------------------------------------------
    */

    const buildFilters = (
        page = 1,
    ) => {
        return {
            from:
                from ||
                undefined,

            to:
                to ||
                undefined,

            extension:
                extensionFilter !==
                'all'
                    ? extensionFilter
                    : undefined,

            direction:
                directionFilter !==
                'all'
                    ? directionFilter
                    : undefined,

            status:
                statusFilter !==
                'all'
                    ? statusFilter
                    : undefined,

            page,
        };
    };

    /*
    |--------------------------------------------------------------------------
    | Apply filters
    |--------------------------------------------------------------------------
    */

    const applyFilters = () => {
        router.get(
            route(
                'pbx.call-reports.index',
            ),

            buildFilters(1),

            {
                preserveState: true,

                preserveScroll: true,

                replace: true,

                onStart: () => {
                    setLoading(true);
                },

                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Reset
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {
        setFrom('');

        setTo('');

        setExtensionFilter(
            'all',
        );

        setDirectionFilter(
            'all',
        );

        setStatusFilter(
            'all',
        );

        router.get(
            route(
                'pbx.call-reports.index',
            ),

            {},

            {
                preserveState: false,

                preserveScroll: true,

                replace: true,

                onStart: () => {
                    setLoading(true);
                },

                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    const goToPage = (
        page: number,
    ) => {
        if (
            loading ||
            page < 1 ||
            page >
                pagination.last_page ||
            page ===
                pagination.page
        ) {
            return;
        }

        router.get(
            route(
                'pbx.call-reports.index',
            ),

            buildFilters(page),

            {
                preserveState: true,

                preserveScroll: true,

                replace: true,

                onStart: () => {
                    setLoading(true);
                },

                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AuthenticatedLayout>
            <Head title="Call Reports" />

            <div className="space-y-6">

                {/* Header */}

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Call Reports
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Extension-wise calling history directly from the PBX.
                    </p>
                </div>

                {/* Summary */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between gap-4">

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Calls
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold">
                                        {summary.totalCalls}
                                    </p>
                                </div>

                                <Headphones className="h-10 w-10 text-primary" />

                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between gap-4">

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Incoming
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold">
                                        {summary.incoming}
                                    </p>
                                </div>

                                <PhoneIncoming className="h-10 w-10 text-emerald-500" />

                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between gap-4">

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Outgoing
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold">
                                        {summary.outgoing}
                                    </p>
                                </div>

                                <PhoneOutgoing className="h-10 w-10 text-sky-500" />

                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between gap-4">

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Duration
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold">
                                        {formatDuration(
                                            summary.totalDuration,
                                        )}
                                    </p>
                                </div>

                                <Clock className="h-10 w-10 text-violet-500" />

                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between gap-4">

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Talk Time
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold">
                                        {formatDuration(
                                            summary.totalTalkTime,
                                        )}
                                    </p>
                                </div>

                                <Headphones className="h-10 w-10 text-emerald-600" />

                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between gap-4">

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Answered
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold">
                                        {summary.answered}
                                    </p>
                                </div>

                                <CheckCircle className="h-10 w-10 text-emerald-600" />

                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between gap-4">

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        No Answer
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold">
                                        {summary.noAnswer}
                                    </p>
                                </div>

                                <RefreshCw className="h-10 w-10 text-amber-500" />

                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between gap-4">

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Rejected
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold">
                                        {summary.rejected}
                                    </p>
                                </div>

                                <XCircle className="h-10 w-10 text-red-600" />

                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between gap-4">

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Other Statuses
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold">
                                        {summary.otherStatuses}
                                    </p>
                                </div>

                                <Badge className="rounded-full bg-muted px-3 py-2 text-sm font-medium text-foreground">
                                    {summary.otherStatuses}
                                </Badge>

                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Filters */}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Filters
                        </CardTitle>
                    </CardHeader>

                    <CardContent>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

                            {/* From */}

                            <div className="space-y-2">

                                <Label htmlFor="from">
                                    From
                                </Label>

                                <Input
                                    id="from"
                                    type="date"
                                    value={from}
                                    onChange={(
                                        event,
                                    ) =>
                                        setFrom(
                                            event.target.value,
                                        )
                                    }
                                />

                            </div>

                            {/* To */}

                            <div className="space-y-2">

                                <Label htmlFor="to">
                                    To
                                </Label>

                                <Input
                                    id="to"
                                    type="date"
                                    value={to}
                                    onChange={(
                                        event,
                                    ) =>
                                        setTo(
                                            event.target.value,
                                        )
                                    }
                                />

                            </div>

                            {/* Extension */}

                            <div className="space-y-2">

                                <Label>
                                    User / Extension
                                </Label>

                                <Select
                                    value={
                                        extensionFilter
                                    }
                                    onValueChange={
                                        setExtensionFilter
                                    }
                                >

                                    <SelectTrigger>
                                        <SelectValue placeholder="All extensions" />
                                    </SelectTrigger>

                                    <SelectContent>

                                        <SelectItem value="all">
                                            All extensions
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

                            <div className="space-y-2">

                                <Label>
                                    Direction
                                </Label>

                                <Select
                                    value={
                                        directionFilter
                                    }
                                    onValueChange={
                                        setDirectionFilter
                                    }
                                >

                                    <SelectTrigger>
                                        <SelectValue placeholder="All directions" />
                                    </SelectTrigger>

                                    <SelectContent>

                                        <SelectItem value="all">
                                            All directions
                                        </SelectItem>

                                        <SelectItem value="inbound">
                                            Incoming
                                        </SelectItem>

                                        <SelectItem value="outbound">
                                            Outgoing
                                        </SelectItem>

                                    </SelectContent>

                                </Select>

                            </div>

                            {/* Status */}

                            <div className="space-y-2">

                                <Label>
                                    Status
                                </Label>

                                <Select
                                    value={
                                        statusFilter
                                    }
                                    onValueChange={
                                        setStatusFilter
                                    }
                                >

                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>

                                    <SelectContent>

                                        <SelectItem value="all">
                                            All statuses
                                        </SelectItem>

                                        {statuses.map(
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
                                                    {status}
                                                </SelectItem>
                                            ),
                                        )}

                                    </SelectContent>

                                </Select>

                            </div>

                        </div>

                        {/* Filter Buttons */}

                        <div className="mt-4 flex flex-wrap gap-2">

                            <Button
                                onClick={
                                    applyFilters
                                }
                                disabled={
                                    loading
                                }
                            >
                                {loading ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                )}

                                Apply
                            </Button>

                            <Button
                                variant="outline"
                                onClick={
                                    resetFilters
                                }
                                disabled={
                                    loading
                                }
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />

                                Reset
                            </Button>

                        </div>

                    </CardContent>
                </Card>

                {/* Calls */}

                <Card>

                    <CardHeader className="flex flex-row items-center justify-between">

                        <CardTitle className="text-base">
                            Calls
                        </CardTitle>

                        <div className="text-sm text-muted-foreground">
                            {pagination.total} records
                        </div>

                    </CardHeader>

                    <CardContent>

                        <div className="overflow-x-auto">

                            <Table className="w-full min-w-[1100px] border-separate border-spacing-y-3 text-sm">

                                <TableHeader>

                                    <TableRow className="bg-muted/70 text-left text-xs uppercase tracking-wide text-muted-foreground">

                                        <TableHead className="px-3 py-3 font-medium">
                                            User
                                        </TableHead>

                                        <TableHead className="px-3 py-3 font-medium">
                                            Extension
                                        </TableHead>

                                        <TableHead className="px-3 py-3 font-medium">
                                            Date & Time
                                        </TableHead>

                                        <TableHead className="px-3 py-3 font-medium">
                                            Direction
                                        </TableHead>

                                        <TableHead className="px-3 py-3 font-medium">
                                            Number
                                        </TableHead>

                                        <TableHead className="px-3 py-3 font-medium">
                                            Status
                                        </TableHead>

                                        <TableHead className="px-3 py-3 font-medium">
                                            Duration
                                        </TableHead>

                                        <TableHead className="px-3 py-3 font-medium">
                                            Talk Time
                                        </TableHead>

                                        <TableHead className="px-3 py-3 font-medium">
                                            Recording
                                        </TableHead>

                                    </TableRow>

                                </TableHeader>

                                <TableBody>

                                    {calls.length === 0 ? (

                                        <TableRow>

                                            <TableCell
                                                colSpan={
                                                    9
                                                }
                                                className="px-3 py-12 text-center text-muted-foreground"
                                            >
                                                No call records found.
                                            </TableCell>

                                        </TableRow>

                                    ) : (

                                        calls.map(
                                            (
                                                call,
                                            ) => (

                                                <TableRow
                                                    key={`${call.uniqueid}-${call.extension}-${call.direction}`}
                                                    className="rounded-2xl border border-border bg-background shadow-sm last:border-0"
                                                >

                                                    {/* User */}

                                                    <TableCell className="px-3 py-3">

                                                        <div className="text-sm font-medium text-foreground">
                                                            {call.user_name ??
                                                                '—'}
                                                        </div>

                                                        <div className="text-xs text-muted-foreground">
                                                            {call.user_id
                                                                ? `ID: ${call.user_id}`
                                                                : ''}
                                                        </div>

                                                    </TableCell>

                                                    {/* Extension */}

                                                    <TableCell className="px-3 py-3 font-medium">
                                                        {call.extension}
                                                    </TableCell>

                                                    {/* Date */}

                                                    <TableCell className="whitespace-nowrap px-3 py-3 text-sm text-muted-foreground">
                                                        {formatDateTime(
                                                            call.calldate,
                                                        )}
                                                    </TableCell>

                                                    {/* Direction */}

                                                    <TableCell className="px-3 py-3">

                                                        <div className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1 text-sm font-medium text-foreground">

                                                            {call.direction ===
                                                            'inbound' ? (
                                                                <PhoneIncoming className="h-4 w-4 text-emerald-500" />
                                                            ) : (
                                                                <PhoneOutgoing className="h-4 w-4 text-sky-500" />
                                                            )}

                                                            <span>
                                                                {call.direction ===
                                                                'inbound'
                                                                    ? 'Incoming'
                                                                    : 'Outgoing'}
                                                            </span>

                                                        </div>

                                                    </TableCell>

                                                    {/* Number */}

                                                    <TableCell className="px-3 py-3">

                                                        <div className="text-sm text-foreground">
                                                            {call.number ??
                                                                '—'}
                                                        </div>

                                                        <div className="text-xs text-muted-foreground">
                                                            {call.did
                                                                ? `DID: ${call.did}`
                                                                : ''}
                                                        </div>

                                                    </TableCell>

                                                    {/* Status */}

                                                    <TableCell className="px-3 py-3">

                                                        <Badge
                                                            variant={getStatusVariant(
                                                                call.status,
                                                            )}
                                                        >
                                                            {call.status}
                                                        </Badge>

                                                    </TableCell>

                                                    {/* Duration */}

                                                    <TableCell className="whitespace-nowrap px-3 py-3 font-medium">
                                                        {formatDuration(
                                                            call.duration,
                                                        )}
                                                    </TableCell>

                                                    {/* Talk Time */}

                                                    <TableCell className="whitespace-nowrap px-3 py-3 font-medium">
                                                        {formatDuration(
                                                            call.talk_time,
                                                        )}
                                                    </TableCell>

                                                    {/* Recording */}

                                                    <TableCell className="px-3 py-3">

                                                        {call.has_recording &&
                                                        call.recording_url ? (

                                                            <div className="flex items-center gap-2">

                                                                <Headphones className="h-4 w-4 shrink-0 text-primary" />

                                                                <audio
                                                                    controls
                                                                    preload="none"
                                                                    className="h-8 w-[220px] rounded-lg border border-border bg-background"
                                                                    src={
                                                                        call.recording_url
                                                                    }
                                                                />

                                                            </div>

                                                        ) : (

                                                            <span className="text-muted-foreground">
                                                                —
                                                            </span>

                                                        )}

                                                    </TableCell>

                                                </TableRow>

                                            ),
                                        )

                                    )}

                                </TableBody>

                            </Table>

                        </div>

                        {/* Pagination */}

                        {pagination.last_page >
                            1 && (

                            <div className="mt-5 flex items-center justify-between border-t pt-4">

                                <div className="text-sm text-muted-foreground">

                                    Page{' '}
                                    {
                                        pagination.page
                                    }{' '}
                                    of{' '}
                                    {
                                        pagination.last_page
                                    }

                                    <span className="ml-2">
                                        (
                                        {
                                            pagination.total
                                        }{' '}
                                        records)
                                    </span>

                                </div>

                                <div className="flex gap-2">

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            loading ||
                                            pagination.page <=
                                                1
                                        }
                                        onClick={() =>
                                            goToPage(
                                                pagination.page -
                                                    1,
                                            )
                                        }
                                    >
                                        Previous
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            loading ||
                                            pagination.page >=
                                                pagination.last_page
                                        }
                                        onClick={() =>
                                            goToPage(
                                                pagination.page +
                                                    1,
                                            )
                                        }
                                    >
                                        Next
                                    </Button>

                                </div>

                            </div>

                        )}

                    </CardContent>

                </Card>

            </div>

        </AuthenticatedLayout>
    );
}