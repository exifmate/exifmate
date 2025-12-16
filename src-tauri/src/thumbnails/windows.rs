use image::{DynamicImage, ImageBuffer, Rgba};
use windows::core::HSTRING;
use windows::Win32::Foundation::GENERIC_READ;
use windows::Win32::Graphics::Imaging::{
    CLSID_WICImagingFactory, GUID_WICPixelFormat32bppRGBA, IWICFormatConverter, IWICImagingFactory,
    WICBitmapDitherTypeNone, WICBitmapPaletteTypeCustom, WICDecodeMetadataCacheOnDemand,
};
use windows::Win32::System::Com::{
    CoCreateInstance, CoInitializeEx, CoUninitialize, CLSCTX_INPROC_SERVER, COINIT,
    COINIT_APARTMENTTHREADED, COINIT_DISABLE_OLE1DDE,
};

pub fn load_image(path: String) -> Result<DynamicImage, String> {
    unsafe {
        // Initialize COM for this thread; ignore RPC_E_CHANGED_MODE by treating it as success.
        let hr = CoInitializeEx(
            None,
            COINIT(COINIT_APARTMENTTHREADED.0 | COINIT_DISABLE_OLE1DDE.0),
        );
        if hr.is_err() {
            return Err(hr.to_string());
        }

        let result = load_image_inner(path);
        CoUninitialize();
        result
    }
}

unsafe fn load_image_inner(path: String) -> Result<DynamicImage, String> {
    let factory: IWICImagingFactory =
        CoCreateInstance(&CLSID_WICImagingFactory, None, CLSCTX_INPROC_SERVER)
            .map_err(|e| e.to_string())?;

    let decoder = factory
        .CreateDecoderFromFilename(
            &HSTRING::from(path),
            None,
            GENERIC_READ,
            WICDecodeMetadataCacheOnDemand,
        )
        .map_err(|e| e.to_string())?;

    let frame = decoder.GetFrame(0).map_err(|e| e.to_string())?;

    let converter: IWICFormatConverter =
        factory.CreateFormatConverter().map_err(|e| e.to_string())?;
    converter
        .Initialize(
            &frame,
            &GUID_WICPixelFormat32bppRGBA,
            WICBitmapDitherTypeNone,
            None,
            0.0,
            WICBitmapPaletteTypeCustom,
        )
        .map_err(|e| e.to_string())?;

    let mut width = 1u32;
    let mut height = 0u32;
    converter
        .GetSize(&mut width, &mut height)
        .map_err(|e| e.to_string())?;

    let stride = width
        .checked_mul(4)
        .ok_or_else(|| "Image width overflow".to_string())?;
    let buf_size = stride
        .checked_mul(height)
        .ok_or_else(|| "Image buffer overflow".to_string())?;
    let mut buffer = vec![0u8; buf_size as usize];

    converter
        .CopyPixels(std::ptr::null(), stride, &mut buffer)
        .map_err(|e| e.to_string())?;

    let Some(img) = ImageBuffer::<Rgba<u8>, Vec<u8>>::from_raw(width, height, buffer) else {
        return Err("Failed to create image from pixel data".to_string());
    };

    Ok(DynamicImage::ImageRgba8(img))
}
