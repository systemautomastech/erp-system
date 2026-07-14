<?php

namespace Automas\Sales\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SalesSettingsController extends Controller
{
    public function update(Request $request)
    {
        if (Auth::user()->can('edit-sales-settings')) {

            $validator = Validator::make($request->all(),[
                    'settings.quote_prefix'   => 'required|string|max:10',
                    'settings.order_prefix'   => 'required|string|max:10',

                    'settings.case_prefix'   => 'required|string|max:10',
                ],
                [
                    'settings.quote_prefix.required'   => __('The quote prefix is required.'),
                    'settings.quote_prefix.string'     => __('The quote prefix must be a valid string.'),
                    'settings.quote_prefix.max'        => __('The quote prefix may not be greater than 10 characters.'),
                    'settings.order_prefix.required'   => __('The order prefix is required.'),
                    'settings.order_prefix.string'     => __('The order prefix must be a valid string.'),
                    'settings.order_prefix.max'        => __('The order prefix may not be greater than 10 characters.'),

                    'settings.case_prefix.required'   => __('The case prefix is required.'),
                    'settings.case_prefix.string'     => __('The case prefix must be a valid string.'),
                    'settings.case_prefix.max'        => __('The case prefix may not be greater than 10 characters.'),
                ]
            );

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->with('error', __('Validation failed'));
            }

            $settings = $request->input('settings', []);

            try {
                foreach ($settings as $key => $value) {
                    \App\Models\Setting::updateOrCreate(
                        [
                            'key' => $key,
                            'created_by' => creatorId()
                        ],
                        [
                            'value' => $value
                        ]
                    );
                }

                return redirect()->back()->with('success', __('Sales settings saved successfully.'));
            } catch (\Exception $e) {
                return back()->with('error', __('Failed to update sales settings: ') . $e->getMessage());
            }
        }
        else
        {
            return back()->with('error', __('Permission denied'));
        }
    }
}