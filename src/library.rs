extern crate chrono;
extern crate sha1;

use std::fs::File;
use std::usize;
use std::path::Path;
use self::chrono::prelude::*;
use self::sha1::Sha1;

pub const MEDIA_EXTENSIONS: [&str; 3] = [
    "mp3",
    "wav",
    "ogg"
];

pub const IMAGE_EXTENSIONS: [&str; 2] = [
    "jpg",
    "png"
];

#[derive(Serialize, Deserialize, Clone)]
pub struct Library {
    pub updatedAt: String,
    pub albums: Vec<Album>
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Album {
    id: String,
    src: String,
    artist: String,
    title: String,
    media: Vec<String>,
    cover: String
}

pub fn scan(path: String) -> Library {
    let _albums = find_albums(Path::new(path.as_str()));
    let prefix_length = path.len() + 1;

    // remove library path from all album and media paths
    let mut albums: Vec<Album> = Vec::new();

    for album in _albums {
        // skip albums without media
        if album_contains_media(&album) == false {
            continue;
        }

        let mut src = album.src.clone();
        src.drain(0..prefix_length);

        let mut cover = album.cover.clone();
        cover.drain(0..prefix_length);

        let mut media: Vec<String> = Vec::new();

        for file in album.media {
            let mut _file = file.clone();
            _file.drain(0..prefix_length);
            media.push(_file);
        }

        albums.push(Album {
            id: album.id.clone(),
            artist: album.artist.clone(),
            title: album.title.clone(),
            src,
            media,
            cover
        });
    }

    let updated_at: String = Utc::now().to_rfc3339();
    let library = Library {
        albums,
        updatedAt: updated_at
    };

    return library;
}

fn humanize_filename(filename: String) -> String {
    filename.replacen("_", " ", usize::max_value())
}

fn readdir(path: &Path) -> Vec<String> {
    let mut files: Vec<String> = Vec::new();

    for entry in path.read_dir().expect("read_dir call failed") {
        if let Ok(entry) = entry {
            let path_buf = entry.path();
            let path = path_buf.as_path();

            let file = path.to_str().unwrap().to_string();
            files.push(file);
        }
    }

    return files;
}

fn readdir_recursive(path: &Path) -> Vec<String> {
    let mut dirs: Vec<String> = Vec::new();

    for entry in path.read_dir().expect("read_dir call failed") {
        if let Ok(entry) = entry {
            let path_buf = entry.path();
            let path = path_buf.as_path();

            if is_dir(path) {
                let dir = path.to_str().unwrap().to_string();
                dirs.push(dir);

                // recurse into sub directories
                dirs.extend(
                    readdir_recursive(path)
                );
            }
        }
    }

    return dirs;
}

// fn prefix_path(prefix: &Path, suffix: &Path) -> Path {
//     prefix.join(suffix).as_path()
// }

fn album_contains_media(album: &Album) -> bool {
    album.media.len() > 0
}

fn is_dir(path: &Path) -> bool {
    path.is_dir()
}

fn file_size(file: &File) {

}

fn sha1_from_path(path: &Path) -> String {
    Sha1::from(path.to_str().unwrap().to_string())
    .digest()
    .to_string()
}

fn scan_album(path: &Path) -> Album {
    let files: Vec<String> = readdir(path);
    let mut media_files: Vec<String> = files.clone();
    media_files.retain(|ref file| is_media_file(Path::new(file.clone().as_str())));

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

fn is_album_cover(path: &Path) -> bool {
    let result = path.extension();

    match result {
        Some(ext) => return IMAGE_EXTENSIONS.contains(
            &ext
            .to_str()
            .unwrap()
            .to_lowercase()
            .as_str()
        ),
        None => return false,
    };
}

fn is_media_file(path: &Path) -> bool {
    match path.extension() {
        Some(ext) => return MEDIA_EXTENSIONS.contains(
            &ext
            .to_str()
            .unwrap()
            .to_lowercase()
            .as_str()
        ),
        None => return false,
    };
}

fn album_title(path: &Path) -> String {
    let file_name = humanize_filename(
        path.file_name().unwrap().to_str().unwrap().to_string()
    );

    match file_name.find(" - ") {
        Some(index) =>
            if index > 3 {
                return humanize_filename(
                    file_name.split(" - ").last().unwrap().to_string()
                )
            } else {
                return file_name.trim().to_string()
            },
        _ => return file_name.trim().to_string(),
    }
}

fn album_artist(path: &Path) -> String {
    let file_name = humanize_filename(
        path.file_name().unwrap().to_str().unwrap().to_string()
    );

    match file_name.find(" - ") {
        Some(index) =>
            if index > 3 {
                return humanize_filename(
                    file_name.split(" - ").next().unwrap().to_string()
                )
            } else {
                return file_name.trim().to_string()
            },
        _ => return file_name.trim().to_string(),
    }
}

fn find_album_cover(path: &Path, _files: Vec<String>) -> String {
    // TODO: find largest image file and use that
    // or cover.jpg as a fallback
    let cover = path.join("cover.jpg")
        .as_path()
        .to_str()
        .unwrap()
        .to_string();

    return cover;
}

fn find_albums(path: &Path) -> Vec<Album> {
    let mut albums: Vec<Album> = Vec::new();
    let mut dirs = readdir_recursive(path);

    // remove hidden directories and MACOSX dirs
    dirs.retain(|dir| !dir.starts_with(".") && !dir.starts_with("__MACOSX"));

    for dir in &dirs {
        let _dir = dir.clone();
        let path = Path::new(_dir.as_str());
        let album = scan_album(&path);
        albums.push(album);
    }

    return albums;
}
