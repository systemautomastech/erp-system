import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { formatDateTime } from '@/utils/helpers';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Stream {
    id: number;
    remark: string;
    file_upload?: string;
    created_at: string;
    module_type: string;
    module_id: number;
    module_name?: string;
    creator_id?: number;
    creator?: {
        name: string;
    };
}

interface StreamsIndexProps {
    streams: {
        data: Stream[];
        links: any[];
        meta: any;
    };
}

export default function Index({ streams }: StreamsIndexProps) {
    const { t } = useTranslation();
    const { auth, imageUrlPrefix } = usePage().props as any;
    const [deleteStreamId, setDeleteStreamId] = useState<number | null>(null);

    const handleDelete = (streamId: number) => {
        router.delete(route('sales.streamdelete', streamId), {
            onSuccess: () => {
                setDeleteStreamId(null);
                toast.success(t('Stream deleted successfully'));
            },
            onError: () => {
                toast.error(t('Failed to delete stream'));
            },
            preserveScroll: true
        });
    };

    const canEditDelete = (stream: Stream) => {
        if (auth?.user?.type === 'company') {
            return true;
        }
        return stream.creator_id === auth?.user?.id;
    };

    const getModuleColor = (moduleType: string) => {
        switch (moduleType) {
            case 'account': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
            case 'contact': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
            case 'opportunity': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
            case 'case': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                {label: t('Sales'), url: route('sales.index')},
                { label: t('Streams') }
            ]}
            pageTitle={t('Manage Streams')}
        >
            <Head title={t('Streams')} />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        {t('All Streams')}
                        <Badge variant="secondary" className="ml-2">
                            {streams?.meta?.total || 0}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {streams?.data?.length > 0 ? (
                        <div className="space-y-4">
                            {streams?.data?.map((stream) => (
                                <Card key={stream.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-3">
                                        <div className="flex items-start gap-3 relative">
                                            {canEditDelete(stream) && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setDeleteStreamId(stream.id)}
                                                    className="absolute top-0 right-0 text-xs h-6 w-6 p-0 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
                                                    {stream.creator?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0 pr-8">
                                                <div className="mb-2">
                                                    <div className="font-semibold text-foreground text-sm mb-1">
                                                        {stream.creator?.name || t('Unknown User')}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mb-1">
                                                        {formatDateTime(stream.created_at)}
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {t('posted to')}:
                                                        </span>
                                                        <Badge variant="secondary" className={`text-xs ${getModuleColor(stream.module_type)}`}>
                                                            {stream.module_type.charAt(0).toUpperCase() + stream.module_type.slice(1)}
                                                        </Badge>
                                                        {stream.module_name && (
                                                            <span className="text-xs text-muted-foreground">- {stream.module_name}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-2">
                                                        <span className="font-medium">{stream.module_type.charAt(0).toUpperCase() + stream.module_type.slice(1)}</span> {t('comment')} :
                                                    </div>
                                                    <div className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md border-l-4 border-primary">
                                                        {stream.remark}
                                                    </div>
                                                </div>
                                                
                                                {stream.file_upload && (
                                                    <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                                                        <Paperclip className="h-4 w-4" />
                                                        <a 
                                                            href={`${imageUrlPrefix}/${stream.file_upload}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="hover:underline"
                                                        >
                                                            {t('View Attachment')}
                                                        </a>
                                                    </div>
                                                )}
                                                

                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                            <p>{t('No streams found')}</p>
                            <p className="text-sm">{t('Streams will appear here when users add comments')}</p>
                        </div>
                    )}

                    {streams?.links && streams?.links?.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-1">
                                {streams?.links?.map((link: any, index: number) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteStreamId !== null} onOpenChange={() => setDeleteStreamId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('Delete Stream')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('Are you sure you want to delete this stream? This action cannot be undone.')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => deleteStreamId && handleDelete(deleteStreamId)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {t('Delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}