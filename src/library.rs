extern crate chrono;
extern crate sha1;
extern crate natord;

use std::fs;
use std::fs::File;
use std::usize;
use std::path::Path;
use self::chrono::prelude::*;
use self::sha1::Sha1;

pub const AUDIO_EXTENSIONS: [&str; 3] = [
    "mp3",
    "wav",
    "ogg"
];

pub const VIDEO_EXTENSIONS: [&str; 4] = [
    "mp4",
    "mpeg",
    "ogv",
    "webm"
];

pub const IMAGE_EXTENSIONS: [&str; 3] = [
    "jpg",
    "jpeg",
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
    audios: Vec<String>,
    images: Vec<String>,
    videos: Vec<String>,
    cover: String,
    createdAt: String,
}

pub fn scan(path: String) -> Library {
    let mut albums: Vec<Album> = Vec::new();

    let _albums = find_albums(Path::new(path.as_str()));
    let prefix_length = path.len() + 1;

    // remove library path from all album and media paths
    for album in _albums {
        // skip albums without media
        if album_contains_media(&album) == false {
            continue;
        }

        let mut src = album.src.clone();
        src.drain(0..prefix_length);

        let mut cover = album.cover.clone();
        cover.drain(0..prefix_length);

        let mut audio_files: Vec<String> = Vec::new();
        let mut image_files: Vec<String> = Vec::new();
        let mut video_files: Vec<String> = Vec::new();

        for file in album.audios {
            let mut _file = file.clone();
            _file.drain(0..prefix_length);
            audio_files.push(_file);
        }

        for file in album.images {
            let mut _file = file.clone();
            _file.drain(0..prefix_length);
            image_files.push(_file);
        }

        for file in album.videos {
            let mut _file = file.clone();
            _file.drain(0..prefix_length);
            video_files.push(_file);
        }

        albums.push(Album {
            id: album.id.clone(),
            artist: album.artist.clone(),
            title: album.title.clone(),
            src,
            audios: audio_files,
            images: image_files,
            videos: video_files,
            cover,
            createdAt: album.createdAt
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

    files.sort_by(|a, b| natord::compare(a.as_str(), b.as_str()));

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

    dirs.sort_by(|a, b| natord::compare(a.as_str(), b.as_str()));

    return dirs;
}

// fn prefix_path(prefix: &Path, suffix: &Path) -> Path {
//     prefix.join(suffix).as_path()
// }

fn album_contains_media(album: &Album) -> bool {
    album.audios.len() > 0 ||
    album.images.len() > 0 ||
    album.videos.len() > 0
}

fn is_dir(path: &Path) -> bool {
    path.is_dir()
}

fn file_size(_file: &File) {

}

fn sha1_from_path(path: &Path) -> String {
    Sha1::from(path.to_str().unwrap().to_string())
    .digest()
    .to_string()
}

fn scan_album(path: &Path) -> Album {
    let files: Vec<String> = readdir(path);
    let mut audio_files: Vec<String> = files.clone();
    audio_files.retain(|ref file| is_audio_file(Path::new(file.clone().as_str())));
    let mut image_files: Vec<String> = files.clone();
    image_files.retain(|ref file| is_image_file(Path::new(file.clone().as_str())));
    let mut video_files: Vec<String> = files.clone();
    video_files.retain(|ref file| is_video_file(Path::new(file.clone().as_str())));

    let album_metadata = fs::metadata(path);
    let mut created_at: String = String::new();
    
    if let Ok(created_time) = album_metadata.unwrap().created() {
        let created_time_dt: DateTime<Utc> = created_time.clone().into();
        created_at = created_time_dt.to_rfc3339();
    }

    let album: Album = Album {
        id: sha1_from_path(path),
        src: path.to_str().unwrap().to_string(),
        artist: album_artist(path),
        title: album_title(path),
        audios: audio_files,
        images: image_files.clone(),
        videos: video_files,
        cover: find_album_cover(path, image_files.clone()),
        createdAt: created_at
    };

    return album;
}

pub fn is_audio_file(path: &Path) -> bool {
    match path.extension() {
        Some(ext) => return AUDIO_EXTENSIONS.contains(
            &ext
            .to_str()
            .unwrap()
            .to_lowercase()
            .as_str()
        ),
        None => return false,
    };
}

pub fn is_video_file(path: &Path) -> bool {
    match path.extension() {
        Some(ext) => return VIDEO_EXTENSIONS.contains(
            &ext
            .to_str()
            .unwrap()
            .to_lowercase()
            .as_str()
        ),
        None => return false,
    };
}

pub fn is_image_file(path: &Path) -> bool {
    match path.extension() {
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
    let mut max_size = 0;
    let mut cover = path.join("cover.jpg")
        .as_path()
        .to_str()
        .unwrap()
        .to_string();

    for file in _files.iter() {
        let size = fs::metadata(file).unwrap().len();
        if size > max_size {
            max_size = size;
            cover = file.to_string();
        }
    }

    return cover;
}

fn find_albums(path: &Path) -> Vec<Album> {
    let mut albums: Vec<Album> = Vec::new();
    let mut dirs = readdir_recursive(path);

    // remove hidden directories and MACOSX dirs
    // TODO: this only checks for hidden or MACOSX dirs on top level, but must on the dirname level
    dirs.retain(|dir| !dir.starts_with(".") && !dir.starts_with("__MACOSX"));

    for dir in &dirs {
        let _dir = dir.clone();
        let path = Path::new(_dir.as_str());
        let album = scan_album(&path);
        albums.push(album);
    }

    return albums;
}
