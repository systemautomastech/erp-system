import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import ExtensionForm, {
    type ExtensionFormData,
    type ExtensionUser,
    type PbxSetting,
} from './components/ExtensionForm';

interface PbxExtension {
    id: number;
    user_id: number;
    extension: string;
    caller_id?: string | null;
    is_active: boolean | number;
}

interface EditProps {
    extension: PbxExtension;
    users: ExtensionUser[];
    setting: PbxSetting;
    assignedUserIds: number[];
    assignedExtensions: string[];
}

export default function Edit({
    extension,
    users,
    setting,
    assignedUserIds,
    assignedExtensions,
}: EditProps) {
    const { t } = useTranslation();

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm<ExtensionFormData>({
        user_id: extension.user_id,
        extension: String(extension.extension),
        caller_id: extension.caller_id ?? '',
        sip_secret: '',
        is_active: Boolean(extension.is_active),
    });

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ): void => {
        event.preventDefault();

        put(
            route(
                'pbx.extensions.update',
                extension.id,
            ),
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title={t('Edit Extension')} />

            <div className="row">
                <div className="col-sm-12">
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    {t('Setup User with Extension')}
                                </h5>

                                <div className="form-check form-switch">
                                    <input
                                        id="extension-active"
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={data.is_active}
                                        onChange={(event) =>
                                            setData(
                                                'is_active',
                                                event.target.checked,
                                            )
                                        }
                                    />

                                    <label
                                        className="form-check-label"
                                        htmlFor="extension-active"
                                    >
                                        {t('Active')}
                                    </label>
                                </div>
                            </div>

                            <div className="card-body">
                                <ExtensionForm
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    users={users}
                                    setting={setting}
                                    assignedUserIds={
                                        assignedUserIds
                                    }
                                    assignedExtensions={
                                        assignedExtensions
                                    }
                                    isEditing
                                />

                                <div className="text-end">
                                    <Link
                                        href={route(
                                            'pbx.extensions.index',
                                        )}
                                        className="btn btn-light me-2"
                                    >
                                        {t('Cancel')}
                                    </Link>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? t('Updating...')
                                            : t('Update')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}