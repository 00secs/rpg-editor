import {Code, isCode} from '../../util/types'

function isExpectedArray(value: any, f: (_: any) => boolean): boolean {
  return Array.isArray(value) && value.length > 0 && value.every(f)
}

export type ActorData = {
  image: string
  width: number
  height: number
  idle: UVFunc
  moving: UVFunc
  events: Code[]
}
export function isActorData(value: any): value is ActorData {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.image === 'string' &&
    typeof value.width === 'number' &&
    typeof value.height === 'number' &&
    isUVFunc(value.idle) &&
    isUVFunc(value.moving) &&
    Array.isArray(value.events) &&
    value.events.every(isCode)
  )
}
export function parseActorData(s: string): ActorData | null {
  try {
    const o = JSON.parse(s)
    return isActorData(o) ? o : null
  } catch (_) {
    return null
  }
}
export function defaultActorData(): ActorData {
  return {
    image: '',
    width: 48,
    height: 48,
    idle: defaultUVFunc(),
    moving: defaultUVFunc(),
    events: [],
  }
}

export type UVFunc = {
  left: UVFuncPoint[]
  right: UVFuncPoint[]
  up: UVFuncPoint[]
  down: UVFuncPoint[]
}
export function isUVFunc(value: any): value is UVFunc {
  return (
    typeof value === 'object' &&
    value !== null &&
    isExpectedArray(value.left, isUVFuncPoint) &&
    isExpectedArray(value.right, isUVFuncPoint) &&
    isExpectedArray(value.up, isUVFuncPoint) &&
    isExpectedArray(value.down, isUVFuncPoint)
  )
}
export function defaultUVFunc(): UVFunc {
  return {
    left: [defaultUVFuncPoint()],
    right: [defaultUVFuncPoint()],
    up: [defaultUVFuncPoint()],
    down: [defaultUVFuncPoint()],
  }
}

export type UVFuncPoint = {
  time: number
  l: number
  t: number
  w: number
  h: number
}
export function isUVFuncPoint(value: any): value is UVFuncPoint {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.time === 'number' &&
    typeof value.l === 'number' &&
    typeof value.t === 'number' &&
    typeof value.w === 'number' &&
    typeof value.h === 'number'
  )
}
export function defaultUVFuncPoint(): UVFuncPoint {
  return {
    time: 0.0,
    l: 0,
    t: 0,
    w: 1,
    h: 1,
  }
}
