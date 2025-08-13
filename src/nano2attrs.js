import Case from "./Case.js"
import escape from "./escape.js"

/**
 * Convert an attributes object to a string suitable for an XML tag.
 *
 * @param {Object<string,any>} attrs - Attribute map where keys start with `$`.
 * @param {Object<string,any>} [defaultTags={}] - Configuration allowing case overrides.
 * @returns {string} Serialized attribute string (including leading spaces).
 */
function nano2attrs(attrs, defaultTags = {}) {
	return Object.entries(attrs).map(([attr, value]) => {
		if (undefined === value) return ''
		const name = Case.transform(attr.slice(1), defaultTags.$attrCase ?? Case.KEBAB)
		return (true === value
			? ` ${name}${defaultTags.$attrTrue ?? ''}`
			: ` ${name}="${escape(value)}"`
		)
	}).join('')
}

export default nano2attrs