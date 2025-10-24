import Transformer from "@nan0web/transformer"
import XMLTags from "./XMLTags.js"
import nano2xml from "./nano2xml.js"

/**
 * Class representing an XML transformer.
 * Encodes nano objects to XML format, and decodes XML strings to nano objects.
 * @extends Transformer
 */
export default class XMLTransformer extends Transformer {
	/** @type {string} */
	tab
	/** @type {string} */
	eol
	/** @type {XMLTags} */
	defaultTags

	/**
	 * Creates a new XMLTransformer instance.
	 * @param {Object} [options={}] - Options for HTML conversion.
	 * @param {string} [options.tab='\t'] - The string to use for indentation.
	 * @param {string} [options.eol='\n'] - The string to use for new lines.
	 * @param {Object} [options.defaultTags] - The default tag mappings for conversion.
	 */
	constructor(options = {}) {
		super()
		const {
			tab = "\t",
			eol = "\n",
			defaultTags = new XMLTags(),
		} = options
		this.tab = String(tab)
		this.eol = String(eol)
		this.defaultTags = defaultTags
	}

	/**
	 * Encodes a nano object to HTML format.
	 * @param {Object|Array} data - The nano object or array to encode.
	 * @returns {Promise<string>} - The HTML string representation.
	 */
	async encode(data) {
		return nano2xml(data, { indent: this.tab, newLine: this.eol, defaultTags: this.defaultTags })
	}

	/**
	 * Decodes an XML string to a nano object.
	 * Note: This method is a placeholder and should be implemented with actual HTML parsing logic.
	 * @param {string} str - The XML string to decode.
	 * @returns {Promise<Object|Array>} - The decoded nano object or array.
	 */
	async decode(str) {
		throw new Error('XMLTransformer.decode() is not implemented yet')
	}
}
