extern crate lib;

use std::env;
use lib::config;
use lib::library;
use std::path::Path;

fn scan_library(path: Path) {
    println!("Scanning library under {} ...", path);
    library::scan(path);
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
    let library_path: Path = conf.library.parse().unwrap();
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
