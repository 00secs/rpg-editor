import {useCallback, useEffect, useMemo, useState} from 'react'
import MapTile from './MapTile'
import {convertFileSrc} from '@tauri-apps/api/core'
import {defaultMapTileData, MapData, MapTileData} from './types'
import styled from 'styled-components'
import Sidebar from '../../helper/Sidebar'
import Box from '../../helper/Box'
import SettingItem from '../../helper/SettingItem'
import FilePicker from '../../helper/form/FilePicker'
import NumberInput from '../../helper/form/NumberInput'
import {useDialog} from '../../helper/Dialog'

type Props = {
  data: MapData
  updateData: (data: MapData) => void
}

export default function MapPage(props: Props) {
  const {openDialog} = useDialog()

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
      const orow = props.data.tiles.length
      const ocol = props.data.tiles[0].length
      if (row === orow && col === ocol) {
        return false
      }
      const newMapTiles: MapTileData[][] = []
      for (let i = 0; i < row; ++i) {
        const arr: MapTileData[] = []
        for (let j = 0; j < col; ++j) {
          if (i < orow && j < ocol) {
            arr.push(props.data.tiles[i][j])
          } else {
            arr.push(defaultMapTileData())
          }
        }
        newMapTiles.push(arr)
      }
      props.updateData({
        ...props.data,
        tiles: newMapTiles,
      })
      return true
    },
    [props.data, props.data.tiles, props.updateData]
  )

  /**
   * マップタイル配列の要素を更新するコールバック。
   *
   * 要素のインデックスはiとjを参照する。
   */
  const updateMapTile = useCallback(
    (data: MapTileData) => {
      const newMapTiles = props.data.tiles.map((row) => [...row])
      newMapTiles[i][j] = data
      props.updateData({
        ...props.data,
        tiles: newMapTiles,
      })
      return true
    },
    [props.data, props.data.tiles, props.updateData, i, j]
  )

  /**
   * MapData.imageが変わるたびにHTMLImageElementをリロードするエフェクト。
   *
   * ただし、空マップ作成時にリロードが入ることを避けるために、
   * MapData.imageが空文字である場合はリロードしない。
   */
  useEffect(() => {
    if (props.data.image === '') {
      return
    }
    const img = new Image()
    img.onload = () => setImage(img)
    img.onerror = () => openDialog(props.data.image + 'の読み込みに失敗しました。')
    img.src = convertFileSrc(props.data.image)
  }, [props.data, props.data.image])

  return (
    <Container>
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
                <MapTile
                  image={image}
                  data={n}
                />
              </MapTileContainer>
            ))}
          </MapTileRow>
        ))}
      </Content>
      <Sidebar initialWidth={200}>
        <Box label='MAP SETTINGS'>
          <SettingItem label='texture'>
            <FilePicker
              value={props.data.image}
              filters={[{name: 'PNG Files', extensions: ['png']}]}
              onPicked={(path) => {
                props.updateData({
                  ...props.data,
                  image: path,
                })
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
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
`

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
