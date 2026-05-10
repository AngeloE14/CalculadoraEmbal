(function () {
  try {
    var savedTheme = localStorage.getItem("formulador-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  } catch (error) {
    // Ignora si localStorage no esta disponible.
  }
})();
