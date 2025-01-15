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
import CodeEditor from '../../helper/CodeEditor'
import {VscAdd, VscCode} from 'react-icons/vsc'
import Prompt from '../../helper/Propmpt'
import Item from '../../helper/Item'
import SettingItems from '../../helper/SettingItems'

type ChildProps = EditPageChildProps<ActorData, {rootPath: string}>
type UVFuncType = 'idle' | 'moving'
type UVFuncDirection = 'left' | 'right' | 'up' | 'down'

function ActorPageBody(props: ChildProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [uvFuncType, setUVFuncType] = useState<UVFuncType>('idle')
  const [uvFuncDirection, setUVFuncDirection] = useState<UVFuncDirection>('left')
  const [i, setI] = useState(0)
  const [eventIndex, setEventIndex] = useState<number | null>(null)
  const [promptState, setPromptState] = useState(false)

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
        {eventIndex !== null ? (
          <CodeEditor
            code={props.data.events[eventIndex].code}
            onEdit={(code) => {
              // TODO: これで問題ないか？
              props.data.events[eventIndex].code = code
              props.setData(props.data)
            }}
            onExit={() => setEventIndex(null)}
          />
        ) : (
          <>
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
          </>
        )}
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
          <SettingItems label='events'>
            <Item
              Icon={VscAdd}
              label='New'
              selected={false}
              onClick={() => setPromptState(true)}
            />
            {props.data.events.map((n, i) => (
              <Item
                key={i}
                Icon={VscCode}
                label={n.name}
                selected={eventIndex === i}
                onClick={() => setEventIndex(i)}
              />
            ))}
          </SettingItems>
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
      {promptState && (
        <Prompt
          label='コード名を入力してください。'
          onBlur={(value) => {
            if (value === '') {
              message('ファイル名に空文字列は指定できません。')
              return
            }
            // TOTO: これで問題ないか？
            props.data.events.push({name: value, code: ''})
            props.data.events = props.data.events.sort((a, b) => (a.name < b.name ? -1 : 1))
            props.setData(props.data)
            setPromptState(false)
          }}
        />
      )}
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
  display: flex;
  flex-flow: column;
`
