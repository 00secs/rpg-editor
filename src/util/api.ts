import {invoke} from '@tauri-apps/api/core'
import {EventCallback, listen, UnlistenFn} from '@tauri-apps/api/event'

// ============================================================================================= //
//     listen                                                                                    //
// ============================================================================================= //

type OpenWorkspacePayload = {
  path: string
  body: string
}
export const listenOpenWorkspace = (() => {
  let current: Promise<void> = Promise.resolve()
  let unlisten: UnlistenFn | null = null
  return async (cls: EventCallback<OpenWorkspacePayload>) => {
    current = current.then(async () => {
      if (unlisten !== null) {
        unlisten()
      }
      unlisten = await listen('open_workspace', cls)
    })
    await current
  }
})()

export const listenSave = (() => {
  let current: Promise<void> = Promise.resolve()
  let unlisten: UnlistenFn | null = null
  return async (cls: EventCallback<void>) => {
    current = current.then(async () => {
      if (unlisten !== null) {
        unlisten()
      }
      unlisten = await listen('save', cls)
    })
    await current
  }
})()

// ============================================================================================= //
//     send                                                                                      //
// ============================================================================================= //

export function sendNewFile(path: string, body: string): Promise<boolean> {
  return invoke('new_file', {path, body})
}

export function sendSaveFile(path: string, body: string): Promise<boolean> {
  return invoke('save_file', {path, body})
}

type ReadFileResponse = {
  ok: boolean
  content: string
}
export function sendReadFile(path: string): Promise<ReadFileResponse> {
  return invoke('read_file', {path})
}