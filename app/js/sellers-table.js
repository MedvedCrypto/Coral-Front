$(document).ready(function () {
  function updateLinkedWidths() {
    var maxWidths = [];

    // Найти максимальную ширину для каждого индекса среди всех .item
    $(".seller-tr-js").each(function () {
      $(this)
        .find(".seller-td-js")
        .each(function (index) {
          var currentWidth = $(this).outerWidth();
          if (
            maxWidths[index] === undefined ||
            currentWidth > maxWidths[index]
          ) {
            maxWidths[index] = currentWidth;
          }
        });
    });

    // Установить максимальную ширину для всех элементов .item по индексу
    $(".seller-tr-js").each(function () {
      $(this)
        .find(".seller-td-js")
        .each(function (index) {
          $(this).css("width", maxWidths[index]);
        });
    });

    // Установить максимальную ширину для всех элементов .seller-th-js по индексу
    $(".sellers-thead-js .seller-th-js").each(function (index) {
      $(this).css("width", maxWidths[index]);
    });
  }

  // Инициализация установки ширины
  updateLinkedWidths();

  // Добавление обработчика события resize для обновления ширины при изменении размера окна
  //  $(window).resize(updateLinkedWidths);

 $(".seller-buy-js").on("click", function (e) {
   e.preventDefault();

   var $currentSellerItem = $(this).parents(".seller-tr-js");

   // Убираем 'active' и закрываем все остальные элементы
   $(".seller-tr-js").not($currentSellerItem).removeClass("active");
   $(".sellers-table__tr-bottom")
     .not($currentSellerItem.find(".sellers-table__tr-bottom"))
     .slideUp();

   // Добавляем 'active' и открываем текущий элемент
   $currentSellerItem.addClass("active");
   $currentSellerItem.find(".sellers-table__tr-bottom").slideDown();
 });
  $(".seller-cancel-js").on("click", function (e) {
    e.preventDefault();
    $(this).parents(".seller-tr-js").removeClass('active');
    $(this).parents(".seller-tr-js").find('.sellers-table__tr-bottom').slideUp();
  });
});
