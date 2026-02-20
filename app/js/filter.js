$(document).ready(function () {
  // Переключение класса у второго элемента при клике на первый элемент
  $(".filter-js").on("click", function (event) {
    event.stopPropagation(); // Остановка всплытия события клика
    $(this).toggleClass('active');
    $(".filter__dropdown").toggleClass("active");
  });

  // Удаление класса у второго элемента при клике вне него
  $(document).on("click", function (event) {
    $(".filter-js").removeClass('active');
    if (!$(event.target).closest(".filter__dropdown").length) {
      $(".filter__dropdown").removeClass("active");
    }
  });

  // Остановка всплытия события клика для второго элемента
  $(".filter__dropdown").on("click", function (event) {
    event.stopPropagation(); // Остановка всплытия события клика
  });
});
