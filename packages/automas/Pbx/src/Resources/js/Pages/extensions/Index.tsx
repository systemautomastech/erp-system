import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface ExtensionUser {
    id: number;
    name: string;
    email?: string | null;
}

interface PbxExtension {
    id: number;
    user_id: number;
    extension: string;
    caller_id?: string | null;
    is_active: boolean | number;
    created_at?: string;
    user?: ExtensionUser | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedExtensions {
    data: PbxExtension[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface PbxSetting {
    id: number;
    max_extensions: number;
    extension_start: number;
    extension_end: number;
    is_enabled: boolean | number;
}

interface IndexProps {
    extensions: PaginatedExtensions;
    setting: PbxSetting | null;
    canCreateExtension: boolean;
}

export default function Index({
    extensions,
    setting,
    canCreateExtension,
}: IndexProps) {
    const { t } = useTranslation();

    const handleDelete = (extension: PbxExtension): void => {
        const confirmed = window.confirm(
            t(
                'Are you sure you want to delete extension {{extension}}?',
                {
                    extension: extension.extension,
                },
            ),
        );

        if (!confirmed) {
            return;
        }

        router.delete(route('pbx.extensions.destroy', extension.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t('Manage Extensions')} />

            <div className="row">
                <div className="col-sm-12">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <h4 className="mb-1">
                                {t('Manage Extensions')}
                            </h4>

                            <nav aria-label={t('Breadcrumb')}>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        {t('PBX')}
                                    </li>

                                    <li
                                        className="breadcrumb-item active"
                                        aria-current="page"
                                    >
                                        {t('Extensions')}
                                    </li>
                                </ol>
                            </nav>
                        </div>

                        {canCreateExtension && (
                            <Link
                                href={route('pbx.extensions.create')}
                                className="btn btn-sm btn-primary"
                            >
                                <span className="me-1">+</span>
                                {t('Create')}
                            </Link>
                        )}
                    </div>

                    {!setting && (
                        <div
                            className="alert alert-warning d-flex justify-content-between align-items-center"
                            role="alert"
                        >
                            <span>
                                {t(
                                    'Configure PBX settings before managing extensions.',
                                )}
                            </span>

                            <Link
                                href={route('pbx.settings.index')}
                                className="btn btn-sm btn-warning"
                            >
                                {t('Configure PBX')}
                            </Link>
                        </div>
                    )}

                    {setting && !canCreateExtension && (
                        <div className="alert alert-info" role="alert">
                            {t(
                                'The maximum extension limit for this workspace has been reached.',
                            )}
                        </div>
                    )}

                    <div className="card">
                        <div className="card-header">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                                <h5 className="card-title mb-0">
                                    {t('Extensions')}
                                </h5>

                                <div className="d-flex align-items-center gap-3">
                                    {setting && (
                                        <>
                                            <span className="badge bg-light-primary text-primary">
                                                {t('Range')}:&nbsp;
                                                {setting.extension_start}–
                                                {setting.extension_end}
                                            </span>

                                            <span className="badge bg-light-secondary text-secondary">
                                                {t('Used')}:&nbsp;
                                                {extensions.total}/
                                                {setting.max_extensions}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card-body table-border-style">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '70px' }}>
                                                {t('SL')}
                                            </th>

                                            <th>{t('User')}</th>

                                            <th>{t('Extension')}</th>

                                            <th>{t('Caller ID')}</th>

                                            <th>{t('Status')}</th>

                                            <th
                                                className="text-end"
                                                style={{ width: '160px' }}
                                            >
                                                {t('Action')}
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {extensions.data.length > 0 ? (
                                            extensions.data.map(
                                                (extension, index) => (
                                                    <tr key={extension.id}>
                                                        <td>
                                                            {(extensions.current_page -
                                                                1) *
                                                                extensions.per_page +
                                                                index +
                                                                1}
                                                        </td>

                                                        <td>
                                                            <div>
                                                                <div className="fw-semibold">
                                                                    {extension
                                                                        .user
                                                                        ?.name ??
                                                                        t(
                                                                            'Unknown User',
                                                                        )}
                                                                </div>

                                                                {extension.user
                                                                    ?.email && (
                                                                        <small className="text-muted">
                                                                            {
                                                                                extension
                                                                                    .user
                                                                                    .email
                                                                            }
                                                                        </small>
                                                                    )}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <span className="fw-semibold">
                                                                {
                                                                    extension.extension
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            {extension.caller_id ||
                                                                '—'}
                                                        </td>

                                                        <td>
                                                            {Boolean(
                                                                extension.is_active,
                                                            ) ? (
                                                                <span className="badge bg-success">
                                                                    {t(
                                                                        'Active',
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-danger">
                                                                    {t(
                                                                        'Inactive',
                                                                    )}
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="text-end">
                                                            <div className="d-inline-flex align-items-center gap-2">
                                                                <Link
                                                                    href={route('pbx.extensions.edit',extension.id,)}
                                                                    className="btn btn-sm btn-info"
                                                                    title={t(
                                                                        'Edit',
                                                                    )}
                                                                >
                                                                    {t('Edit')}
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-danger"
                                                                    title={t(
                                                                        'Delete',
                                                                    )}
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            extension,
                                                                        )
                                                                    }
                                                                >
                                                                    {t(
                                                                        'Delete',
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-5 text-center"
                                                >
                                                    <div className="text-muted">
                                                        {t(
                                                            'No extensions found.',
                                                        )}
                                                    </div>

                                                    {canCreateExtension && (
                                                        <Link
                                                            href={route('pbx.extensions.create',)}
                                                            className="btn btn-sm btn-primary mt-3"
                                                        >
                                                            <span className="me-1">
                                                                +
                                                            </span>
                                                            {t(
                                                                'Create Extension',
                                                            )}
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {extensions.last_page > 1 && (
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 border-top pt-3">
                                    <div className="text-muted">
                                        {t('Showing')} {extensions.from ?? 0}{' '}
                                        {t('to')} {extensions.to ?? 0}{' '}
                                        {t('of')} {extensions.total}{' '}
                                        {t('results')}
                                    </div>

                                    <nav aria-label={t('Pagination')}>
                                        <ul className="pagination pagination-sm mb-0">
                                            {extensions.links.map(
                                                (link, index) => (
                                                    <li
                                                        key={`${link.label}-${index}`}
                                                        className={`page-item ${link.active
                                                                ? 'active'
                                                                : ''
                                                            } ${!link.url
                                                                ? 'disabled'
                                                                : ''
                                                            }`}
                                                    >
                                                        {link.url ? (
                                                            <Link
                                                                href={link.url}
                                                                className="page-link"
                                                                preserveScroll
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            />
                                                        ) : (
                                                            <span
                                                                className="page-link"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            />
                                                        )}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}