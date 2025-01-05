export type MapData = {
  image: string
  tiles: MapTileData[][]
}
export function isMapData(value: any): value is MapData {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.image === 'string' &&
    Array.isArray(value.tiles) &&
    value.tiles.length > 0 &&
    value.tiles.every(
      (row: any) => Array.isArray(row) && row.length > 0 && row.every((tile) => isMapTileData(tile))
    )
  )
}
export function defaultMapData(): MapData {
  return {
    image: '',
    tiles: [[defaultMapTileData()]],
  }
}

export type MapTileData = {
  uv: UvArea
}
export function isMapTileData(value: any): value is MapTileData {
  return typeof value === 'object' && value !== null && 'uv' in value && isUvArea(value.uv)
}
export function defaultMapTileData(): MapTileData {
  return {
    uv: {
      left: 0,
      top: 0,
      right: 1,
      bottom: 1,
    },
  }
}

export type UvArea = {
  left: number
  top: number
  right: number
  bottom: number
}
export function isUvArea(value: any): value is UvArea {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.left === 'number' &&
    typeof value.top === 'number' &&
    typeof value.right === 'number' &&
    typeof value.bottom === 'number'
  )
}
