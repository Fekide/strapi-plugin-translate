export interface SplitResult {
  chunks: string[][]
  reduceFunction: (translationResults: string[][]) => string[]
}

export type SplitFunction = (
  textArray: string[],
  options?: { maxLength?: number; maxByteSize?: number }
) => SplitResult

export interface ChunksService {
  split: SplitFunction
}
