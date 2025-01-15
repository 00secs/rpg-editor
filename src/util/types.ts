export type Code = {
  name: string
  code: string
}
export function isCode(value: any): value is Code {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.name === 'string' &&
    typeof value.code === 'string'
  )
}
