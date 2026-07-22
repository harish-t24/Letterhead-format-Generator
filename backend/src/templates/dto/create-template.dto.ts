export class CreateTemplateDto {
  originalName: string;
}

export class CreateFromStarterDto {
  templateName: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  headerHtml?: string;
  footerHtml?: string;
}

export class UpdateContentDto {
  bodyHtml?: string;
  headerHtml?: string;
  footerHtml?: string;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

export class RenameTemplateDto {
  templateName: string;
}
