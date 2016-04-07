var APP = {};

var ensureTableSize;

var parseTabular = function(text) {
    text = text.replace("\r", "");
    var lines = text.split("\n");
    var data = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line !== "") {
            data.push(line.split("\t"));
        }
    }
    return data;
};

var encodeCellId = function(i, j) {
    return "cell" + String(i) + "-" + String(j);
};

var decodeCellId = function(name) {
    var re = /^cell(\d+)-(\d+)/;
    var match = re.exec(name);
    if (match) {
        return [Number(match[1]), Number(match[2])];
    }
};

var setTableElements = function(data, indexes) {
    var i0 = indexes[0], j0 = indexes[1];
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        if (!row) continue;
        for (var j = 0; j < row.length; j++) {
            var input_elem = document.getElementById(encodeCellId(i0+i, j0+j));
            if (input_elem) {
                input_elem.value = row[j];
            }
        }
    }
};

var cellOnPaste = function(e) {
    var id = e.target.getAttribute("id");
    var indexes = decodeCellId(id);
    var pastedText = e.clipboardData.getData('text/plain');
    var pastedData = parseTabular(pastedText);
    // When calling ensureTableSize we ask for one more row and column of what needed.
    ensureTableSize(APP.TABLE, indexes[0] + pastedData.length + 1, indexes[1] + pastedData[0].length + 1);
    setTableElements(pastedData, indexes);
    return false;
};

var createTableTh = function(j) {
    var th = document.createElement("th");
    th.innerHTML = String.fromCharCode(65 + j);
    return th;
};

var createTableTd = function(i, j, onpaste) {
    var td = document.createElement("td");
    var input_elem = document.createElement("input");
    input_elem.setAttribute("type", "text");
    input_elem.setAttribute("id", encodeCellId(i, j));
    input_elem.onpaste = onpaste;
    td.appendChild(input_elem);
    return td;
};

var createTableTr = function(i, cols, onpaste) {
    var tr = document.createElement("tr");
    for (var j = 0; j < cols; j++) {
        var td = createTableTd(i, j, onpaste);
        tr.appendChild(td);
    }
    return tr;
}

ensureTableSize = function(TABLE, rows_request, cols_request) {
    var table = TABLE.table;
    var rows = TABLE.rows, cols = TABLE.cols;
    if (rows_request < rows) rows_request = rows;
    if (cols_request < cols) cols_request = cols;
    var tr_nodes = table.childNodes;
    var thead = tr_nodes[0];
    var i, j;
    for (j = cols; j < cols_request; j++) {
        var th = createTableTh(j);
        thead.appendChild(th);
    }
    for (i = 0; i < rows; i++) {
        var tr = tr_nodes[i+1];
        for (j = cols; j < cols_request; j++) {
            var td = createTableTd(i, j, cellOnPaste);
            tr.appendChild(td);
        }
    }
    for (i = rows; i < rows_request; i++) {
        var tr = createTableTr(i, cols_request, cellOnPaste);
        table.appendChild(tr);
    }
    TABLE.rows = rows_request;
    TABLE.cols = cols_request;
};

var table = document.getElementById('data-table');

var thead = document.createElement("thead");
for (var j = 0; j < 4; j++) {
    var th = createTableTh(j);
    thead.appendChild(th);
}
table.appendChild(thead);
for (var i = 0; i < 4; i++) {
    var tr = createTableTr(i, 4, cellOnPaste);
    table.appendChild(tr);
}

APP.TABLE = { table: table, rows: 4, cols: 4 };
