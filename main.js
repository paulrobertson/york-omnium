var currentDataUrl = '';

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
        {"<>": "td", "html": "<strong>${Pos}</strong>"},
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

function pageInit(dataUrl) {
    $('#reloadButton').on('click', function(event) {
        init(currentDataUrl);
        event.preventDefault();
    });
    
    var rotationAlert = document.getElementById('orientationInfo')
    rotationAlert.addEventListener('closed.bs.alert', function () {
        localStorage.rotationAlertDismissed = "true";
    });

    if (localStorage.rotationAlertDismissed === "true") {
        $("#orientationInfo").hide();
    }

    init(dataUrl);
}

function init(dataUrl) {
    currentDataUrl = dataUrl;
    const minutes = 2;
    const ms = 1000 * 60 * minutes;
    var time = Math.round(new Date().getTime() / ms) * ms;
    $('#resultsTable').hide();
    $('#lastUpdated').hide();
    $.ajax({
        type: "GET",
        url: dataUrl + "?t=" + time,
        success: function(data, status, xhr) {
            $('#tempTable').html("// <![CDATA[ " + data + " // ]]>");
            $('#lastUpdatedTime').text(xhr.getResponseHeader("last-modified"));
            $('#lastUpdated').show();
        },
        complete: function() {
            populateTable();
        }
    });
}