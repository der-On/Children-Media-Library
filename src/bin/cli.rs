extern crate serde;
extern crate serde_json;
extern crate lib;

use std::fs::File;
use std::env;
use lib::config;
use lib::library;
use std::path::Path;

fn scan_library(src: String) {
    println!("Scanning library under {} ...", src);
    let _library = library::scan(src);
    println!("Found {} albums.", _library.albums.len());

    let file = File::create("public/library.json").unwrap();
    serde_json::to_writer_pretty(file, &_library);

    println!("Updated library.json");
}

fn help() {
    let help_contents = r#"
        Usage:

        cli [action]

        Actions:

        scan    - Scans the library folders
        help    - Displays this help
    "#;

    println!("{}", help_contents);
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let conf = config::load("config.json".to_string()).unwrap();
    let library_path = conf.library;
    let action: String = match args.len() {
        0...1 => "help".to_owned(),
        _ => args[1].clone(),
    };

    match action.as_ref() {
        "scan" => scan_library(library_path),
        "help" => help(),
        _ => help(),
    };
}
