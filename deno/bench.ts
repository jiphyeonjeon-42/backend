import * as it from "https://deno.land/x/iter@v3.0.0/fp.ts"
import { curryIterFunction } from "https://deno.land/x/iter@v3.0.0/lib/internal/util.ts"
import { IterableCircular } from "https://deno.land/x/iter@v3.0.0/lib/types.ts";
import { b, c, p } from "https://deno.land/x/copb@v1.0.1/mod.ts"
import { BenchResult, benchmark } from "./calc.ts"
import { outdent } from "https://deno.land/x/outdent@v0.8.0/mod.ts"

const fence = "```"

export const printBenchmarkMd = (res: BenchResult) => {
  const { elems, min, max, mean, stdDevValue, base, relativeMean, relativeStdDev } = res
  console.log(outdent`
    | Average |  ${Math.round(mean)}ms | |
    | --- | --- | --- |
    | Time (mean ± σ)     | ${mean.toFixed(3)}ms ± ${stdDevValue.toFixed(3)}ms | base ${base}ms |
    | Relative (mean ± σ) | ${relativeMean.toFixed(2)} ± ${relativeStdDev.toFixed(2)} |  |
    | Range (min … max)   | ${min}ms … ${max}ms | ${elems.length} runs |

    <details><summary>all runs</summary>

    ${fence}
    ${elems}
    ${fence}

    </details>

  `)
}

const runBench = b(printBenchmarkMd)(benchmark)
const isoDatePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/

function dropWhile<T>(it: Iterable<T>, fn: (x: T) => boolean): IterableCircular<T> {
  return {
    *[Symbol.iterator]() {
      const iterator = it[Symbol.iterator]();
      let x = iterator.next();
      while (!x.done && fn(x.value)) {
        x = iterator.next()
      }
      while (!x.done) {
        yield x.value;
        x = iterator.next();
      }
    },
  };
}

const dropWhileCurried = curryIterFunction(dropWhile)

const watcher = "watcher:"
const server = "server :"

const pipeline = c(p
  (dropWhileCurried<string>(x => !x.startsWith(watcher)))
  (it.filter<string>(x => x.startsWith(watcher) || x.startsWith(server)))
  (it.map(x => x.match(isoDatePattern)![0]))
  (it.map(x => new Date(x).valueOf()))
  (it.chunkify(2))
  (it.filter((pair): pair is [number, number] => pair.length === 2))
  (it.map(([a, b]) => b - a))
)


if (import.meta.main) {
  const [file] = Deno.args
  const isReference = file === "dev.bench.log"
  const testname = isReference ? "dev (reference)" : file.replace(".bench.log", "")

  const text = await Deno.readTextFile(file)
  const lines = text.split("\n")
  const elems = [...pipeline(lines)]

  console.log(`## ${testname}\n`)
  runBench(elems)
}
