extern crate rodio;

use std::fs::File;
use std::io::BufReader;
use std::path::Path;

use self::rodio::Source;
use self::rodio::Device;
use self::rodio::Decoder;

pub struct Playback {
    library_path: String,
    filepath: String,
    current_time: i64,
    total_time: i64,
    device: Device
}

impl Playback {
    pub fn new(library_path: String) -> Self {
        Playback {
            library_path: library_path.clone(),
            filepath: "".to_string(),
            current_time: 0,
            total_time: 0,
            device: rodio::default_output_device().unwrap()
        }
    }

    pub fn play(&mut self, filepath: String) {
        if self.filepath != filepath {

            // file already playing/loaded,
            // unload it first
            if self.filepath.is_empty() == false {
                self.filepath = filepath;

            }

            let file = self.open_file(self.filepath.clone());
            let source = Decoder::new(BufReader::new(file)).unwrap();
            rodio::play_raw(&self.device, source.convert_samples());
        }
    }

    pub fn pause(&mut self, ) {

    }

    pub fn reset(&mut self, ) {
        self.current_time = 0;
        self.total_time = 0;
        self.filepath = "".to_string();
    }

    pub fn get_current_time(&mut self) -> i64 {
        self.current_time
    }

    pub fn set_current_time(&mut self, time: i64) {
        // implement
    }

    pub fn get_total_time(&mut self) -> i64 {
        self.total_time
    }

    fn open_file(&mut self, filepath: String) -> File {
        File::open(
            Path::new(self.library_path.as_str()).join(Path::new(filepath.as_str()))
        ).unwrap()
    }
}
