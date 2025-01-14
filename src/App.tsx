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
import {VscAccount, VscMapFilled, VscNewFile} from 'react-icons/vsc'
import {defaultMapData, parseMapData} from './pages/map/types'
import Prompt from './helper/Propmpt'
import {build, parseProject, Project} from './util/build'
import {defaultActorData, parseActorData} from './pages/actor/types'
import ActorPage from './pages/actor/ActorPage'

type PageType = 'actor' | 'map'
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
        case 'actor':
          const adata = parseActorData(response.content)
          if (!adata) {
            message(`${path}は無効なデータです。`)
            return
          }
          setPage(
            <ActorPage
              rootPath={rootPath}
              path={path}
              data={adata}
              saved={saved}
            />
          )
          break
        case 'map':
          const mdata = parseMapData(response.content)
          if (!mdata) {
            message(`${path}は無効なデータです。`)
            return
          }
          setPage(
            <MapPage
              rootPath={rootPath}
              path={path}
              data={mdata}
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
      // 追加
      let nfr = false
      let newProject = project
      switch (type) {
        case 'actor':
          nfr = await sendNewFile(`${rootPath}/${path}`, JSON.stringify(defaultActorData()))
          const newActors = [...project.actors]
          newActors.push(path)
          newProject = {
            ...project,
            actors: newActors.sort(),
          }
          break
        case 'map':
          nfr = await sendNewFile(`${rootPath}/${path}`, JSON.stringify(defaultMapData()))
          const newMaps = [...project.maps]
          newMaps.push(path)
          newProject = {
            ...project,
            maps: newMaps.sort(),
          }
          break
      }
      if (!nfr) {
        message(`${rootPath}/${path}の作成に失敗しました。`)
        return
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
              <Box label='ACTORS'>
                <File onClick={() => setPromptState('actor')}>
                  <VscNewFile />
                  <label>New Actor</label>
                </File>
                {project.actors.map((n, i) => (
                  <File
                    key={i}
                    onClick={() => selectFile('actor', n)}
                  >
                    <VscAccount />
                    <label>{n}</label>
                  </File>
                ))}
              </Box>
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
