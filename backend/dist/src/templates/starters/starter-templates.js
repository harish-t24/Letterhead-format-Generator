"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHINECRAFT_STARTER = exports.BLANK_STARTER = void 0;
exports.getStarter = getStarter;
exports.BLANK_STARTER = {
    label: 'Blank Document',
    description: 'An empty page with no header or footer — start from scratch.',
    headerHtml: '',
    footerHtml: '',
    bodyHtml: '<p></p>',
    header: false,
    footer: false,
};
exports.SHINECRAFT_STARTER = {
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
      Shinecraft Industries — Confidential &nbsp;|&nbsp; Page 
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
function getStarter(source) {
    return source === 'shinecraft' ? exports.SHINECRAFT_STARTER : exports.BLANK_STARTER;
}
//# sourceMappingURL=starter-templates.js.map