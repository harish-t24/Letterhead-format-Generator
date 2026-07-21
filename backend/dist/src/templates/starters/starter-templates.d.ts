export interface StarterDefinition {
    label: string;
    description: string;
    headerHtml: string;
    footerHtml: string;
    bodyHtml: string;
    header: boolean;
    footer: boolean;
}
export declare const BLANK_STARTER: StarterDefinition;
export declare const SHINECRAFT_STARTER: StarterDefinition;
export declare function getStarter(source: 'blank' | 'shinecraft'): StarterDefinition;
