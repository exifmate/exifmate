use fast_image_resize::{images::Image, IntoImageView, ResizeOptions, Resizer};
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

pub fn load_thumbnail(path: String) -> Result<Vec<u8>, String> {
    let dynimg = load_image(path)?;
    let mut dst_image = Image::new(THUMBNAIL_SIZE, THUMBNAIL_SIZE, dynimg.pixel_type().unwrap());

    let mut resizer = Resizer::new();
    resizer
        .resize(
            &dynimg,
            &mut dst_image,
            &ResizeOptions::new()
                .fit_into_destination((0.5, 0.5).into())
                .resize_alg(fast_image_resize::ResizeAlg::Nearest),
        )
        .unwrap();

    let mut result_buf = Cursor::new(Vec::new());
    PngEncoder::new(&mut result_buf)
        .write_image(
            dst_image.buffer(),
            THUMBNAIL_SIZE,
            THUMBNAIL_SIZE,
            dynimg.color().into(),
        )
        .unwrap();

    Ok(result_buf.into_inner())
}
