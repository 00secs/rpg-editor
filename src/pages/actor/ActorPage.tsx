import {useEffect, useState} from 'react'
import {convertFileSrc} from '@tauri-apps/api/core'
import {ActorData, defaultUVFuncPoint, UVFuncPoint} from './types'
import styled from 'styled-components'
import Sidebar from '../../helper/Sidebar'
import {message} from '@tauri-apps/plugin-dialog'
import EditPage, {EditPageChildProps} from '../../helper/EditPage'
import Box from '../../helper/Box'
import SettingItem from '../../helper/SettingItem'
import NumberInput from '../../helper/form/NumberInput'
import TextInput from '../../helper/form/TextInput'
import ActorRow from './ActorRow'

type ChildProps = EditPageChildProps<ActorData, {rootPath: string}>
type UVFuncType = 'idle' | 'moving'
type UVFuncDirection = 'left' | 'right' | 'up' | 'down'

function ActorPageBody(props: ChildProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [uvFuncType, setUVFuncType] = useState<UVFuncType>('idle')
  const [uvFuncDirection, setUVFuncDirection] = useState<UVFuncDirection>('left')
  const [i, setI] = useState(0)

  const selectedPoint = props.data[uvFuncType][uvFuncDirection][i]

  const selectUVFuncPoint = (t: UVFuncType, d: UVFuncDirection, i: number) => {
    setUVFuncType(t)
    setUVFuncDirection(d)
    setI(i)
  }
  const addUVFuncPoint = (t: UVFuncType, d: UVFuncDirection) => {
    const n = props.data[t][d]
    n.push({
      ...defaultUVFuncPoint(),
      time: n.length > 0 ? n[n.length - 1].time : 0.0,
    })
    const r = {...props.data}
    r[t][d] = n
    props.setData(r)
  }
  const updateUVFuncPoint = (p: UVFuncPoint) => {
    const n = [...props.data[uvFuncType][uvFuncDirection]]
    n[i] = p
    const r = {...props.data}
    r[uvFuncType][uvFuncDirection] = n
    props.setData(r)
    return true
  }

  /**
   * ActorData.imageが変わるたびにHTMLImageElementをリロードするエフェクト。
   */
  useEffect(() => {
    // TODO: 空文字列になった場合、canvasをクリアする。
    if (props.data.image === '') {
      return
    }
    const path = `${props.rootPath}/${props.data.image}`
    const img = new Image()
    img.onload = () => setImage(img)
    img.onerror = () => message(`${path}の読み込みに失敗しました。`)
    img.src = convertFileSrc(path)
  }, [props.rootPath, props.data, props.data.image])

  return (
    <>
      <Content>
        <ActorRow
          label='IDLE [left]'
          image={image}
          width={props.data.width}
          height={props.data.height}
          points={props.data.idle.left}
          onSelect={(i) => selectUVFuncPoint('idle', 'left', i)}
          onAdd={() => addUVFuncPoint('idle', 'left')}
        />
        <ActorRow
          label='IDLE [right]'
          image={image}
          width={props.data.width}
          height={props.data.height}
          points={props.data.idle.right}
          onSelect={(i) => selectUVFuncPoint('idle', 'right', i)}
          onAdd={() => addUVFuncPoint('idle', 'right')}
        />
        <ActorRow
          label='IDLE [up]'
          image={image}
          width={props.data.width}
          height={props.data.height}
          points={props.data.idle.up}
          onSelect={(i) => selectUVFuncPoint('idle', 'up', i)}
          onAdd={() => addUVFuncPoint('idle', 'up')}
        />
        <ActorRow
          label='IDLE [down]'
          image={image}
          width={props.data.width}
          height={props.data.height}
          points={props.data.idle.down}
          onSelect={(i) => selectUVFuncPoint('idle', 'down', i)}
          onAdd={() => addUVFuncPoint('idle', 'down')}
        />
        <ActorRow
          label='MOVING [left]'
          image={image}
          width={props.data.width}
          height={props.data.height}
          points={props.data.moving.left}
          onSelect={(i) => selectUVFuncPoint('moving', 'left', i)}
          onAdd={() => addUVFuncPoint('moving', 'left')}
        />
        <ActorRow
          label='MOVING [right]'
          image={image}
          width={props.data.width}
          height={props.data.height}
          points={props.data.moving.right}
          onSelect={(i) => selectUVFuncPoint('moving', 'right', i)}
          onAdd={() => addUVFuncPoint('moving', 'right')}
        />
        <ActorRow
          label='MOVING [up]'
          image={image}
          width={props.data.width}
          height={props.data.height}
          points={props.data.moving.up}
          onSelect={(i) => selectUVFuncPoint('moving', 'up', i)}
          onAdd={() => addUVFuncPoint('moving', 'up')}
        />
        <ActorRow
          label='MOVING [down]'
          image={image}
          width={props.data.width}
          height={props.data.height}
          points={props.data.moving.down}
          onSelect={(i) => selectUVFuncPoint('moving', 'down', i)}
          onAdd={() => addUVFuncPoint('moving', 'down')}
        />
      </Content>
      <Sidebar
        initialWidth={200}
        isLeft={false}
      >
        <Box label='ACTOR SETTINGS'>
          <SettingItem label='texture'>
            <TextInput
              value={props.data.image}
              onChange={(path) => {
                props.setData({
                  ...props.data,
                  image: path,
                })
                return true
              }}
            />
          </SettingItem>
          <SettingItem label='width'>
            <NumberInput
              allowDecimal={false}
              min={1}
              max={10000}
              value={props.data.width}
              onChange={(n) => {
                props.setData({
                  ...props.data,
                  width: n,
                })
                return true
              }}
            />
          </SettingItem>
          <SettingItem label='height'>
            <NumberInput
              allowDecimal={false}
              min={1}
              max={10000}
              value={props.data.height}
              onChange={(n) => {
                props.setData({
                  ...props.data,
                  height: n,
                })
                return true
              }}
            />
          </SettingItem>
        </Box>
        <Box label='UV FUNC SETTINGS'>
          <SettingItem label='time'>
            <NumberInput
              allowDecimal={true}
              min={0}
              max={1}
              value={selectedPoint.time}
              onChange={(n) =>
                updateUVFuncPoint({
                  ...selectedPoint,
                  time: n,
                })
              }
            />
          </SettingItem>
          <SettingItem label='left'>
            <NumberInput
              allowDecimal={true}
              min={0}
              max={1}
              value={selectedPoint.l}
              onChange={(n) =>
                updateUVFuncPoint({
                  ...selectedPoint,
                  l: n,
                })
              }
            />
          </SettingItem>
          <SettingItem label='top'>
            <NumberInput
              allowDecimal={true}
              min={0}
              max={1}
              value={selectedPoint.t}
              onChange={(n) =>
                updateUVFuncPoint({
                  ...selectedPoint,
                  t: n,
                })
              }
            />
          </SettingItem>
          <SettingItem label='width'>
            <NumberInput
              allowDecimal={true}
              min={0}
              max={1}
              value={selectedPoint.w}
              onChange={(n) =>
                updateUVFuncPoint({
                  ...selectedPoint,
                  w: n,
                })
              }
            />
          </SettingItem>
          <SettingItem label='height'>
            <NumberInput
              allowDecimal={true}
              min={0}
              max={1}
              value={selectedPoint.h}
              onChange={(n) =>
                updateUVFuncPoint({
                  ...selectedPoint,
                  h: n,
                })
              }
            />
          </SettingItem>
        </Box>
      </Sidebar>
    </>
  )
}

type Props = {
  rootPath: string
  path: string
  data: ActorData
  saved: React.MutableRefObject<boolean>
}

export default function ActorPage(props: Props) {
  return (
    <EditPage
      Child={ActorPageBody}
      data={props.data}
      path={props.path}
      saved={props.saved}
      info={{rootPath: props.rootPath}}
    />
  )
}

const Content = styled.div`
  flex-grow: 1;
`
