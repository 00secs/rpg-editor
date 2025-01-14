mod f2r;
mod r2f;

use tauri::{menu::*, AppHandle, Builder, Emitter, Runtime};

// NOTE: Builder.menu()がクロージャを要求する都合上、
//       メニューアイテムのインスタンスからIDを参照できないため、
//       定数で共通化する。
const OPEN_WORKSPACE_MENU_ID: &str = "openproject";
const SAVE_MENU_ID: &str = "save";
const EXPORT_MENU_ID: &str = "export";

fn create_menu<R: Runtime>(handle: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    Ok(Menu::with_items(
        handle,
        &[
            // NOTE: macOSではアプリ名のメニューを追加しなければならない。
            //       もし追加しない場合は、この配列の1個目の要素が強制的にアプリ名のメニューとなる。
            #[cfg(target_os = "macos")]
            &Submenu::with_items(
                handle,
                "rpg-editor",
                true,
                &[
                    &PredefinedMenuItem::about(handle, Some("About rpg-editor"), None)?,
                    &PredefinedMenuItem::hide(handle, Some("Hide rpg-editor"))?,
                    &PredefinedMenuItem::hide_others(handle, Some("Hide Others"))?,
                    &PredefinedMenuItem::close_window(handle, Some("Quit rpg-editor"))?,
                ],
            )?,
            &Submenu::with_items(
                handle,
                "File",
                true,
                &[
                    &MenuItemBuilder::with_id(OPEN_WORKSPACE_MENU_ID, "Open Workspace")
                        .accelerator("CmdOrCtrl+O")
                        .build(handle)?,
                    &PredefinedMenuItem::separator(handle)?,
                    &MenuItemBuilder::with_id(SAVE_MENU_ID, "Save")
                        .accelerator("CmdOrCtrl+S")
                        .build(handle)?,
                    &PredefinedMenuItem::separator(handle)?,
                    &MenuItemBuilder::with_id(EXPORT_MENU_ID, "Export").build(handle)?,
                    &PredefinedMenuItem::separator(handle)?,
                    &PredefinedMenuItem::close_window(handle, Some("Quit"))?,
                ],
            )?,
        ],
    )?)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .menu(create_menu)
        .on_menu_event(|app, event| {
            if event.id() == OPEN_WORKSPACE_MENU_ID {
                r2f::open_workspace(app);
            } else if event.id() == SAVE_MENU_ID {
                let _ = app.emit("save", {});
            } else if event.id() == EXPORT_MENU_ID {
                let _ = app.emit("export", {});
            }
        })
        .invoke_handler(tauri::generate_handler![
            f2r::new_file,
            f2r::save_file,
            f2r::read_file
        ])
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| panic!("{}", e));
}
