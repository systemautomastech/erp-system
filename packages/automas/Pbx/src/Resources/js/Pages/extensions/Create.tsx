import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import ExtensionForm, {
    type ExtensionFormData,
    type ExtensionUser,
    type PbxSetting,
} from './components/ExtensionForm';

interface CreateProps {
    users: ExtensionUser[];
    setting: PbxSetting;
    assignedUserIds: number[];
    assignedExtensions: string[];
}

export default function Create({
    users,
    setting,
    assignedUserIds,
    assignedExtensions,
}: CreateProps) {
    const { t } = useTranslation();

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm<ExtensionFormData>({
        user_id: '',
        extension: '',
        caller_id: '',
        sip_secret: '',
        is_active: true,
    });

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ): void => {
        event.preventDefault();

        post(route('pbx.extensions.store'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t('Create Extension')} />

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
                                />

                                <div className="text-end">
                                    <Link
                                        href={route('pbx.extensions.index',)}
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
                                            ? t('Creating...')
                                            : t('Create')}
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