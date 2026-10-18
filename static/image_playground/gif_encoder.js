// Compact GIF89a encoder using a fixed 3-3-2 RGB palette (256 colours).
// This keeps recording local, dependency-free, and small enough for browsers.
class ByteWriter {
  constructor() {
    this.buffer = new Uint8Array(1024);
    this.length = 0;
  }

  ensure(extra) {
    const needed = this.length + extra;
    if (needed <= this.buffer.length) return;
    let size = this.buffer.length;
    while (size < needed) size *= 2;
    const next = new Uint8Array(size);
    next.set(this.buffer);
    this.buffer = next;
  }

  byte(value) {
    this.ensure(1);
    this.buffer[this.length++] = value & 0xff;
  }

  word(value) {
    this.byte(value);
    this.byte(value >> 8);
  }

  bytes(values) {
    this.ensure(values.length);
    this.buffer.set(values, this.length);
    this.length += values.length;
  }

  finish() {
    return this.buffer.slice(0, this.length);
  }
}

function lzwEncode(indices) {
  const clearCode = 256;
  const endCode = 257;
  let codeSize = 9;
  let nextCode = 258;
  let dictionary = new Map();
  let bits = 0;
  let bitCount = 0;
  const output = [];

  const writeCode = (code) => {
    bits |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      output.push(bits & 0xff);
      bits >>= 8;
      bitCount -= 8;
    }
  };
  const reset = () => {
    dictionary = new Map();
    codeSize = 9;
    nextCode = 258;
  };

  writeCode(clearCode);
  let prefix = indices[0];
  for (let index = 1; index < indices.length; index++) {
    const value = indices[index];
    const key = `${prefix}:${value}`;
    const combined = dictionary.get(key);
    if (combined !== undefined) {
      prefix = combined;
      continue;
    }

    writeCode(prefix);
    if (nextCode < 4096) {
      dictionary.set(key, nextCode++);
      if (nextCode === (1 << codeSize) && codeSize < 12) codeSize++;
    } else {
      writeCode(clearCode);
      reset();
    }
    prefix = value;
  }
  writeCode(prefix);
  writeCode(endCode);
  if (bitCount > 0) output.push(bits & 0xff);
  return new Uint8Array(output);
}

function writeSubBlocks(writer, data) {
  for (let offset = 0; offset < data.length; offset += 255) {
    const block = data.subarray(offset, Math.min(offset + 255, data.length));
    writer.byte(block.length);
    writer.bytes(block);
  }
  writer.byte(0);
}

export class GifEncoder {
  static quantizeRGBA(rgba) {
    const indices = new Uint8Array(rgba.length / 4);
    for (let source = 0, target = 0; source < rgba.length; source += 4, target++) {
      indices[target] = (rgba[source] & 0xe0) | ((rgba[source + 1] & 0xe0) >> 3) | (rgba[source + 2] >> 6);
    }
    return indices;
  }

  static encode({ width, height, frames, delayCentiseconds = 12 }) {
    if (!frames.length || width < 1 || height < 1 || width > 65535 || height > 65535) {
      throw new Error('GIF needs at least one frame with valid dimensions.');
    }

    const pixels = width * height;
    if (frames.some((frame) => frame.length !== pixels)) {
      throw new Error('GIF frame dimensions do not match.');
    }

    const writer = new ByteWriter();
    writer.bytes(new TextEncoder().encode('GIF89a'));
    writer.word(width);
    writer.word(height);
    writer.byte(0xf7); // global 256-colour table, 8-bit colour resolution
    writer.byte(0);
    writer.byte(0);

    for (let index = 0; index < 256; index++) {
      writer.byte(((index >> 5) & 0x07) * 255 / 7);
      writer.byte(((index >> 2) & 0x07) * 255 / 7);
      writer.byte((index & 0x03) * 255 / 3);
    }

    writer.bytes(new Uint8Array([0x21, 0xff, 0x0b]));
    writer.bytes(new TextEncoder().encode('NETSCAPE2.0'));
    writer.bytes(new Uint8Array([0x03, 0x01, 0x00, 0x00, 0x00]));

    for (const frame of frames) {
      writer.bytes(new Uint8Array([0x21, 0xf9, 0x04, 0x00]));
      writer.word(delayCentiseconds);
      writer.bytes(new Uint8Array([0x00, 0x00, 0x2c]));
      writer.word(0);
      writer.word(0);
      writer.word(width);
      writer.word(height);
      writer.byte(0);
      writer.byte(8);
      writeSubBlocks(writer, lzwEncode(frame));
    }

    writer.byte(0x3b);
    return writer.finish();
  }
}
