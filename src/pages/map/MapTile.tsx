import {useEffect, useRef} from 'react'
import {MapTileData} from './types'
import styled from 'styled-components'

type Props = {
  image: HTMLImageElement | null
  data: MapTileData
}

export default function MapTile(props: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const context = canvas.current?.getContext('2d')
    if (!context) {
      return
    }
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.current!.width, canvas.current!.height)
    if (props.image) {
      const left = props.image.width * props.data.uv.left
      const top = props.image.width * props.data.uv.top
      const right = props.image.width * props.data.uv.right - left
      const bottom = props.image.width * props.data.uv.bottom - top
      context.drawImage(props.image, left, top, right, bottom, 0, 0, 48, 48)
    }
  }, [props.image, props.data])

  return (
    <Canvas
      ref={canvas}
      width={48}
      height={48}
    />
  )
}

const Canvas = styled.canvas`
  display: block;
  width: 48px;
  height: 48px;
`
