/**
 * Class representing an XML transformer.
 * Encodes nano objects to XML format, and decodes XML strings to nano objects.
 * @extends Transformer
 */
export default class XMLTransformer extends Transformer {
    /**
     * Creates a new XMLTransformer instance.
     * @param {Object} [options={}] - Options for HTML conversion.
     * @param {string} [options.tab='\t'] - The string to use for indentation.
     * @param {string} [options.eol='\n'] - The string to use for new lines.
     * @param {Object} [options.defaultTags] - The default tag mappings for conversion.
     */
    constructor(options?: {
        tab?: string | undefined;
        eol?: string | undefined;
        defaultTags?: any;
    } | undefined);
    /** @type {string} */
    tab: string;
    /** @type {string} */
    eol: string;
    /** @type {XMLTags} */
    defaultTags: XMLTags;
    /**
     * Encodes a nano object to HTML format.
     * @param {Object|Array} data - The nano object or array to encode.
     * @returns {Promise<string>} - The HTML string representation.
     */
    encode(data: any | any[]): Promise<string>;
    /**
     * Decodes an XML string to a nano object.
     * Note: This method is a placeholder and should be implemented with actual HTML parsing logic.
     * @param {string} str - The XML string to decode.
     * @returns {Promise<Object|Array>} - The decoded nano object or array.
     */
    decode(str: string): Promise<any | any[]>;
}
import Transformer from "@nan0web/transformer";
import XMLTags from "./XMLTags.js";
