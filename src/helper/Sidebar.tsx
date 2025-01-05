import {useState, ReactNode, useRef} from 'react'
import styled from 'styled-components'

type Props = {
  children?: ReactNode
  initialWidth: number
}

/**
 * 左に伸縮できるサイドバー。
 *
 * 高さ100%。
 * 左に線があり、それをつまんで幅を変えられる。
 * はみ出た部分は非表示になる。
 */
export default function Sidebar(props: Props) {
  const [width, setWidth] = useState(props.initialWidth)

  const resizeInfo = useRef({
    startWidth: width,
    startPosition: 0,
  })

  const handleMouseMove = (event: MouseEvent) => {
    setWidth(resizeInfo.current.startWidth + resizeInfo.current.startPosition - event.pageX)
  }
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  return (
    <Container style={{width: width}}>
      <Handle
        onMouseDown={(event) => {
          resizeInfo.current = {
            startWidth: width,
            startPosition: event.pageX,
          }
          document.addEventListener('mousemove', handleMouseMove)
          document.addEventListener('mouseup', handleMouseUp)
        }}
      />
      <Content>{props.children}</Content>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  height: 100%;
`

const Handle = styled.div`
  width: 2px;
  min-width: 2px;
  max-width: 2px;
  height: 100%;
  min-height: 100%;
  max-height: 100%;
  cursor: col-resize;
  background-color: #333;
`

const Content = styled.div`
  flex-grow: 1;
  overflow: hidden;
`
