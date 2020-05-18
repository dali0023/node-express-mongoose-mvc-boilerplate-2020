$(function () {
  $(document).ready(function () {
    $("#example").DataTable();
  });
});


// File Upload
$(".custom-file-input").on("change", function () {
  var fileName = $(this).val().split("\\").pop();
  $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});
