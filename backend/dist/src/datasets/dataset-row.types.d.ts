export interface DatasetRow {
    id: string;
    templateId: string;
    data: Record<string, string>;
    createdAt: string;
    updatedAt: string;
    lastUsedAt: string | null;
}
