// imports
importScripts("/recarga-facil/js/sw-utils.js");

const STATIC_CACHE = "static-v3";
const DYNAMIC_CACHE = "dynamic-v3";
const INMUTABLE_CACHE = "inmutable-v3";

const APP_SHELL = [
  "/recarga-facil/",
  "/recarga-facil/index.html",
  "/recarga-facil/styles.css",
  "/recarga-facil/js/app.js",
  "/recarga-facil/images/stores_pay.png",
  "/recarga-facil/images/oxxo_pay.png",
  "/recarga-facil/images/logo.png",
  "/recarga-facil/images/favicon.ico",
  "/recarga-facil/js/sw-utils.js",
];

const APP_SHELL_INMUTABLE = [
  "/recarga-facil/js/libs/jquery.validate.min.js",
  "/recarga-facil/js/libs/jquery.print.min.js",
  "/recarga-facil/js/libs/jquery.mask.min.js",
  "/recarga-facil/js/libs/jquery.com_jquery-3.7.0.min.js",
];

self.addEventListener("install", (e) => {
  const cacheStatic = caches
    .open(STATIC_CACHE)
    .then((cache) => cache.addAll(APP_SHELL));

  const cacheInmutable = caches
    .open(INMUTABLE_CACHE)
    .then((cache) => cache.addAll(APP_SHELL_INMUTABLE));

  e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener("activate", (e) => {
  const respuesta = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== STATIC_CACHE && key.includes("static")) {
        return caches.delete(key);
      }

      if (key !== DYNAMIC_CACHE && key.includes("dynamic")) {
        return caches.delete(key);
      }

      if (key !== INMUTABLE_CACHE && key.includes("inmutable")) {
        return caches.delete(key);
      }
    });
  });

  e.waitUntil(respuesta);
});

self.addEventListener("fetch", (e) => {
  let respuesta;

  if (e.request.url.includes("/api")) {
    // return respuesta????
    respuesta = manejoApiMensajes(DYNAMIC_CACHE, e.request);
  } else {
    respuesta = caches.match(e.request).then((res) => {
      if (res) {
        actualizaCacheStatico(STATIC_CACHE, e.request, APP_SHELL_INMUTABLE);
        return res;
      } else {
        return fetch(e.request).then((newRes) => {
          return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
        });
      }
    });
  }

  e.respondWith(respuesta);
});
