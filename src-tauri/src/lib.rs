use swift_rs::{swift, Int, SRData, SRString};
use tauri::ipc::Response;

swift!(fn resize_image(path: SRString, width: Int, height: Int) -> Option<SRData>);

const THUMBNAIL_SIZE: Int = 300;

#[tauri::command]
fn read_thumbnail(path: String) -> Result<Response, String> {
    let Some(image_data) =
        (unsafe { resize_image(path.as_str().into(), THUMBNAIL_SIZE, THUMBNAIL_SIZE) })
    else {
        return Err("Failed to resize image".to_string());
    };

    return Ok(Response::new(image_data.to_vec()));
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_thumbnail])
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
