import Foundation
import CoreGraphics
import SwiftRs
import ImageIO
import UniformTypeIdentifiers

@_cdecl("resize_image")
public func resizeImage(path: SRString, width: Int, height: Int) -> SRData? {
    let url = URL(fileURLWithPath: path.toString())

    guard let imageSource = CGImageSourceCreateWithURL(url as CFURL, nil) else {
        return nil
    }

    guard let image = CGImageSourceCreateImageAtIndex(imageSource, 0, nil) else {
        return nil
    }

    let imageSize = CGSize(width: image.width, height: image.height)
    let targetSize = CGSize(width: Int(width), height: Int(height))

    // Calculate scale to fill (aspect fill) - scale that covers the target
    let scale = max(targetSize.width / imageSize.width, targetSize.height / imageSize.height)
    let scaledSize = CGSize(width: imageSize.width * scale, height: imageSize.height * scale)

    // Calculate offset to center the scaled image
    let offsetX = (scaledSize.width - targetSize.width) / 2.0
    let offsetY = (scaledSize.height - targetSize.height) / 2.0

    let colorSpace = CGColorSpaceCreateDeviceRGB()

    guard let context = CGContext(
        data: nil,
        width: Int(width),
        height: Int(height),
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else {
        return nil
    }

    context.interpolationQuality = .high

    // Transform to center and scale: translate to center, then scale
    context.translateBy(x: -offsetX, y: -offsetY)
    context.scaleBy(x: scale, y: scale)

    // Draw the image (will be cropped by context bounds)
    context.draw(image, in: CGRect(origin: .zero, size: imageSize))

    guard let resizedImage = context.makeImage() else {
        return nil
    }

    let destinationData = NSMutableData()

    let jpeg: CFString
    if #available(macOS 11.0, *) {
        jpeg = UTType.jpeg.identifier as CFString
    } else {
        jpeg = kUTTypeJPEG as CFString
    }

    guard let imageDestination = CGImageDestinationCreateWithData(
        destinationData,
        jpeg,
        1,
        nil
    ) else {
        return nil
    }

    let compressionProperties: NSDictionary = [
        kCGImageDestinationLossyCompressionQuality: 0.9
    ]

    CGImageDestinationAddImage(imageDestination, resizedImage, compressionProperties)

    guard CGImageDestinationFinalize(imageDestination) else {
        return nil
    }

    return SRData(Array(destinationData))
}

