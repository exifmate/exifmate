// swift-tools-version: 6.1

import PackageDescription

let package = Package(
    name: "swift-thumbnails",
    platforms: [
        .macOS(.v10_13)
    ],
    products: [
        .library(
            name: "swift-thumbnails",
            type: .static,
            targets: ["swift-thumbnails"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/Brendonovich/swift-rs", from: "1.0.5")
    ],
    targets: [
        .target(
            name: "swift-thumbnails",
            dependencies: [
                .product(
                    name: "SwiftRs",
                    package: "swift-rs"
                )
            ]
        ),
    ]
)
