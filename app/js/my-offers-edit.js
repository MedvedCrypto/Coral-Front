$(".my-offers-edit-js").on("click", function () {
  var $currentOfferItem = $(this).parents(".my-offers__item");
  $currentOfferItem.find(".edit-js").slideDown();
  $currentOfferItem.find(".my-offers__item-inner-wrap").addClass("hide");

  $(".edit-js").not($currentOfferItem.find(".edit-js")).slideUp();
  $(".my-offers__item-inner-wrap")
    .not($currentOfferItem.find(".my-offers__item-inner-wrap"))
    .removeClass("hide");
});

$(".my-offers-edit-cancel-js").on("click", function () {
  var $currentOfferItem = $(this).parents(".my-offers__item");
  $currentOfferItem.find(".edit-js").slideUp();
  $currentOfferItem.find(".my-offers__item-inner-wrap").removeClass("hide");
});
