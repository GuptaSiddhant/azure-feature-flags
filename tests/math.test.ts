import { describe, expect, it } from "vitest";
import {
  createRatioFromFraction,
  createRatioWithMultipleNumbers,
} from "../src/utils/math";

describe(createRatioFromFraction, { concurrent: true }, () => {
  const runs: Array<{
    input: Parameters<typeof createRatioFromFraction>[0];
    output: ReturnType<typeof createRatioFromFraction>;
  }> = [
    { input: 0.5, output: { ratio: 1, total: 2 } },
    { input: 0.25, output: { ratio: 1, total: 4 } },
    { input: 0.2, output: { ratio: 1, total: 5 } },
    { input: 0.4, output: { ratio: 2, total: 5 } },
    { input: 0.45, output: { ratio: 9, total: 20 } },
    { input: 0.6, output: { ratio: 3, total: 5 } },
    { input: 0.7, output: { ratio: 7, total: 10 } },
    { input: 0.75, output: { ratio: 3, total: 4 } },
    { input: 0.8, output: { ratio: 4, total: 5 } },
    { input: 0.9, output: { ratio: 9, total: 10 } },
    { input: 1, output: { ratio: 1, total: 1 } },
    { input: 0, output: { ratio: 0, total: 1 } },
  ];

  for (const { input, output } of runs) {
    it(`${input.toFixed(2)} => ${output.ratio}/${output.total}`, () => {
      expect(createRatioFromFraction(input)).toEqual(output);
    });
  }
});

describe(createRatioWithMultipleNumbers, { concurrent: true }, () => {
  it("should throw error if sum = 0", () => {
    expect(() => createRatioWithMultipleNumbers([0, 0, 0])).toThrowError(
      "The sum of all numbers should be grater than 0."
    );
  });

  const runs: Array<{
    input: Parameters<typeof createRatioWithMultipleNumbers>[0];
    output: ReturnType<typeof createRatioWithMultipleNumbers>;
  }> = [
    { input: [30, 30, 40], output: [3, 3, 4] },
    { input: [25, 60, 15], output: [5, 12, 3] },
    { input: [10, 30, 60], output: [1, 3, 6] },
    { input: [5, 45, 50], output: [1, 9, 10] },
    { input: [30, 20, 25, 25], output: [6, 4, 5, 5] },
  ];

  for (const { input, output } of runs) {
    it(`${input} => ${output}`, () => {
      expect(createRatioWithMultipleNumbers(input)).toEqual(output);
    });
  }
});
