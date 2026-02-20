$(".offer-popup-js").on('click', function(e){
  e.preventDefault();
  $(".popup-js").addClass('active');
  $("body").addClass('no-scroll');
});
$(".popup-cancel-js").on("click", function () {
  $(".popup-js").removeClass("active");
  $("body").removeClass('no-scroll');
});