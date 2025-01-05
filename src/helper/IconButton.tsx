import {IconType} from 'react-icons'
import styled from 'styled-components'

type Props = {
  Icon: IconType
  onClick: () => void
}

export default function IconButton(props: Props) {
  return (
    <Button onClick={props.onClick}>
      <props.Icon />
    </Button>
  )
}

const Button = styled.button`
  color: #d4d4d4;
  background: none;
  border: none;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #333;
    border-radius: 50%;
    cursor: pointer;
  }
`
