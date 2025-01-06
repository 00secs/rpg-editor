use std::{
    fs::{self, File},
    io::Read,
    path::Path,
};

#[tauri::command]
pub fn new_file(path: String, body: String) -> bool {
    !Path::new(&path).is_file() && fs::write(path, body).is_ok()
}

#[tauri::command]
pub fn save_file(path: String, body: String) -> bool {
    fs::write(path, body).is_ok()
}

#[derive(serde::Serialize)]
pub struct ReadFileResponse {
    ok: bool,
    content: String,
}
#[tauri::command]
pub fn read_file(path: String) -> ReadFileResponse {
    let mut file = match File::open(path) {
        Ok(n) => n,
        Err(e) => {
            return ReadFileResponse {
                ok: false,
                content: format!("{e}"),
            };
        }
    };
    let mut content = String::new();
    match file.read_to_string(&mut content) {
        Ok(_) => ReadFileResponse { ok: true, content },
        Err(e) => ReadFileResponse {
            ok: false,
            content: format!("{e}"),
        },
    }
}
