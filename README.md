# @nan0web/xml

XML transformer and utilities.

|[Status](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв)|Documentation|Test coverage|Features|Npm version|
|---|---|---|---|---|
 |🟢 `98.6%` |🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/xml/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/xml/blob/main/docs/uk/README.md) |🟢 `93.5%` |✅ d.ts 📜 system.md 🕹️ playground |— |

## Description

The `@nan0web/xml` package provides a minimal yet powerful foundation for transforming nano-style JavaScript objects into XML and handling common XML-related utilities.
Core features:

- `Case` — Utilities for string case transformation (camel, kebab, snake, etc.).
- `escape` — Escapes unsafe characters in XML strings.
- `nano2attrs` — Converts an attribute object to an XML attribute string.
- `nano2xml` — Converts a nano-style JS object or array into a well-formed XML string.
- `XMLTags` — Configurable tag name mappings and self-closing logic.
- `XMLTransformer` — A full transformer class encoding nano objects to XML.

These tools are ideal for generating sitemaps, atom feeds, configuration files,
or any structured XML output from lightweight JavaScript structures — no DOM required.

## Installation

How to install with npm?
```bash
npm install @nan0web/xml
```

How to install with pnpm?
```bash
pnpm add @nan0web/xml
```

How to install with yarn?
```bash
yarn add @nan0web/xml
```

## Usage

### String Case Transformation

Use `Case` utilities to transform strings between different naming conventions.

How to transform strings between different cases?
```js
import { Case } from '@nan0web/xml'
console.info(Case.toCamelCase('hello-world'))     // ← helloWorld
console.info(Case.toKebabCase('helloWorld'))      // ← hello-world
console.info(Case.toSnakeCase('helloWorld'))      // ← hello_world
console.info(Case.toPascalCase('hello-world'))    // ← HelloWorld
console.info(Case.toUpperCase('hello'))           // ← HELLO
console.info(Case.toLowerCase('HELLO'))           // ← hello
```

How to use Case.transform with type constants?
```js
import { Case } from '@nan0web/xml'
const input = 'my_string-value'
console.info(Case.transform(input, Case.CAMEL))   // ← myStringValue
console.info(Case.transform(input, Case.KEBAB))   // ← my-string-value
console.info(Case.transform(input, Case.SNAKE))   // ← my_string_value
console.info(Case.transform(input, Case.PASCAL))  // ← MyStringValue
console.info(Case.transform(input, Case.UPPER))   // ← MYSTRINGVALUE
console.info(Case.transform('MyVar', Case.LOWER)) // ← myvar
```
### Escaping Unsafe Characters

Use `escape()` to safely encode special characters in XML content.

