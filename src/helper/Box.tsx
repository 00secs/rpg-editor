import {ReactNode, useState} from 'react'
import {VscChevronDown, VscChevronRight} from 'react-icons/vsc'
import styled from 'styled-components'

type Props = {
  label: string
  children?: ReactNode
}

/**
 * 中身を表示/非表示できるコンテナ。
 */
export default function Box(props: Props) {
  const [isOpened, setIsOpened] = useState(true)

  return (
    <Container>
      <Header onClick={() => setIsOpened(!isOpened)}>
        {isOpened ? <VscChevronDown /> : <VscChevronRight />}
        <Label>{props.label}</Label>
      </Header>
      {isOpened && props.children}
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  padding: 3px;
  border-bottom: 2px solid #333;
`

const Header = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  &:hover,
  & *:hover {
    cursor: pointer;
  }
`

const Label = styled.label`
  font-weight: bold;
`
