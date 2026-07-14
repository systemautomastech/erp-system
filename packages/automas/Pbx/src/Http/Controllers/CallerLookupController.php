<?php

namespace Automas\Pbx\Http\Controllers;

use Automas\Lead\Models\Lead;
use Automas\Lead\Models\Deal;
use Automas\Account\Models\Customer;
use Automas\Hrm\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class CallerLookupController extends Controller
{
    public function lookup(Request $request)
    {
        if (!Auth::user()->isAbleTo('pbx use softphone')) {
            return response()->json(['found' => false], 403);
        }

        $request->validate([
            'number' => 'required|string|max:50',
        ]);

        $phoneNumber = $request->input('number');
        $creatorId = (int) creatorId();

        // Normalize phone number for matching
        $normalized = $this->normalizeNumber($phoneNumber);
        // also prepare a digits-only form and last-10 digits for fuzzy matching
        $normalized_digits = preg_replace('/[^0-9]/', '', $phoneNumber);
        $last10 = strlen($normalized_digits) > 10 ? substr($normalized_digits, -10) : $normalized_digits;

        // Search in all models
        $results = [];

        // Search in Leads
        if (class_exists(Lead::class)) {
            $lead = Lead::where('created_by', $creatorId)
                ->where(function ($query) use ($normalized, $phoneNumber, $last10) {
                    $query->whereRaw("REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') = ?", [$normalized])
                        ->orWhere('phone', $phoneNumber)
                        ->orWhereRaw("RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''), 10) = ?", [$last10]);
                })
                ->first();

            if ($lead) {
                $results[] = [
                    'score' => 100,
                    'type' => 'lead',
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'phone' => $lead->phone,
                    'email' => $lead->email ?? null,
                    'organization' => null,
                    'address' => null,
                    'extra' => [
                        'lead_stage' => $lead->stage?->name ?? null,
                        'lead_subject' => $lead->subject ?? null,
                        'lead_status' => $lead->status ?? null,
                        'lead_created_at' =>$lead->created_at->diffForHumans() ?? null,
                        'lead_link' => route('leads.show', $lead->id),
                    ],
                ];
            }
        }

        // Search in Deals
        if (class_exists(Deal::class)) {
            $deal = Deal::where('created_by', $creatorId)
                ->where(function ($query) use ($normalized, $phoneNumber, $last10) {
                    $query->whereRaw("REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') = ?", [$normalized])
                        ->orWhere('phone', $phoneNumber)
                        ->orWhereRaw("RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''), 10) = ?", [$last10]);
                })
                ->first();

            if ($deal) {
                $results[] = [
                    'score' => 100,
                    'type' => 'deal',
                    'id' => $deal->id,
                    'name' => $deal->name,
                    'phone' => $deal->phone,
                    'email' => null,
                    'organization' => null,
                    'address' => null,
                    'extra' => [
                        'deal_stage' => $deal->stage?->name ?? null,
                        'deal_link' => route('deals.show', $deal->id),
                    ],
                ];
            }
        }

        // Search in Customers
        if (class_exists(Customer::class)) {
            $customer = Customer::where('created_by', $creatorId)
                ->where(function ($query) use ($normalized, $phoneNumber, $last10) {
                    $query->whereRaw("REPLACE(REPLACE(REPLACE(REPLACE(contact, ' ', ''), '-', ''), '(', ''), ')', '') = ?", [$normalized])
                        ->orWhere('contact', $phoneNumber)
                        ->orWhereRaw("RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(contact, ' ', ''), '-', ''), '(', ''), ')', ''), 10) = ?", [$last10]);
                })
                ->first();

            if ($customer) {
                $results[] = [
                    'score' => 90,
                    'type' => 'client',
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'phone' => $customer->contact ?? null,
                    'email' => $customer->user?->email ?? null,
                    'organization' => $customer->name,
                    'address' => null,
                    'extra' => [],
                ];
            }
        }

        // Search in Employees
        if (class_exists(Employee::class)) {
            $employee = Employee::where(function ($query) use ($normalized, $phoneNumber, $last10) {
                $query->whereRaw("REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') = ?", [$normalized])
                    ->orWhere('phone', $phoneNumber)
                    ->orWhereRaw("RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''), 10) = ?", [$last10]);
            })
                ->first();

            if ($employee) {
                $results[] = [
                    'score' => 80,
                    'type' => 'staff',
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'phone' => $employee->phone,
                    'email' => $employee->email ?? null,
                    'organization' => null,
                    'address' => $employee->address ?? null,
                    'extra' => [],
                ];
            }
        }

        // Return best match if found
        if (!empty($results)) {
            usort($results, function ($a, $b) {
                return $b['score'] - $a['score'];
            });

            $match = $results[0];

            return response()->json([
                'found' => true,
                'type' => $match['type'],
                'id' => $match['id'],
                'name' => $match['name'],
                'organization' => $match['organization'],
                'phone' => $match['phone'],
                'email' => $match['email'],
                'address' => $match['address'],
                'extra' => $match['extra'],
            ]);
        }

        return response()->json([
            'found' => false,
            'number' => $phoneNumber,
        ]);
    }

    private function normalizeNumber($phone)
    {
        // Remove all non-digit characters except leading +
        if (strpos($phone, '+') === 0) {
            return '+' . preg_replace('/[^0-9]/', '', substr($phone, 1));
        }
        return preg_replace('/[^0-9]/', '', $phone);
    }
}
