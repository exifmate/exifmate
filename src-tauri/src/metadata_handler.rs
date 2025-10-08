use exiftool::ExifTool;
use serde;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::fmt;
use std::path::Path;
use std::string::String;
use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
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

pub type ImageData = HashMap<String, ExifValue>;

fn map_json(val: &Value) -> Result<ImageData, serde_json::Error> {
    Ok(serde_json::from_value(val.clone())?)
}

pub fn load_metadata(
    handle: tauri::AppHandle,
    img_paths: Vec<String>,
) -> Result<ImageData, String> {
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

    let Ok(converted): Result<Vec<ImageData>, _> = exif_data.iter().map(map_json).collect() else {
        return Err("Failed mapping exif data".to_string());
    };

    Ok(aggregate_exif(&converted))
}

pub fn save_metadata(img_paths: Vec<String>, new_data: ImageData) -> Result<(), String> {
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

fn aggregate_exif(items: &Vec<ImageData>) -> ImageData {
    let mut result = HashMap::<String, ExifValue>::new();

    if items.is_empty() {
        return result;
    }

    let mut all_keys = HashSet::new();
    for item in items {
        for key in item.keys() {
            all_keys.insert(key.clone());
        }
    }

    for key in all_keys {
        let Some(first_item) = items.first() else {
            continue;
        };
        let Some(common_value) = first_item.get(&key) else {
            continue;
        };

        let all_same = items
            .iter()
            .all(|item| item.get(&key) == Some(common_value));

        if all_same {
            result.insert(key, common_value.clone());
        }
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        let first = ImageData::from([
            ("Artist".to_string(), ExifValue::String("".to_string())),
            (
                "ImageDescription".to_string(),
                ExifValue::String("test".to_string()),
            ),
            ("Make".to_string(), ExifValue::String("foo".to_string())),
            (
                "Orientation".to_string(),
                ExifValue::String("Horizontal (normal)".to_string()),
            ),
            (
                "WhiteBalance".to_string(),
                ExifValue::String("Auto".to_string()),
            ),
            ("SerialNumber".to_string(), ExifValue::Number(123.0)),
            ("LensSerialNumber".to_string(), ExifValue::Number(1.0)),
            ("DateTimeOriginal".to_string(), ExifValue::Null),
        ]);
        let second = ImageData::from([
            ("Artist".to_string(), ExifValue::String("".to_string())),
            (
                "ImageDescription".to_string(),
                ExifValue::String("test".to_string()),
            ),
            ("Make".to_string(), ExifValue::String("bar".to_string())),
            (
                "Orientation".to_string(),
                ExifValue::String("Horizontal (normal)".to_string()),
            ),
            (
                "WhiteBalance".to_string(),
                ExifValue::String("Auto".to_string()),
            ),
            ("SerialNumber".to_string(), ExifValue::Number(123.0)),
            ("LensSerialNumber".to_string(), ExifValue::Number(2.0)),
            ("DateTimeOriginal".to_string(), ExifValue::Null),
        ]);
        let third = ImageData::from([
            ("Artist".to_string(), ExifValue::String("".to_string())),
            (
                "ImageDescription".to_string(),
                ExifValue::String("test".to_string()),
            ),
            ("Make".to_string(), ExifValue::String("foo".to_string())),
            (
                "WhiteBalance".to_string(),
                ExifValue::String("Auto".to_string()),
            ),
            ("SerialNumber".to_string(), ExifValue::Number(123.0)),
            ("LensSerialNumber".to_string(), ExifValue::Number(3.0)),
            ("DateTimeOriginal".to_string(), ExifValue::Null),
        ]);

        let expected = ImageData::from([
            ("Artist".to_string(), ExifValue::String("".to_string())),
            (
                "ImageDescription".to_string(),
                ExifValue::String("test".to_string()),
            ),
            (
                "WhiteBalance".to_string(),
                ExifValue::String("Auto".to_string()),
            ),
            ("SerialNumber".to_string(), ExifValue::Number(123.0)),
            ("DateTimeOriginal".to_string(), ExifValue::Null),
        ]);

        assert_eq!(aggregate_exif(&Vec::from([first, second, third])), expected);
    }
}
