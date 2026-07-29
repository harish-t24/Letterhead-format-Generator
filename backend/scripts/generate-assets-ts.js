const fs = require('fs');
const path = require('path');

const headerPath = path.join(__dirname, '../../frontend/src/assets/header.png');
const footerPath = path.join(__dirname, '../../frontend/src/assets/footer.png');

const h = fs.readFileSync(headerPath).toString('base64');
const f = fs.readFileSync(footerPath).toString('base64');

const code = `/**
 * Base64 assets for default header.png and footer.png
 */
export const DEFAULT_HEADER_PNG_BASE64 = 'data:image/png;base64,${h}';
export const DEFAULT_FOOTER_PNG_BASE64 = 'data:image/png;base64,${f}';
`;

const outputPath = path.join(__dirname, '../src/templates/starters/starter-assets.ts');
fs.writeFileSync(outputPath, code);
console.log('Successfully wrote starter-assets.ts to', outputPath);
