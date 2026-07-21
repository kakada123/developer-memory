import { deflateSync } from 'node:zlib';
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const size = 1024;
const pixels = Buffer.alloc(size * size * 4);
const scriptDirectory = dirname(fileURLToPath(import.meta.url));

const clamp = (value, minimum = 0, maximum = 1) => Math.max(minimum, Math.min(maximum, value));
const mix = (start, end, amount) => Math.round(start + (end - start) * clamp(amount));

function blendPixel(x, y, color, opacity) {
  if (x < 0 || y < 0 || x >= size || y >= size || opacity <= 0) return;

  const offset = (y * size + x) * 4;
  const sourceAlpha = clamp(opacity) * (color[3] / 255);
  const destinationAlpha = pixels[offset + 3] / 255;
  const outputAlpha = sourceAlpha + destinationAlpha * (1 - sourceAlpha);
  if (outputAlpha === 0) return;

  for (let channel = 0; channel < 3; channel += 1) {
    pixels[offset + channel] = Math.round(
      (color[channel] * sourceAlpha + pixels[offset + channel] * destinationAlpha * (1 - sourceAlpha)) / outputAlpha,
    );
  }
  pixels[offset + 3] = Math.round(outputAlpha * 255);
}

function roundedRectangleDistance(x, y, left, top, width, height, radius) {
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  const qx = Math.abs(x - centerX) - (width / 2 - radius);
  const qy = Math.abs(y - centerY) - (height / 2 - radius);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}

function drawRoundedRectangle(left, top, width, height, radius, startColor, endColor = startColor) {
  const minimumX = Math.max(0, Math.floor(left - 1));
  const maximumX = Math.min(size - 1, Math.ceil(left + width + 1));
  const minimumY = Math.max(0, Math.floor(top - 1));
  const maximumY = Math.min(size - 1, Math.ceil(top + height + 1));

  for (let y = minimumY; y <= maximumY; y += 1) {
    for (let x = minimumX; x <= maximumX; x += 1) {
      const coverage = clamp(0.5 - roundedRectangleDistance(x + 0.5, y + 0.5, left, top, width, height, radius));
      if (coverage === 0) continue;

      const progress = clamp(((x - left) / width + (y - top) / height) / 2);
      const color = startColor.map((channel, index) => mix(channel, endColor[index], progress));
      blendPixel(x, y, color, coverage);
    }
  }
}

function drawShadow(left, top, width, height, radius, blur, opacity) {
  const margin = blur * 3;
  const minimumX = Math.max(0, Math.floor(left - margin));
  const maximumX = Math.min(size - 1, Math.ceil(left + width + margin));
  const minimumY = Math.max(0, Math.floor(top - margin));
  const maximumY = Math.min(size - 1, Math.ceil(top + height + margin));

  for (let y = minimumY; y <= maximumY; y += 1) {
    for (let x = minimumX; x <= maximumX; x += 1) {
      const distance = Math.max(0, roundedRectangleDistance(x + 0.5, y + 0.5, left, top, width, height, radius));
      const alpha = opacity * Math.exp(-(distance * distance) / (2 * blur * blur));
      blendPixel(x, y, [2, 6, 23, 255], alpha);
    }
  }
}

function distanceToSegment(x, y, startX, startY, endX, endY) {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;
  const amount = clamp(((x - startX) * deltaX + (y - startY) * deltaY) / lengthSquared);
  return Math.hypot(x - (startX + amount * deltaX), y - (startY + amount * deltaY));
}

function drawLine(startX, startY, endX, endY, width, color) {
  const radius = width / 2;
  const minimumX = Math.max(0, Math.floor(Math.min(startX, endX) - radius - 1));
  const maximumX = Math.min(size - 1, Math.ceil(Math.max(startX, endX) + radius + 1));
  const minimumY = Math.max(0, Math.floor(Math.min(startY, endY) - radius - 1));
  const maximumY = Math.min(size - 1, Math.ceil(Math.max(startY, endY) + radius + 1));

  for (let y = minimumY; y <= maximumY; y += 1) {
    for (let x = minimumX; x <= maximumX; x += 1) {
      const coverage = clamp(radius + 0.5 - distanceToSegment(x + 0.5, y + 0.5, startX, startY, endX, endY));
      blendPixel(x, y, color, coverage);
    }
  }
}

