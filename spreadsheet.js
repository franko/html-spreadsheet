var dataTableCurrentId = 0;

var newTableId = function() {
    var id = dataTableCurrentId;
    dataTableCurrentId ++;
    return id;
};

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

var encodeCellId = function(id, i, j) {
    return "cell" + String(id) + "-" + String(i) + "-" + String(j);
};

var decodeCellId = function(name) {
    var re = /^cell(\d+)-(\d+)-(\d+)/;
    var match = re.exec(name);
    if (match) {
        return [Number(match[2]), Number(match[3])];
    }
};

function createDataTable(initialRows, initialCols) {
    var tableElement, tableRows = 0, tableCols = 0, activeInput;
    var tableId = newTableId();

    var createTableTh = function(j) {
        var th = document.createElement("th");
        th.innerHTML = String.fromCharCode(65 + j);
        return th;
    };

    var createTableTd = function(i, j) {
        var td = document.createElement("td");
        td.setAttribute("id", encodeCellId(tableId, i, j));
        td.onclick = spreadSheetTdOnClick;
        var text = document.createTextNode("");
        td.appendChild(text);
        return td;
    };

    var createTableTr = function(i, cols) {
        var tr = document.createElement("tr");
        for (var j = 0; j < cols; j++) {
            var td = createTableTd(i, j);
            tr.appendChild(td);
        }
        return tr;
    }

    var spreadSheetRemoveActiveInput = function(spreadSheet) {
        if (!activeInput) return;
        var td = activeInput;
        var content = td.firstChild.value;
        td.removeChild(td.firstChild);
        var text = document.createTextNode(content);
        td.appendChild(text);
        activeInput = null;
    };

    var spreadSheetSetActiveInput = function(td, newElement) {
        td.removeChild(td.firstChild);
        td.appendChild(newElement);
        activeInput = td;
    };

    var spreadSheetTdOnClick = function(e) {
        var td = e.target;
        var input = document.createElement("input");
        input.setAttribute("type", "text");
        input.value = td.childNodes[0].nodeValue;
        input.onpaste = cellOnPaste;
        spreadSheetRemoveActiveInput();
        spreadSheetSetActiveInput(td, input);
        input.focus();
        return false;
    };

    var setTableElements = function(data, indexes) {
        var i0 = indexes[0], j0 = indexes[1];
        for (var i = 0; i < data.length; i++) {
            var row = data[i];
            if (!row) continue;
            for (var j = 0; j < row.length; j++) {
                var td = document.getElementById(encodeCellId(tableId, i0+i, j0+j));
                if (td.firstChild.nodeName === "INPUT") {
                    td.firstChild.value = row[j];
                } else {
                    td.firstChild.nodeValue = row[j];
                }
            }
        }
    };

    var cellOnPaste = function(e) {
        var cellId = e.target.parentNode.getAttribute("id");
        var indexes = decodeCellId(cellId);
        var pastedText = e.clipboardData.getData('text/plain');
        var pastedData = parseTabular(pastedText);
        // When calling ensureTableSize we ask for one more row and column of what needed.
        ensureTableSize(indexes[0] + pastedData.length + 1, indexes[1] + pastedData[0].length + 1);
        setTableElements(pastedData, indexes);
        return false;
    };

    var ensureTableSize = function(rowsRequest, colsRequest) {
        var rows = tableRows, cols = tableCols;
        if (rowsRequest < rows) rowsRequest = rows;
        if (colsRequest < cols) colsRequest = cols;
        var tableNodes = tableElement.childNodes;
        var thead = tableNodes[0];
        var i, j;
        for (j = cols; j < colsRequest; j++) {
            var th = createTableTh(j);
            thead.appendChild(th);
        }
        for (i = 0; i < rows; i++) {
            var tr = tableNodes[i+1];
            for (j = cols; j < colsRequest; j++) {
                var td = createTableTd(i, j);
                tr.appendChild(td);
            }
        }
        for (i = rows; i < rowsRequest; i++) {
            var tr = createTableTr(i, colsRequest);
            tableElement.appendChild(tr);
        }
        tableRows = rowsRequest;
        tableCols = colsRequest;
    };

    // Create an empty table with thead child.
    tableElement = document.createElement("table");
    var thead = document.createElement("thead");
    tableElement.appendChild(thead);

    ensureTableSize(initialRows, initialCols);

    return {element: tableElement};
}

var div = document.getElementById("data-table");
var dataTable = createDataTable(4, 4);
div.appendChild(dataTable.element);
