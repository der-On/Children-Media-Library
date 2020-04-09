extern crate futures;
extern crate hyper;
extern crate hyper_staticfile;
extern crate percent_encoding;

use std::path::Path;
use std::str::FromStr;
use self::percent_encoding::percent_decode;
// use self::futures::{Future};

// use self::hyper::{Error, Uri};
use self::hyper::{Body, Request, Response, Server, Method, StatusCode, Uri};
use self::hyper::service::{make_service_fn, service_fn};
use self::hyper_staticfile::Static;

type GenericError = Box<dyn std::error::Error + Send + Sync>;
type Result<T> = std::result::Result<T, GenericError>;

// static INTERNAL_SERVER_ERROR: &[u8] = b"Internal Server Error";
static NOTFOUND: &[u8] = b"Not Found";

/*
type ResponseFuture = Box<Future<Item=Response<Body>, Error=Error>>;

struct MainService {
    library_: Static,
    public_: Static,
}

impl MainService {
    fn new(library: String) -> MainService {
        MainService {
            public_: Static::new(Path::new("public/")),
            library_: Static::new(Path::new(&library))
        }
    }
}

impl Service<Request<Body>> for MainService {
    // type Request = Request;
    // type Response = Response;
    type Error = Error;
    type Future = ResponseFuture;

    fn call(&self, mut req: Request<Body>) -> Self::Future {
        let method = req.method().as_str();
        let path = req.path();
        let uri = req.uri();
        println!("{} {}", method, path);

        // if method == "GET" {
            if path.starts_with("/library/") == true {
                let new_uri_str = format!("{}", uri)
                    .replace("/library/", "/");
                let new_uri_str_decoded = percent_decode(new_uri_str.as_bytes())
                    .decode_utf8().unwrap();

                let new_uri: Uri = Uri::from_str(&new_uri_str_decoded).unwrap();
                req.set_uri(new_uri);
                self.library_.call(req)
            } else {
                self.public_.call(req)
            }
         } else if method == "POST" {
            if path == "/shutdown" {
                self.shutdown()
            }
        }
    }
}*/

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
                Ok(Response::builder()
                    .status(StatusCode::OK)
                    .body("System shutdown initialized ...".into())
                    .unwrap()
                )
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
                .body(NOTFOUND.into())
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
