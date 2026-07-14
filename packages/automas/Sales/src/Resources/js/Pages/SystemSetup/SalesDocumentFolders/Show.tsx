import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';
import { Folder, FolderTree, FileText, Calendar } from 'lucide-react';
import { SalesDocumentFolder } from './types';
import { formatDate } from '@/utils/helpers';

interface ViewSalesDocumentFolderProps {
    salesdocumentfolder: SalesDocumentFolder;
    onClose: () => void;
    parentFolders: any[];
}

export default function View({ salesdocumentfolder, onClose, parentFolders }: ViewSalesDocumentFolderProps) {
    const { t } = useTranslation();
    
    const parentFolder = parentFolders?.find(item => item.id.toString() === salesdocumentfolder.parent?.toString());

    return (
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Folder className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold">{t('Document Folder Details')}</DialogTitle>
                        </div>
                    </div>
                </div>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">{t('Name')}</span>
                        </div>
                        <span className="text-gray-900 font-medium">{salesdocumentfolder.name}</span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center gap-2">
                            <FolderTree className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">{t('Parent Folder')}</span>
                        </div>
                        <span className="text-gray-900">
                            {parentFolder ? parentFolder.name : t('No Parent')}
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">{t('Created At')}</span>
                        </div>
                        <span className="text-gray-900">{formatDate(salesdocumentfolder.created_at)}</span>
                    </div>
                </div>

                {salesdocumentfolder.description && (
                    <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <h4 className="text-sm font-semibold text-gray-900">{t('Description')}</h4>
                        </div>
                        <div className="bg-gray-50 rounded-md p-4 border">
                            <p className="text-gray-700 text-sm">{salesdocumentfolder.description}</p>
                        </div>
                    </div>
                )}
            </div>
        </DialogContent>
    );
}