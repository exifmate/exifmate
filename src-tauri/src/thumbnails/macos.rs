use swift_rs::{swift, Int, SRData, SRString};

swift!(fn resize_image(path: SRString, width: Int, height: Int) -> Option<SRData>);

const THUMBNAIL_SIZE: Int = 300;

pub fn load_thumbnail(path: String) -> Result<Vec<u8>, String> {
    let Some(image_data) =
        (unsafe { resize_image(path.as_str().into(), THUMBNAIL_SIZE, THUMBNAIL_SIZE) })
    else {
        return Err("Failed to resize image".to_string());
    };

    return Ok(image_data.to_vec());
}
