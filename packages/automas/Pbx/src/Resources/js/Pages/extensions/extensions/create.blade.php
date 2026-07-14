@extends('layouts.main')
@section('page-title')
{{ __('Create Extension') }}
@endsection
@section('page-breadcrumb')
{{ __('PBX') }},{{ __('Extensions') }},{{ __('Create') }}
@endsection
@section('content')
<div class="row">
    <div class="col-sm-12">
        <form method="POST" action="{{ route('pbx.extensions.store') }}" class="needs-validation" novalidate>
            @csrf
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5>{{ __('Setup User with Extension') }}</h5>

                    <div class="form-check form-switch">
                        <input type="checkbox" class="form-check-input" name="is_active" value="1" id="extension-active" {{ old('is_active', $extension->is_active ?? true) ? 'checked' : '' }}>
                        <label class="form-check-label" for="extension-active">{{ __('Active') }}</label>
                    </div>
                </div>
                <div class="card-body">

                    @include('pbx::extensions.form')
                    <div class="text-end">
                        <a href="{{ route('pbx.extensions.index') }}" class="btn btn-light">{{ __('Cancel') }}</a>
                        <button type="submit" class="btn btn-primary">{{ __('Create') }}</button>
                    </div>

                </div>
            </div>
        </form>
    </div>
</div>
@endsection