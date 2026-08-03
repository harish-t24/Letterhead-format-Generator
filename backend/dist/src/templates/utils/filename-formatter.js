"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShortTemplateInitials = getShortTemplateInitials;
exports.formatMergedFilename = formatMergedFilename;
function getShortTemplateInitials(templateName) {
    if (!templateName)
        return 'DOC';
    const words = templateName.trim().split(/[\s_-]+/);
    if (words.length > 1) {
        const initials = words.map((w) => w.charAt(0).toUpperCase()).join('');
        return initials || 'DOC';
    }
    const word = words[0];
    if (word.length >= 3) {
        return word.slice(0, 3).toUpperCase();
    }
    return word.toUpperCase() || 'DOC';
}
function formatMergedFilename(templateName, rowIndex, rowData) {
    const shortName = getShortTemplateInitials(templateName);
    const year = new Date().getFullYear().toString().slice(-2);
    const rowIdPadded = String(rowIndex + 1).padStart(3, '0');
    let personName = '';
    if (rowData) {
        const nameKey = Object.keys(rowData).find((k) => {
            const lower = k.toLowerCase().replace(/[^a-z]/g, '');
            return (lower === 'name' ||
                lower === 'fullname' ||
                lower === 'studentname' ||
                lower === 'candidatename' ||
                lower === 'employeename' ||
                lower === 'personname' ||
                lower === 'recipient');
        });
        if (nameKey && rowData[nameKey]?.trim()) {
            personName = ` ${rowData[nameKey].trim().replace(/[/\\?%*:|"<>]/g, '')}`;
        }
    }
    return `SCT ${shortName} ${year}_${rowIdPadded}${personName}`;
}
//# sourceMappingURL=filename-formatter.js.map