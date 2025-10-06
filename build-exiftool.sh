#!/bin/bash
set -euo pipefail

PKG_NAME=Image-ExifTool-13.38
echo "Let's get $PKG_NAME"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

cd $TMP_DIR

DL_NAME=$PKG_NAME.tar.gz
curl -fL --no-progress-meter -o $DL_NAME "https://sourceforge.net/projects/exiftool/files/${DL_NAME}"
tar -xvzf $DL_NAME

cd $PKG_NAME
perl Makefile.PL
make
make test

cd blib
mv script/exiftool .
rm -rf arch bin man1 man3 script

TARGET_DIR=$PROJECT_ROOT/src-tauri/resources/exiftool
[ -d $TARGET_DIR ] && rm -rf $TARGET_DIR
mkdir -p $PROJECT_ROOT/src-tauri/resources
mv $(pwd) $TARGET_DIR
