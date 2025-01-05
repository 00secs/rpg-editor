import './App.css'

import {useCallback, useEffect, useState} from 'react'
import MapPage from './pages/map/MapPage'
import DialogProvider, {useDialog} from './helper/Dialog'
import styled from 'styled-components'
import {defaultMapData, isMapData, MapData} from './pages/map/types'
import {listenNewMap, listenOpenJSONFile, listenSave, sendSaveJSONFile} from './util/api'
import {Window} from '@tauri-apps/api/window'
import {save} from '@tauri-apps/plugin-dialog'

type PageType = 'map' | null

// NOTE: useContextを用いるためにはProvider下のコンポーネントを出し分ける必要があるので。
function Content() {
  const {openDialog} = useDialog()

  const [filePath, setFilePath] = useState('')
  const [pageType, setPageType] = useState<PageType>(null)
  const [mapData, setMapData] = useState<MapData>(defaultMapData())

  const saveData = useCallback(async () => {
    // ページが開かれていない場合はリターン
    if (pageType === null) {
      return
    }
    // 保存先を確定
    const path =
      filePath !== ''
        ? filePath
        : ((await save({
            filters: [
              {
                name: 'JSON',
                extensions: ['json'],
              },
            ],
          })) ?? '')
    if (path === '') {
      openDialog('保存先が見つかりません。')
      return
    }
    // ページタイプに合わせてデータを選択
    const data = pageType === 'map' ? JSON.stringify({type: 'map', data: mapData}) : ''
    // 保存
    const result = await sendSaveJSONFile(path, data)
    if (result) {
      Window.getCurrent().setTitle(path)
      setFilePath(path)
    } else {
      openDialog('ファイルの保存に失敗しました。')
    }
  }, [filePath, pageType, mapData, openDialog])

  useEffect(() => {
    listenNewMap(() => {
      Window.getCurrent().setTitle('[New Map]')
      setFilePath('')
      setPageType('map')
      setMapData(defaultMapData())
    })

    listenOpenJSONFile((event) => {
      try {
        // JSONにパース
        const json = JSON.parse(event.payload.body)
        // プロパティを確認
        if ('type' in json === false || 'data' in json === false) {
          throw new Error()
        }
        // ディスパッチ
        switch (json['type']) {
          case 'map':
            if (isMapData(json['data'])) {
              Window.getCurrent().setTitle(event.payload.path)
              setFilePath(event.payload.path)
              setPageType(json['type'])
              setMapData(json['data'])
              return
            }
            break
        }
        // エラー
        throw new Error()
      } catch (_) {
        openDialog('無効なデータです。')
        return
      }
    })
  }, [])
  useEffect(() => {
    listenSave(saveData)
  }, [saveData])

  return (
    <>
      {pageType === 'map' ? (
        <MapPage
          data={mapData}
          updateData={setMapData}
        />
      ) : (
        <DefaultPage>
          <DefaultMessage>ファイルを開いてください</DefaultMessage>
        </DefaultPage>
      )}
    </>
  )
}

export default function App() {
  return (
    <main className='container'>
      <DialogProvider>
        <Content />
      </DialogProvider>
    </main>
  )
}

const DefaultPage = styled.div`
  display: flex;
  align-items: center;
  width: 100vw;
  height: 100vh;
`

const DefaultMessage = styled.span`
  text-align: center;
  width: 100%;
`
