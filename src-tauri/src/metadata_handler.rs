use exiftool::ExifTool;
use serde;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fmt;
use std::{collections::HashMap, path::Path};
use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ExifValue {
    String(String),
    Number(f64),
    Bool(bool),
    Null,
}

impl fmt::Display for ExifValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ExifValue::String(s) => write!(f, "{}", s),
            ExifValue::Number(n) => write!(f, "{}", n),
            ExifValue::Bool(b) => write!(f, "{}", b),
            ExifValue::Null => write!(f, ""),
        }
    }
}

type ImageData = HashMap<String, ExifValue>;

fn map_json(val: &Value) -> Result<ImageData, serde_json::Error> {
    Ok(serde_json::from_value(val.clone())?)
}

#[tauri::command]
pub fn read_metadata(
    handle: tauri::AppHandle,
    img_paths: Vec<String>,
) -> Result<Vec<ImageData>, String> {
    let Ok(exiftool_path) = handle
        .path()
        .resolve("resources/exiftool/exiftool", BaseDirectory::Resource)
    else {
        return Err("Failed to get path to exiftool".to_string());
    };

    let Ok(mut exiftool) = ExifTool::with_executable(exiftool_path.as_path()) else {
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

#[tauri::command]
pub fn write_metadata(img_paths: Vec<String>, new_data: ImageData) -> Result<(), String> {
    let Ok(mut exiftool) = ExifTool::new() else {
        return Err("Failed initiating exiftool".to_string());
    };

    let mut combined_args = Vec::<String>::new();

    for item in new_data {
        let tag_name = match item.0.to_lowercase().as_str() {
            "gpslatitude" => "GPSLatitude*",
            "gpslongitude" => "GPSLongitude*",
            _ => item.0.as_str(),
        };

        let arg = format!("-{}={}", tag_name, item.1);
        combined_args.push(arg)
    }

    for img_path in img_paths {
        combined_args.push(img_path);
    }

    let args: Vec<&str> = combined_args.iter().map(|s| s.as_str()).collect();

    let run = exiftool.execute_lines(args.as_slice());
    match run {
        Ok(_) => Ok(()),
        Err(e) => {
            eprintln!("Failed to convert data: {}", e);
            Err("Failed updating metadata".to_string())
        }
    }
}
