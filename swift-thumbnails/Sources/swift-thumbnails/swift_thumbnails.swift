import Foundation
import SwiftRs
import ImageIO
import CoreGraphics

class PixelBufferResult: NSObject {
    var width: Int
    var height: Int
    var data: SRData // Format: RGBA8, premultiplied alpha

    init(width: Int, height: Int, data: Data) {
        self.width = width
        self.height = height
        self.data = SRData(Array(data))
    }
}

@_cdecl("load_image_pixels")
func loadImagePixels(path: SRString) -> PixelBufferResult? {
    let url = URL(fileURLWithPath: path.toString())

    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
        return nil
    }

    let width = image.width
    let height = image.height
    let bytesPerPixel = 4
    let bytesPerRow = width * bytesPerPixel

    let colorSpace = CGColorSpaceCreateDeviceRGB()

    var rawData = Data(count: bytesPerRow * height)
    rawData.withUnsafeMutableBytes { ptr in
        guard let ctx = CGContext(
            data: ptr.baseAddress,
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: bytesPerRow,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else {
            return
        }

        let rect = CGRect(x: 0, y: 0, width: width, height: height)
        ctx.draw(image, in: rect)
    }

    return PixelBufferResult(
        width: width,
        height: height,
        data: rawData
    )
}
