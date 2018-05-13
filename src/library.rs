extern crate chrono;
extern crate sha1;

use std::fs::File;
use std::usize;
use std::path::Path;
use self::chrono::prelude::*;
use self::sha1::Sha1;

pub const MEDIA_EXTENSIONS: [&str; 3] = [
    ".mp3",
    ".wav",
    ".ogg"
];

pub struct Library {
    pub updated_at: String,
    pub albums: Vec<Album>
}

pub struct Album {
    id: String,
    src: String,
    artist: String,
    title: String,
    media: Vec<String>,
    cover: String
}

pub fn scan(path: &Path) -> Library {
    let albums = find_albums(path);
    let updated_at: String = Utc::now().to_rfc3339();
    let library = Library { albums, updated_at };
    return library;
}

fn humanize_filename(filename: String) -> String {
    filename.replacen("_", " ", usize::max_value())
}

fn readdir_recursive(path: &Path) -> Vec<String> {
    let mut dirs: Vec<String> = Vec::new();

    for entry in path.read_dir().expect("read_dir call failed") {
        if let Ok(entry) = entry {
            let path_buf = entry.path();
            let path = path_buf.as_path();

            if is_dir(path) {
                dirs.push(
                    path.to_str().unwrap().to_string()
                );
            }
        }
    }

    for src in &dirs {
        dirs.extend(
            readdir_recursive(Path::new(src.clone().as_str()))
        );
    }

    return dirs;
}

// fn prefix_path(prefix: &Path, suffix: &Path) -> Path {
//     prefix.join(suffix).as_path()
// }

fn album_contains_media(album: Album) -> bool {
    album.media.len() > 0
}

fn is_dir(path: &Path) -> bool {
    path.is_dir()
}

fn is_album_cover(path: &Path) {

}

fn file_size(file: &File) {

}

fn sha1_from_path(path: &Path) -> String {
    Sha1::from(path.to_str().unwrap().to_string())
    .digest()
    .to_string()
}

fn scan_album(path: &Path) -> Album {
    let files: Vec<String> = Vec::new();
    let media_files: Vec<String> = Vec::new();
    // files.clone().retain(|&file| is_media_file(Path::new(file.clone().as_str())));

    let album: Album = Album {
        id: sha1_from_path(path),
        src: path.to_str().unwrap().to_string(),
        artist: album_artist(path),
        title: album_title(path),
        media: media_files,
        cover: find_album_cover(path, files)
    };

    return album;
}

fn is_media_file(path: &Path) -> bool {
    let result = path.extension();

    match result.as_mut() {
        Some(ext) => MEDIA_EXTENSIONS.contains(&ext.to_str().unwrap()),
        None => false,
        _ => false,
    }
}

fn album_title(path: &Path) -> String {

}

fn album_artist(path: &Path) -> String {

}

fn find_album_cover(path: &Path, files: Vec<String>) -> String {
    let mut cover = path.join("cover.jpg")
        .as_path()
        .to_str()
        .unwrap()
        .to_string();

    return cover;
}

fn find_albums(path: &Path) -> Vec<Album> {
    let albums: Vec<Album> = Vec::new();

    let dirs = readdir_recursive(path);

    // remove hidden directories and MACOSX dirs
    dirs.retain(|&dir| !dir.starts_with(".") && !dir.starts_with("__MACOSX"));

    for dir in &dirs {
        let path = Path::new(dir.clone().as_str());
        albums.push(
            scan_album(&path)
        );
    }

    return albums;
}
