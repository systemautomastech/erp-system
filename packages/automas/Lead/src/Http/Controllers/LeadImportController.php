<?php

namespace Automas\Lead\Http\Controllers;

use App\Models\User;
use Automas\Lead\Http\Requests\StoreLeadImportMappingRequest;
use Automas\Lead\Http\Requests\StoreLeadImportSettingsRequest;
use Automas\Lead\Http\Requests\UploadLeadImportRequest;
use Automas\Lead\Jobs\PrepareLeadImport;
use Automas\Lead\Models\LeadImport;
use Automas\Lead\Models\LeadStage;
use Automas\Lead\Models\Pipeline;
use Automas\Lead\Services\LeadImportCsvService;
use Illuminate\Routing\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class LeadImportController extends Controller
{
    public function index(): Response
    {
        abort_unless(
            auth()->user()?->can('create-leads'),
            403
        );
        $downloadLink = getFilePath('samples/lead_import.csv');
        return Inertia::render('Lead/Leads/Import/Index', compact('downloadLink'));
    }

    public function upload(UploadLeadImportRequest $request, LeadImportCsvService $csvService): RedirectResponse
    {
        $user = $request->user();
        $uploadedFile = $request->file('file');

        if (!$uploadedFile || !$uploadedFile->isValid()) {
            return back()->withErrors([
                'file' => __('The CSV upload failed. Please try again.'),
            ]);
        }

        $uuid = (string) Str::uuid();

        $storedPath = $uploadedFile->storeAs(
            "lead-imports/{$uuid}",
            'source.csv',
            'local'
        );

        if (!$storedPath) {
            return back()->withErrors([
                'file' => __('The CSV file could not be stored.'),
            ]);
        }

        try {
            $absolutePath = Storage::disk('local')->path(
                $storedPath
            );

            $preview = $csvService->preview($absolutePath);

            $import = DB::transaction(function () use ($user, $uploadedFile, $storedPath, $uuid, $request, $preview) {
                return LeadImport::create([
                    'uuid' => $uuid,
                    'creator_id' => $user->id,
                    'created_by' => creatorId(),
                    'original_filename' => $uploadedFile
                        ->getClientOriginalName(),
                    'stored_path' => $storedPath,
                    'file_size' => $uploadedFile->getSize() ?: 0,
                    'mode' => $request->string('mode')->toString(),
                    'status' => 'preview_ready',
                    'duplicate_strategy' => 'skip',
                    'column_mapping' => $preview['suggested_mapping'],
                    'options' => [
                        'delimiter' => $preview['delimiter_character'],
                        'delimiter_name' => $preview['delimiter'],
                        'has_header' => true,

                        /*
                            * Only the first 20 rows are stored here.
                            * The complete CSV stays in private storage.
                            */
                        'preview' => [
                            'headers' => $preview['headers'],
                            'rows' => $preview['rows'],
                            'required_fields' => $preview['required_fields'],
                        ],
                    ],
                ]);
            });

            return redirect()
                ->route(
                    'lead.leads.import.preview',
                    $import->uuid
                )
                ->with(
                    'success',
                    __('CSV uploaded successfully.')
                );
        } catch (Throwable $exception) {
            Storage::disk('local')->deleteDirectory(
                "lead-imports/{$uuid}"
            );

            report($exception);

            return back()->withErrors([
                'file' => $exception->getMessage(),
            ]);
        }
    }

    private function importableFields(): array
    {
        return [
            [
                'key' => 'name',
                'label' => __('Name'),
                'required' => true,
            ],
            [
                'key' => 'subject',
                'label' => __('Subject'),
                'required' => true,
            ],
            [
                'key' => 'phone',
                'label' => __('Phone'),
                'required' => true,
            ],
            [
                'key' => 'email',
                'label' => __('Email'),
                'required' => false,
            ],
            [
                'key' => 'notes',
                'label' => __('Notes'),
                'required' => false,
            ],
            [
                'key' => 'date',
                'label' => __('Follow Up Date'),
                'required' => false,
            ],
        ];
    }

    public function storeMapping(StoreLeadImportMappingRequest $request, LeadImport $leadImport): RedirectResponse
    {
        $user = Auth()->user();
        abort_unless(
            (int) $leadImport->created_by === (int) creatorId(),
            403
        );

        abort_unless(
            in_array(
                $leadImport->status,
                ['uploaded', 'preview_ready'],
                true
            ),
            422,
            __('This import can no longer be modified.')
        );

        $availableColumnIndexes = collect(
            data_get(
                $leadImport->options,
                'preview.headers',
                []
            )
        )
            ->pluck('index')
            ->map(fn($index) => (string) $index)
            ->all();

        $submittedColumnMapping = $request->validated(
            'column_mapping'
        );

        foreach (array_keys($submittedColumnMapping) as $columnIndex) {
            if (
                !in_array(
                    (string) $columnIndex,
                    $availableColumnIndexes,
                    true
                )
            ) {
                return back()->withErrors([
                    'column_mapping' => __(
                        'The submitted CSV column mapping is invalid.'
                    ),
                ]);
            }
        }

        /*
            * Convert:
            *
            * CSV column index => CRM field
            *
            * Into:
            *
            * CRM field => CSV column index
            */
        $fieldMapping = [];

        foreach ($submittedColumnMapping as $columnIndex => $crmField) {
            if ($crmField === '__ignore__') {
                continue;
            }

            $fieldMapping[$crmField] = (int) $columnIndex;
        }

        $assignmentRanges = collect($request->validated('assignment_ranges', []))
            ->map(fn(array $range): array => [
                'from_row' => (int) $range['from_row'],
                'to_row' => (int) $range['to_row'],
                'user_id' => (int) $range['user_id'],
            ])
            ->sortBy('from_row')
            ->values()
            ->all();

        $allowedUserIds = User::query()
            ->where(function ($query) {
                $query
                    ->where('id', creatorId())
                    ->orWhere('created_by', creatorId());
            })
            ->whereIn(
                'id',
                collect($assignmentRanges)->pluck('user_id')
            )
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->all();

        foreach ($assignmentRanges as $range) {
            if (!in_array($range['user_id'], $allowedUserIds, true)) {
                return back()->withErrors([
                    'assignment_ranges' => __(
                        'One or more selected users do not belong to your company.'
                    ),
                ]);
            }
        }

        $options = $leadImport->options ?? [];
        $options['assignment_ranges'] = $assignmentRanges;

        $leadImport->update([
            'column_mapping' => $fieldMapping,
            'options' => $options,
            'status' => 'preview_ready',
        ]);

        return redirect()
            ->route(
                'lead.leads.import.settings',
                $leadImport->uuid
            )
            ->with(
                'success',
                __('Column mapping and user assignments saved.')
            );
    }

    public function settings(LeadImport $leadImport): Response
    {
        abort_unless(
            auth()->user()?->can('create-leads'),
            403
        );

        abort_unless(
            (int) $leadImport->created_by === (int) creatorId(),
            403
        );

        abort_unless(
            in_array(
                $leadImport->status,
                ['uploaded', 'preview_ready', 'settings_ready'],
                true
            ),
            422,
            __('This import can no longer be modified.')
        );

        $user = auth()->user();

        $pipelines = Pipeline::query()
            ->where('created_by', creatorId())
            ->select([
                'id',
                'name',
            ])
            ->orderBy('name')
            ->get();

        if ($pipelines->isEmpty()) {
            return redirect()->route('lead.leads.index')->with('error', __('Please create a pipeline before importing leads.'));
        }

        $defaultPipelineId = null;

        if (
            $user->default_pipeline
            && $pipelines->contains(
                'id',
                (int) $user->default_pipeline
            )
        ) {
            $defaultPipelineId = (int) $user->default_pipeline;
        } else {
            $defaultPipelineId = (int) $pipelines->first()->id;
        }

        $savedPipelineId = (int) data_get(
            $leadImport->default_values,
            'pipeline_id',
            0
        );

        $selectedPipelineId = $pipelines->contains(
            'id',
            $savedPipelineId
        )
            ? $savedPipelineId
            : $defaultPipelineId;

        $stages = LeadStage::query()
            ->whereIn('pipeline_id', $pipelines->pluck('id'))
            ->select([
                'id',
                'name',
                'pipeline_id',
            ])
            ->orderBy('pipeline_id')
            ->orderBy('order')
            ->get();

        $selectedPipelineStages = $stages->where(
            'pipeline_id',
            $selectedPipelineId
        );

        if ($selectedPipelineStages->isEmpty()) {
            return redirect()->route('lead.leads.import.preview', $leadImport->uuid)->with('error', __('Please create a stage for the selected pipeline.'));
        }

        $savedStageId = (int) data_get(
            $leadImport->default_values,
            'stage_id',
            0
        );

        $selectedStageId = $selectedPipelineStages->contains(
            'id',
            $savedStageId
        )
            ? $savedStageId
            : (int) $selectedPipelineStages->first()->id;

        $assignmentRanges = data_get(
            $leadImport->options,
            'assignment_ranges',
            []
        );

        return Inertia::render(
            'Lead/Leads/Import/Settings',
            [
                'leadImport' => [
                    'uuid' => $leadImport->uuid,
                    'original_filename' => $leadImport->original_filename,
                    'duplicate_strategy' => $leadImport->duplicate_strategy,
                    'assignment_range_count' => count($assignmentRanges),
                    'column_mapping' => $leadImport->column_mapping ?? [],
                ],

                'pipelines' => $pipelines,
                'stages' => $stages,

                'defaults' => [
                    'pipeline_id' => $selectedPipelineId,
                    'stage_id' => $selectedStageId,
                    'duplicate_by' => data_get(
                        $leadImport->options,
                        'duplicate_by',
                        'phone'
                    ),
                    'duplicate_strategy' => $leadImport->duplicate_strategy
                        ?: 'skip',
                    'is_active' => (bool) data_get(
                        $leadImport->default_values,
                        'is_active',
                        true
                    ),
                ],
            ]
        );
    }

    public function storeSettings(StoreLeadImportSettingsRequest $request, LeadImport $leadImport): RedirectResponse
    {
        abort_unless(
            (int) $leadImport->created_by === (int) creatorId(),
            403
        );

        abort_unless(
            in_array(
                $leadImport->status,
                ['uploaded', 'preview_ready', 'settings_ready'],
                true
            ),
            422,
            __('This import can no longer be modified.')
        );

        $assignmentRanges = data_get(
            $leadImport->options,
            'assignment_ranges',
            []
        );

        if (empty($assignmentRanges)) {
            return back()->withErrors([
                'assignment_ranges' => __(
                    'Add at least one user assignment range. Leads without an assigned user will not be imported.'
                ),
            ]);
        }

        $validated = $request->validated();

        $defaultValues = $leadImport->default_values ?? [];

        $defaultValues['pipeline_id'] = (int) $validated['pipeline_id'];
        $defaultValues['stage_id'] = (int) $validated['stage_id'];
        $defaultValues['is_active'] = (bool) $validated['is_active'];

        $options = $leadImport->options ?? [];

        $options['duplicate_by'] = $validated['duplicate_by'];

        $leadImport->update([
            'default_values' => $defaultValues,
            'options' => $options,
            'duplicate_strategy' => $validated['duplicate_strategy'],
            'status' => 'settings_ready',
        ]);

        return redirect()
            ->route(
                'lead.leads.import.review',
                $leadImport->uuid
            )
            ->with(
                'success',
                __('Import settings saved successfully.')
            );
    }

    public function review(
        LeadImport $leadImport,
        LeadImportCsvService $csvService
    ): Response {
        abort_unless(
            auth()->user()?->can('create-leads'),
            403
        );

        abort_unless(
            (int) $leadImport->created_by === (int) creatorId(),
            403
        );

        abort_unless(
            in_array(
                $leadImport->status,
                ['settings_ready', 'preview_ready'],
                true
            ),
            422,
            __('This import is not ready for review.')
        );

        abort_unless(
            Storage::disk('local')->exists(
                $leadImport->stored_path
            ),
            404,
            __('The uploaded CSV file could not be found.')
        );

        $options = $leadImport->options ?? [];
        $defaults = $leadImport->default_values ?? [];

        $delimiter = (string) data_get(
            $options,
            'delimiter',
            ','
        );

        $hasHeader = (bool) data_get(
            $options,
            'has_header',
            true
        );

        $totalRows = $csvService->countDataRows(
            Storage::disk('local')->path(
                $leadImport->stored_path
            ),
            $delimiter,
            $hasHeader
        );

        $assignmentRanges = collect(
            data_get(
                $options,
                'assignment_ranges',
                []
            )
        )
            ->map(fn(array $range): array => [
                'from_row' => (int) $range['from_row'],
                'to_row' => (int) $range['to_row'],
                'user_id' => (int) $range['user_id'],
            ])
            ->sortBy('from_row')
            ->values();

        /*
     * Count only rows that really exist in the CSV.
     *
     * Example:
     * Range 1–500, but CSV has 200 rows:
     * assigned count = 200.
     */
        $assignedRows = $assignmentRanges->sum(
            function (array $range) use ($totalRows): int {
                $from = max(1, $range['from_row']);
                $to = min($totalRows, $range['to_row']);

                if ($from > $to) {
                    return 0;
                }

                return ($to - $from) + 1;
            }
        );

        $assignedRows = min(
            $totalRows,
            $assignedRows
        );

        $skippedUnassignedRows = max(
            0,
            $totalRows - $assignedRows
        );

        $pipeline = Pipeline::query()
            ->whereKey(
                (int) data_get(
                    $defaults,
                    'pipeline_id'
                )
            )
            ->where(
                'created_by',
                creatorId()
            )
            ->first([
                'id',
                'name',
            ]);

        $stage = LeadStage::query()
            ->whereKey(
                (int) data_get(
                    $defaults,
                    'stage_id'
                )
            )
            ->where(
                'pipeline_id',
                $pipeline?->id
            )
            ->first([
                'id',
                'name',
                'pipeline_id',
            ]);

        abort_unless(
            $pipeline && $stage,
            422,
            __('The selected pipeline or stage is no longer available.')
        );

        $userIds = $assignmentRanges
            ->pluck('user_id')
            ->unique()
            ->values();

        $users = User::query()
            ->whereIn('id', $userIds)
            ->where(function ($query) {
                $query
                    ->where('id', creatorId())
                    ->orWhere(
                        'creator_id',
                        creatorId()
                    );
            })
            ->get([
                'id',
                'name',
                'email',
            ])
            ->keyBy('id');

        $assignmentSummary = $assignmentRanges
            ->map(function (array $range) use (
                $users,
                $totalRows
            ): array {
                $effectiveFrom = max(
                    1,
                    $range['from_row']
                );

                $effectiveTo = min(
                    $totalRows,
                    $range['to_row']
                );

                $rowCount = $effectiveFrom <= $effectiveTo
                    ? ($effectiveTo - $effectiveFrom) + 1
                    : 0;

                $user = $users->get(
                    $range['user_id']
                );

                return [
                    'from_row' => $range['from_row'],
                    'to_row' => $range['to_row'],
                    'effective_rows' => $rowCount,
                    'user' => $user
                        ? [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                        ]
                        : null,
                ];
            })
            ->values();

        $leadImport->update([
            'total_rows' => $totalRows,
        ]);

        return Inertia::render(
            'Lead/Leads/Import/Review',
            [
                'leadImport' => [
                    'uuid' => $leadImport->uuid,
                    'original_filename' => $leadImport
                        ->original_filename,
                    'file_size' => $leadImport->file_size,
                    'status' => $leadImport->status,
                    'column_mapping' => $leadImport
                        ->column_mapping ?? [],
                    'duplicate_strategy' => $leadImport
                        ->duplicate_strategy,
                ],

                'summary' => [
                    'total_rows' => $totalRows,
                    'assigned_rows' => $assignedRows,
                    'skipped_unassigned_rows' => $skippedUnassignedRows,
                    'mapped_fields' => count(
                        $leadImport->column_mapping ?? []
                    ),
                    'pipeline' => [
                        'id' => $pipeline->id,
                        'name' => $pipeline->name,
                    ],
                    'stage' => [
                        'id' => $stage->id,
                        'name' => $stage->name,
                    ],
                    'duplicate_by' => data_get(
                        $options,
                        'duplicate_by',
                        'phone'
                    ),
                    'duplicate_strategy' => $leadImport
                        ->duplicate_strategy,
                    'is_active' => (bool) data_get(
                        $defaults,
                        'is_active',
                        true
                    ),
                ],

                'assignmentRanges' => $assignmentSummary,
            ]
        );
    }

    public function start(LeadImport $leadImport): RedirectResponse
    {
        abort_unless(
            auth()->user()?->can('create-leads'),
            403
        );

        abort_unless(
            (int) $leadImport->created_by === (int) creatorId(),
            403
        );

        /*
     * Already started:
     * just send the user to the progress page.
     */
        if (
            in_array(
                $leadImport->status,
                [
                    'pending',
                    'preparing',
                    'queued',
                    'processing',
                    'completed',
                    'completed_with_errors',
                ],
                true
            )
        ) {
            return redirect()->route(
                'lead.leads.import.progress',
                $leadImport->uuid
            );
        }

        abort_unless(
            $leadImport->status === 'settings_ready',
            422,
            __('This import is not ready to start.')
        );

        $mapping = $leadImport->column_mapping ?? [];

        foreach (['name', 'subject', 'phone'] as $requiredField) {
            if (!array_key_exists($requiredField, $mapping)) {
                return back()->withErrors([
                    'import' => __(
                        'The :field field is not mapped.',
                        ['field' => ucfirst($requiredField)]
                    ),
                ]);
            }
        }

        $assignmentRanges = data_get(
            $leadImport->options,
            'assignment_ranges',
            []
        );

        if (empty($assignmentRanges)) {
            return back()->withErrors([
                'import' => __(
                    'At least one user assignment range is required.'
                ),
            ]);
        }

        $defaults = $leadImport->default_values ?? [];

        if (
            empty($defaults['pipeline_id']) ||
            empty($defaults['stage_id'])
        ) {
            return back()->withErrors([
                'import' => __(
                    'Pipeline and stage are required before starting.'
                ),
            ]);
        }

        $updated = LeadImport::query()
            ->whereKey($leadImport->id)
            ->where('status', 'settings_ready')
            ->update([
                'status' => 'pending',
                'failure_message' => null,
            ]);

        if ($updated === 1) {
            PrepareLeadImport::dispatch(
                $leadImport->id
            );
        }

        return redirect()
            ->route(
                'lead.leads.import.progress',
                $leadImport->uuid
            )
            ->with(
                'success',
                __('Lead import has been queued.')
            );
    }

    public function progress(LeadImport $leadImport): Response
    {
        abort_unless(
            auth()->user()?->can('create-leads'),
            403
        );

        abort_unless(
            (int) $leadImport->created_by === (int) creatorId(),
            403
        );

        $leadImport->refresh();

        return Inertia::render(
            'Lead/Leads/Import/Progress',
            [
                'leadImport' => [
                    'uuid' => $leadImport->uuid,
                    'original_filename' => $leadImport->original_filename,
                    'status' => $leadImport->status,
                    'total_rows' => $leadImport->total_rows,
                    'total_chunks' => $leadImport->total_chunks,
                    'completed_chunks' => $leadImport->completed_chunks,
                    'processed_rows' => $leadImport->processed_rows,
                    'inserted_rows' => $leadImport->inserted_rows,
                    'updated_rows' => $leadImport->updated_rows,
                    'duplicate_rows' => $leadImport->duplicate_rows,
                    'skipped_rows' => $leadImport->skipped_rows,
                    'skipped_unassigned_rows' =>
                    $leadImport->skipped_unassigned_rows,
                    'failed_rows' => $leadImport->failed_rows,
                    'failure_message' => $leadImport->failure_message,
                ],
            ]
        );
    }

    public function preview(LeadImport $leadImport, LeadImportCsvService $csvService): Response
    {
        abort_unless(
            auth()->user()?->can('create-leads'),
            403
        );

        abort_unless(
            (int) $leadImport->created_by === (int) creatorId(),
            403
        );

        $options = $leadImport->options ?? [];
        $preview = $options['preview'] ?? null;

        /*
     * Backward-compatible fallback:
     * imports uploaded before preview snapshots were added
     * are read again from the stored CSV.
     */
        if (!$preview) {
            abort_unless(
                Storage::disk('local')->exists(
                    $leadImport->stored_path
                ),
                404,
                __('The uploaded CSV file could not be found.')
            );

            $parsedPreview = $csvService->preview(
                Storage::disk('local')->path(
                    $leadImport->stored_path
                )
            );

            $preview = [
                'headers' => $parsedPreview['headers'],
                'rows' => $parsedPreview['rows'],
                'required_fields' => $parsedPreview['required_fields'],
            ];

            $options['preview'] = $preview;
            $options['delimiter'] = $parsedPreview['delimiter_character'];
            $options['delimiter_name'] = $parsedPreview['delimiter'];
            $options['has_header'] = true;

            $leadImport->update([
                'options' => $options,
                'column_mapping' => $leadImport->column_mapping
                    ?: $parsedPreview['suggested_mapping'],
            ]);

            $leadImport->refresh();
        }

        return Inertia::render(
            'Lead/Leads/Import/Preview',
            [
                'leadImport' => [
                    'uuid' => $leadImport->uuid,
                    'original_filename' => $leadImport->original_filename,
                    'file_size' => $leadImport->file_size,
                    'mode' => $leadImport->mode,
                    'status' => $leadImport->status,
                    'duplicate_strategy' => $leadImport
                        ->duplicate_strategy,
                    'column_mapping' => $leadImport
                        ->column_mapping ?? [],
                    'delimiter_name' => data_get(
                        $leadImport->options,
                        'delimiter_name'
                    ),
                ],

                'preview' => [
                    'headers' => $preview['headers'] ?? [],
                    'rows' => $preview['rows'] ?? [],
                    'required_fields' => $preview['required_fields'] ?? [
                        'name',
                        'subject',
                        'phone',
                    ],
                ],

                'crmFields' => $this->importableFields(),

                'users' => User::query()
                    ->where(function ($query) {
                        $query
                            ->where('id', creatorId())
                            ->orWhere('creator_id', creatorId());
                    })->emp(['vendor', 'client'])
                    ->select([
                        'id',
                        'name',
                        'email',
                    ])
                    ->orderBy('name')
                    ->get(),
            ]
        );
    }
}
