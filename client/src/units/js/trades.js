$(".view-table-js").on("click", function (e) {
  e.preventDefault();
  $(".table-js").not($(this).parents(".trades__item").find(".table-js")).slideUp();
  $(this).parents(".trades__item").find(".table-js").slideDown();
});
