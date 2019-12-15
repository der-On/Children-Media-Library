extern crate children_audio_library;

use children_audio_library::config;
use children_audio_library::server::start;

fn main() {
    let conf = config::load("config.json".to_string()).unwrap();
    let port = conf.port;
    let library = conf.library;

    start(port, library);
}
