@extends('layouts.main')
@section('page-title')
{{ __('PBX Settings') }}
@endsection
@section('page-breadcrumb')
{{ __('PBX') }},{{ __('Settings') }}
@endsection

@section('content')
<div class="row">
    <div class="col-sm-12">
        <div class="card">
            <form method="POST" action="{{ route('pbx.settings.store') }}">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title">{{ __('PBX Settings') }}</h5>
                    <div class="form-check form-switch">
                        <input type="checkbox" class="form-check-input" name="is_enabled" value="1" id="pbx-enabled" {{ old('is_enabled', $setting->is_enabled ?? false) ? 'checked' : '' }}>
                        <label class="form-check-label" for="pbx-enabled">{{ __('Enable PBX') }}</label>
                    </div>
                </div>
                <div class="card-body">
                    @csrf
                    <div class="row">
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('PBX Name') }}</label>
                                <input type="text" name="pbx_name" class="form-control" value="{{ old('pbx_name', $setting->pbx_name ?? '') }}" required>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('PBX Host') }}</label>
                                <input type="text" name="pbx_host" class="form-control" value="{{ old('pbx_host', $setting->pbx_host ?? '') }}">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('AMI Host') }}</label>
                                <input type="text" name="ami_host" class="form-control" value="{{ old('ami_host', $setting->ami_host ?? '') }}" required>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('AMI Port') }}</label>
                                <input type="number" name="ami_port" class="form-control" value="{{ old('ami_port', $setting->ami_port ?? 5038) }}" required>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('AMI Username') }}</label>
                                <input type="text" name="ami_username" class="form-control" value="{{ old('ami_username', $setting->ami_username ?? '') }}" required>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('AMI Password') }}</label>
                                <input type="password" name="ami_password" class="form-control" placeholder="{{ $setting ? __('Leave blank to keep current') : '' }}">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('SIP Domain') }}</label>
                                <input type="text" name="sip_domain" class="form-control" value="{{ old('sip_domain', $setting->sip_domain ?? '') }}" required>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('WebSocket URL') }}</label>
                                <input type="text" name="websocket_url" class="form-control" value="{{ old('websocket_url', $setting->websocket_url ?? '') }}" required>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('STUN Server') }}</label>
                                <input type="text" name="stun_server" class="form-control" value="{{ old('stun_server', $setting->stun_server ?? 'stun:stun.l.google.com:19302') }}">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('SIP Trunk Name') }}</label>
                                <input type="text" name="sip_trunk_name" class="form-control" value="{{ old('sip_trunk_name', $setting->sip_trunk_name ?? '') }}">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('Extension Start') }}</label>
                                <input type="number" name="extension_start" class="form-control" value="{{ old('extension_start', $setting->extension_start ?? 100) }}" required>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('Extension End') }}</label>
                                <input type="number" name="extension_end" class="form-control" value="{{ old('extension_end', $setting->extension_end ?? 199) }}" required>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label class="form-label">{{ __('Max Extensions') }}</label>
                                <input type="number" name="max_extensions" class="form-control" value="{{ old('max_extensions', $setting->max_extensions ?? 50) }}" required>
                            </div>
                        </div>
                    </div>
                    <div class="text-end">
                        <button type="submit" class="btn btn-primary">{{ __('Save Settings') }}</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection