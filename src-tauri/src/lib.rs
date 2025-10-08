mod metadata_handler;

#[tauri::command]
fn read_metadata(
    handle: tauri::AppHandle,
    img_paths: Vec<String>,
) -> Result<metadata_handler::ImageData, String> {
    metadata_handler::load_metadata(handle, img_paths)
}

#[tauri::command]
fn write_metadata(
    img_paths: Vec<String>,
    new_data: metadata_handler::ImageData,
) -> Result<(), String> {
    metadata_handler::save_metadata(img_paths, new_data)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_metadata, write_metadata,])
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
