use gdk_pixbuf::{InterpType, Pixbuf};
use std::path::Path;

const THUMBNAIL_SIZE: i32 = 300;

pub fn load_thumbnail(path: String) -> Result<Vec<u8>, String> {
    let Ok(original_image) = Pixbuf::from_file(Path::new(&path)) else {
        return Err("Failed to read file.".to_string());
    };

    let original_width = original_image.width();
    let original_height = original_image.height();

    let target_ratio = THUMBNAIL_SIZE as f32 / THUMBNAIL_SIZE as f32;
    let original_ratio = original_width as f32 / original_height as f32;

    // Determine crop size
    let (target_width, target_height) = if original_ratio > target_ratio {
        // too wide: crop horizontally
        let target_height = original_height;
        let target_width = (target_height as f32 * target_ratio).round() as i32;
        (target_width, target_height)
    } else {
        // too tall: crop vertically
        let target_width = original_width;
        let target_height = (target_width as f32 / target_ratio).round() as i32;
        (target_width, target_height)
    };

    // Center the crop
    let offset_x = (original_width - target_width) / 2;
    let offset_y = (original_height - target_height) / 2;

    let sub = original_image.new_subpixbuf(offset_x, offset_y, target_width, target_height);

    let Some(scaled_image) = sub.scale_simple(THUMBNAIL_SIZE, THUMBNAIL_SIZE, InterpType::Bilinear)
    else {
        return Err("Failed to scale.".to_string());
    };

    let Ok(buffer) = scaled_image.save_to_bufferv("jpeg", &[]) else {
        return Err("Failed to create JPEG buffer".to_string());
    };

    Ok(buffer)
}
