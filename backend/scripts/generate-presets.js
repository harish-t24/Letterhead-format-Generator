const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../../frontend/src/assets');

const h1 = 'data:image/png;base64,' + fs.readFileSync(path.join(assetsDir, 'header1.png')).toString('base64');
const h2 = 'data:image/png;base64,' + fs.readFileSync(path.join(assetsDir, 'header2.png')).toString('base64');
const h3 = 'data:image/png;base64,' + fs.readFileSync(path.join(assetsDir, 'header3.png')).toString('base64');

const f1 = 'data:image/png;base64,' + fs.readFileSync(path.join(assetsDir, 'footer1.png')).toString('base64');
const f2 = 'data:image/png;base64,' + fs.readFileSync(path.join(assetsDir, 'footer2.png')).toString('base64');
const f3 = 'data:image/png;base64,' + fs.readFileSync(path.join(assetsDir, 'footer3.png')).toString('base64');

const tsContent = `export interface HeaderPreset {
  id: string;
  name: string;
  description: string;
  dataUri: string;
  html: string;
}

export interface FooterPreset {
  id: string;
  name: string;
  description: string;
  dataUri: string;
  html: string;
}

export function createHeaderHtml(dataUri: string): string {
  return \`<p style="text-align:center; margin:0; padding:0; width:100%;"><img src="\${dataUri}" style="width:100%; display:block; margin:0 auto; padding:0;" /></p>\`;
}

export function createFooterHtml(dataUri: string): string {
  return \`<p style="text-align:center; margin:0; padding:0; width:100%;"><img src="\${dataUri}" style="width:100%; display:block; margin:0 auto; padding:0;" /></p>\`;
}

export const HEADER_1_PNG = '${h1}';
export const HEADER_2_PNG = '${h2}';
export const HEADER_3_PNG = '${h3}';

export const FOOTER_1_PNG = '${f1}';
export const FOOTER_2_PNG = '${f2}';
export const FOOTER_3_PNG = '${f3}';

export const HEADER_PRESETS: HeaderPreset[] = [
  {
    id: 'header-1',
    name: 'Header 1 (header1.png)',
    description: 'Uploaded Header 1 PNG Asset',
    dataUri: HEADER_1_PNG,
    html: createHeaderHtml(HEADER_1_PNG),
  },
  {
    id: 'header-2',
    name: 'Header 2 (header2.png)',
    description: 'Uploaded Header 2 PNG Asset',
    dataUri: HEADER_2_PNG,
    html: createHeaderHtml(HEADER_2_PNG),
  },
  {
    id: 'header-3',
    name: 'Header 3 (header3.png)',
    description: 'Uploaded Header 3 PNG Asset',
    dataUri: HEADER_3_PNG,
    html: createHeaderHtml(HEADER_3_PNG),
  },
];

export const FOOTER_PRESETS: FooterPreset[] = [
  {
    id: 'footer-1',
    name: 'Footer 1 (footer1.png)',
    description: 'Uploaded Footer 1 PNG Asset',
    dataUri: FOOTER_1_PNG,
    html: createFooterHtml(FOOTER_1_PNG),
  },
  {
    id: 'footer-2',
    name: 'Footer 2 (footer2.png)',
    description: 'Uploaded Footer 2 PNG Asset',
    dataUri: FOOTER_2_PNG,
    html: createFooterHtml(FOOTER_2_PNG),
  },
  {
    id: 'footer-3',
    name: 'Footer 3 (footer3.png)',
    description: 'Uploaded Footer 3 PNG Asset',
    dataUri: FOOTER_3_PNG,
    html: createFooterHtml(FOOTER_3_PNG),
  },
];
`;

fs.writeFileSync(path.join(assetsDir, 'header-footer-presets.ts'), tsContent);
console.log('Successfully generated header-footer-presets.ts with uploaded PNG files!');
