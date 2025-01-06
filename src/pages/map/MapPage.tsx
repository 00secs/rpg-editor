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
import {message} from '@tauri-apps/plugin-dialog'
import {listenSave, sendSaveFile} from '../../util/api'
import { Window } from '@tauri-apps/api/window'

type Props = {
  path: string
  data: MapData
}

export default function MapPage(props: Props) {
  // データ
  const [data, _setData] = useState<MapData>(props.data)
  const [saved, setSaved] = useState(true)
  // setDataラッパー
  // NOTE: 安全にsavedを変更するため。
  const setData = useCallback((data: MapData) => {
    _setData(data)
    setSaved(false)
  }, [])
  // データロードエフェクト
  // NOTE: props.dataの変更はロードなので保存済みであることが保証されている。
  useEffect(() => {
    _setData(props.data)
    setSaved(true)
  }, [props.data])
  // ウィンドウタイトル変更エフェクト
  useEffect(() => {
    const p = saved ? "" : "*"
    Window.getCurrent().setTitle(`${p} ${props.path}`)
  }, [props.path, saved])
  // メニュー「File>Save」を購読
  useEffect(() => {
    listenSave(async () => {
      const result = await sendSaveFile(props.path, JSON.stringify(data))
      if (!result) {
        message('保存に失敗しました。')
        return
      }
      setSaved(true)
    })
  }, [data])

  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [i, setI] = useState(0)
  const [j, setJ] = useState(0)

  const mapTilesRowNumber = useMemo(() => data.tiles.length, [data.tiles])
  const mapTilesColNumber = useMemo(() => data.tiles[0].length, [data.tiles])

  /**
   * マップタイル配列をリサイズするコールバック。
   *
   * TODO: 縮小時に確認ダイアログを出すと丁寧かも。
   */
  const resizeMapTiles = useCallback(
    (row: number, col: number) => {
      const orow = data.tiles.length
      const ocol = data.tiles[0].length
      if (row === orow && col === ocol) {
        return false
      }
      const newMapTiles: MapTileData[][] = []
      for (let i = 0; i < row; ++i) {
        const arr: MapTileData[] = []
        for (let j = 0; j < col; ++j) {
          if (i < orow && j < ocol) {
            arr.push(data.tiles[i][j])
          } else {
            arr.push(defaultMapTileData())
          }
        }
        newMapTiles.push(arr)
      }
      setData({
        ...data,
        tiles: newMapTiles,
      })
      return true
    },
    [data, data.tiles]
  )

  /**
   * マップタイル配列の要素を更新するコールバック。
   *
   * 要素のインデックスはiとjを参照する。
   */
  const updateMapTile = useCallback(
    (d: MapTileData) => {
      const newMapTiles = data.tiles.map((row) => [...row])
      newMapTiles[i][j] = d
      setData({
        ...data,
        tiles: newMapTiles,
      })
      return true
    },
    [data, data.tiles, i, j]
  )

  /**
   * MapData.imageが変わるたびにHTMLImageElementをリロードするエフェクト。
   *
   * ただし、空マップ作成時にリロードが入ることを避けるために、
   * MapData.imageが空文字である場合はリロードしない。
   */
  useEffect(() => {
    if (data.image === '') {
      return
    }
    const img = new Image()
    img.onload = () => setImage(img)
    img.onerror = () => message(`${data.image}の読み込みに失敗しました。`)
    img.src = convertFileSrc(data.image)
  }, [data.image])

  return (
    <Container>
      <Content>
        {data.tiles.map((row, ri) => (
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
      <Sidebar
        initialWidth={200}
        isLeft={false}
      >
        <Box label='MAP SETTINGS'>
          <SettingItem label='texture'>
            <FilePicker
              value={data.image}
              filters={[{name: 'PNG Files', extensions: ['png']}]}
              onPicked={(path) => {
                setData({
                  ...data,
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
              value={data.tiles[i][j].uv.left}
              onChange={(n) =>
                updateMapTile({
                  uv: {...data.tiles[i][j].uv, left: n},
                })
              }
            />
          </SettingItem>
          <SettingItem label='top'>
            <NumberInput
              allowDecimal={true}
              min={0}
              max={1}
              value={data.tiles[i][j].uv.top}
              onChange={(n) =>
                updateMapTile({
                  uv: {...data.tiles[i][j].uv, top: n},
                })
              }
            />
          </SettingItem>
          <SettingItem label='right'>
            <NumberInput
              allowDecimal={true}
              min={0}
              max={1}
              value={data.tiles[i][j].uv.right}
              onChange={(n) =>
                updateMapTile({
                  uv: {...data.tiles[i][j].uv, right: n},
                })
              }
            />
          </SettingItem>
          <SettingItem label='bottom'>
            <NumberInput
              allowDecimal={true}
              min={0}
              max={1}
              value={data.tiles[i][j].uv.bottom}
              onChange={(n) =>
                updateMapTile({
                  uv: {...data.tiles[i][j].uv, bottom: n},
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
  width: 100%;
  height: 100%;
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
