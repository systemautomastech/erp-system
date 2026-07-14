<div class="d-flex gap-2">
    <a href="{{ route('pbx.extensions.edit', $row) }}" class="btn btn-sm btn-info" data-bs-toggle="tooltip" title="{{ __('Edit') }}">
        <i class="ti ti-edit"></i>
    </a>
    <form method="POST" action="{{ route('pbx.extensions.destroy', $row) }}" onsubmit="return confirm('{{ __('Are you sure?') }}')">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn btn-sm btn-danger" data-bs-toggle="tooltip" title="{{ __('Delete') }}">
            <i class="ti ti-trash"></i>
        </button>
    </form>
</div>