How to escape unsafe XML characters?
```js
import { escape } from '@nan0web/xml'
const input = `&<>"'`
const result = escape(input)
console.info(result) // ← &amp;&lt;&gt;&quot;&#039;
```

How to escape while ignoring certain characters?
```js
import { escape } from '@nan0web/xml'
const input = `&<>"'`
const result = escape(input, ['<', '>'])
console.info(result) // ← &amp;<>&quot;&#039;
```

How to escape non-string primitives?
```js
import { escape } from '@nan0web/xml'
console.info(escape(123)) // ← 123
console.info(escape(true)) // ← true
console.info(escape(BigInt(420))) // ← 420
```
### Converting Attributes to XML Strings

Use `nano2attrs` to convert an object of attributes into a serialized string.

How to convert attributes object to XML attribute string?
```js
import { nano2attrs } from '@nan0web/xml'
const attrs = { $id: 'main', $hidden: true, $title: 'Hello & World' }
const result = nano2attrs(attrs)
console.info(result) // ← ` id="main" hidden title="Hello &amp; World"`
```

How to customize attribute case and true suffix?
```js
import { nano2attrs, Case } from '@nan0web/xml'
const attrs = { $dataValue: 'test', $active: true }
const defaultTags = { $attrCase: Case.UPPER, $attrTrue: '_present' }
const result = nano2attrs(attrs, defaultTags)
console.info(result) // ← ` DATAVALUE="test" ACTIVE_present`
```

How to skip undefined attributes in output?
```js
import { nano2attrs } from '@nan0web/xml'
const attrs = { $id: 'test', $class: undefined, $value: 'ok' }
const result = nano2attrs(attrs)
console.info(result) // ← ` id="test" value="ok"`
```
### Converting Nano Objects to XML

Use `nano2xml` to convert JavaScript objects or arrays into XML strings.

How to convert a simple object to XML?
```js
import { nano2xml } from '@nan0web/xml'
const data = { $id: "1", note: "Hello" }
const xml = nano2xml(data, { indent: '  ', newLine: '\n' })
console.info(xml) // ← `<note id="1">Hello</note>`
```

How to handle arrays with default tag wrapping?
```js
import { nano2xml } from '@nan0web/xml'
const data = [{ item: 'A' }, { item: 'B' }]
const xml = nano2xml(data, {
	indent: '',
	newLine: '',
	defaultTags: { '': 'item' }
})
console.info(xml) // ← `<item>A</item><item>B</item>`
```

How to handle self-closed tags?
```js
import { nano2xml } from '@nan0web/xml'
const data = { img: true, $src: 'pic.png' }
const xml = nano2xml(data, {
	defaultTags: {
		$selfClosed: (tag) => tag === 'img' && true,
		$attrCase: 'kebab'
	}
})
console.info(xml.trim()) // ← `<img src="pic.png" />`
```

How to handle empty content and self-closing logic?
```js
import { nano2xml } from '@nan0web/xml'
const data = { br: '' }
const defaultTags = { $selfClosed: true }
const xml = nano2xml(data, { defaultTags })
console.info(xml) // ← `<br />`
```

How to render comments in XML?
```js
import { nano2xml } from '@nan0web/xml'
const data = { root: true, '#comment': 'This is a comment' }
const xml = nano2xml(data, { indent: '\t', newLine: '\n' })
console.info(xml) // ← `<!-- comment: This is a comment -->\n<root></root>`
```

How to render element with embedded attributes (e.g. div.main#id)?
```js
import { nano2xml } from '@nan0web/xml'
const data = { 'div.container#main': 'Content' }
const defaultTags = { $tagAttrs: { '#': 'id', '.': 'class' } }
const xml = nano2xml(data, { defaultTags })
console.info(xml) // ← `<div id="main" class="container">Content</div>`
```
### Using XMLTags Configuration

Use `XMLTags` to define default tag mappings and self-closing behavior.

How to create and use custom XMLTags configuration?
```js
import { XMLTags } from '@nan0web/xml'
const tags = new XMLTags()
console.info(tags.$default) // ← element
console.info(tags.books) // ← book
console.info(tags.library) // ← section
console.info(tags.$selfClosed('note')) // ← ></note>
console.info(tags.$selfClosed('?xml')) // ← ?>
```
### Using XMLTransformer

Use `XMLTransformer` class for a consistent way to encode nano objects to XML.

How to create XMLTransformer with default options?
```js
import { XMLTransformer } from '@nan0web/xml'
const transformer = new XMLTransformer()
console.info(transformer.tab) // ← \t
console.info(transformer.eol) // ← \n
console.info(transformer.defaultTags instanceof XMLTags) // ← true
```

How to create XMLTransformer with custom options?
```js
import { XMLTransformer, XMLTags } from '@nan0web/xml'
const customTags = new XMLTags()
const transformer = new XMLTransformer({
	tab: '  ',
	eol: '\r\n',
	defaultTags: customTags
})
console.info(transformer.tab) // ←    (2 spaces)
console.info(transformer.eol) // ← \r\n
console.info(transformer.defaultTags) // ← XMLTags { ... }
```

How to encode data to XML using XMLTransformer?
```js
import { XMLTransformer } from '@nan0web/xml'
const transformer = new XMLTransformer()
const data = { note: 'Hello World' }
const xml = await transformer.encode(data)
console.info(xml) // ← `<note>Hello World</note>`
```

How to ensure decode method is not implemented yet?
```js
import { XMLTransformer } from '@nan0web/xml'
const transformer = new XMLTransformer()
const xmlString = '<note>Hello</note>'
await assert.rejects(
	async () => await transformer.decode(xmlString),
	{ message: 'XMLTransformer.decode() is not implemented yet' }
)
```
## API

### Case

Utility class for transforming string cases.

* **Static Constants**
  * `Case.CAMEL` – "camel"
  * `Case.KEBAB` – "kebab"
  * `Case.SNAKE` – "snake"
  * `Case.PASCAL` – "pascal"
  * `Case.UPPER` – "upper"
  * `Case.LOWER` – "lower"

* **Methods**
  * `toCamelCase(str)` – converts to camelCase.
  * `toKebabCase(str)` – converts to kebab-case.
  * `toSnakeCase(str)` – converts to snake_case.
  * `toPascalCase(str)` – converts to PascalCase.
  * `toUpperCase(str)` – converts to UPPERCASE.
  * `toLowerCase(str)` – converts to lowercase.
  * `static transform(str, type)` – applies the given case transformation.

### escape(unsafe, ignore = [])

Escapes XML special characters in a string.
* **Parameters**
  * `unsafe` – Value to escape (string, number, boolean, bigint).
  * `ignore` – Optional array of characters to skip escaping.
* **Returns** – Escaped string.

### nano2attrs(attrs, defaultTags = {})

Converts attribute object to XML attribute string.
* **Parameters**
  * `attrs` – Object where keys start with `$`.
  * `defaultTags` – Configuration object with `$attrCase` and `$attrTrue`.
* **Returns** – Serialized attribute string (with leading spaces).

### nano2xml(data, { indent, newLine, defaultTags })

Converts a nano-style JS object/array to XML string.
* **Parameters**
  * `data` – Input data structure.
  * `indent` – Indentation string (default: `\t`).
  * `newLine` – New line string (default: `\n`).
  * `defaultTags` – Tag configuration (e.g. `$selfClosed`, `$tagAttrs`, case rules).
* **Returns** – Formatted XML string.

### XMLTags

Default tag mappings and helper methods.
* **Properties**
  * `$default` – Fallback tag name.
  * `books`, `library`, `catalog`, `employees`, `department` – Built-in tag mappings.
* **Methods**
  * `$selfClosed(tag)` – Returns `?>` for PI tags, `></tag>` otherwise.

### XMLTransformer

Class to encode nano objects to XML.
* **Properties**
  * `tab` – Indentation string.
  * `eol` – Line ending string.
  * `defaultTags` – XMLTags instance.
* **Methods**
  * `constructor(options)` – Accepts `tab`, `eol`, `defaultTags`.
  * `encode(data)` – Converts nano object to XML string.
  * `decode(str)` – *(Not implemented)* Throws error.

All exported functions and classes should be available

## Java•Script

Uses `d.ts` files for autocompletion

## CLI Playground

Run playground script to test examples locally.

How to run playground script?
```bash
# Clone the repository and run the playground
git clone https://github.com/nan0web/xml.git
cd xml
npm install
npm run play
```

## Contributing

How to contribute? - [check here](./CONTRIBUTING.md)

## License

How to license ISC? - [check here](./LICENSE)
