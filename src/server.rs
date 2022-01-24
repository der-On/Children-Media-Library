extern crate futures;
extern crate hyper;
extern crate hyper_staticfile;
extern crate percent_encoding;
extern crate cmd_lib;
extern crate url;
extern crate md5;

use std::path::Path;
use std::io::{Error, ErrorKind};

use self::hyper::{Body, Request, Response, Server, Method, StatusCode};
use self::hyper::service::{make_service_fn, service_fn};
use self::hyper_staticfile::Static;
use self::url::Url;
use self::percent_encoding::{percent_decode};

use super::library::is_image_file;

type GenericError = Box<dyn std::error::Error + Send + Sync>;
type Result<T> = std::result::Result<T, GenericError>;

fn resize_image(path: &Path, w: u32, h: u32, dest: &Path) -> Result<String> {
    let dimensions = w.to_string() + "x" + &h.to_string();
    let new_path = format!("{:x}", md5::compute("/".to_owned() + &dimensions + "/" + path.to_str().unwrap())) + ".jpg";
    let full_new_path = dest.join(&new_path);
    
    if path.exists() == false {
        return Err(Box::new(
            Error::new(ErrorKind::NotFound, "Image not found.")
        ));
    }

    if full_new_path.exists() {
        Ok(new_path)
    } else {
        let output = cmd_lib::run_fun!(
            mkdir -p $dest;
            convert $path -resize $dimensions $full_new_path;
        );

        match output {
            Ok(_) => {
                Ok(new_path)
            },
            Err(err) => {
                Err(Box::new(err))
            }
        }
    }
}

async fn request_handler(
    req: Request<Body>,
    public_handler: Static,
    library_handler: Static,
    cache_handler: Static
) -> Result<Response<Body>> {
    let path = req.uri().path();
    let library_path = library_handler.root.as_path();
    let cache_path = cache_handler.root.as_path();

    match (req.method(), path) {
        (&Method::GET, _) => {
            let uri = req.uri();

            if path.starts_with("/library/") == true {
                let new_uri_str = format!("{}", uri.path()).replace("/library/", "/");
                let full_uri = "http://localhost".to_owned() + &uri.to_string();
                let full_new_uri = "http://localhost".to_owned() + &new_uri_str.to_string();
                let relative_path = Url::parse(&full_new_uri).unwrap().path().to_owned();
                let relative_path_decoded = percent_decode(relative_path.as_bytes()).decode_utf8().unwrap();
                let full_path = library_path.join(&relative_path_decoded.strip_prefix("/").unwrap());
                
                if is_image_file(&full_path) {
                    match Url::parse(full_uri.as_str()) {
                        Ok(url) => {
                            let mut w = 0;
                            let mut h = 0;

                            for (key, value) in url.query_pairs() {
                                if key == "w" {
                                    w = value.parse::<u32>().unwrap();
                                }
                                if key == "h" {
                                    h = value.parse::<u32>().unwrap();
                                }
                            }

                            match resize_image(&full_path, w, h, cache_path) {
                                Ok(resized_path) => {
                                    let resized_uri = "/".to_owned() + &resized_path;
                                    let request = Request::builder()
                                        .method(Method::GET)
                                        .uri(resized_uri)
                                        .body("")
                                        .unwrap();

                                    Ok(
                                        cache_handler.serve(request).await?
                                    )
                                }
                                Err(err) => {
                                    eprintln!("{:?}", err);
                                    
                                    let request = Request::builder()
                                        .method(Method::GET)
                                        .uri(new_uri_str)
                                        .body("")
                                        .unwrap();
                                        
                                    Ok(
                                        library_handler.serve(request).await?
                                    )
                                }
                            }
                        }

                        Err(err) => {
                            eprintln!("{:?}", err);
                            
                            let request = Request::builder()
                                .method(Method::GET)
                                .uri(new_uri_str)
                                .body("")
                                .unwrap();
                                
                            Ok(
                                library_handler.serve(request).await?
                            )
                        }
                    }
                } else {
                    let request = Request::builder()
                        .method(Method::GET)
                        .uri(new_uri_str)
                        .body("")
                        .unwrap();
                        
                    Ok(
                        library_handler.serve(request).await?
                    )
                }
            } else {
                Ok(
                    public_handler.serve(req).await?
                )
            }
        }
        (&Method::POST, "/shutdown") => {
            eprintln!("Shuting down ...");
            let output = cmd_lib::run_fun!(
                sh raspi/shutdown.sh
            );

            match output {
                Ok(_) => {
                    Ok(Response::builder()
                        .status(StatusCode::OK)
                        .body("System shutdown initialized.".into())
                        .unwrap()
                    )
                },
                error => {
                    eprintln!("Error during system shutdown: {:?}", error);
                    Ok(Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .body("Error during system shutdown.".into())
                        .unwrap()
                    )
                }
            }
        }
        (&Method::POST, "/scan") => {
            eprintln!("Scanning library ...");
            let output = cmd_lib::run_fun!(
                sh raspi/scan.sh
            );

            match output {
                Ok(_) => {
                    Ok(Response::builder()
                        .status(StatusCode::OK)
                        .body("Scan completed.".into())
                        .unwrap()
                    )
                },
                error => {
                    eprintln!("Error during scan: {:?}", error);
                    Ok(Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .body("Error during scan.".into())
                        .unwrap()
                    )
                }
            }
        }
        _ => {
            Ok(Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body("Not found.".into())
                .unwrap()
            )
        }
    }
}


pub async fn run_server(port: u16, library: String, cache: String) {
    let addr = format!("0.0.0.0:{}", port).parse().unwrap();
    let public_handler = Static::new(Path::new("public/"));
    let library_handler = Static::new(Path::new(&library));
    let cache_handler = Static::new(Path::new(&cache));

    let api_service = make_service_fn(move |_| {
        let public_handler = public_handler.clone();
        let library_handler = library_handler.clone();
        let cache_handler = cache_handler.clone();

        async {
            Ok::<_, GenericError>(service_fn(move |req| {
                request_handler(
                    req,
                    public_handler.to_owned(),
                    library_handler.to_owned(),
                    cache_handler.to_owned()
                )
            }))
        }
    });

    let server = Server::bind(&addr).serve(api_service);

    if let Err(e) = server.await {
        eprintln!("server error: {}", e);
    }
}
