(function () {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js").catch(function () {
      // Silencioso: no afecta el uso normal si falla.
    });
  });
})();

