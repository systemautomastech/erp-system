<?php

namespace Automas\Sales\Database\Seeders;

use Illuminate\Database\Seeder;
use Automas\Sales\Models\SalesShippingProvider;

class DemoSalesShippingProviderSeeder extends Seeder
{
    public function run($userId): void
    {
        if (SalesShippingProvider::where('created_by', $userId)->exists()) {
            return;
        }

        $providers = [
            ['name' => 'FedEx', 'website' => 'https://www.fedex.com'],
            ['name' => 'UPS', 'website' => 'https://www.ups.com'],
            ['name' => 'DHL Express', 'website' => 'https://www.dhl.com'],
            ['name' => 'USPS', 'website' => 'https://www.usps.com'],
            ['name' => 'Amazon Logistics', 'website' => 'https://logistics.amazon.com'],
            ['name' => 'TNT Express', 'website' => 'https://www.tnt.com'],
            ['name' => 'Aramex', 'website' => 'https://www.aramex.com'],
            ['name' => 'Blue Dart', 'website' => 'https://www.bluedart.com'],
            ['name' => 'Canada Post', 'website' => 'https://www.canadapost.ca'],
            ['name' => 'Royal Mail', 'website' => 'https://www.royalmail.com'],
            ['name' => 'Australia Post', 'website' => 'https://auspost.com.au'],
            ['name' => 'La Poste', 'website' => 'https://www.laposte.fr'],
            ['name' => 'Deutsche Post', 'website' => 'https://www.deutschepost.de'],
            ['name' => 'Japan Post', 'website' => 'https://www.post.japanpost.jp'],
            ['name' => 'SF Express', 'website' => 'https://www.sf-express.com'],
            ['name' => 'OnTrac', 'website' => 'https://www.ontrac.com'],
            ['name' => 'Purolator', 'website' => 'https://www.purolator.com'],
            ['name' => 'GLS', 'website' => 'https://gls-group.eu'],
            ['name' => 'Hermes', 'website' => 'https://www.hermes.com'],
            ['name' => 'DPD', 'website' => 'https://www.dpd.com'],
            ['name' => 'PostNL', 'website' => 'https://www.postnl.nl'],
            ['name' => 'Correos', 'website' => 'https://www.correos.es'],
            ['name' => 'Swiss Post', 'website' => 'https://www.post.ch'],
            ['name' => 'Poste Italiane', 'website' => 'https://www.poste.it'],
            ['name' => 'YTO Express', 'website' => 'https://www.yto.net.cn'],
            ['name' => 'ZTO Express', 'website' => 'https://www.zto.com'],
            ['name' => 'STO Express', 'website' => 'https://www.sto.cn'],
            ['name' => 'Yunda Express', 'website' => 'https://www.yunda56.com'],
            ['name' => 'Best Express', 'website' => 'https://www.best-inc.com'],
            ['name' => 'Cainiao Network', 'website' => 'https://www.cainiao.com']
        ];

        foreach ($providers as $provider) {
            SalesShippingProvider::create([
                'name' => $provider['name'],
                'website' => $provider['website'],
                'creator_id' => $userId,
                'created_by' => $userId,
            ]);
        }
    }
}