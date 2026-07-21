"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameTemplateDto = exports.UpdateContentDto = exports.CreateFromStarterDto = exports.CreateTemplateDto = void 0;
class CreateTemplateDto {
    originalName;
}
exports.CreateTemplateDto = CreateTemplateDto;
class CreateFromStarterDto {
    templateName;
    includeHeader;
    includeFooter;
    headerHtml;
    footerHtml;
}
exports.CreateFromStarterDto = CreateFromStarterDto;
class UpdateContentDto {
    bodyHtml;
    headerHtml;
    footerHtml;
}
exports.UpdateContentDto = UpdateContentDto;
class RenameTemplateDto {
    templateName;
}
exports.RenameTemplateDto = RenameTemplateDto;
//# sourceMappingURL=create-template.dto.js.map