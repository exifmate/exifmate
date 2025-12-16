use image::{DynamicImage, ImageBuffer, Rgba};
use swift_rs::{swift, Int, SRData, SRObject, SRString};

#[repr(C)]
struct PixelBufferResult {
    width: Int,
    height: Int,
    data: SRData, // Format: RGBA8, premultiplied alpha
}

swift!(fn load_image_pixels(path: SRString) -> Option<SRObject<PixelBufferResult>>);

pub fn load_image(path: String) -> Result<DynamicImage, String> {
    let Some(pixel_info) = (unsafe { load_image_pixels(path.as_str().into()) }) else {
        return Err("Failed to resize image".to_string());
    };

    let Some(img) = ImageBuffer::<Rgba<u8>, Vec<u8>>::from_raw(
        pixel_info.width.try_into().unwrap(),
        pixel_info.height.try_into().unwrap(),
        pixel_info.data.to_vec(),
    ) else {
        return Err("Failed to create image from pixel data".to_string());
    };

    Ok(DynamicImage::ImageRgba8(img))
}
