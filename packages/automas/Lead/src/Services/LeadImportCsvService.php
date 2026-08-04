<?php

namespace Automas\Lead\Services;

use RuntimeException;
use SplFileObject;

class LeadImportCsvService
{
    private const PREVIEW_LIMIT = 20;

    private const DELIMITERS = [
        ',',
        ';',
        "\t",
        '|',
    ];

    public function preview(string $absolutePath): array
    {
        if (!is_file($absolutePath) || !is_readable($absolutePath)) {
            throw new RuntimeException(
                __('The uploaded CSV file could not be read.')
            );
        }

        $delimiter = $this->detectDelimiter($absolutePath);

        $file = new SplFileObject($absolutePath, 'r');

        $file->setFlags(
            SplFileObject::READ_CSV
                | SplFileObject::SKIP_EMPTY
                | SplFileObject::DROP_NEW_LINE
        );

        $file->setCsvControl(
            separator: $delimiter,
            enclosure: '"',
            escape: '\\'
        );

        $rawHeader = $file->fgetcsv();

        if ($rawHeader === false || $this->isEmptyRow($rawHeader)) {
            throw new RuntimeException(
                __('The CSV file does not contain any readable rows.')
            );
        }

        $header = $this->normalizeHeader($rawHeader);

        if (count($header) < 2) {
            throw new RuntimeException(
                __('The CSV file must contain at least two columns.')
            );
        }

        $rows = [];
        $rowNumber = 1;

        while (!$file->eof() && count($rows) < self::PREVIEW_LIMIT) {
            $row = $file->fgetcsv();
            $rowNumber++;

            if ($row === false || $this->isEmptyRow($row)) {
                continue;
            }

            $rows[] = [
                'row_number' => $rowNumber,
                'values' => $this->normalizeRow(
                    $row,
                    count($header)
                ),
            ];
        }

        if ($rows === []) {
            throw new RuntimeException(
                __('The CSV file contains a header but no data rows.')
            );
        }

        return [
            'delimiter' => $this->delimiterName($delimiter),
            'delimiter_character' => $delimiter,
            'headers' => $header,
            'rows' => $rows,
            'suggested_mapping' => $this->suggestMapping($header),
            'required_fields' => [
                'name',
                'subject',
                'phone',
            ],
        ];
    }

    private function detectDelimiter(string $absolutePath): string
    {
        $handle = fopen($absolutePath, 'r');

        if ($handle === false) {
            throw new RuntimeException(
                __('The CSV file could not be opened.')
            );
        }

        $sampleLines = [];

        while (
            !feof($handle)
            && count($sampleLines) < 5
        ) {
            $line = fgets($handle);

            if ($line === false) {
                break;
            }

            if (trim($line) !== '') {
                $sampleLines[] = $line;
            }
        }

        fclose($handle);

        if ($sampleLines === []) {
            throw new RuntimeException(
                __('The CSV file is empty.')
            );
        }

        $bestDelimiter = ',';
        $bestScore = -1;

        foreach (self::DELIMITERS as $delimiter) {
            $columnCounts = [];

            foreach ($sampleLines as $line) {
                $columns = str_getcsv(
                    $line,
                    $delimiter,
                    '"',
                    '\\'
                );

                $columnCounts[] = count($columns);
            }

            $minimumColumns = min($columnCounts);
            $maximumColumns = max($columnCounts);

            $consistent = $minimumColumns === $maximumColumns;
            $score = $consistent
                ? $minimumColumns * 10
                : $minimumColumns;

            if ($minimumColumns > 1 && $score > $bestScore) {
                $bestScore = $score;
                $bestDelimiter = $delimiter;
            }
        }

        return $bestDelimiter;
    }

