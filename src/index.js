import Case from "./Case.js"
import escape from "./escape.js"
import nano2attrs from "./nano2attrs.js"
import nano2xml from "./nano2xml.js"
import XMLTags from "./XMLTags.js"

const defaultXMLTags = new XMLTags()

export {
	Case,
	escape,
	nano2attrs,
	nano2xml,
	defaultXMLTags,
	XMLTags,
}

export default nano2xml
