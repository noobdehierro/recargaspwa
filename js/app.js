// app.js
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then((registration) => {
      console.log("Service Worker registrado con éxito:", registration);
    })
    .catch((error) => {
      console.error("Error al registrar el Service Worker:", error);
    });
}
$("#msisdn").mask("0000000000");

function realizarConsulta() {
  const msisdn = document.getElementById("msisdn").value;

  // Realizar la consulta AJAX utilizando jQuery
  $.ajax({
    showLoader: true,
    url: "http://apirecharge.test/api/getOffers", // Reemplaza esto con tu URL de consulta
    method: "GET",
    data: { msisdn: msisdn },
    success: function (data) {
      localStorage.setItem("msisdn", msisdn);

      console.log(data);
      mostrarResultados(data);
    },
    error: function (error) {
      console.log("Error en la consulta AJAX:", error);
      // console.error("Error en la consulta AJAX:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "El número telefónico no es válido.",
      });
    },
  });
}

function mostrarResultados(data) {
  // Ocultar la pantalla 1 y mostrar la pantalla 2
  document.getElementById("pantalla1").classList.add("hidden");
  document.getElementById("pantalla2").classList.remove("hidden");

  // Mostrar los resultados en la pantalla 2
  const resultadosDiv = document.getElementById("resultados");
  resultadosDiv.innerHTML = `<p>Resultados:</p><pre>${JSON.stringify(
    data,
    null,
    2
  )}</pre>`;
}

function regresarPantalla1() {
  // Ocultar la pantalla 2 y mostrar la pantalla 1
  document.getElementById("pantalla1").classList.remove("hidden");
  document.getElementById("pantalla2").classList.add("hidden");
}
$(document).ajaxSend(function () {
  $("#overlay").fadeIn(300);
});

$(document).ajaxComplete(function () {
  $("#overlay").fadeOut(300);
});
