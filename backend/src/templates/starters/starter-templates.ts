/**
 * Built-in starting points offered when the user clicks "New Template".
 * These are plain HTML strings (not files) -- html-to-docx turns them
 * into a real DOCX with genuine Word header/footer XML parts.
 *
 * To swap in your organization's real letterhead, replace the HTML
 * below (e.g. point the header at an actual logo image, real address,
 * etc.) -- the rest of the pipeline doesn't need to change.
 */

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
  label: 'Shinecraft Letterhead',
  description: 'Company letterhead with header and footer already in place.',
  headerHtml: `
    <p style="text-align:center; margin:0;">
      <strong style="font-size:16px; letter-spacing:1px;">SHINECRAFT</strong>
    </p>
    <p style="text-align:center; margin:0; font-size:10px; color:#555;">
      123 Business Avenue, Suite 400 &nbsp;|&nbsp; contact@shinecraft.example
    </p>
  `,
  footerHtml: `
    <p style="text-align:center; margin:0; font-size:9px; color:#777;">
      Shinecraft Industries — Confidential
    </p>
  `,
  bodyHtml: `
    <p>Dear {name},</p>
    <p></p>
    <p>[Type your letter content here — wrap any word in curly braces, like this, to make it a per-recipient field.]</p>
  `,
  header: true,
  footer: true,
};

export function getStarter(source: 'blank' | 'shinecraft'): StarterDefinition {
  return source === 'shinecraft' ? SHINECRAFT_STARTER : BLANK_STARTER;
}
