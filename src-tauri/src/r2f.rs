use std::{fs::File, io::Read, path::Path};
use tauri::{AppHandle, Emitter};
use tauri_plugin_dialog::DialogExt;

#[derive(Clone, serde::Serialize)]
struct OpenWorkspacePayload {
    path: String,
    body: String,
}
pub fn open_workspace(app: &AppHandle) {
    let app = app.clone();
    app.dialog().file().pick_folder(move |path| {
        // 準備
        let Some(path) = path.map(|n| n.to_string()) else {
            return;
        };
        if !Path::new(&path).is_dir() {
            app.dialog()
                .message(format!("{}にディレクトリが存在しません。", &path));
            return;
        }
        // ファイル読込
        let file_path = Path::new(&path).join("project.json");
        let body = if file_path.is_file() {
            let mut file = match File::open(&file_path) {
                Ok(n) => n,
                Err(e) => {
                    app.dialog().message(format!("{}", e));
                    return;
                }
            };
            let mut body = String::new();
            match file.read_to_string(&mut body) {
                Ok(_) => body,
                Err(e) => {
                    app.dialog().message(format!("{}", e));
                    return;
                }
            }
        } else {
            "{\"maps\":[]}".to_string()
        };
        // クライアントへ送信
        let payload = OpenWorkspacePayload {
            path: path.clone(),
            body,
        };
        if let Err(e) = app.emit("open_workspace", payload) {
            app.dialog()
                .message(format!("ワークスペース'{}'のロードに失敗：{}", path, e));
        }
    });
}
