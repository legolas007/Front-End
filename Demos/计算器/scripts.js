
document.getElementById("clear").addEventListener("click", function() {
    document.getElementById("display").value = "";
});

function get(value) {
    document.getElementById("display").value += value;
}


function calculates() {
    var result = 0;
    result = document.getElementById("display").value;
    document.getElementById("display").value = "";
    document.getElementById("display").value = eval(result);
};