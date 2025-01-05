use std::{fs::File, io::Read};
use tauri::{AppHandle, Emitter};
use tauri_plugin_dialog::DialogExt;

#[derive(Clone, serde::Serialize)]
pub struct OpenJSONFileEventPayload {
    path: String,
    body: String,
}
pub fn open_json_file(app: &AppHandle) {
    let app = app.clone();
    app.dialog()
        .file()
        .add_filter("JSON", &["json"])
        .pick_file(move |file_path| {
            let Some(file_path) = file_path.map(|n| n.to_string()) else {
                return;
            };
            let Ok(mut file) = File::open(&file_path) else {
                app.dialog()
                    .message(format!("{}が開けませんでした。", &file_path));
                return;
            };
            let mut contents = String::new();
            if file.read_to_string(&mut contents).is_err() {
                app.dialog()
                    .message(format!("{}の読込に失敗しました。", &file_path));
                return;
            }
            if app
                .emit(
                    "open_json_file",
                    OpenJSONFileEventPayload {
                        path: file_path.to_string(),
                        body: contents,
                    },
                )
                .is_err()
            {
                app.dialog().message(format!(
                    "{}のバックエンドからフロントエンドへの転送に失敗しました。",
                    &file_path
                ));
            }
        });
}
