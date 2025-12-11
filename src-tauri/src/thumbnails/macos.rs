use fast_image_resize::{images::Image, IntoImageView, ResizeOptions, Resizer};
use image::{codecs::png::PngEncoder, DynamicImage, ImageBuffer, ImageEncoder};
use std::{
    io::{BufWriter, Cursor},
    time::Instant,
};
use swift_rs::{swift, Int, SRData, SRObject, SRString};

#[repr(C)]
struct PixelBufferResult {
    width: Int,
    height: Int,
    data: SRData, // Format: RGBA8, premultiplied alpha
}

swift!(fn load_image_pixels(path: SRString) -> Option<SRObject<PixelBufferResult>>);

const THUMBNAIL_SIZE: Int = 300;

pub fn load_thumbnail(path: String) -> Result<Vec<u8>, String> {
    let Some(pixel_info) = (unsafe { load_image_pixels(path.as_str().into()) }) else {
        return Err("Failed to resize image".to_string());
    };

    let Some(img) = ImageBuffer::<image::Rgba<u8>, Vec<u8>>::from_raw(
        pixel_info.width.try_into().unwrap(),
        pixel_info.height.try_into().unwrap(),
        pixel_info.data.to_vec(),
    ) else {
        return Err("Failed to create image from pixel data".to_string());
    };
    let dynimg = DynamicImage::ImageRgba8(img);

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
