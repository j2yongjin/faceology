import assert from "node:assert/strict";
import { describe, it } from "node:test";
import sharp from "sharp";

import {
  analyzeImageQuality,
  generateInterpretation,
  hashImage
} from "../src/services/analyzer.js";

async function createGradientImage(width, height) {
  const channels = 3;
  const data = Buffer.alloc(width * height * channels);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * channels;
      const base = Math.floor(((x + y) / (width + height)) * 255);
      data[idx] = base;
      data[idx + 1] = Math.min(255, base + 15);
      data[idx + 2] = Math.max(0, base - 15);
    }
  }

  return sharp(data, {
    raw: {
      width,
      height,
      channels
    }
  })
    .png()
    .toBuffer();
}

describe("analyzeImageQuality", () => {
  it("passes a clear 600x600 image", async () => {
    const image = await createGradientImage(600, 600);
    const quality = await analyzeImageQuality(image);

    assert.equal(quality.passed, true);
    assert.equal(quality.width, 600);
    assert.equal(quality.height, 600);
  });

  it("fails a low resolution image", async () => {
    const image = await createGradientImage(200, 200);
    const quality = await analyzeImageQuality(image);

    assert.equal(quality.passed, false);
    assert.equal(quality.issues.includes("low_resolution"), true);
  });
});

describe("generateInterpretation", () => {
  it("returns deterministic output for hash + variation", async () => {
    const image = await createGradientImage(600, 600);
    const imageHash = hashImage(image);

    const first = generateInterpretation(imageHash, 1);
    const second = generateInterpretation(imageHash, 1);

    assert.deepEqual(first, second);
  });
});
