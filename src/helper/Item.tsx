import {IconType} from 'react-icons'
import styled from 'styled-components'

type Props = {
  Icon?: IconType
  label: string
  selected: boolean
  onClick: () => void
}

export default function Item(props: Props) {
  return (
    <Container
      className={props.selected ? 'selected' : ''}
      onClick={props.onClick}
    >
      {props.Icon && <props.Icon />}
      <label>{props.label}</label>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  gap: 4px;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  &:hover {
    background-color: #333;
    cursor: pointer;
  }
  & *:hover {
    cursor: pointer;
  }
  &.selected {
    background-color: #444 !important;
  }
`
