import {DialogFilter, open} from '@tauri-apps/plugin-dialog'
import {useCallback, useMemo} from 'react'
import styled from 'styled-components'
import IconButton from '../IconButton'
import {VscFolder} from 'react-icons/vsc'

type Props = {
  value: string
  filters: DialogFilter[]
  onPicked: (path: string) => void
}

/**
 * ファイル選択フォーム。
 */
export default function FilePicker(props: Props) {
  const value = useMemo(() => props.value.split(/[/\\]/).pop() || '', [props.value])

  const onClick = useCallback(async () => {
    const path = await open({
      filters: props.filters,
    })
    if (!path) {
      return
    }
    props.onPicked(path)
  }, [props.filters, props.onPicked])

  return (
    <Picker>
      <ContentContainer>
        <Content title={props.value}>{value}</Content>
      </ContentContainer>
      <IconButton
        Icon={VscFolder}
        onClick={onClick}
      />
    </Picker>
  )
}

const Picker = styled.div`
  display: flex;
  gap: 4px;
  width: 100%;
  min-width: 0;
`

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
`

const Content = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
