use fast_image_resize::{images::Image, IntoImageView, ResizeAlg::Nearest, ResizeOptions, Resizer};
use image::{codecs::png::PngEncoder, ImageEncoder};
use std::io::Cursor;

#[cfg(target_os = "macos")]
mod macos;

#[cfg(target_os = "macos")]
use macos::load_image;

#[cfg(target_os = "linux")]
mod linux;

#[cfg(target_os = "linux")]
pub use linux::load_image;

#[cfg(target_os = "windows")]
mod windows;

#[cfg(target_os = "windows")]
pub use windows::load_image;

const THUMBNAIL_SIZE: u32 = 300;

pub fn create_thumbnail(path: String) -> Result<Vec<u8>, String> {
    let original_image = load_image(path)?;
    let Some(original_pixel_type) = original_image.pixel_type() else {
        return Err("Unable to determine original pixel type".to_string());
    };
    let mut thumbnail = Image::new(THUMBNAIL_SIZE, THUMBNAIL_SIZE, original_pixel_type);

    let mut resizer = Resizer::new();
    resizer
        .resize(
            &original_image,
            &mut thumbnail,
            &ResizeOptions::new()
                .fit_into_destination((0.5, 0.5).into())
                .resize_alg(Nearest),
        )
        .map_err(|_| "Resizing failed".to_string())?;

    let mut result_buf = Cursor::new(Vec::new());
    PngEncoder::new(&mut result_buf)
        .write_image(
            thumbnail.buffer(),
            THUMBNAIL_SIZE,
            THUMBNAIL_SIZE,
            original_image.color().into(),
        )
        .map_err(|_| "Failed encoding thumbnail to PNG".to_string())?;

    Ok(result_buf.into_inner())
}
