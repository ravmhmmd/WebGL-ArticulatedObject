var modal = document.getElementById("helpModal");
var modalBtn = document.getElementById("help-button");
var span = document.getElementById("close");

modalBtn.onclick = function() {
    modal.style.display = "block";
}
span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function() {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}