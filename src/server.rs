extern crate futures;
extern crate hyper;
extern crate hyper_staticfile;

use std::path::Path;
use self::futures::{Future};

use self::hyper::Error;
use self::hyper::server::{Http, Request, Response, Service, Server};
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

    fn call(&self, req: Request) -> Self::Future {
        if req.path().starts_with("/library/") == true {
            self.library_.call(req)
        } else {
            self.public_.call(req)
        }
    }
}

pub fn start(port: u16, library: String) {
    let addr = format!("127.0.0.1:{}", port).parse().unwrap();
    let server = Http::new().bind(&addr, move || Ok(MainService::new(library.clone()))).unwrap();
    println!("Server running on http://localhost:{}/", port);

    server.run().unwrap()
}
