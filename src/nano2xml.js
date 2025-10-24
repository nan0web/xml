import { clone } from "@nan0web/types"
import escape from "./escape.js"
import nano2attrs from "./nano2attrs.js"

/**
 * Determine whether a content value should be considered empty.
 * @param {*} content - The content to evaluate.
 * @returns {boolean} True when content is empty.
 */
function isContentEmpty(content) {
	if (true === content || null === content || '' === content) return true
	if (Array.isArray(content) && content.length === 0) return true
	if (typeof content === 'object' && content !== null && Object.keys(content).length === 0) return true
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
	let remaining = key
	const attrs = {}

	// Handle #id first to ensure id before class in insertion order
	const idMatch = remaining.match(/#([^\s.#]+)/)
	if (idMatch) {
		attrs.$id = idMatch[1]
		remaining = remaining.replace(idMatch[0], '')
	}

	// Handle .class multiple times
	let classStr = ''
	while (remaining.includes('.')) {
		const classMatch = remaining.match(/\.([^\s.#]+)/)
		if (classMatch) {
			classStr += (classStr ? ' ' : '') + classMatch[1]
			remaining = remaining.replace(classMatch[0], '')
		} else {
			break
		}
	}
	if (classStr) {
		attrs.$class = classStr
	}

	// Tag name is the remaining after removing leading separators
	const cleanTag = remaining.replace(/^[.#]*/, '')
	return [cleanTag, attrs]
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

		// Handle arrays - wrap each item in default tag if specified
		if (Array.isArray(obj)) {
			const tag = defaultTags[parent ?? '']
			xml += obj.map((el, index) => {
				let processedEl = el
				if (tag && typeof el === 'object' && el !== null && Object.values(defaultTags).includes(tag)) {
					if (Object.keys(el).length === 1 && el[tag] !== undefined) {
						processedEl = el[tag]
					}
				}
				const isElNotTag = tag && el[tag] === undefined
				const xmlStr = isElNotTag
					? convertToXml({ [tag]: processedEl }, currentIndent, parent, prev)
					: convertToXml(processedEl, currentIndent, tag ?? parent, prev)
				prev = el
				return xmlStr
			}).join('')
		}

		// Handle objects
		else if (typeof obj === 'object' && obj !== null) {
			const attrs = {}
			const comments = {}
			const tags = {}

			// Separate attributes, comments, processing instructions, and tags
			Object.entries(obj).forEach(([key, value]) => {
				if (key.startsWith('$')) {
					attrs[key] = value
				} else if (key.startsWith('#')) {
					comments[key] = value
				} else if (key.startsWith('?')) {
					tags[key] = value
				} else {
					const $tagAttrs = defaultTags.$tagAttrs
					if (typeof $tagAttrs === 'object' && $tagAttrs !== null && (key.includes('.') || key.includes('#'))) {
						const [tag, found] = getEmbedTagAttributes(key, $tagAttrs)
						Object.entries(found).forEach(([aKey, v]) => {
							if (attrs[aKey] === undefined) {
								attrs[aKey] = v
							} else {
								attrs[aKey] += ' ' + v
							}
						})
						tags[tag] = value
					} else {
						tags[key] = value
					}
				}
			})

			// Use default tag if no tags but has attrs
			if (Object.keys(tags).length === 0 && Object.keys(attrs).length > 0) {
				const defaultTag = defaultTags.$default
				if (defaultTag) {
					tags[defaultTag] = true
				}
			}

			// Render comments first
			xml += Object.entries(comments)
				.map(([comment, value]) => `${currentIndent}<!-- ${comment.slice(1)}${value !== true && value ? `: ${value}` : ''} -->${newLine}`)
				.join('')

			// Render tags/processing instructions
			xml += Object.entries(tags)
				.map(([tag, content]) => {
					let $selfClosed = defaultTags.$selfClosed
					if (typeof $selfClosed === 'function') {
						$selfClosed = $selfClosed.call(defaultTags, tag, content)
					}
					const isSelfClosed = !!$selfClosed && isContentEmpty(content)

					// Special handling for processing instructions
					if (tag.startsWith('?')) {
						const attrStr = nano2attrs(attrs, defaultTags)
						const closeStr = $selfClosed || '?>'
						return `<${tag}${attrStr}${closeStr}${newLine}`
					}

					const attrStr = nano2attrs(attrs, defaultTags)

					if (isSelfClosed) {
						const closeStr = typeof $selfClosed === 'boolean' ? ' />' : $selfClosed
						return `${currentIndent}<${tag}${attrStr}${closeStr}${newLine}`
					}

					const fullOpen = `${currentIndent}<${tag}${attrStr}>`
					const fullClose = `${currentIndent}</${tag}>`

					if (isContentEmpty(content)) {
						return `${fullOpen}${fullClose}${newLine}`
					}

					if (isSingleLine(content)) {
						return `${fullOpen}${escape(content)}${fullClose}${newLine}`
					}

					// Block content
					const contentOutput = convertToXml(content, currentIndent + indent, tag)
					const adjustedContent = contentOutput.endsWith(newLine)
						? contentOutput.slice(0, -newLine.length)
						: contentOutput
					return `${fullOpen}${newLine}${adjustedContent}${newLine}${fullClose}`
				})
				.join('')

			// Trim trailing newline if present
			if (xml.endsWith(newLine)) {
				xml = xml.slice(0, -newLine.length)
			}
		}

		// Handle primitives
		else {
			const tag = defaultTags[parent ?? ""] ?? false
			xml += tag ? convertToXml({ [tag]: obj }, currentIndent, parent) : escape(obj)
		}

		// Trim leading newline for root
		if (currentIndent === '' && xml.startsWith(newLine)) {
			xml = xml.slice(newLine.length)
		}

		return xml
	}

	return convertToXml(nano, '', null, null)
}

export default nano2xml
