import fs from 'fs';
import path from 'path';

function createIcoBuffer(width = 32, height = 32) {
  const headerSize = 6;
  const dirEntrySize = 16;
  const bmpHeaderSize = 40;
  const pixelDataSize = width * height * 4;
  const maskDataSize = Math.ceil((width * height) / 8);
  const totalSize = headerSize + dirEntrySize + bmpHeaderSize + pixelDataSize + maskDataSize;

  const buf = Buffer.alloc(totalSize);

  // 1. ICONDIR Header (6 bytes)
  buf.writeUInt16LE(0, 0); // Reserved, must be 0
  buf.writeUInt16LE(1, 2); // Image type: 1 = ICO
  buf.writeUInt16LE(1, 4); // Number of images in file: 1

  // 2. ICONDIRENTRY (16 bytes)
  buf.writeUInt8(width === 256 ? 0 : width, 6);   // Image width in pixels
  buf.writeUInt8(height === 256 ? 0 : height, 7); // Image height in pixels
  buf.writeUInt8(0, 8);                           // Color palette (0 = no palette)
  buf.writeUInt8(0, 9);                           // Reserved
  buf.writeUInt16LE(1, 10);                       // Color planes (1)
  buf.writeUInt16LE(32, 12);                      // Bits per pixel (32)
  buf.writeUInt32LE(bmpHeaderSize + pixelDataSize + maskDataSize, 14); // Size of image data in bytes
  buf.writeUInt32LE(headerSize + dirEntrySize, 18); // Offset of BMP header

  // 3. BITMAPINFOHEADER (40 bytes)
  const bmpOffset = headerSize + dirEntrySize;
  buf.writeUInt32LE(bmpHeaderSize, bmpOffset + 0);
  buf.writeInt32LE(width, bmpOffset + 4);
  buf.writeInt32LE(height * 2, bmpOffset + 8);    // Note: Height is doubled for XOR + AND masks
  buf.writeUInt16LE(1, bmpOffset + 12);           // Planes
  buf.writeUInt16LE(32, bmpOffset + 14);          // Bit count
  buf.writeUInt32LE(0, bmpOffset + 16);           // BI_RGB (uncompressed)
  buf.writeUInt32LE(pixelDataSize + maskDataSize, bmpOffset + 20); // Image size
  buf.writeInt32LE(0, bmpOffset + 24);            // X pixels per meter
  buf.writeInt32LE(0, bmpOffset + 28);            // Y pixels per meter
  buf.writeUInt32LE(0, bmpOffset + 32);           // Colors used
  buf.writeUInt32LE(0, bmpOffset + 36);           // Important colors

  // 4. XOR Pixel Data (32x32 pixels, BGRA format, bottom-to-top)
  const pixelsOffset = bmpOffset + bmpHeaderSize;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Invert Y because BMP stores rows from bottom to top
      const bmpY = height - 1 - y;
      const idx = pixelsOffset + (bmpY * width + x) * 4;

      // Dark warm background (#1f1813) with Gold border & subtle styling (#d4af37)
      const isBorder = x === 0 || x === width - 1 || y === 0 || y === height - 1;
      const isInnerBorder = x === 2 || x === width - 3 || y === 2 || y === height - 3;
      
      if (isBorder || isInnerBorder) {
        // Gold: #d4af37 => B=0x37, G=0xAF, R=0xD4
        buf[idx + 0] = 0x37;
        buf[idx + 1] = 0xaf;
        buf[idx + 2] = 0xd4;
        buf[idx + 3] = 0xff;
      } else {
        // Dark background: #1f1813 => B=0x13, G=0x18, R=0x1F
        buf[idx + 0] = 0x13;
        buf[idx + 1] = 0x18;
        buf[idx + 2] = 0x1f;
        buf[idx + 3] = 0xff;
      }
    }
  }

  // 5. AND Mask (1 bit per pixel, 0 = opaque, 1 = transparent)
  // Default allocated buffer is filled with 0s (opaque).

  return buf;
}

const faviconPath = path.resolve('app/favicon.ico');
const icoBuf = createIcoBuffer(32, 32);
fs.writeFileSync(faviconPath, icoBuf);

console.log(`Successfully generated valid favicon.ico (${icoBuf.length} bytes) at ${faviconPath}`);
