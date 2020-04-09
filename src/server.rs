extern crate futures;
extern crate hyper;
extern crate hyper_staticfile;
extern crate percent_encoding;
extern crate cmd_lib;

use std::path::Path;

use self::hyper::{Body, Request, Response, Server, Method, StatusCode};
use self::hyper::service::{make_service_fn, service_fn};
use self::hyper_staticfile::Static;
use self::cmd_lib::FunResult;

type GenericError = Box<dyn std::error::Error + Send + Sync>;
type Result<T> = std::result::Result<T, GenericError>;

async fn request_handler(
    req: Request<Body>,
    public_handler: Static,
    library_handler: Static
) -> Result<Response<Body>> {
    match req.method() {
        &Method::GET => {
            let path = req.uri().path();
            let uri = req.uri();

            if path.starts_with("/library/") == true {
                let new_uri_str = format!("{}", uri)
                    .replace("/library/", "/");

                let library_request = Request::builder()
                    .method(Method::GET)
                    .uri(new_uri_str)
                    .body("")
                    .unwrap();

                Ok(
                    library_handler.serve(library_request).await?
                )
            } else {
                Ok(
                    public_handler.serve(req).await?
                )
            }
        }
        &Method::POST => {
            let path = req.uri().path();

            if path == "/shutdown" {
                let output = cmd_lib::run_cmd("sh raspi/shutdown.sh");

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
            } else {
                Ok(Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .body("Not found.".into())
                    .unwrap()
                )
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


pub async fn run_server(port: u16, library: String) {
    let addr = format!("0.0.0.0:{}", port).parse().unwrap();
    let public_handler = Static::new(Path::new("public/"));
    let library_handler = Static::new(Path::new(&library));

    let api_service = make_service_fn(move |_| {
        let public_handler = public_handler.clone();
        let library_handler = library_handler.clone();

        async {
            Ok::<_, GenericError>(service_fn(move |req| {
                request_handler(
                    req,
                    public_handler.to_owned(),
                    library_handler.to_owned()
                )
            }))
        }
    });

    let server = Server::bind(&addr).serve(api_service);

    if let Err(e) = server.await {
        eprintln!("server error: {}", e);
    }
}
