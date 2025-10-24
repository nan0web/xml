import { describe, it, before, beforeEach } from "node:test"
import assert from "node:assert/strict"
import FS from "@nan0web/db-fs"
import { NoConsole } from "@nan0web/log"
import {
	DatasetParser,
	DocsParser,
	runSpawn,
} from "@nan0web/test"
import {
	Case,
	escape,
	nano2attrs,
	nano2xml,
	XMLTransformer,
	XMLTags,
} from "./index.js"

const fs = new FS()
let pkg

before(async () => {
	const doc = await fs.loadDocument("package.json", {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/xml
	 *
	 * XML transformer and utilities.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 *
	 * The `@nan0web/xml` package provides a minimal yet powerful foundation for transforming nano-style JavaScript objects into XML and handling common XML-related utilities.
	 * Core features:
	 *
	 * - `Case` — Utilities for string case transformation (camel, kebab, snake, etc.).
	 * - `escape` — Escapes unsafe characters in XML strings.
	 * - `nano2attrs` — Converts an attribute object to an XML attribute string.
	 * - `nano2xml` — Converts a nano-style JS object or array into a well-formed XML string.
	 * - `XMLTags` — Configurable tag name mappings and self-closing logic.
	 * - `XMLTransformer` — A full transformer class encoding nano objects to XML.
	 *
	 * These tools are ideal for generating sitemaps, atom feeds, configuration files,
	 * or any structured XML output from lightweight JavaScript structures — no DOM required.
	 *
	 * ## Installation
	 */
	it("How to install with npm?", () => {
		/**
		 * ```bash
		 * npm install @nan0web/xml
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/xml")
	})
	/**
	 * @docs
	 */
	it("How to install with pnpm?", () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/xml
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/xml")
	})
	/**
	 * @docs
	 */
	it("How to install with yarn?", () => {
		/**
		 * ```bash
		 * yarn add @nan0web/xml
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/xml")
	})

	/**
	 * @docs
	 * ## Usage
	 *
	 * ### String Case Transformation
	 *
	 * Use `Case` utilities to transform strings between different naming conventions.
	 */
	it("How to transform strings between different cases?", () => {
		//import { Case } from '@nan0web/xml'
		assert.equal(Case.toCamelCase('hello-world'), 'helloWorld')
		assert.equal(Case.toKebabCase('helloWorld'), 'hello-world')
		assert.equal(Case.toSnakeCase('helloWorld'), 'hello_world')
		assert.equal(Case.toPascalCase('hello-world'), 'HelloWorld')
		assert.equal(Case.toUpperCase('hello'), 'HELLO')
		assert.equal(Case.toLowerCase('HELLO'), 'hello')
	})
	/**
	 * @docs
	 */
	it("How to use Case.transform with type constants?", () => {
		//import { Case } from '@nan0web/xml'
		const input = 'my_string-value'
		assert.equal(Case.transform(input, Case.CAMEL), 'myStringValue')
		assert.equal(Case.transform(input, Case.KEBAB), 'my-string-value')
		assert.equal(Case.transform(input, Case.SNAKE), 'my_string_value')
		assert.equal(Case.transform(input, Case.PASCAL), 'MyStringValue')
		assert.equal(Case.transform(input, Case.UPPER), 'MYSTRINGVALUE')
		assert.equal(Case.transform('MyVar', Case.LOWER), 'myvar')
	})

	/**
	 * @docs
	 * ### Escaping Unsafe Characters
	 *
	 * Use `escape()` to safely encode special characters in XML content.
	 */
	it("How to escape unsafe XML characters?", () => {
		//import { escape } from '@nan0web/xml'
		const input = `&<>"'`
		const result = escape(input)
		console.info(result)
		assert.equal(console.output()[0][1], '&amp;&lt;&gt;&quot;&#039;')
	})
	/**
	 * @docs
	 */
	it("How to escape while ignoring certain characters?", () => {
		//import { escape } from '@nan0web/xml'
		const input = `&<>"'`
		const result = escape(input, ['<', '>'])
		console.info(result)
		assert.equal(console.output()[0][1], '&amp;<>&quot;&#039;')
	})
	/**
	 * @docs
	 */
	it("How to escape non-string primitives?", () => {
		//import { escape } from '@nan0web/xml'
		console.info(escape(123))
		console.info(escape(true))
		console.info(escape(BigInt(42)))
		assert.equal(console.output()[0][1], '123')
		assert.equal(console.output()[1][1], 'true')
		assert.equal(console.output()[2][1], '42')
	})

	/**
	 * @docs
	 * ### Converting Attributes to XML Strings
	 *
	 * Use `nano2attrs` to convert an object of attributes into a serialized string.
	 */
	it("How to convert attributes object to XML attribute string?", () => {
		//import { nano2attrs } from '@nan0web/xml'
		const attrs = { $id: 'main', $hidden: true, $title: 'Hello & World' }
		const result = nano2attrs(attrs)
		console.info(result)
		assert.equal(console.output()[0][1], ' id="main" hidden title="Hello &amp; World"')
	})
	/**
	 * @docs
	 */
	it("How to customize attribute case and true suffix?", () => {
		//import { nano2attrs, Case } from '@nan0web/xml'
		const attrs = { $dataValue: 'test', $active: true }
		const defaultTags = { $attrCase: Case.UPPER, $attrTrue: '_present' }
		const result = nano2attrs(attrs, defaultTags)
		console.info(result)
		assert.equal(console.output()[0][1], ' DATAVALUE="test" ACTIVE_present')
	})
	/**
	 * @docs
	 */
	it("How to skip undefined attributes in output?", () => {
		//import { nano2attrs } from '@nan0web/xml'
		const attrs = { $id: 'test', $class: undefined, $value: 'ok' }
		const result = nano2attrs(attrs)
		console.info(result)
		assert.equal(console.output()[0][1], ' id="test" value="ok"')
	})

	/**
	 * @docs
	 * ### Converting Nano Objects to XML
	 *
	 * Use `nano2xml` to convert JavaScript objects or arrays into XML strings.
	 */
	it("How to convert a simple object to XML?", () => {
		//import { nano2xml } from '@nan0web/xml'
		const data = { $id: "1", note: "Hello" }
		const xml = nano2xml(data, { indent: '  ', newLine: '\n' })
		console.info(xml)
		assert.equal(console.output()[0][1].trim(), '<note id="1">Hello</note>')
	})
	/**
	 * @docs
	 */
	it("How to handle self-closed tags?", () => {
		//import { nano2xml } from '@nan0web/xml'
		const data = { img: true, $src: 'pic.png' }
		const xml = nano2xml(data, {
			defaultTags: {
				$selfClosed: (tag) => tag === 'img' && true,
				$attrCase: 'kebab'
			}
		})
		console.info(xml.trim())
		assert.equal(console.output()[0][1], '<img src="pic.png" />')
	})
	/**
	 * @docs
	 */
	it("How to handle empty content and self-closing logic?", () => {
		//import { nano2xml } from '@nan0web/xml'
		const data = { br: '' }
		const defaultTags = { $selfClosed: true }
		const xml = nano2xml(data, { defaultTags })
		console.info(xml)
		assert.equal(console.output()[0][1], '<br />')
	})
	/**
	 * @docs
	 */
	it("How to render comments in XML?", () => {
		//import { nano2xml } from '@nan0web/xml'
		const data = { root: true, '#comment': 'This is a comment' }
		const xml = nano2xml(data, { indent: '\t', newLine: '\n' })
		console.info(xml)
		assert.equal(console.output()[0][1], '<!-- comment: This is a comment -->\n<root></root>')
	})
	/**
	 * @docs
	 */
	it("How to render element with embedded attributes (e.g. div.main\#id)?", () => {
		//import { nano2xml } from '@nan0web/xml'
		const data = { 'div.container#main': 'Content' }
		const defaultTags = { $tagAttrs: { '#': 'id', '.': 'class' } }
		const xml = nano2xml(data, { defaultTags })
		console.info(xml)
		assert.equal(console.output()[0][1], '<div id="main" class="container">Content</div>')
	})

	/**
	 * @docs
	 * ### Using XMLTags Configuration
	 *
	 * Use `XMLTags` to define default tag mappings and self-closing behavior.
	 */
	it("How to create and use custom XMLTags configuration?", () => {
		//import { XMLTags } from '@nan0web/xml'
		const tags = new XMLTags()
		assert.equal(tags.$default, 'element')
		assert.equal(tags.books, 'book')
		assert.equal(tags.library, 'section')
		assert.equal(tags.$selfClosed('note'), '></note>')
		assert.equal(tags.$selfClosed('?xml'), '?>')
	})

	/**
	 * @docs
	 * ### Using XMLTransformer
	 *
	 * Use `XMLTransformer` class for a consistent way to encode nano objects to XML.
	 */
	it("How to create XMLTransformer with default options?", () => {
		//import { XMLTransformer } from '@nan0web/xml'
		const transformer = new XMLTransformer()
		assert.equal(transformer.tab, '\t')
		assert.equal(transformer.eol, '\n')
		assert.ok(transformer.defaultTags instanceof XMLTags)
	})
	/**
	 * @docs
	 */
	it("How to create XMLTransformer with custom options?", () => {
		//import { XMLTransformer, XMLTags } from '@nan0web/xml'
		const customTags = new XMLTags()
		const transformer = new XMLTransformer({
			tab: '  ',
			eol: '\r\n',
			defaultTags: customTags
		})
		assert.equal(transformer.tab, '  ')
		assert.equal(transformer.eol, '\r\n')
		assert.strictEqual(transformer.defaultTags, customTags)
	})
	/**
	 * @docs
	 */
	it("How to encode data to XML using XMLTransformer?", async () => {
		//import { XMLTransformer } from '@nan0web/xml'
		const transformer = new XMLTransformer()
		const data = { note: 'Hello World' }
		const xml = await transformer.encode(data)
		console.info(xml)
		assert.equal(console.output()[0][1], '<note>Hello World</note>')
	})
	/**
	 * @docs
	 */
	it("How to ensure decode method is not implemented yet?", async () => {
		//import { XMLTransformer } from '@nan0web/xml'
		const transformer = new XMLTransformer()
		const xmlString = '<note>Hello</note>'
		await assert.rejects(
			async () => await transformer.decode(xmlString),
			{ message: 'XMLTransformer.decode() is not implemented yet' }
		)
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### Case
	 *
	 * Utility class for transforming string cases.
	 *
	 * * **Static Constants**
	 *   * `Case.CAMEL` – "camel"
	 *   * `Case.KEBAB` – "kebab"
	 *   * `Case.SNAKE` – "snake"
	 *   * `Case.PASCAL` – "pascal"
	 *   * `Case.UPPER` – "upper"
	 *   * `Case.LOWER` – "lower"
	 *
	 * * **Methods**
	 *   * `toCamelCase(str)` – converts to camelCase.
	 *   * `toKebabCase(str)` – converts to kebab-case.
	 *   * `toSnakeCase(str)` – converts to snake_case.
	 *   * `toPascalCase(str)` – converts to PascalCase.
	 *   * `toUpperCase(str)` – converts to UPPERCASE.
	 *   * `toLowerCase(str)` – converts to lowercase.
	 *   * `static transform(str, type)` – applies the given case transformation.
	 *
	 * ### escape(unsafe, ignore = [])
	 *
	 * Escapes XML special characters in a string.
	 * * **Parameters**
	 *   * `unsafe` – Value to escape (string, number, boolean, bigint).
	 *   * `ignore` – Optional array of characters to skip escaping.
	 * * **Returns** – Escaped string.
	 *
	 * ### nano2attrs(attrs, defaultTags = {})
	 *
	 * Converts attribute object to XML attribute string.
	 * * **Parameters**
	 *   * `attrs` – Object where keys start with `$`.
	 *   * `defaultTags` – Configuration object with `$attrCase` and `$attrTrue`.
	 * * **Returns** – Serialized attribute string (with leading spaces).
	 *
	 * ### nano2xml(data, { indent, newLine, defaultTags })
	 *
	 * Converts a nano-style JS object/array to XML string.
	 * * **Parameters**
	 *   * `data` – Input data structure.
	 *   * `indent` – Indentation string (default: `\t`).
	 *   * `newLine` – New line string (default: `\n`).
	 *   * `defaultTags` – Tag configuration (e.g. `$selfClosed`, `$tagAttrs`, case rules).
	 * * **Returns** – Formatted XML string.
	 *
	 * ### XMLTags
	 *
	 * Default tag mappings and helper methods.
	 * * **Properties**
	 *   * `$default` – Fallback tag name.
	 *   * `books`, `library`, `catalog`, `employees`, `department` – Built-in tag mappings.
	 * * **Methods**
	 *   * `$selfClosed(tag)` – Returns `?>` for PI tags, `></tag>` otherwise.
	 *
	 * ### XMLTransformer
	 *
	 * Class to encode nano objects to XML.
	 * * **Properties**
	 *   * `tab` – Indentation string.
	 *   * `eol` – Line ending string.
	 *   * `defaultTags` – XMLTags instance.
	 * * **Methods**
	 *   * `constructor(options)` – Accepts `tab`, `eol`, `defaultTags`.
	 *   * `encode(data)` – Converts nano object to XML string.
	 *   * `decode(str)` – *(Not implemented)* Throws error.
	 */
	it("All exported functions and classes should be available", () => {
		assert.ok(Case)
		assert.ok(escape)
		assert.ok(nano2attrs)
		assert.ok(nano2xml)
		assert.ok(XMLTags)
		assert.ok(XMLTransformer)
	})

	/**
	 * @docs
	 * ## Java•Script
	 */
	it("Uses `d.ts` files for autocompletion", () => {
		assert.equal(pkg.types, "./types/index.d.ts")
	})

	/**
	 * @docs
	 * ## CLI Playground
	 *
	 * Run playground script to test examples locally.
	 */
	it("How to run playground script?", async () => {
		/**
		 * ```bash
		 * # Clone the repository and run the playground
		 * git clone https://github.com/nan0web/xml.git
		 * cd xml
		 * npm install
		 * npm run playground
		 * ```
		 */
		assert.ok(String(pkg.scripts?.playground))
		const response = await runSpawn("git", ["remote", "get-url", "origin"])
		assert.ok(response.code === 0, "git command fails (e.g., not in a git repo)")
		assert.ok(response.text.trim().endsWith(":nan0web/xml.git"))
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it("How to contribute? - [check here](./CONTRIBUTING.md)", async () => {
		assert.equal(pkg.scripts?.precommit, "npm test")
		assert.equal(pkg.scripts?.prepush, "npm test")
		assert.equal(pkg.scripts?.prepare, "husky")
		const text = await fs.loadDocument("CONTRIBUTING.md")
		const str = String(text)
		assert.ok(str.includes("# Contributing"))
	})

	/**
	 * @docs
	 * ## License
	 */
	it("How to license ISC? - [check here](./LICENSE)", async () => {
		assert.ok(String(await fs.loadDocument("LICENSE")).includes("ISC"))
	})
}

describe("README.md testing", testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument(".datasets/README.dataset.jsonl", dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const saved = await fs.loadDocument("README.md")
		assert.ok(saved.includes("## License"))
	})
})
