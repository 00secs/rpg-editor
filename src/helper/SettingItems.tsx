import {ReactNode} from 'react'
import styled from 'styled-components'
import SettingItem from './SettingItem'

type Props = {
  label: string
  children?: ReactNode
}

export default function SettingItems(props: Props) {
  return (
    <>
      <SettingItem label={props.label} />
      <Container>
        <Items>{props.children}</Items>
      </Container>
    </>
  )
}

const Container = styled.div`
  width: 100%;
  padding-left: 20px;
  padding-right: 4px;
`

const Items = styled.div`
  border: 2px solid #333;
`
