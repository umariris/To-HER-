// Generates a tiny noise tile PNG for the vintage paper grain effect
const fs = require('fs');
const zlib = require('zlib');

const W = 128, H = 128;

// Build raw RGBA pixel data for the filter
const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  const offset = y * (1 + W * 4);
  raw[offset] = 0; // filter byte = None
  for (let x = 0; x < W; x++) {
    const px = offset + 1 + x * 4;
    // Random gray noise
    const v = Math.floor(Math.random() * 60) + 180;
    raw[px] = v;
    raw[px + 1] = v;
    raw[px + 2] = v;
    raw[px + 3] = 255;
  }
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([len, typeAndData, crc]);
}

// PNG Signature
const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// IHDR
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 6;  // color type RGBA
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

// IDAT
const compressed = zlib.deflateSync(raw);

// IEND
const iend = Buffer.alloc(0);

const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', compressed),
  chunk('IEND', iend),
]);

fs.writeFileSync('public/noise.png', png);
console.log(`noise.png written: ${png.length} bytes`);
