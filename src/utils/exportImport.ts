/**
 * Universal Excel (CSV) and JSON Export & Import Utility
 * Supports UTF-8 with BOM for Excel compatibility with Somali and international characters.
 */

export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const escapeCell = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(','))
  ].join('\r\n');

  // \uFEFF ensures Microsoft Excel detects UTF-8 correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(filename: string, data: any): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSVString(text: string): string[][] {
  const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0);
  return lines.map((line) => {
    const row: string[] = [];
    let insideQuotes = false;
    let current = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    return row;
  });
}

export function handleFileImport(
  file: File,
  onSuccess: (data: any) => void,
  onError: (err: string) => void
): void {
  const reader = new FileReader();
  const isJSON = file.name.endsWith('.json');
  const isCSV = file.name.endsWith('.csv');

  if (!isJSON && !isCSV) {
    onError('Fadlan soo dooro file noociisu yahay .csv ama .json kaliya!');
    return;
  }

  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      if (isJSON) {
        const parsed = JSON.parse(content);
        onSuccess(parsed);
      } else {
        const rows = parseCSVString(content);
        if (rows.length < 2) {
          onError('File-ku waa faaruq ama ma laha xog ku filan!');
          return;
        }
        const headers = rows[0];
        const items = rows.slice(1).map((r) => {
          const obj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            obj[h.trim()] = r[idx] || '';
          });
          return obj;
        });
        onSuccess(items);
      }
    } catch (err: any) {
      onError('Cillad ayaa dhacday markii file-ka la akhrinayay: ' + (err?.message || 'Khalad'));
    }
  };

  reader.onerror = () => {
    onError('Lama furi karin file-ka la soo doortay.');
  };

  reader.readAsText(file, 'utf-8');
}
