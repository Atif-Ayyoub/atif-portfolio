const fs = require('fs')
const path = require('path')

function readPng(filePath) {
  return fs.readFileSync(path.resolve(process.cwd(), filePath))
}

function pngWidthHeight(pngBuffer) {
  const width = pngBuffer.readUInt32BE(16)
  const height = pngBuffer.readUInt32BE(20)
  return { width, height }
}

function buildIco(pngFiles, outFile) {
  const pngBuffers = pngFiles.map(readPng)
  const count = pngBuffers.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(count, 4)

  const entries = Buffer.alloc(16 * count)
  let offset = 6 + 16 * count
  const images = []

  for (let i = 0; i < count; i++) {
    const img = pngBuffers[i]
    const { width, height } = pngWidthHeight(img)
    const w = width >= 256 ? 0 : width
    const h = height >= 256 ? 0 : height
    const bytesInRes = img.length

    entries.writeUInt8(w, i * 16 + 0)
    entries.writeUInt8(h, i * 16 + 1)
    entries.writeUInt8(0, i * 16 + 2)
    entries.writeUInt8(0, i * 16 + 3)
    entries.writeUInt16LE(0, i * 16 + 4)
    entries.writeUInt16LE(0, i * 16 + 6)
    entries.writeUInt32LE(bytesInRes, i * 16 + 8)
    entries.writeUInt32LE(offset, i * 16 + 12)

    offset += bytesInRes
    images.push(img)
  }

  const out = Buffer.concat([header, entries, ...images])
  fs.writeFileSync(path.resolve(process.cwd(), outFile), out)
}

const inputs = [
  'public/favicon-32x32.png',
  'public/favicon-16x16.png'
]
const out = 'public/favicon.ico'

try {
  buildIco(inputs, out)
  console.log('Wrote', out)
} catch (err) {
  console.error('Failed to build ICO:', err)
  process.exit(1)
}
