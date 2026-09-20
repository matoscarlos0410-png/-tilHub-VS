const CACHE = "utilhub-v14-suprime-master-nova-1";

const CORE_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "./icon.svg"
];


self.addEventListener("install", event => {

  event.waitUntil(

    caches
      .open(CACHE)
      .then(cache =>
        cache.addAll(CORE_FILES)
      )
      .then(() =>
        self.skipWaiting()
      )

  );

});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches
      .keys()
      .then(keys =>

        Promise.all(

          keys
            .filter(key => key !== CACHE)
            .map(key =>
              caches.delete(key)
            )

        )

      )
      .then(() =>
        self.clients.claim()
      )

  );

});


self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  const url =
    new URL(event.request.url);

  if (
    url.origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(

    caches
      .match(event.request)
      .then(cached => {

        if (cached) {
          return cached;
        }

        return fetch(event.request)
          .then(response => {

            if (response.ok) {

              const copy =
                response.clone();

              caches
                .open(CACHE)
                .then(cache => {

                  cache.put(
                    event.request,
                    copy
                  );

                });

            }

            return response;

          })
          .catch(() =>
            caches.match("./index.html")
          );

      })

  );

});
