import { strictEqual } from 'node:assert'
import { fileURLToPath } from 'node:url'
import { readFile, unlink } from 'node:fs/promises'
import { rollup } from 'rollup'
import tehanu from 'tehanu'
import { minify } from '../lib/index.js'

const test = tehanu(fileURLToPath(import.meta.url))
let bundle

test.before(async () => {
  try {
    await unlink('test/out.js')
  // eslint-disable-next-line no-empty
  } catch {}
  try {
    await unlink('test/out.js.map')
  // eslint-disable-next-line no-empty
  } catch {}

  bundle = await rollup({ input: 'test/entry.js' })
})

test('minify iife', async () => {
  await bundle.write({
    plugins: [minify()],
    file: 'test/out.js',
    strict: false,
    format: 'iife',
    name: 'glob'
  })

  const code = await readFile('test/out.js', 'utf8')
  strictEqual(code, 'var glob=function(l){var o=()=>{({}!==void 0)&&console.log("glob")};function n(){console.log("help")}return l.glob=o,l.help=n,l}({});\n')
})

test('minify umd', async () => {
  await bundle.write({
    plugins: [minify()],
    file: 'test/out.js',
    strict: false,
    format: 'umd',
    name: 'glob'
  })

  const code = await readFile('test/out.js', 'utf8')
  strictEqual(code, '(function(e,o){typeof exports=="object"&&typeof module<"u"?o(exports):typeof define=="function"&&define.amd?define(["exports"],o):(e=typeof globalThis<"u"?globalThis:e||self,o(e.glob={}))})(this,function(e){var o=()=>{({}!==void 0)&&console.log("glob")};function n(){console.log("help")}e.glob=o,e.help=n});\n')
})

test('minify cjs', async () => {
  await bundle.write({
    plugins: [minify()],
    file: 'test/out.js',
    strict: false,
    format: 'cjs'
  })

  const code = await readFile('test/out.js', 'utf8')
  strictEqual(code, 'var l=()=>{({}!==void 0)&&console.log("glob")};function o(){console.log("help")}exports.glob=l,exports.help=o;\n')
})

test('minify es', async () => {
  await bundle.write({
    plugins: [minify()],
    file: 'test/out.js'
  })

  const code = await readFile('test/out.js', 'utf8')
  strictEqual(code, 'var o=()=>{({}!==void 0)&&console.log("glob")};function l(){console.log("help")}export{o as glob,l as help};\n')
})

test('minify with source map', async () => {
  await bundle.write({
    plugins: [minify({ logLevel: 'error', logLimit: 0 })],
    file: 'test/out.js',
    sourcemap: true
  })

  const code = await readFile('test/out.js', 'utf8')
  const map = await readFile('test/out.js.map', 'utf8')
  strictEqual(code, `var o=()=>{({}!==void 0)&&console.log("glob")};function l(){console.log("help")}export{o as glob,l as help};
//# sourceMappingURL=out.js.map
`)
  strictEqual(map, `{"version":3,"file":"out.js","sources":["glob.js","help.js"],"sourcesContent":["export default () => {\\n  if (this !== {})\\n    console.log('glob')\\n}\\n","//! prints usage instructions\\nexport function help() {\\n  console.log('help')\\n}\\n"],"names":["glob","this","help"],"mappings":"AAAA,IAAAA,EAAe,IAAM,EACN,CAAE,IAAXC,SACF,QAAQ,IAAI,MAAM,CACtB,ECFO,SAASC,GAAO,CACrB,QAAQ,IAAI,MAAM,CACpB"}`)
})

test('minify with legal comments', async () => {
  await bundle.write({
    plugins: [minify({ legalComments: 'inline' })],
    file: 'test/out.js'
  })

  const code = await readFile('test/out.js', 'utf8')
  strictEqual(code, 'var o=()=>{({}!==void 0)&&console.log("glob")};//! prints usage instructions\nfunction l(){console.log("help")}export{o as glob,l as help};\n')
})

test('clean up', async () => {
  await bundle.write({
    plugins: [minify({ minify: false })],
    file: 'test/out.js'
  })

  const code = await readFile('test/out.js', 'utf8')
  strictEqual(code, 'var glob = () => {\n' +
    '  if (void 0 !== {})\n' +
    '    console.log("glob");\n' +
    '};\n' +
    'function help() {\n' +
    '  console.log("help");\n' +
    '}\n' +
    'export { glob, help };\n')
})
