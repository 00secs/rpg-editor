use std::fs;

#[tauri::command]
pub fn save_json_file(path: String, body: String) -> bool {
    fs::write(path, body).is_ok()
}