function drawTriangle(points, startColor, endColor) {
  const [first, second, third] = points;
  const denominator = (second[1] - third[1]) * (first[0] - third[0]) + (third[0] - second[0]) * (first[1] - third[1]);
  const minimumX = Math.floor(Math.min(first[0], second[0], third[0]));
  const maximumX = Math.ceil(Math.max(first[0], second[0], third[0]));
  const minimumY = Math.floor(Math.min(first[1], second[1], third[1]));
  const maximumY = Math.ceil(Math.max(first[1], second[1], third[1]));

  for (let y = minimumY; y <= maximumY; y += 1) {
    for (let x = minimumX; x <= maximumX; x += 1) {
      const alpha = ((second[1] - third[1]) * (x - third[0]) + (third[0] - second[0]) * (y - third[1])) / denominator;
      const beta = ((third[1] - first[1]) * (x - third[0]) + (first[0] - third[0]) * (y - third[1])) / denominator;
      if (alpha < 0 || beta < 0 || alpha + beta > 1) continue;

      const progress = clamp((x - minimumX + y - minimumY) / ((maximumX - minimumX) + (maximumY - minimumY)));
      blendPixel(x, y, startColor.map((channel, index) => mix(channel, endColor[index], progress)), 1);
    }
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

drawShadow(48, 62, 928, 914, 218, 28, 0.42);
drawRoundedRectangle(48, 48, 928, 928, 218, [52, 52, 154, 255], [8, 17, 40, 255]);
drawRoundedRectangle(76, 76, 872, 230, 170, [111, 109, 255, 34], [38, 56, 138, 6]);

drawShadow(230, 340, 486, 522, 92, 28, 0.42);
drawRoundedRectangle(230, 322, 486, 540, 92, [104, 112, 232, 255], [45, 53, 165, 255]);
drawRoundedRectangle(238, 330, 470, 524, 84, [86, 92, 215, 255], [35, 44, 137, 255]);

drawShadow(286, 278, 498, 532, 92, 24, 0.38);
drawRoundedRectangle(286, 258, 498, 552, 92, [135, 120, 252, 255], [67, 58, 202, 255]);
drawRoundedRectangle(294, 266, 482, 536, 84, [123, 108, 241, 255], [65, 57, 200, 255]);

drawShadow(348, 190, 495, 575, 105, 30, 0.5);
drawRoundedRectangle(348, 159, 495, 606, 105, [196, 182, 255, 255], [82, 88, 242, 255]);
drawRoundedRectangle(357, 168, 477, 588, 96, [165, 140, 255, 255], [74, 80, 235, 255]);
drawTriangle([[704, 168], [834, 298], [760, 298]], [163, 247, 255, 255], [69, 192, 244, 255]);

const codeColor = [36, 31, 120, 255];
drawLine(512, 401, 420, 493, 54, codeColor);
drawLine(420, 493, 512, 585, 54, codeColor);
drawLine(674, 401, 766, 493, 54, codeColor);
drawLine(766, 493, 674, 585, 54, codeColor);
drawLine(626, 381, 563, 608, 42, [227, 222, 255, 255]);
drawLine(432, 701, 704, 701, 16, [188, 178, 255, 118]);

function encodePng(pixelBuffer, dimension) {
  const raw = Buffer.alloc((dimension * 4 + 1) * dimension);
  for (let y = 0; y < dimension; y += 1) {
    const rowOffset = y * (dimension * 4 + 1);
    raw[rowOffset] = 0;
    pixelBuffer.copy(raw, rowOffset + 1, y * dimension * 4, (y + 1) * dimension * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(dimension, 0);
  header.writeUInt32BE(dimension, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function downsample(sourcePixels, destinationSize) {
  if (destinationSize === size) return sourcePixels;

  const factor = size / destinationSize;
  const output = Buffer.alloc(destinationSize * destinationSize * 4);

  for (let targetY = 0; targetY < destinationSize; targetY += 1) {
    for (let targetX = 0; targetX < destinationSize; targetX += 1) {
      let alphaSum = 0;
      let redSum = 0;
      let greenSum = 0;
      let blueSum = 0;

      for (let sourceY = targetY * factor; sourceY < (targetY + 1) * factor; sourceY += 1) {
        for (let sourceX = targetX * factor; sourceX < (targetX + 1) * factor; sourceX += 1) {
          const sourceOffset = (sourceY * size + sourceX) * 4;
          const alpha = sourcePixels[sourceOffset + 3] / 255;
          alphaSum += alpha;
          redSum += sourcePixels[sourceOffset] * alpha;
          greenSum += sourcePixels[sourceOffset + 1] * alpha;
          blueSum += sourcePixels[sourceOffset + 2] * alpha;
        }
      }

      const sampleCount = factor * factor;
      const targetOffset = (targetY * destinationSize + targetX) * 4;
      if (alphaSum > 0) {
        output[targetOffset] = Math.round(redSum / alphaSum);
        output[targetOffset + 1] = Math.round(greenSum / alphaSum);
        output[targetOffset + 2] = Math.round(blueSum / alphaSum);
      }
      output[targetOffset + 3] = Math.round(255 * alphaSum / sampleCount);
    }
  }

  return output;
}

function icnsEntry(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length + 8);
  return Buffer.concat([Buffer.from(type), length, data]);
}

const pngBySize = new Map();
for (const dimension of [16, 32, 64, 128, 256, 512, 1024]) {
  pngBySize.set(dimension, encodePng(downsample(pixels, dimension), dimension));
}

const icnsEntries = [
  ['icp4', 16],
  ['ic11', 32],
  ['icp5', 32],
  ['ic12', 64],
  ['icp6', 64],
  ['ic07', 128],
  ['ic13', 256],
  ['ic08', 256],
  ['ic14', 512],
  ['ic09', 512],
  ['ic10', 1024],
].map(([type, dimension]) => icnsEntry(type, pngBySize.get(dimension)));

const icnsLength = 8 + icnsEntries.reduce((total, entry) => total + entry.length, 0);
const icnsHeader = Buffer.alloc(8);
icnsHeader.write('icns');
icnsHeader.writeUInt32BE(icnsLength, 4);

const buildDirectory = join(scriptDirectory, '..', 'build');
await writeFile(join(buildDirectory, 'icon.png'), pngBySize.get(1024));
await writeFile(join(buildDirectory, 'icon.icns'), Buffer.concat([icnsHeader, ...icnsEntries]));
