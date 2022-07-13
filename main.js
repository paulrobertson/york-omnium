function populateTable() {
    var headers = ["Pos", "Num", "Name", "Club", "Cat", "BcNumber", "EventsStarted", "TtTime", "TtPoints", "ElimPoints", "ScratchPoints", "SprintPoints", "PointsPoints", "PointsPos", "TotalPoints", "OmniumPoints"];
    var jsonResults = [];
    $("#tempTable table").find('tbody tr').each(function (i, tr) {
        if (i > 0) {
            var obj = {};
            
            $tds = $(tr).find('td');

            if ($tds[0].innerText.trim().length == 0) {
                return;
            }

            $tds.each(function (index, td) {
                obj[headers[index]] = $tds.eq(index).text();
            });
            jsonResults.push(obj);
        }
    });

    let template = 
    {"<>": "tr", "html":[
        {"<>": "td", "text": "${Pos}"},
        {"<>": "td", "text": "${Num}"},
        {"<>": "td", "text": "${Name}"},
        {"<>": "td", "text": "${Club}"},
        {"<>": "td", "text": "${EventsStarted}"},
        {"<>": "td", "text": "${TtTime}"},
        {"<>": "td", "text": "${TtPoints}"},
        {"<>": "td", "text": "${ElimPoints}"},
        {"<>": "td", "text": "${ScratchPoints}"},
        {"<>": "td", "text": "${SprintPoints}"},
        {"<>": "td", "text": "${PointsPoints}"},
        {"<>": "td", "text": "${PointsPos}"},
        {"<>": "td", "text": "${TotalPoints}"}
    ]};

    let tableHtml = json2html.transform(jsonResults, template);

    $('#resultsTable tbody').html(tableHtml);

    $('#resultsTable').show();
}

function init(dataUrl) {
    $.ajax({
        type: "GET",
        url: dataUrl,
        success: function(data) {
            $('#tempTable').html("// <![CDATA[ " + data + " // ]]>");
        },
        complete: function() {
            populateTable();
        }
    });
}