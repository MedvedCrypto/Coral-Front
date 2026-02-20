$(document).ready(function () {
  // Переключение класса у второго элемента при клике на первый элемент
  $(".select-js").on("click", function (event) {
    // Удаление класса 'active' у всех элементов с классом '.select-js', кроме текущего
    $(".select-js").not(this).removeClass("active");

    // Удаление класса 'active' у всех '.select__dropdown', кроме текущего
    $(".select__dropdown")
      .not($(this).parents(".select").find(".select__dropdown"))
      .removeClass("active");

    event.stopPropagation(); // Остановка всплытия события клика
    $(this).toggleClass("active");
    $(this).parents(".select").find(".select__dropdown").toggleClass("active");
  });

  // Удаление класса у второго элемента при клике вне него
  $(document).on("click", function (event) {
    if (!$(event.target).closest(".select__dropdown").length) {
      $(".select__dropdown").removeClass("active");
      $(".select__selected.active").removeClass("active");
    }
  });
  


  // Остановка всплытия события клика для второго элемента
  $(".notification__dropdown").on("click", function (event) {
    event.stopPropagation(); // Остановка всплытия события клика
  });

  $(".select-item-js").each(function () {
    let $this = $(this);
    $this.on("click", function () {
      let dataVal = $this.attr("data-val");
      let dataText = $this.attr("data-text");
      let imagePath = $this.find(".select-img-js").attr("src");
      $this.parents(".select").find(".select__input").val(dataVal);
      $this.parents(".select").find(".select-txt-js").text(dataText);
      $this.parents(".select").find(".select-js img").attr("src", imagePath);
      $this.parents(".select").find(".select-js").removeClass("active");
      $this.parents(".select").find(".select__dropdown").removeClass("active");
    });
  });
  

});
