use exifmate_lib::thumbnails::load_thumbnail;
use std::fs;

#[test]
fn test_load_thumbnail_creates_a_thumbnail() {
    let path = "tests/image.png";
    let result = load_thumbnail(path.to_string());
    assert!(result.is_ok());

    let buffer = result.unwrap();
    let expected =
        fs::read("tests/expected-thumbnail.png").expect("Failed to load expected thumbnail");
    assert_eq!(buffer, expected);
}

#[test]
fn test_load_thumbnail_handles_nonexistent_file() {
    let path = "tests/nonexistent.png";
    let result = load_thumbnail(path.to_string());
    assert!(result.is_err());
}
