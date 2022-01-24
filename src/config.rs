extern crate serde;
extern crate serde_json;

use std::fs::File;

#[derive(Serialize, Deserialize, Clone)]
pub struct Config {
    pub library: String,
    pub cache: String,
    pub port: u16
}

pub fn load(path: String) -> Result<Config, serde_json::Error> {
    let file = File::open(path).unwrap();
    let config: Config = serde_json::from_reader(file)?;

    return Ok(config);
}
