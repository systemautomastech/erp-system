@extends('layouts.main')
@section('page-title')
    {{ __('Call Logs') }}
@endsection
@section('page-breadcrumb')
    {{ __('PBX') }},{{ __('Call Logs') }}
@endsection
@push('css')
    @include('layouts.includes.datatable-css')
@endpush
@section('content')
    <div class="row">
        <div class="col-sm-12">
            <div class="card mb-3">
                <div class="card-body">
                    <form method="GET" action="{{ route('pbx.call-logs.index') }}" id="pbx-call-log-filters">
                        <div class="row g-3">
                            <div class="col-md-2">
                                <label class="form-label">{{ __('Extension') }}</label>
                                <select name="extension" class="form-control">
                                    <option value="">{{ __('All') }}</option>
                                    @foreach ($extensions as $ext)
                                        <option value="{{ $ext }}" @selected(request('extension') == $ext)>{{ $ext }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label class="form-label">{{ __('Direction') }}</label>
                                <select name="direction" class="form-control">
                                    <option value="">{{ __('All') }}</option>
                                    @foreach ($directions as $direction)
                                        <option value="{{ $direction }}" @selected(request('direction') == $direction)>{{ ucfirst($direction) }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label class="form-label">{{ __('Status') }}</label>
                                <select name="status" class="form-control">
                                    <option value="">{{ __('All') }}</option>
                                    @foreach ($statuses as $status)
                                        <option value="{{ $status }}" @selected(request('status') == $status)>{{ ucfirst($status) }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label class="form-label">{{ __('From Number') }}</label>
                                <input type="text" name="from_number" class="form-control" value="{{ request('from_number') }}">
                            </div>
                            <div class="col-md-2">
                                <label class="form-label">{{ __('To Number') }}</label>
                                <input type="text" name="to_number" class="form-control" value="{{ request('to_number') }}">
                            </div>
                            <div class="col-md-1">
                                <label class="form-label">{{ __('From Date') }}</label>
                                <input type="date" name="date_from" class="form-control" value="{{ request('date_from') }}">
                            </div>
                            <div class="col-md-1">
                                <label class="form-label">{{ __('To Date') }}</label>
                                <input type="date" name="date_to" class="form-control" value="{{ request('date_to') }}">
                            </div>
                        </div>
                        <div class="text-end mt-3">
                            <a href="{{ route('pbx.call-logs.index') }}" class="btn btn-light">{{ __('Reset') }}</a>
                            <button type="submit" class="btn btn-primary">{{ __('Filter') }}</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="card">
                <div class="card-body table-border-style">
                    <div class="table-responsive">
                        {{ $dataTable->table(['width' => '100%']) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
@push('scripts')
    @include('layouts.includes.datatable-js')
    {{ $dataTable->scripts() }}
    <script>
        document.getElementById('pbx-call-log-filters').addEventListener('submit', function () {
            const params = new URLSearchParams(new FormData(this)).toString();
            window.LaravelDataTables['pbx-call-logs-table'].ajax.url("{{ route('pbx.call-logs.index') }}?" + params).load();
            return false;
        });
    </script>
@endpush
