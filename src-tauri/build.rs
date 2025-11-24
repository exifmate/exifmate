use swift_rs::SwiftLinker;

fn main() {
    SwiftLinker::new("10.13")
        .with_package("swift-thumbnails", "../swift-thumbnails")
        .link();
    tauri_build::build()
}
