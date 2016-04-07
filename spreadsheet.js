var parse_tabular = function(text) {
    text = text.replace("\r", "");
    var lines = text.split("\n");
    var data = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        data.push(line.split("\t"));
    }
    return data;
};

var setTableElements = function(data) {
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        for (var j = 0; j < row.length; j++) {
            var input_elem = document.getElementById("cell" + String(i) + "-" + String(j));
            if (input_elem) {
                input_elem.value = row[j];
            }
        }
    }
};

var table = document.getElementById('data-table');

for (var i = 0; i < 6; i++) {
    var tr = document.createElement("tr");
    for (var j = 0; j < 6; j++) {
        var td = document.createElement("td");
        var input_elem = document.createElement("input");
        input_elem.setAttribute("type", "text");
        input_elem.setAttribute("id", "cell" + String(i) + "-" + String(j));
        td.appendChild(input_elem);
        tr.appendChild(td);
    }
    table.appendChild(tr);
}

var myElement = document.getElementById("cell0-0");

myElement.onpaste = function(e) {
    var pastedText = e.clipboardData.getData('text/plain');
    var pastedData = parse_tabular(pastedText);
    setTableElements(pastedData);
    return false;
};
