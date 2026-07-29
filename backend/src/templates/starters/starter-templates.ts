import { DEFAULT_HEADER_PNG_BASE64, DEFAULT_FOOTER_PNG_BASE64 } from './starter-assets';

export interface StarterDefinition {
  label: string;
  description: string;
  headerHtml: string;
  footerHtml: string;
  bodyHtml: string;
  header: boolean;
  footer: boolean;
}

export const BLANK_STARTER: StarterDefinition = {
  label: 'Blank Document',
  description: 'An empty page with no header or footer — start from scratch.',
  headerHtml: '',
  footerHtml: '',
  bodyHtml: '<p></p>',
  header: false,
  footer: false,
};

export const SHINECRAFT_STARTER: StarterDefinition = {
  label: 'Default Letterhead (With Header & Footer)',
  description: 'Pre-fitted company letterhead template with default marginless header (header.png) and footer (footer.png).',
  headerHtml: `<p style="text-align:center; margin:0; padding:0; width:100%;"><img src="${DEFAULT_HEADER_PNG_BASE64}" style="width:100%; display:block; margin:0 auto; padding:0;" /></p>`,
  footerHtml: `<p style="text-align:center; margin:0; padding:0; width:100%;"><img src="${DEFAULT_FOOTER_PNG_BASE64}" style="width:100%; display:block; margin:0 auto; padding:0;" /></p>`,
  bodyHtml: `
    <p>Dear {name},</p>
    <p></p>
    <p>We are pleased to present this official document for your review. Please examine the terms and details below:</p>
    <p></p>
    <p>[Type your letter content here — wrap any custom field in curly braces, like {company_name} or {date}, to convert it into a dynamic variable.]</p>
    <p></p>
    <p>Sincerely,</p>
    <p><strong>The Shinecraft Team</strong></p>
  `,
  header: true,
  footer: true,
};

export function getStarter(source: 'blank' | 'shinecraft' | string): StarterDefinition {
  return source === 'shinecraft' ? SHINECRAFT_STARTER : BLANK_STARTER;
}
