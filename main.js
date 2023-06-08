var currentDataUrl = '';
const refreshDuration = 30;
var timer = refreshDuration;
var loading = false;

function renderTable(data) {
    const template = 
    {"<>": "tr", "html":[
        {"<>": "th", "scope": "row", "text": "${Pos}"},
        {"<>": "td", "text": "${Num}"},
        {"<>": "td", "text": "${Name}"},
        {"<>": "td", "text": "${Club}"},
        {"<>": "td", "text": function() { return this['TT Time'] == '' ? 0 : this['Events Started'] } },
        {"<>": "td", "text": "${TT Time}"},
        {"<>": "td", "text": "${TT Points}"},
        {"<>": "td", "text": "${Elim Points}"},
        {"<>": "td", "text": "${Scratch Points}"},
        {"<>": "td", "text": "${Spr/Kn Points}"},
        {"<>": "td", "text": "${Points R Ponts}"},
        {"<>": "td", "text": "${Points R pos}"},
        {"<>": "td", "text": "${Total points}"}
    ]};

    const tableHtml = json2html.transform(data, template);

    $('#resultsTable tbody').html(tableHtml);
    $('#resultsTable').show();
}

function pageInit(dataUrl) {
    currentDataUrl = dataUrl;
    const counter = document.querySelector('#counter');

    refreshIntervalId = setInterval(function () {
      if (timer > 0) {
        --timer;
      } else if (!loading) {
        init(dataUrl);
      }
      counter.textContent = timer;
    }, 1000);
    
    const rotationAlert = document.getElementById('orientationInfo')
    rotationAlert.addEventListener('closed.bs.alert', function () {
        localStorage.rotationAlertDismissed = new Date().getTime();
    });

    if (localStorage.rotationAlertDismissed && (new Date().getTime() - localStorage.rotationAlertDismissed) < 3600000) {
        $("#orientationInfo").hide();
    }

    init(dataUrl);
}

function init(dataUrl) {
    if (loading) {
      return;
    }

    loading = true;
    const minutes = 2;
    const ms = 1000 * 60 * minutes;
    const time = Math.round(new Date().getTime() / ms) * ms;

    $.ajax({
        type: "GET",
        url: dataUrl + "?t=" + time,
        success: function(data, status, xhr) {
            renderTable(data);
            const lastModified = xhr.getResponseHeader("last-modified") || xhr.getResponseHeader("x-server-response-time");
            $('#lastUpdatedTime').text(lastModified);
            $('#lastUpdated').show();
        },
        complete: function() {
          timer = refreshDuration;
          loading = false;
        }
    });
  }