import { clone } from "@nan0web/types"
import escape from "./escape.js"
import nano2attrs from "./nano2attrs.js"

/**
 * Determine whether a content value should be considered empty.
 * @param {*} content - The content to evaluate.
 * @returns {boolean} True when content is empty.
 */
function isContentEmpty(content) {
	if (true === content || null === content) return true
	if (Array.isArray(content) && 0 === content.length) return true
	if ('object' === typeof content && 0 === Object.keys(content).length) return true
	return false
}

/**
 * Check whether the content can be rendered on a single line.
 * @param {*} content - The content to evaluate.
 * @returns {boolean} True for primitive types.
 */
function isSingleLine(content) {
	return ['boolean', 'number', 'string'].includes(typeof content)
}

/**
 * Extract embedded tag attributes from a key using a mapping of separators.
 *
 * @param {string} key - The raw key (e.g. "div.main#id").
 * @param {Object<string,string>} $tagAttrs - Mapping of separators to attribute names.
 * @returns {[string,Object]} Tag name and attribute map.
 */
function getEmbedTagAttributes(key, $tagAttrs) {
	const separators = Object.keys($tagAttrs)
	const attrs = {}
	let nextElement = ''
	let currElement = ''
	let tag = key
	function commit() {
		if ('' === nextElement) {
			tag = currElement
		} else {
			const a = nextElement.startsWith('$') ? nextElement : `$${nextElement}`
			if (undefined === attrs[a]) {
				attrs[a] = currElement
			} else {
				attrs[a] += ' ' + currElement
			}
		}
	}
	for (let i = 0; i < key.length; i++) {
		const char = key.charAt(i)
		if (separators.includes(char)) {
			commit()
			nextElement = $tagAttrs[char]
			currElement = ''
		} else {
			currElement += char
		}
	}
	if (currElement) {
		commit()
	}
	return [tag, attrs]
}

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
function nano2xml(data, { indent = '\t', newLine = '\n', defaultTags = {} } = {}) {
	const nano = clone(data)

	/**
	 * Recursive conversion helper.
	 *
	 * @param {*} obj - Current data chunk.
	 * @param {string} [currentIndent=''] - Indentation for the current level.
	 * @param {string|null} [parent=null] - Parent tag name.
	 * @param {*} [prev=null] - Previous sibling.
	 * @returns {string} XML fragment.
	 */
	function convertToXml(obj, currentIndent = '', parent = null, prev = null) {
		let xml = ''

		// Handle arrays
		if (Array.isArray(obj)) {
			let p = prev
			const tag = defaultTags[parent ?? ""]
			xml += obj.map(el => {
				if (tag && 'object' === typeof el && el[tag] && Object.values(defaultTags).includes(tag)) {
					if (Object.keys(el).length <= 1) {
						el = el[tag]
					}
				}
				const isElNotTag = tag && 'undefined' === typeof el[tag]
				const xmlStr = convertToXml(isElNotTag ? { [tag]: el } : el, currentIndent, tag ?? parent, p)
				p = el
				return xmlStr
			}).join('')
		}

		// Handle objects
		else if ('object' === typeof obj && null !== obj) {
			const attrs = {}, comments = {}, tags = {}

			// Separate attributes, comments, and tags
			Object.entries(obj).forEach(([key, value]) => {
				if (key.startsWith('$')) attrs[key] = value
				else if (key.startsWith('#')) comments[key] = value
				else {
					const $tagAttrs = defaultTags.$tagAttrs
					if ('object' === typeof $tagAttrs && null !== $tagAttrs) {
						const [tag, found] = getEmbedTagAttributes(key, $tagAttrs)
						Object.entries(found).forEach(([a, v]) => {
							if (undefined === attrs[a]) attrs[a] = v
							else attrs[a] += ' ' + v
						})
						tags[tag] = value
					} else {
						tags[key] = value
					}
				}
			})

			// Use default tags if no valid tags exist
			if (Object.keys(tags).length === 0 && Object.keys(attrs).length) {
				const defaultTag = defaultTags[parent ?? ""] ?? defaultTags.$default
				if (defaultTag) tags[defaultTag] = true
			}

			// Render comments
			xml += Object.entries(comments).map(([comment, value]) => (
				`${newLine}${currentIndent}` +
				`<!-- ${comment.slice(1)}${value && value !== true ? `: ${value}` : ''} -->`
			)).join('')

			// Render tags
			xml += Object.entries(tags).map(([tag, content]) => {
				let $selfClosed = defaultTags.$selfClosed
				if ('function' === typeof $selfClosed) $selfClosed = $selfClosed.apply(defaultTags, [tag, content])
				const isSelfClosed = $selfClosed && isContentEmpty(content)
				/**
				 * @comment Handle the legacy (X|HT)ML versions.
				 */
				const selfClose = isSelfClosed ? (true === $selfClosed ? ' />' : $selfClosed) : ''
				const attrStr = nano2attrs(attrs, defaultTags)

				return (
					`${newLine}${currentIndent}` +
					`<${tag}${attrStr}` +
					(selfClose || (
						'>' +
						(isContentEmpty(content) ? `</${tag}>` :
							(convertToXml(content, currentIndent + indent, tag) +
								(isSingleLine(content) ? '' : `${newLine}${currentIndent}`)
							) +
							`</${tag}>`
						)
					))
				)
			}).join('')
		}

		// Handle primitive values
		else {
			const tag = defaultTags[parent ?? ""] ?? false
			if (tag) {
				xml += convertToXml({ [tag]: obj }, currentIndent, tag)
			} else {
				xml += escape(obj)
			}
		}
		if (!parent && !prev && newLine && xml.startsWith(newLine)) xml = xml.slice(1)
		return xml
	}
	return convertToXml(nano)
}

export default nano2xml
