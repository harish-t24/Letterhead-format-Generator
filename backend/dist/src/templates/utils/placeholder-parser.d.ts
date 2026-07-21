export declare function extractPlaceholders(text: string): string[];
export declare function extractPlaceholdersFromDocx(docxBuffer: Buffer): string[];
export declare function validateBraces(text: string): {
    valid: boolean;
    error?: string;
};
