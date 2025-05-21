/** Convert number[] → `[0.1,0.2,...]` (pgvector literal) */
export function toPgvectorLiteral(arr: number[]): string {
  return `[${arr.join(",")}]`;
}
