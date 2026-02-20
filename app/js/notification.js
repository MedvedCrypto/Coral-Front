$(document).ready(function () {
  // Переключение класса у второго элемента при клике на первый элемент
  $(".notification-js").on("click", function (event) {
    event.stopPropagation(); // Остановка всплытия события клика
    $(".notification__dropdown").toggleClass("active");

    if (window.matchMedia("(max-width: 575px)").matches) {
      $("body").toggleClass("no-scroll");
    }
  });

  // Удаление класса у второго элемента при клике вне него
  $(document).on("click", function (event) {
    if (!$(event.target).closest(".notification__dropdown, .offer-popup-js, .popup").length) {
      $(".notification__dropdown").removeClass("active");
      if (window.matchMedia("(max-width: 575px)").matches) {
        $("body").removeClass("no-scroll");
      } 
    }
  });

  // Остановка всплытия события клика для второго элемента
  $(".notification__dropdown").on("click", function (event) {
    event.stopPropagation(); // Остановка всплытия события клика
  });
});
