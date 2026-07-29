"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHINECRAFT_STARTER = exports.BLANK_STARTER = void 0;
exports.getStarter = getStarter;
const starter_assets_1 = require("./starter-assets");
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
    label: 'Default Letterhead (With Header & Footer)',
    description: 'Pre-fitted company letterhead template with default marginless header (header.png) and footer (footer.png).',
    headerHtml: `<p style="text-align:center; margin:0; padding:0; width:100%;"><img src="${starter_assets_1.DEFAULT_HEADER_PNG_BASE64}" style="width:100%; display:block; margin:0 auto; padding:0;" /></p>`,
    footerHtml: `<p style="text-align:center; margin:0; padding:0; width:100%;"><img src="${starter_assets_1.DEFAULT_FOOTER_PNG_BASE64}" style="width:100%; display:block; margin:0 auto; padding:0;" /></p>`,
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
function getStarter(source) {
    return source === 'shinecraft' ? exports.SHINECRAFT_STARTER : exports.BLANK_STARTER;
}
//# sourceMappingURL=starter-templates.js.map