    public function countDataRows(
        string $absolutePath,
        string $delimiter = ',',
        bool $hasHeader = true
    ): int {
        if (!is_file($absolutePath) || !is_readable($absolutePath)) {
            throw new RuntimeException(
                __('The uploaded CSV file could not be read.')
            );
        }

        $file = new SplFileObject($absolutePath, 'r');

        $file->setFlags(
            SplFileObject::READ_CSV
                | SplFileObject::SKIP_EMPTY
                | SplFileObject::DROP_NEW_LINE
        );

        $file->setCsvControl(
            separator: $delimiter,
            enclosure: '"',
            escape: '\\'
        );

        $count = 0;
        $firstReadableRowFound = false;

        while (!$file->eof()) {
            $row = $file->fgetcsv();

            if (
                $row === false ||
                $this->isEmptyRow($row)
            ) {
                continue;
            }

            if (!$firstReadableRowFound) {
                $firstReadableRowFound = true;

                if ($hasHeader) {
                    continue;
                }
            }

            $count++;
        }

        return $count;
    }

    private function normalizeHeader(array $header): array
    {
        $used = [];

        return array_map(
            function (mixed $value, int $index) use (&$used): array {
                $original = $this->cleanValue($value);

                if ($index === 0) {
                    $original = $this->removeBom($original);
                }

                $label = $original !== ''
                    ? $original
                    : __('Column :column', [
                        'column' => $index + 1,
                    ]);

                $key = $this->makeUniqueKey(
                    $label,
                    $index,
                    $used
                );

                $used[] = $key;

                return [
                    'index' => $index,
                    'key' => $key,
                    'label' => $label,
                ];
            },
            $header,
            array_keys($header)
        );
    }

    private function normalizeRow(
        array $row,
        int $columnCount
    ): array {
        $normalized = [];

        for ($index = 0; $index < $columnCount; $index++) {
            $normalized[] = $this->cleanValue(
                $row[$index] ?? ''
            );
        }

        return $normalized;
    }

    private function cleanValue(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        $value = trim((string) $value);

        return mb_convert_encoding(
            $value,
            'UTF-8',
            'UTF-8, ISO-8859-1, Windows-1252'
        );
    }

    private function removeBom(string $value): string
    {
        return preg_replace(
            '/^\xEF\xBB\xBF/',
            '',
            $value
        ) ?? $value;
    }

    private function makeUniqueKey(
        string $label,
        int $index,
        array $used
    ): string {
        $key = mb_strtolower($label);
        $key = preg_replace('/[^a-z0-9]+/i', '_', $key);
        $key = trim((string) $key, '_');

        if ($key === '') {
            $key = 'column_' . ($index + 1);
        }

        $originalKey = $key;
        $suffix = 2;

        while (in_array($key, $used, true)) {
            $key = $originalKey . '_' . $suffix;
            $suffix++;
        }

        return $key;
    }

    private function isEmptyRow(array $row): bool
    {
        foreach ($row as $value) {
            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }

    private function suggestMapping(array $headers): array
    {
        $aliases = [
            'name' => [
                'name',
                'lead_name',
                'customer_name',
                'client_name',
                'contact_name',
                'full_name',
                'person_name',
            ],
            'subject' => [
                'subject',
                'lead_subject',
                'title',
                'lead_title',
                'inquiry',
                'interest',
            ],
            'phone' => [
                'phone',
                'phone_number',
                'mobile',
                'mobile_number',
                'contact_number',
                'telephone',
                'tel',
            ],
            'email' => [
                'email',
                'email_address',
                'mail',
            ],
            'notes' => [
                'notes',
                'note',
                'description',
                'remarks',
                'comment',
            ],
            'date' => [
                'date',
                'follow_up',
                'follow_up_date',
                'next_follow_up',
            ],
        ];

        $mapping = [];

        foreach ($headers as $header) {
            $normalized = $header['key'];

            foreach ($aliases as $field => $fieldAliases) {
                if (in_array($normalized, $fieldAliases, true)) {
                    if (!isset($mapping[$field])) {
                        $mapping[$field] = $header['index'];
                    }

                    break;
                }
            }
        }

        return $mapping;
    }

    private function delimiterName(string $delimiter): string
    {
        return match ($delimiter) {
            ',' => 'comma',
            ';' => 'semicolon',
            "\t" => 'tab',
            '|' => 'pipe',
            default => 'unknown',
        };
    }
}
