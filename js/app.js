// app.js
$(document).ready(function () {
  // if ("serviceWorker" in navigator) {
  //   navigator.serviceWorker
  //     .register("sw.js")
  //     .then((registration) => {
  //       console.log("Service Worker registrado con éxito:", registration);
  //     })
  //     .catch((error) => {
  //       console.error("Error al registrar el Service Worker:", error);
  //     });
  // }

  // if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("sw.js")
      .then((registration) => {
        console.log("Service Worker registrado con éxito:", registration);
      })
      .catch((error) => {
        console.log("Error al registrar el Service Worker:", error);
      });
  }

  const cachedMsisdn = localStorage.getItem("msisdn");

  if (cachedMsisdn) {
    // Si hay un número en el caché, realiza la consulta directamente
    $("#msisdn").val(cachedMsisdn); // Llena el campo con el número del caché
    realizarConsulta(); // Realiza la consulta
  }

  $("#msisdn").mask("0000000000");

  var offerTemplate =
    '<div class="plan offeringTemplate :superoferta">' +
    '<div class="offer-name plan_title">:offername</div>' +
    '<div class="offer-price letrasplan"><small>$</small>:offerprice</div>' +
    '<div class="offer-short" style="display: none;">:offershort</div>' +
    '<div class="offer-description letrasplan">:offerdesc</div>' +
    '<button class="select_plan buttonplan next" data-id=":offerid">Continuar</button>' +
    "</div>";

  function realizarConsulta() {
    const msisdn = $("#msisdn").val();

    if (msisdn.length < 10) {
      mostrarError("El número telefónico no es válido.");
      return;
    }

    $.ajax({
      url: "https://api-recargas.figou.mx/api/getOffers",
      method: "GET",
      data: { msisdn: msisdn },
      beforeSend: function () {
        $("#overlay").fadeIn(300);
      },
      success: function (data) {
        console.log(data);

        if (data.status === "fail") {
          mostrarError("El número telefónico no es válido.");
          return;
        }

        $(".msisdn").text(msisdn);
        localStorage.setItem("msisdn", msisdn);

        mostrarResultados(data);
      },
      error: function (error) {
        console.log("Error en la consulta AJAX:", error);
        mostrarError("Error al realizar la consulta.");
      },
      complete: function () {
        $("#overlay").fadeOut(300);
      },
    });
  }

  function mostrarResultados(data) {
    $("#pantalla1").addClass("hidden");
    $("#pantalla2").removeClass("hidden");

    $("#email").val(data.email);

    $("#offerings").html("");

    $.each(data.offerings, function (index, item) {
      if (item.description === "") {
        item.description = "Descripción no disponible.";
      }

      if (item.name !== null) {
        var offer = offerTemplate
          .replace(":superoferta", item.superOferta)
          .replace(":offerprice", item.specialPrice)
          .replace(":offername", item.name)
          .replace(":offerdesc", item.description)
          .replace(":offerid", item.productId);

        $("#offerings").append(offer);
      }
    });

    $(".select_plan").on("click", function () {
      var productCard = $(this).parent();
      var total = productCard.find(".offer-price").text();

      var price = Number(
        total.replace("MXN", "").replace("$", "").replace(".00", "")
      ).toString();

      var dataToSend = {
        msisdn: $("#msisdn").val(),
        offering_id: $(this).attr("data-id"),
        description: productCard.find(".offer-description").html(),
        offering_price: price,
        offering_name: productCard.find(".offer-name").text(),
        email: $("#email").val(),
      };

      $.ajax({
        url: "https://api-recargas.figou.mx/api/saveOrder",
        method: "POST",
        data: dataToSend,
        success: function (data) {
          console.log(data);

          if (data.status !== "success") {
            // mostrarError("Error al realizar la compra.");
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Error al realizar la compra.",
              footer: "Por favor, intenta de nuevo.",
            })
          }

          $("#pantalla1").addClass("hidden");
          $("#pantalla2").addClass("hidden");
          $("#pantalla3").removeClass("hidden");

          var imprime = $("#store-imprime");
          imprime.find(".nombre-plan").text(data.data.offering_name);
          imprime.find(".monto").text("$" + data.data.offering_price + " MXN");
          imprime.find(".referencia-igou").text(data.data.conekta_order_id);
          imprime.find(".barcode-img").attr("src", data.data.barcode_url);
          imprime.find(".barcode-ref").text(data.data.referencia_conekta);

          // if (data.data[4] == "OXXO") {
            imprime.find(".store-pay").attr("src", "images/oxxo_pay.png");
          // } else {
          //   imprime.find(".store-pay").attr("src", "images/stores_pay.png");
          // }
        },
        error: function (error) {
          console.log("Error en la consulta AJAX:", error);
          mostrarError("Error al realizar la consulta.");
        },
      });
    });
  }

  function mostrarError(message) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
    });
  }

  $("#store_print").on("click", function () {
    $.print("#store-imprime");
  });

  function regresarPantalla1() {
    $("#pantalla1").removeClass("hidden");
    $("#pantalla2").addClass("hidden");
  }

  $(document).ajaxSend(function () {
    $("#overlay").fadeIn(300);
  });

  $(document).ajaxComplete(function () {
    $("#overlay").fadeOut(300);
  });

  $("#realizarConsultaBtn").on("click", function () {
    realizarConsulta();
  });

  $("#regresarBtn").on("click", function () {
    regresarPantalla1();
  });
});
