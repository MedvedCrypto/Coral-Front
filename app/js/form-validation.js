import $ from "jquery";
import "jquery-validation";
// Example usage:
$(document).ready(function () {
  $(function () {
    var form = $("#table-form");
    if (form.length) {
      form.validate({
        rules: {
          sell: {
            required: true,
          },
          receive: {
            required: true,
          },
          telegram: {
            required: true,
          },
        },
        messages: {
          sell: {
            required: "Required field",
          },
          receive: {
            required: "Required field",
          },
          telegram: {
            required: "Required field",
          },
        },
      });
    }
  });
});
