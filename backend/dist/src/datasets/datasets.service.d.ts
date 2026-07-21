import { DatasetRow } from './dataset-row.types';
export declare class DatasetsService {
    private rowsByTemplate;
    constructor();
    private loadDatasets;
    private saveDatasets;
    listRows(templateId: string): DatasetRow[];
    addRow(templateId: string, data: Record<string, string>): DatasetRow;
    updateRow(templateId: string, rowId: string, data: Record<string, string>): DatasetRow;
    markUsed(templateId: string, rowId: string): void;
    getRow(templateId: string, rowId: string): DatasetRow;
    deleteRow(templateId: string, rowId: string): void;
    clearAll(templateId: string): void;
    getSummary(templateId: string): {
        recordCount: number;
        lastUpdatedAt: string | null;
    };
}
