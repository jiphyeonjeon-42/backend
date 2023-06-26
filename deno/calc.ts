const average = (e: number[]) => e.reduce((a, b) => a + b, 0) / e.length
const stdDev = (arr: number[], mean: number) => {
  const squareDiffs = arr.map((x) => (x - mean) ** 2)
  const avgSquareDiff = average(squareDiffs)

  return Math.sqrt(avgSquareDiff)
}

export type BenchResult = { elems: number[] } & Record<'min' | 'max' | 'mean' | 'stdDevValue' | 'base' | 'relativeMean' | 'relativeStdDev', number>

export const benchmark = (elems: number[]): BenchResult => {
  const min = Math.min(...elems)
  const max = Math.max(...elems)
  const mean = average(elems)
  const stdDevValue = stdDev(elems, mean)
  const base = elems[0]
  const relative = elems.map(e => (e / base))
  const relativeBase = relative[0]
  const relativeMean = average(relative)
  const relativeStdDev = stdDev(relative, relativeBase)

  return { elems, min, max, mean, stdDevValue, base, relativeMean, relativeStdDev }
}

export const printBenchmark = ({ elems, min, max, mean, stdDevValue, base, relativeMean, relativeStdDev } :BenchResult) => {
  console.log(`total ${elems.length} runs`)
  console.log(`min      : ${min}ms`)
  console.log(`max      : ${max}ms`)
  console.log(`mean     : ${mean.toFixed(3)} ± ${stdDevValue.toFixed(3)}ms`)
  console.log(`relative : ${relativeMean.toFixed(2)} ± ${relativeStdDev.toFixed(2)}`)
  console.log(`base     : ${base}ms`)
  console.log(`all values:\n${elems}`)
}
