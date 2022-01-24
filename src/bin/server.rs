extern crate lib;

use lib::config;
use lib::server::run_server;

#[tokio::main]
async fn main() {
    let conf = config::load("config.json".to_string()).unwrap();
    let port = conf.port;
    let library = conf.library;
    let cache = conf.cache;

    let server = run_server(port, library, cache);
    println!("Server running on http://localhost:{}/", port);

    server.await;
}
