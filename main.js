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

function pageInit(dataUrl, hasHeats) {
    currentDataUrl = dataUrl;
    const counter = document.querySelector('#counter');

    refreshIntervalId = setInterval(function () {
      if (timer > 0) {
        --timer;
      } else if (!loading) {
        init(dataUrl, hasHeats);
      }
      counter.textContent = timer;
    }, 1000);
    
    const rotationAlert = document.getElementById('orientationInfo');
    const resultsInfo = document.getElementById('resultsInfo');

    rotationAlert.addEventListener('closed.bs.alert', function (event) {
        if (event.target == rotationAlert) {
          localStorage.rotationAlertDismissed = new Date().getTime();
        }
    });

    resultsInfo.addEventListener('closed.bs.alert', function (event) {
      if (event.target == resultsInfo) {
        localStorage.resultsInfoDismissed = new Date().getTime();
      }
  });

    if (localStorage.rotationAlertDismissed && (new Date().getTime() - localStorage.rotationAlertDismissed) < 3600000) {
        $("#orientationInfo").hide();
    }

    if (localStorage.resultsInfoDismissed && (new Date().getTime() - localStorage.resultsInfoDismissed) < 3600000) {
        $("#resultsInfo").hide();
    }

    init(dataUrl, hasHeats);
}

function init(dataUrl, hasHeats) {
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

    let races = [];
    if (hasHeats) {
      races = ["tt", "scratch1", "scratch2", "elim1", "elim2", "heats", "sprint", "points", "pointsPrimes"];
    } else {
      races = ["tt", "scratch", "elim", "sprint", "points", "pointsPrimes"];
    }
    
    for (race of races) {
      const raceName = race;
      $.ajax({
        type: "GET",
        url: dataUrl.replace(".json", "-" + raceName + ".json") + "?t=" + time,
        success: function(data, status, xhr) {
            renderIndividualTable(raceName, data);
        },
        complete: function() {
        }
      });
    }
}

function renderIndividualTable(race, data) {
  const tableSelector = "#" + race + "Table";

  if (data.length == 0) {
    $(tableSelector).hide();
    $(tableSelector + " tbody").empty();
    return;
  }

  // hide sprint groups until both first 3 races complete
  if (race == "heats") {
    if ($("#ttTable").is(":hidden") 
      || ($("#scratchTable").is(":hidden") && $("#scratch1Table").is(":hidden") && $("#scratch2Table").is(":hidden"))
      || ($("#elimTable").is(":hidden") && $("#elim1Table").is(":hidden") && $("#elim2Table").is(":hidden"))) {
      return;
    }
  }

  let template = [];

  template["tt"] =
    {"<>": "tr", "html":[
        {"<>": "th", "scope": "row", "text": "${Placing}"},
        {"<>": "td", "text": "${Rider Number}"},
        {"<>": "td", "text": "${Name} ${Surname}"},
        {"<>": "td", "text": "${TT Time}"},
        {"<>": "td", "text": "${Points}"},
        {"<>": "td", "text": "${Bunch Heats}"}
    ]};
  template["scratch"] =
    {"<>": "tr", "html":[
        {"<>": "th", "scope": "row", "text": "${Place}"},
        {"<>": "td", "text": "${Number}"},
        {"<>": "td", "text": "${Name} ${Surname}"},
        {"<>": "td", "text": "${Points}"}
    ]};
  template["scratch1"] = template["scratch"];
  template["scratch2"] = template["scratch"];
  template["elim"] = template["scratch"];
  template["elim1"] = template["scratch"];
  template["elim2"] = template["scratch"];
  template["heats"] =
    {"<>": "tr", "html":[
        {"<>": "th", "scope": "row", "text": "${Heat}"},
        {"<>": "td", "text": "${Number}"},
        {"<>": "td", "text": "${Name} ${Surname}"}
    ]};
  template["sprint"] =
    {"<>": "tr", "html":[
        {"<>": "th", "scope": "row", "text": "${Heat}"},
        {"<>": "td", "text": "${Place}"},
        {"<>": "td", "text": "${Number}"},
        {"<>": "td", "text": "${Name} ${Surname}"},
        {"<>": "td", "text": "${Points}"}
    ]};
  template["points"] =
    {"<>": "tr", "html":[
        {"<>": "th", "scope": "row", "text": "${Last Lap Position}"},
        {"<>": "td", "text": "${Number}"},
        {"<>": "td", "text": "${Name} ${Surname}"},
        {"<>": "td", "text": "${Laps Gained}"},
        {"<>": "td", "text": "${Laps Lost}"},
        {"<>": "td", "text": "${Total Points}"}
    ]};
  template["pointsPrimes"] =
    {"<>": "tr", "html":[
        {"<>": "th", "scope": "row", "text": "${Sprints}"},
        {"<>": "td", "text": "${Position}"},
        {"<>": "td", "text": "${Number}"},
        {"<>": "td", "text": "${Name} ${Surname}"},
        {"<>": "td", "text": "${Points}"}
    ]};


  const tableHtml = json2html.transform(data, template[race]);

  $(tableSelector + " tbody").html(tableHtml);
  $(tableSelector).show();
}