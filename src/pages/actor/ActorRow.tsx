import {VscAdd} from 'react-icons/vsc'
import Canvas from '../../helper/Canvas'
import IconButton from '../../helper/IconButton'
import {UVFuncPoint} from './types'
import styled from 'styled-components'

type Props = {
  image: HTMLImageElement | null
  label: string
  width: number
  height: number
  points: UVFuncPoint[]
  onSelect: (i: number) => void
  onAdd: () => void
}

export default function ActorRow(props: Props) {
  return (
    <Container>
      <Label>{props.label}</Label>
      <Row>
        {props.points.map((n, i) => (
          <CanvasContainer
            key={i}
            onClick={() => props.onSelect(i)}
          >
            <Canvas
              image={props.image}
              left={n.l}
              top={n.t}
              right={n.l + n.w}
              bottom={n.t + n.h}
              width={props.width}
              height={props.height}
              styleWidth={props.width}
              styleHeight={props.height}
            />
          </CanvasContainer>
        ))}
        <IconButton
          Icon={VscAdd}
          onClick={() => props.onAdd()}
        />
      </Row>
    </Container>
  )
}

const Container = styled.div`
  padding: 3px;
`

const Label = styled.label`
  font-weight: bold;
`

const Row = styled.div`
  display: flex;
`

const CanvasContainer = styled.div`
  width: fit-content;
  height: fit-content;
  border: 1px solid black;
  &:hover {
    cursor: pointer;
  }
`
