export function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
export class Random {
  constructor(seed) {
    this.state = hashSeed(seed);
  }

  next() {
    this.state += 0x6d2b79f5;
    let value = this.state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  }

  integer(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick(values) {
    return values[this.integer(0, values.length - 1)];
  }

  chance(probability = 0.5) {
    return this.next() < probability;
  }

  shuffled(values) {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const other = this.integer(0, index);
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  }
}
