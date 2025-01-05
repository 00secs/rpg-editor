import {ReactNode} from 'react'
import styled from 'styled-components'

type Props = {
  label: string
  children?: ReactNode
}

/**
 * 設定項目。
 *
 * NOTE: tableで設定項目を作るとovreflow-x周りが期待通りにならないので、
 *       このコンポーネントを連ねて設定項目テーブルを作る。
 */
export default function SettingItem(props: Props) {
  return (
    <Container>
      <Label>{props.label}</Label>
      {props.children}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  height: 1.75em;
  min-height: 1.75em;
  max-height: 1.75em;
  padding: 0 8px;
`

const Label = styled.label`
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  overflow-x: hidden;
  font-weight: bold;
`
