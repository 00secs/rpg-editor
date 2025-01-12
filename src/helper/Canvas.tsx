import {useEffect, useRef} from 'react'

type Props = {
  image: HTMLImageElement | null
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  styleWidth: number
  styleHeight: number
}

export default function Canvas(props: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const context = canvas.current?.getContext('2d')
    if (!context) {
      return
    }
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.current!.width, canvas.current!.height)
    if (props.image) {
      const left = props.image.width * props.left
      const top = props.image.width * props.top
      const right = props.image.width * props.right - left
      const bottom = props.image.width * props.bottom - top
      context.drawImage(props.image, left, top, right, bottom, 0, 0, props.width, props.height)
    }
  }, [props.image, props.left, props.top, props.right, props.bottom, props.width, props.height])

  return (
    <canvas
      ref={canvas}
      width={props.width}
      height={props.height}
      style={{
        display: 'block',
        width: `${props.styleWidth}px`,
        height: `${props.styleHeight}px`,
      }}
    />
  )
}
