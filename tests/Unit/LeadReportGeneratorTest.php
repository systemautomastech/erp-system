<?php

namespace Tests\Unit;

use Automas\SmartReports\Services\ReportGenerators\LeadReportGenerator;
use PHPUnit\Framework\TestCase;

class LeadReportGeneratorTest extends TestCase
{
    public function test_it_normalizes_lead_status_values(): void
    {
        $this->assertSame('Converted', LeadReportGenerator::normalizeLeadStatus(['is_converted' => 1, 'is_active' => 1]));
        $this->assertSame('Active', LeadReportGenerator::normalizeLeadStatus(['is_converted' => 0, 'is_active' => 1]));
        $this->assertSame('Inactive', LeadReportGenerator::normalizeLeadStatus(['is_converted' => 0, 'is_active' => 0]));
    }
}
