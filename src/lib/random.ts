// src/lib/random.ts
// SeededRandom + weightedPick para generación reproducible de tickets

export class SeededRandom {
  private seed: number

  constructor(seed?: number) {
    this.seed = (seed ?? Date.now()) >>> 0
  }

  next(): number {
    // xorshift32
    this.seed ^= this.seed << 13
    this.seed ^= this.seed >>> 17
    this.seed ^= this.seed << 5
    this.seed >>>= 0
    return (this.seed & 0x7fffffff) / 0x7fffffff
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  pick<T>(arr: readonly T[]): T {
    return arr[this.int(0, arr.length - 1)]
  }

  weighted<T>(items: Array<{ value: T; weight: number }>): T {
    const total = items.reduce((s, i) => s + i.weight, 0)
    let r = this.next() * total
    for (const item of items) {
      r -= item.weight
      if (r <= 0) return item.value
    }
    return items[items.length - 1].value
  }

  chance(p: number): boolean {
    return this.next() < p
  }
}

export const rng = new SeededRandom()
