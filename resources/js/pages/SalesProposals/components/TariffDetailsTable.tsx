import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

export interface ProposalTariffRow {
    id?: number;
    particulars: string;
    tariff_per_min: number | string;
    brand: string;
    qty: number | string;
    pulse_per_min: string;
    sort_order?: number;
}

interface Props {
    tariffs: ProposalTariffRow[];
    onChange: (tariffs: ProposalTariffRow[]) => void;
}

export default function TariffDetailsTable({ tariffs, onChange }: Props) {
    const { t } = useTranslation();

    const addTariffRow = () => {
        const newRow: ProposalTariffRow = {
            particulars: '',
            tariff_per_min: 0,
            brand: '',
            qty: 1,
            pulse_per_min: '',
            sort_order: tariffs.length + 1,
        };
        onChange([...tariffs, newRow]);
    };

    const removeTariffRow = (index: number) => {
        const updated = tariffs.filter((_, i) => i !== index);
        updated.forEach((row, idx) => {
            row.sort_order = idx + 1;
        });
        onChange(updated);
    };

    const updateTariffRow = (index: number, field: keyof ProposalTariffRow, value: any) => {
        const updated = [...tariffs];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full text-xs">
                    <thead>
                        <tr className="border-b border-border bg-muted/40">
                            <th className="px-3 py-2.5 text-left font-semibold">{t('Particulars')}</th>
                            <th className="px-3 py-2.5 text-left font-semibold">{t('Tariff / Min')}</th>
                            <th className="px-3 py-2.5 text-left font-semibold">{t('Brand')}</th>
                            <th className="px-3 py-2.5 text-center font-semibold">{t('Qty')}</th>
                            <th className="px-3 py-2.5 text-left font-semibold">{t('Pulse / Min')}</th>
                            <th className="px-3 py-2.5 text-center font-semibold">{t('Action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {tariffs.length > 0 ? (
                            tariffs.map((row, index) => (
                                <tr key={index} className="hover:bg-muted/20">
                                    <td className="p-2">
                                        <Input
                                            type="text"
                                            value={row.particulars}
                                            onChange={(e) => updateTariffRow(index, 'particulars', e.target.value)}
                                            placeholder={t('e.g., Local Calls')}
                                            className="h-8 text-xs"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            step="0.0001"
                                            min="0"
                                            value={row.tariff_per_min}
                                            onChange={(e) => updateTariffRow(index, 'tariff_per_min', parseFloat(e.target.value) || 0)}
                                            placeholder="0.0000"
                                            className="h-8 w-28 text-xs"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="text"
                                            value={row.brand}
                                            onChange={(e) => updateTariffRow(index, 'brand', e.target.value)}
                                            placeholder={t('e.g., Telecom')}
                                            className="h-8 text-xs"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            step="1"
                                            min="0"
                                            value={row.qty}
                                            onChange={(e) => updateTariffRow(index, 'qty', parseFloat(e.target.value) || 0)}
                                            className="h-8 w-20 text-xs text-center"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="text"
                                            value={row.pulse_per_min}
                                            onChange={(e) => updateTariffRow(index, 'pulse_per_min', e.target.value)}
                                            placeholder={t('e.g., 60 Sec')}
                                            className="h-8 text-xs"
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeTariffRow(index)}
                                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-4 text-center text-muted-foreground text-xs italic">
                                    {t('No tariff rows added yet.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTariffRow}
                className="gap-2 h-8 text-xs"
            >
                <Plus className="h-3.5 w-3.5" />
                {t('Add Row')}
            </Button>
        </div>
    );
}
