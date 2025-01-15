import styled from 'styled-components'
import {VscClose} from 'react-icons/vsc'
import {useEffect, useState} from 'react'
import IconButton from './IconButton'

type Props = {
  code: string
  onEdit: (code: string) => void
  onExit: () => void
}

export default function CodeEditor(props: Props) {
  const [code, setCode] = useState(props.code)

  useEffect(() => setCode(props.code), [props.code])

  return (
    <Container>
      <Header>
        <IconButton
          Icon={VscClose}
          onClick={() => props.onExit()}
        />
      </Header>
      <TextArea
        value={code}
        onChange={(event) => {
          setCode(event.target.value)
          props.onEdit(event.target.value)
        }}
      />
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
`

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
`

const TextArea = styled.textarea`
  flex-grow: 1;
  color: #d4d4d4;
  background-color: #333;
  outline: none;
`
