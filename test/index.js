import { strictEqual } from 'assert'
import { fileURLToPath } from 'url'
import { readFile, unlink } from 'fs/promises'
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
  strictEqual(code, 'var glob=function(e){var l=()=>{({}!==void 0)&&console.log("glob")};function o(){console.log("help")}return e.glob=l,e.help=o,Object.defineProperty(e,"__esModule",{value:!0}),e}({});\n')
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
  strictEqual(code, '(function(e,o){typeof exports=="object"&&typeof module<"u"?o(exports):typeof define=="function"&&define.amd?define(["exports"],o):(e=typeof globalThis<"u"?globalThis:e||self,o(e.glob={}))})(this,function(e){var o=()=>{({}!==void 0)&&console.log("glob")};function n(){console.log("help")}e.glob=o,e.help=n,Object.defineProperty(e,"__esModule",{value:!0})});\n')
})

test('minify cjs', async () => {
  await bundle.write({
    plugins: [minify()],
    file: 'test/out.js',
    strict: false,
    format: 'cjs'
  })

  const code = await readFile('test/out.js', 'utf8')
  strictEqual(code, 'Object.defineProperty(exports,"__esModule",{value:!0});var e=()=>{({}!==void 0)&&console.log("glob")};function l(){console.log("help")}exports.glob=e,exports.help=l;\n')
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
  strictEqual(map, `{"version":3,"file":"out.js","sources":["glob.js","help.js"],"sourcesContent":["export default () => {\\n  if (this !== {})\\n    console.log('glob')\\n}\\n","export function help() {\\n  console.log('help')\\n}\\n"],"names":["this"],"mappings":"AAAA,GAAA,GAAe,IAAM,CACnB,AAAIA,CAAS,CAAE,IAAXA,SACF,QAAQ,IAAI,MAAM,CACtB,ECHO,YAAgB,CACrB,QAAQ,IAAI,MAAM,CACpB"}`)
})
