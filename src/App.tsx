import './App.css'

import {useCallback, useEffect, useRef, useState} from 'react'
import MapPage from './pages/map/MapPage'
import styled from 'styled-components'
import {
  listenClosing,
  listenExport,
  listenOpenWorkspace,
  sendNewFile,
  sendReadFile,
  sendSaveFile,
} from './util/api'
import {ask, message} from '@tauri-apps/plugin-dialog'
import Sidebar from './helper/Sidebar'
import Box from './helper/Box'
import {VscMapFilled, VscNewFile} from 'react-icons/vsc'
import {defaultMapData, parseMapData} from './pages/map/types'
import Prompt from './helper/Propmpt'
import {build, parseProject, Project} from './util/build'

type PageType = 'map'
type PageTypeWithNull = PageType | null

export default function App() {
  // プロジェクト
  const [rootPath, setRootPath] = useState('')
  const [project, setProject] = useState<Project | null>(null)
  // メニュー「File>Export」を購読
  useEffect(() => {
    listenExport(() => {
      if (!project) {
        return
      }
      build(rootPath, project)
    })
  }, [rootPath, project])

  // ファイル
  const [page, setPage] = useState<JSX.Element>(<></>)
  const [promptState, setPromptState] = useState<PageTypeWithNull>(null)
  const saved = useRef(true)
  // ファイル選択コールバック
  const selectFile = useCallback(
    async (type: PageTypeWithNull, name: string) => {
      if (!saved.current && !(await ask('ファイルが未保存ですがよろしいですか。'))) {
        return
      }
      if (type === null) {
        setPage(<></>)
        return
      }
      const path = `${rootPath}/${name}`
      const response = await sendReadFile(path)
      if (!response.ok) {
        message(response.content)
        return
      }
      switch (type) {
        case 'map':
          const data = parseMapData(response.content)
          if (!data) {
            message(`${path}は無効なデータです。`)
            return
          }
          setPage(
            <MapPage
              rootPath={rootPath}
              path={path}
              data={data}
              saved={saved}
            />
          )
          break
      }
    },
    [rootPath]
  )
  // ファイル追加コールバック
  const newFile = useCallback(
    async (type: PageType, path: string) => {
      if (!project) {
        return
      }
      // ファイル作成
      const nfr = await sendNewFile(`${rootPath}/${path}`, JSON.stringify(defaultMapData()))
      if (!nfr) {
        message(`${rootPath}/${path}の作成に失敗しました。`)
        return
      }
      // 追加
      let newProject = project
      switch (type) {
        case 'map':
          const newMaps = [...project.maps]
          newMaps.push(path)
          newProject = {
            maps: newMaps.sort(),
          }
          break
      }
      setProject(newProject)
      // 保存
      const sfr = await sendSaveFile(`${rootPath}/project.json`, JSON.stringify(newProject))
      if (!sfr) {
        message('プロジェクトの保存に失敗しました。')
      }
    },
    [rootPath, project]
  )

  useEffect(() => {
    // メニュー「File>Open Workspace」を購読
    listenOpenWorkspace(async (event) => {
      if (!saved.current && !(await ask('ファイルが未保存ですがよろしいですか。'))) {
        return
      }
      const newProject = parseProject(event.payload.body)
      if (!newProject) {
        message(`${event.payload.path}は無効なワークスペースです。`)
        return
      }
      setPage(<></>)
      setPromptState(null)
      setRootPath(event.payload.path)
      setProject(newProject)
    })

    // ウィンドウクローズ時に未保存状態であれば警告を出す
    listenClosing(async (event) => {
      if (!saved.current && !(await ask('ファイルが未保存ですがよろしいですか。'))) {
        event.preventDefault()
      }
    })
  }, [])

  return (
    <main className='container'>
      {project === null ? (
        <DefaultPage>
          <DefaultMessage>ワークスペースを開いてください</DefaultMessage>
        </DefaultPage>
      ) : (
        <>
          <Page>
            <Sidebar
              initialWidth={200}
              isLeft={true}
            >
              <Box label='MAPS'>
                <File onClick={() => setPromptState('map')}>
                  <VscNewFile />
                  <label>New Map</label>
                </File>
                {project.maps.map((n, i) => (
                  <File
                    key={i}
                    onClick={() => selectFile('map', n)}
                  >
                    <VscMapFilled />
                    <label>{n}</label>
                  </File>
                ))}
              </Box>
            </Sidebar>
            {page}
          </Page>
          {promptState !== null && (
            <Prompt
              label='ファイル名を入力してください。'
              onBlur={(value) => {
                if (value === '') {
                  message('ファイル名に空文字列は指定できません。')
                  return
                }
                newFile(promptState, value)
                setPromptState(null)
              }}
            />
          )}
        </>
      )}
    </main>
  )
}

const DefaultPage = styled.div`
  display: flex;
  align-items: center;
  width: 100vw;
  height: 100vh;
`

const DefaultMessage = styled.span`
  text-align: center;
  width: 100%;
`

const Page = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
`

const File = styled.div`
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
`
