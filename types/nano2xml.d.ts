export default nano2xml;
/**
 * Convert a nano‑style JavaScript object to XML.
 *
 * @param {Object|Array} data - Input nano structure.
 * @param {Object} [options={}] - Conversion options.
 * @param {string} [options.indent='\t'] - Indentation string.
 * @param {string} [options.newLine='\n'] - New line string.
 * @param {Object} [options.defaultTags={}] - Tag configuration.
 * @returns {string} XML string.
 */
declare function nano2xml(data: any | any[], { indent, newLine, defaultTags }?: {
    indent?: string | undefined;
    newLine?: string | undefined;
    defaultTags?: any;
} | undefined): string;
