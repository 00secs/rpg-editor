import {useCallback, useEffect, useMemo, useState} from 'react'
import {convertFileSrc} from '@tauri-apps/api/core'
import {defaultMapTileData, MapData, MapTileData} from './types'
import styled from 'styled-components'
import Sidebar from '../../helper/Sidebar'
import Box from '../../helper/Box'
import SettingItem from '../../helper/SettingItem'
import TextInput from '../../helper/form/TextInput'
import NumberInput from '../../helper/form/NumberInput'
import {message} from '@tauri-apps/plugin-dialog'
import Canvas from '../../helper/Canvas'
import EditPage, {EditPageChildProps} from '../../helper/EditPage'

type ChildProps = EditPageChildProps<MapData, {rootPath: string}>

function MapPageBody(props: ChildProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [i, setI] = useState(0)
  const [j, setJ] = useState(0)

  const mapTilesRowNumber = useMemo(() => props.data.tiles.length, [props.data.tiles])
  const mapTilesColNumber = useMemo(() => props.data.tiles[0].length, [props.data.tiles])

  /**
   * マップタイル配列をリサイズするコールバック。
   *
   * TODO: 縮小時に確認ダイアログを出すと丁寧かも。
   */
  const resizeMapTiles = useCallback(
    (row: number, col: number) => {
      if (row === mapTilesRowNumber && col === mapTilesColNumber) {
        return false
      }
      const newMapTiles: MapTileData[][] = []
      for (let i = 0; i < row; ++i) {
        const arr: MapTileData[] = []
        for (let j = 0; j < col; ++j) {
          if (i < mapTilesRowNumber && j < mapTilesColNumber) {
            arr.push(props.data.tiles[i][j])
          } else {
            arr.push(defaultMapTileData())
          }
        }
        newMapTiles.push(arr)
      }
      props.setData({
        ...props.data,
        tiles: newMapTiles,
      })
      return true
    },
    [props.setData, props.data, props.data.tiles, mapTilesRowNumber, mapTilesColNumber]
  )

  /**
   * マップタイル配列の要素を更新するコールバック。
   *
   * 要素のインデックスはiとjを参照する。
   */
  const updateMapTile = useCallback(
    (d: MapTileData) => {
      const newMapTiles = props.data.tiles.map((row) => [...row])
      newMapTiles[i][j] = d
      props.setData({
        ...props.data,
        tiles: newMapTiles,
      })
      return true
    },
    [props.setData, props.data, props.data.tiles, i, j]
  )

  /**
   * MapData.imageが変わるたびにHTMLImageElementをリロードするエフェクト。
   */
  useEffect(() => {
    // TODO: 空文字列になった場合、canvasをクリアする。
    if (props.data.image === '') {
      return
    }
    const path = `${props.rootPath}/${props.data.image}`
    const img = new Image()
    img.onload = () => setImage(img)
    img.onerror = () => message(`${path}の読み込みに失敗しました。`)
    img.src = convertFileSrc(path)
  }, [props.rootPath, props.data, props.data.image])

  return (
    <>
      <Content>
        {props.data.tiles.map((row, ri) => (
          <MapTileRow key={ri}>
            {row.map((n, ci) => (
              <MapTileContainer
                key={`${ri}-${ci}`}
                onClick={() => {
                  setI(ri)
                  setJ(ci)
                }}
              >
                <Canvas
                  image={image}
                  left={n.uv.left}
                  top={n.uv.top}
                  right={n.uv.right}
                  bottom={n.uv.bottom}
                  width={48}
                  height={48}
                  styleWidth={48}
                  styleHeight={48}
                />
              </MapTileContainer>
            ))}
          </MapTileRow>
        ))}
      </Content>
      <Sidebar
        initialWidth={200}
        isLeft={false}
      >
        <Box label='MAP SETTINGS'>
          <SettingItem label='texture'>
            <TextInput
              value={props.data.image}
              onChange={(path) => {
                props.setData({
                  ...props.data,
                  image: path,
                })
                return true
              }}
            />
          </SettingItem>
          <SettingItem label='row'>
            <NumberInput
              allowDecimal={false}
              min={1}
              max={10000}
              value={mapTilesRowNumber}
              onChange={(n) => resizeMapTiles(n, mapTilesColNumber)}
            />
          </SettingItem>
          <SettingItem label='col'>
            <NumberInput
              allowDecimal={false}
              min={1}
              max={10000}
              value={mapTilesColNumber}
              onChange={(n) => resizeMapTiles(mapTilesRowNumber, n)}
            />
          </SettingItem>
        </Box>
        <Box label='TILE SETTINGS'>
          <SettingItem label='left'>
            <NumberInput
              allowDecimal={true}
              min={0}
              max={1}
              value={props.data.tiles[i][j].uv.left}
              onChange={(n) =>
                updateMapTile({
                  uv: {...props.data.tiles[i][j].uv, left: n},
                })
              }
            />
          </SettingItem>
          <SettingItem label='top'>
            <NumberInput
              allowDecimal={true}
              min={0}
              max={1}
              value={props.data.tiles[i][j].uv.top}
              onChange={(n) =>
                updateMapTile({
                  uv: {...props.data.tiles[i][j].uv, top: n},
                })
              }
            />
          </SettingItem>
          <SettingItem label='right'>
            <NumberInput
              allowDecimal={true}
              min={0}
              max={1}
              value={props.data.tiles[i][j].uv.right}
              onChange={(n) =>
                updateMapTile({
                  uv: {...props.data.tiles[i][j].uv, right: n},
                })
              }
            />
          </SettingItem>
          <SettingItem label='bottom'>
            <NumberInput
              allowDecimal={true}
              min={0}
              max={1}
              value={props.data.tiles[i][j].uv.bottom}
              onChange={(n) =>
                updateMapTile({
                  uv: {...props.data.tiles[i][j].uv, bottom: n},
                })
              }
            />
          </SettingItem>
        </Box>
      </Sidebar>
    </>
  )
}

type Props = {
  rootPath: string
  path: string
  data: MapData
  saved: React.MutableRefObject<boolean>
}

export default function MapPage(props: Props) {
  return (
    <EditPage
      Child={MapPageBody}
      data={props.data}
      path={props.path}
      saved={props.saved}
      info={{rootPath: props.rootPath}}
    />
  )
}

const Content = styled.div`
  flex-grow: 1;
`

const MapTileRow = styled.div`
  display: flex;
`

const MapTileContainer = styled.div`
  width: fit-content;
  height: fit-content;
  border: 1px solid black;
  &:hover {
    cursor: pointer;
  }
`
