<div class="row">
    <div class="col-md-4">
        <div class="form-group">
            <label class="form-label">{{ __('User') }}</label>
            <select name="user_id" id="user_id" class="form-control choices" searchEnabled="true" required>
                <option value="">{{ __('Select User') }}</option>
                @foreach ($users as $id => $name)
                <option value="{{ $id }}" @selected(old('user_id', $extension->user_id ?? '') == $id) @disabled(isset($assignedUserIds) && in_array($id, $assignedUserIds))>{{ $name }}</option>
                @endforeach
            </select>
        </div>
    </div>
    <div class="col-md-2">
        <div class="form-group">
            <label class="form-label">{{ __('Extensions') }}</label>
            <select name="extension" id="extension" class="form-control choices" searchEnabled="true" required>
                <option value="">{{ __('Select Extension') }}</option>
                @for ($i = $setting->extension_start; $i <= $setting->extension_end; $i++)
                    @if(!in_array($i, $assignedExtensions))
                    <option value="{{ $i }}" @selected(old('extension', $extension->extension ?? '') == $i) >{{ $i }}</option>
                    @endif
                    @endfor
            </select>
            <small class="text-muted">{{ __('Allowed range: :start - :end', ['start' => $setting->extension_start, 'end' => $setting->extension_end]) }}</small>
        </div>
    </div>
    <div class="col-md-3">
        <div class="form-group">
            <label class="form-label">{{ __('Caller ID') }}</label>
            <input type="text" name="caller_id" class="form-control" value="{{ old('caller_id', $extension->caller_id ?? '') }}" placeholder="{{ __('Optional') }}">
        </div>
    </div>
    <div class="col-md-3">
        <div class="form-group">
            <label class="form-label">{{ __('Password') }}</label>
            <input type="text" name="sip_secret" class="form-control" placeholder="{{ isset($extension) ? __('Leave blank to keep current') : __('Auto-generated if empty') }}">
        </div>
    </div>
</div>