import {invoke} from '@tauri-apps/api/core'
import {EventCallback, listen, UnlistenFn} from '@tauri-apps/api/event'

// ============================================================================================= //
//     listen                                                                                    //
// ============================================================================================= //

export const listenNewMap = (() => {
  let current: Promise<void> = Promise.resolve()
  let unlisten: UnlistenFn | null = null
  return async (cls: EventCallback<void>) => {
    current = current.then(async () => {
      if (unlisten !== null) {
        unlisten()
      }
      unlisten = await listen('new_map', cls)
    })
    await current
  }
})()

type OpenJSONFileEventPayload = {
  path: string
  body: string
}
export const listenOpenJSONFile = (() => {
  let current: Promise<void> = Promise.resolve()
  let unlisten: UnlistenFn | null = null
  return async (cls: EventCallback<OpenJSONFileEventPayload>) => {
    current = current.then(async () => {
      if (unlisten !== null) {
        unlisten()
      }
      unlisten = await listen('open_json_file', cls)
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

export function sendSaveJSONFile(path: string, body: string): Promise<boolean> {
  return invoke('save_json_file', {path, body})
}
