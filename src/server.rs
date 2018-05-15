extern crate futures;
extern crate hyper;
extern crate hyper_staticfile;
extern crate percent_encoding;

use std::path::Path;
use std::str::FromStr;
use self::percent_encoding::percent_decode;
use self::futures::{Future};

use self::hyper::{Error, Uri};
use self::hyper::server::{Http, Request, Response, Service};
use self::hyper_staticfile::Static;

type ResponseFuture = Box<Future<Item=Response, Error=Error>>;

struct MainService {
    library_: Static,
    public_: Static,
}

impl MainService {
    fn new(library: String) -> MainService {
        MainService {
            public_: Static::new(Path::new("public/")),
            library_: Static::new(Path::new(&library)),
        }
    }
}

impl Service for MainService {
    type Request = Request;
    type Response = Response;
    type Error = Error;
    type Future = ResponseFuture;

    fn call(&self, mut req: Request) -> Self::Future {
        println!("{} {}", req.method(), req.path());

        if req.path().starts_with("/library/") == true {
            let new_uri_str = format!("{}", req.uri())
                .replace("/library/", "/");
            let new_uri_str_decoded = percent_decode(new_uri_str.as_bytes())
                .decode_utf8().unwrap();

            let new_uri: Uri = Uri::from_str(&new_uri_str_decoded).unwrap();
            req.set_uri(new_uri);
            self.library_.call(req)
        } else {
            self.public_.call(req)
        }
    }
}

pub fn start(port: u16, library: String) {
    let addr = format!("0.0.0.0:{}", port).parse().unwrap();
    let server = Http::new().bind(&addr, move || Ok(MainService::new(library.clone()))).unwrap();
    println!("Server running on http://localhost:{}/", port);

    server.run().unwrap()
}
