extern crate lib;

use lib::config;
use lib::server::start;

fn main() {
    let conf = config::load("config.json".to_string()).unwrap();
    let port = conf.port;
    let library = conf.library;

    start(port, library);
}
