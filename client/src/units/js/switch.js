$(document).ready(function () {
  $(".switch-js").each(function () {
    let $this = $(this);
    let activeItem = $this.find(".switch__item.active");
    let startBacklight = $this.find(".switch-backlight-js");
    let activeItemPosition = $this.find(".switch__item.active").position();
    startBacklight.css({
      'width': activeItem.outerWidth(),
      'height': activeItem.outerHeight(),
      'left': activeItemPosition.left,
    });
    let eachItem = $(this).find(".switch__item");
    eachItem.on("click", function(){
      $(this).addClass("active");
      let activeItemPosition = $(this).position();
      $this.find(".switch__item").not(this).removeClass('active');
      startBacklight.css({
        width: activeItem.outerWidth(),
        height: activeItem.outerHeight(),
        left: activeItemPosition.left,
      });
    });
  });
});
