use gdk_pixbuf::Pixbuf;
use image::{DynamicImage, ImageBuffer, Rgba};

pub fn load_thumbnail(path: String) -> Result<Vec<u8>, String> {
    let Ok(original_file) = Pixbuf::from_file(path) else {
        return Err("Failed to read file.".to_string());
    };

    let width = original_file.width() as u32;
    let height = original_file.height() as u32;
    let has_alpha = original_file.has_alpha();
    let rowstride = original_file.rowstride() as usize;
    let n_channels = original_file.n_channels() as usize;

    let pixels = unsafe { original_file.pixels() };

    // Convert to a contiguous RGBA buffer for the image crate
    let mut rgba_data = Vec::with_capacity((width * height * 4) as usize);

    for y in 0..height as usize {
        let row_start = y * rowstride;
        for x in 0..width as usize {
            let px_start = row_start + x * n_channels;
            rgba_data.push(pixels[px_start]); // R
            rgba_data.push(pixels[px_start + 1]); // G
            rgba_data.push(pixels[px_start + 2]); // B
            if has_alpha {
                rgba_data.push(pixels[px_start + 3]); // A
            } else {
                rgba_data.push(255); // opaque alpha
            }
        }
    }

    let Some(img) = ImageBuffer::<Rgba<u8>, Vec<u8>>::from_raw(width, height, rgba_data) else {
        return Err("Failed to create image from pixel data".to_string());
    };

    Ok(DynamicImage::ImageRgba8(img))
}
