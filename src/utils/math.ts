export function createRatioFromFraction(fraction: number) {
  const len = fraction.toString().length - 2;
  const denominator = Math.pow(10, len);
  const numerator = fraction * denominator;
  const divisor = calcGcd(numerator, denominator);
  const ratio = Math.floor(numerator / divisor);
  const total = Math.floor(denominator / divisor);

  return { ratio, total };
}

export function calcGcd(a: number, b: number) {
  if (b < 0.0000001) return a;

  return calcGcd(b, a % b);
}

export function addNumbers(numbers: number[], init = 0): number {
  return numbers.reduce((acc, num) => acc + num, init);
}

export function createRatioWithMultipleNumbers(numbers: number[]): number[] {
  const sum = addNumbers(numbers);
  if (sum === 0) {
    throw new Error("The sum of all numbers should be grater than 0.");
  }

  const ratioObjs = numbers.map((num) => createRatioFromFraction(num / sum));

  let maxTotal = ratioObjs.reduce(
    (max, ratio) => Math.max(max, ratio.total),
    0
  );

  do {
    const normalizedRatios = ratioObjs.map(({ ratio, total }) => {
      if (total === maxTotal) return ratio;
      return ratio * (maxTotal / total);
    });

    if (normalizedRatios.some((ratio) => ratio % 1 > 0)) {
      maxTotal = maxTotal * 2;
    } else {
      return normalizedRatios;
    }
  } while (true);
}
