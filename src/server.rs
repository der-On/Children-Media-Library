extern crate futures;
extern crate hyper;
extern crate hyper_staticfile;
extern crate percent_encoding;

use std::path::Path;
use std::str::FromStr;
use self::percent_encoding::percent_decode;

use self::futures::{future, Future};
use self::hyper::{Uri, Body, Request, Response, Server};
use self::hyper::service::service_fn;
use self::hyper_staticfile::{Static};
use std::io::Error;

use playback::Playback;

type ResponseFuture = Box<dyn Future<Item=Response<Body>, Error=Error> + Send>;

fn main_handler(
    mut req: Request<Body>,
    library_handler: &Static,
    public_handler: &Static,
    playback: &Playback
) -> ResponseFuture {
    println!("{} {}", req.method(), req.uri().path());

    if req.uri().path().starts_with("/library/") == true {
        let new_uri_str = format!("{}", req.uri())
            .replace("/library/", "/");
        let new_uri_str_decoded = percent_decode(new_uri_str.as_bytes())
            .decode_utf8().unwrap();

        let new_uri: Uri = Uri::from_str(&new_uri_str_decoded).unwrap();
        *req.uri_mut() = new_uri;
        Box::new(library_handler.serve(req))
    /*} else if req.uri().path().starts_with("/playback/") == true {
        let new_uri_str = format!("{}", req.uri())
            .replace("/playback/", "/");
        let new_uri_str_decoded = percent_decode(new_uri_str.as_bytes())
            .decode_utf8().unwrap();

        let new_uri: Uri = Uri::from_str(&new_uri_str_decoded).unwrap();
        *req.uri_mut() = new_uri;
        Box::new(future::ok(Response::new(Body::from("Playback"))))*/
    } else {
        Box::new(public_handler.serve(req))
    }
}

/*
struct MainService {
    library_: Static,
    public_: Static,
    playback_: Playback
}

impl MainService {
    fn new(library: String) -> MainService {
        MainService {
            public_: Static::new(Path::new("public/")),
            library_: Static::new(Path::new(&library)),
            playback_: Playback::new(library)
        }
    }
}

impl Service for MainService {
    type ReqBody = Body;
    type ResBody = Body;
    type Error = Error;
    type Future = ResponseFuture;

    fn call(&mut self, mut req: Request<Body>) -> Self::Future {
        println!("{} {}", req.method(), req.uri().path());

        if req.uri().path().starts_with("/library/") == true {
            let new_uri_str = format!("{}", req.uri())
                .replace("/library/", "/");
            let new_uri_str_decoded = percent_decode(new_uri_str.as_bytes())
                .decode_utf8().unwrap();

            let new_uri: Uri = Uri::from_str(&new_uri_str_decoded).unwrap();
            *req.uri_mut() = new_uri;
            Box::new(self.library_.serve(req))
        /*} else if req.uri().path().starts_with("/playback/") == true {
            let new_uri_str = format!("{}", req.uri())
                .replace("/playback/", "/");
            let new_uri_str_decoded = percent_decode(new_uri_str.as_bytes())
                .decode_utf8().unwrap();

            let new_uri: Uri = Uri::from_str(&new_uri_str_decoded).unwrap();
            *req.uri_mut() = new_uri;
            Box::new(future::ok(Response::new(Body::from("Playback"))))*/
        } else {
            Box::new(self.public_.serve(req))
        }
    }
}
*/

pub fn start(port: u16, library: String) {
    let addr = format!("0.0.0.0:{}", port).parse().unwrap();

    hyper::rt::run(future::lazy(move || {
        let main_service = move || {
            let library_path = library.clone();
            let library_handler = Static::new(Path::new(&library_path));
            let public_handler = Static::new(Path::new("public/"));
            let playback = Playback::new(library_path);

            service_fn(move |req| {
                main_handler(req, &library_handler, &public_handler, &playback)
            });
        };

        let server = Server::bind(&addr)
        .serve(main_service)
        .map_err(|e| eprintln!("server error: {}", e));

        println!("Server running on http://localhost:{}/", port);

        server
    }));
}
