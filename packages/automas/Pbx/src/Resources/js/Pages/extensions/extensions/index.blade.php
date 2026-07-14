@extends('layouts.main')
@section('page-title')
    {{ __('Manage Extensions') }}
@endsection
@section('page-breadcrumb')
    {{ __('PBX') }},{{ __('Extensions') }}
@endsection
@push('css')
    @include('layouts.includes.datatable-css')
@endpush
@section('page-action')
    @permission('pbx manage extensions')
        <a href="{{ route('pbx.extensions.create') }}" class="btn btn-sm btn-primary">
            <i class="ti ti-plus"></i> {{ __('Create') }}
        </a>
    @endpermission
@endsection
@section('content')
    <div class="row">
        <div class="col-sm-12">
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
@endpush
