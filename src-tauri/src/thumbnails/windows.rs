use windows::core::HSTRING;
use windows::Win32::{
    Foundation::{GENERIC_READ, HGLOBAL},
    Graphics::Imaging::{
        CLSID_WICImagingFactory, GUID_ContainerFormatJpeg, GUID_WICPixelFormat24bppBGR,
        IWICBitmapClipper, IWICBitmapEncoder, IWICBitmapFrameEncode, IWICBitmapScaler,
        IWICImagingFactory, WICBitmapEncoderNoCache, WICBitmapInterpolationModeFant,
        WICDecodeMetadataCacheOnLoad, WICRect,
    },
    System::Com::StructuredStorage::CreateStreamOnHGlobal,
    System::Com::{
        CoCreateInstance, IStream, CLSCTX_INPROC_SERVER, STATFLAG, STATSTG, STREAM_SEEK_SET,
    },
};

const THUMBNAIL_SIZE: u32 = 300;

pub fn load_thumbnail(path: String) -> Result<Vec<u8>, String> {
    unsafe {
        // Create WIC factory
        let factory: IWICImagingFactory =
            CoCreateInstance(&CLSID_WICImagingFactory, None, CLSCTX_INPROC_SERVER)
                .map_err(|e| format!("Failed to create WIC factory: {e:?}"))?;

        // Create decoder from filename
        let decoder = factory
            .CreateDecoderFromFilename(
                &HSTRING::from(path),
                None,
                GENERIC_READ,
                WICDecodeMetadataCacheOnLoad,
            )
            .map_err(|e| format!("Failed to create decoder: {e:?}"))?;

        // Get first frame
        let frame = decoder
            .GetFrame(0)
            .map_err(|e| format!("Failed to get frame: {e:?}"))?;

        // Get image dimensions
        let mut w = 0u32;
        let mut h = 0u32;
        frame
            .GetSize(&mut w, &mut h)
            .map_err(|e| format!("Failed to get image size: {e:?}"))?;

        // Calculate crop dimensions to maintain aspect ratio (center crop)
        let target_ratio = THUMBNAIL_SIZE as f32 / THUMBNAIL_SIZE as f32; // 1.0 for square
        let original_ratio = w as f32 / h as f32;

        let (target_width, target_height) = if original_ratio > target_ratio {
            // Image is too wide: crop horizontally
            let crop_height = h;
            let crop_width = (crop_height as f32 * target_ratio).round() as u32;
            (crop_width, crop_height)
        } else {
            // Image is too tall: crop vertically
            let crop_width = w;
            let crop_height = (crop_width as f32 / target_ratio).round() as u32;
            (crop_width, crop_height)
        };

        // Center the crop
        let offset_x = (w - target_width) / 2;
        let offset_y = (h - target_height) / 2;

        // Create clipper to crop the image
        let clipper: IWICBitmapClipper = factory
            .CreateBitmapClipper()
            .map_err(|e| format!("Failed to create clipper: {e:?}"))?;
        clipper
            .Initialize(
                &frame,
                &WICRect {
                    X: offset_x as i32,
                    Y: offset_y as i32,
                    Width: target_width as i32,
                    Height: target_height as i32,
                },
            )
            .map_err(|e| format!("Failed to initialize clipper: {e:?}"))?;

        // Create scaler to resize to thumbnail size
        let scaler: IWICBitmapScaler = factory
            .CreateBitmapScaler()
            .map_err(|e| format!("Failed to create scaler: {e:?}"))?;
        scaler
            .Initialize(
                &clipper,
                THUMBNAIL_SIZE,
                THUMBNAIL_SIZE,
                WICBitmapInterpolationModeFant,
            )
            .map_err(|e| format!("Failed to initialize scaler: {e:?}"))?;

        // Create stream for output using CreateStreamOnHGlobal
        let stream: IStream = CreateStreamOnHGlobal(HGLOBAL::default(), true)
            .map_err(|e| format!("Failed to create stream: {e:?}"))?;

        // Create JPEG encoder
        let encoder: IWICBitmapEncoder = factory
            .CreateEncoder(&GUID_ContainerFormatJpeg, std::ptr::null())
            .map_err(|e| format!("Failed to create encoder: {e:?}"))?;

        encoder
            .Initialize(&stream, WICBitmapEncoderNoCache)
            .map_err(|e| format!("Failed to initialize encoder: {e:?}"))?;

        // Create new frame in the encoder
        let mut frame_encode: Option<IWICBitmapFrameEncode> = None;
        // CreateNewFrame expects *mut Option<IPropertyBag2> but we can pass null_mut
        encoder
            .CreateNewFrame(core::ptr::addr_of_mut!(frame_encode), std::ptr::null_mut())
            .map_err(|e| format!("Failed to create new frame: {e:?}"))?;

        let frame_encode = frame_encode.ok_or("Failed to get frame encoder")?;

        frame_encode
            .Initialize(None)
            .map_err(|e| format!("Failed to initialize frame: {e:?}"))?;
        frame_encode
            .SetSize(THUMBNAIL_SIZE, THUMBNAIL_SIZE)
            .map_err(|e| format!("Failed to set frame size: {e:?}"))?;

        let mut pixel_format = GUID_WICPixelFormat24bppBGR;
        frame_encode
            .SetPixelFormat(&mut pixel_format)
            .map_err(|e| format!("Failed to set pixel format: {e:?}"))?;

        // Write the scaled image to the frame
        frame_encode
            .WriteSource(&scaler, std::ptr::null())
            .map_err(|e| format!("Failed to write source: {e:?}"))?;

        // Commit frame and encoder
        frame_encode
            .Commit()
            .map_err(|e| format!("Failed to commit frame: {e:?}"))?;
        encoder
            .Commit()
            .map_err(|e| format!("Failed to commit encoder: {e:?}"))?;

        // Get stream stats to determine size
        let mut stat = STATSTG::default();
        stream
            .Stat(&mut stat, STATFLAG::default())
            .map_err(|e| format!("Failed to get stream stats: {e:?}"))?;

        // Seek to beginning of stream
        stream
            .Seek(0, STREAM_SEEK_SET, None)
            .map_err(|e| format!("Failed to seek stream: {e:?}"))?;

        // Read all data from stream
        let mut buffer = vec![0u8; stat.cbSize as usize];
        let mut bytes_read = 0u32;
        stream
            .Read(
                buffer.as_mut_ptr() as *mut _,
                buffer.len() as u32,
                Some(&mut bytes_read),
            )
            .ok()
            .map_err(|e| format!("Failed to read from stream: {e:?}"))?;

        buffer.truncate(bytes_read as usize);
        Ok(buffer)
    }
}
