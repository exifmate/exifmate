# ExifMate

ExifMate is a tool for editing image Exif data, leveraging [ExifTool](https://exiftool.org/).

## Development

ExifMate is built using [Tauri](https://tauri.app/) (2), and React for the UI.

To get things running:

* Install the version of Node specified in `.nvmrc`
* Install Rust
* Install Perl if it's not included with your OS
* Run `node build-exiftool.ts` to download and build ExifTool as an app resource
* Install dependencies `npm install`
* You can run the dev version of the app with `npx tauri dev`
