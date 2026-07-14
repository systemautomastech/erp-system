import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface ExtensionUser {
    id: number;
    name: string;
    email?: string | null;
}

export interface PbxSetting {
    id?: number;
    extension_start: number;
    extension_end: number;
    max_extensions?: number;
}

export interface ExtensionFormData {
    user_id: number | string;
    extension: string;
    caller_id: string;
    sip_secret: string;
    is_active: boolean;
}

interface ExtensionFormErrors {
    user_id?: string;
    extension?: string;
    caller_id?: string;
    sip_secret?: string;
    is_active?: string;
}

interface ExtensionFormProps {
    data: ExtensionFormData;
    setData: <K extends keyof ExtensionFormData>(
        key: K,
        value: ExtensionFormData[K],
    ) => void;
    errors: ExtensionFormErrors;
    users: ExtensionUser[];
    setting: PbxSetting;
    assignedUserIds?: number[];
    assignedExtensions?: string[];
    isEditing?: boolean;
}

export default function ExtensionForm({
    data,
    setData,
    errors,
    users,
    setting,
    assignedUserIds = [],
    assignedExtensions = [],
    isEditing = false,
}: ExtensionFormProps) {
    const { t } = useTranslation();

    const extensionOptions = useMemo(() => {
        const options: string[] = [];
        const assigned = new Set(
            assignedExtensions.map((extension) => String(extension)),
        );

        for (
            let extension = Number(setting.extension_start);
            extension <= Number(setting.extension_end);
            extension++
        ) {
            const value = String(extension);

            if (!assigned.has(value) || data.extension === value) {
                options.push(value);
            }
        }

        return options;
    }, [
        setting.extension_start,
        setting.extension_end,
        assignedExtensions,
        data.extension,
    ]);

    const assignedUsers = useMemo(
        () => new Set(assignedUserIds.map(Number)),
        [assignedUserIds],
    );

    return (
        <div className="row">
            <div className="col-md-4">
                <div className="form-group mb-3">
                    <label htmlFor="user_id" className="form-label">
                        {t('User')}
                        <span className="text-danger ms-1">*</span>
                    </label>

                    <select
                        id="user_id"
                        className={`form-control ${errors.user_id ? 'is-invalid' : ''
                            }`}
                        value={data.user_id}
                        onChange={(event) =>
                            setData(
                                'user_id',
                                event.target.value
                                    ? Number(event.target.value)
                                    : '',
                            )
                        }
                        required
                    >
                        <option value="">{t('Select User')}</option>

                        {users.map((user) => {
                            const disabled = assignedUsers.has(
                                Number(user.id),
                            );

                            return (
                                <option
                                    key={user.id}
                                    value={user.id}
                                    disabled={disabled}
                                >
                                    {user.name}
                                    {user.email
                                        ? ` (${user.email})`
                                        : ''}
                                </option>
                            );
                        })}
                    </select>

                    {errors.user_id && (
                        <div className="invalid-feedback">
                            {errors.user_id}
                        </div>
                    )}
                </div>
            </div>

            <div className="col-md-2">
                <div className="form-group mb-3">
                    <label htmlFor="extension" className="form-label">
                        {t('Extension')}
                        <span className="text-danger ms-1">*</span>
                    </label>

                    <select
                        id="extension"
                        className={`form-control ${errors.extension ? 'is-invalid' : ''
                            }`}
                        value={data.extension}
                        onChange={(event) =>
                            setData('extension', event.target.value)
                        }
                        required
                    >
                        <option value="">
                            {t('Select Extension')}
                        </option>

                        {extensionOptions.map((extension) => (
                            <option
                                key={extension}
                                value={extension}
                            >
                                {extension}
                            </option>
                        ))}
                    </select>

                    {errors.extension && (
                        <div className="invalid-feedback">
                            {errors.extension}
                        </div>
                    )}

                    <small className="text-muted">
                        {t('Allowed range')}:&nbsp;
                        {setting.extension_start} -{' '}
                        {setting.extension_end}
                    </small>
                </div>
            </div>

            <div className="col-md-3">
                <div className="form-group mb-3">
                    <label htmlFor="caller_id" className="form-label">
                        {t('Caller ID')}
                    </label>

                    <input
                        id="caller_id"
                        type="text"
                        className={`form-control ${errors.caller_id ? 'is-invalid' : ''
                            }`}
                        value={data.caller_id}
                        onChange={(event) =>
                            setData('caller_id', event.target.value)
                        }
                        placeholder={t('Optional')}
                        maxLength={50}
                    />

                    {errors.caller_id && (
                        <div className="invalid-feedback">
                            {errors.caller_id}
                        </div>
                    )}
                </div>
            </div>

            <div className="col-md-3">
                <div className="form-group mb-3">
                    <label htmlFor="sip_secret" className="form-label">
                        {t('Password')}
                    </label>

                    <input
                        id="sip_secret"
                        type="text"
                        className={`form-control ${errors.sip_secret ? 'is-invalid' : ''
                            }`}
                        value={data.sip_secret}
                        onChange={(event) =>
                            setData('sip_secret', event.target.value)
                        }
                        placeholder={
                            isEditing
                                ? t('Leave blank to keep current')
                                : t('Auto-generated if empty')
                        }
                        minLength={6}
                        maxLength={100}
                        autoComplete="new-password"
                    />

                    {errors.sip_secret && (
                        <div className="invalid-feedback">
                            {errors.sip_secret}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}