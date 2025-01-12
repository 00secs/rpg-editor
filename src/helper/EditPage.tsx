import {Window} from '@tauri-apps/api/window'
import {useCallback, useEffect, useState} from 'react'
import {listenSave, sendSaveFile} from '../util/api'
import {message} from '@tauri-apps/plugin-dialog'
import styled from 'styled-components'

export type EditPageChildProps<T, U> = {
  data: T
  path: string
  saved: React.MutableRefObject<boolean>
  setData: (data: T) => void
} & U

type Props<T, U> = {
  Child: React.ComponentType<EditPageChildProps<T, U>>
  data: T
  path: string
  saved: React.MutableRefObject<boolean>
  info: U
}

/**
 * マップ編集画面やアクター編集画面のような編集画面の共通部分コンポーネント。
 *
 * 主に保存状態に依るウィンドウタイトルの変更・データの保存イベントを司る。
 */
export default function EditPage<T, U>(props: Props<T, U>) {
  // データ
  const [data, _setData] = useState<T>(props.data)
  // setDataラッパー
  // NOTE: 安全にsavedを変更するため。
  const setData = useCallback(
    (data: T) => {
      _setData(data)
      props.saved.current = false
      Window.getCurrent().setTitle(`* ${props.path}`)
    },
    [props.saved, props.path]
  )

  // ロード時コールバック
  const onLoad = useCallback(() => {
    _setData(props.data)
    props.saved.current = true
    Window.getCurrent().setTitle(props.path)
  }, [props.data, props.saved, props.path])
  // データロードエフェクト
  useEffect(() => onLoad(), [props.data])

  // メニュー「File>Save」を購読
  useEffect(() => {
    listenSave(async () => {
      const result = await sendSaveFile(props.path, JSON.stringify(data))
      if (!result) {
        message('保存に失敗しました。')
        return
      }
      props.saved.current = true
      Window.getCurrent().setTitle(props.path)
    })
  }, [data, props.saved])

  return (
    <Container>
      <props.Child
        data={data}
        path={props.path}
        saved={props.saved}
        setData={setData}
        {...props.info}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`
