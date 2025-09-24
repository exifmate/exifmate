use exiftool::ExifTool;
use serde;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{collections::HashMap, path::Path};

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ExifValue {
    String(String),
    Number(f64),
    Bool(bool),
    Null,
}

type ImageData = HashMap<String, ExifValue>;

fn map_json(val: &Value) -> Result<ImageData, serde_json::Error> {
    Ok(serde_json::from_value(val.clone())?)
}

#[tauri::command]
pub fn read_metadata(img_paths: Vec<String>) -> Result<Vec<ImageData>, String> {
    let Ok(mut exiftool) = ExifTool::new() else {
        return Err("Failed initiating exiftool".to_string());
    };

    let paths: Vec<&Path> = img_paths.iter().map(|p| Path::new(p)).collect();

    let Ok(exif_data) = exiftool.json_batch(paths, &["-c", "%+.9f"]) else {
        return Err("Failed running exiftool".to_string());
    };

    let Ok(converted) = exif_data.iter().map(map_json).collect() else {
        return Err("Failed mapping exif data".to_string());
    };

    Ok(converted)
}

// #[tauri::command]
