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
        {"<>": "td", "text": function() { return this['Spr/Kn Points'] == 0 ? this['Events Started'] - 1 : this['Events Started'] } },
        {"<>": "td", "text": "${TT Time}"},
        {"<>": "td", "text": "${TT Points}"},
        {"<>": "td", "text": "${Scratch Points}"},
        {"<>": "td", "text": "${Elim Points}"},
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
      races = ["TT", "Scratch1", "Scratch2", "Elim1", "Elim2", "Heats", "Sprint", "Points", "PointsPrimes"];
    } else {
      races = ["TT", "Scratch", "Elim", "Heats", "Sprint", "Points", "PointsPrimes"];
    }
    
    for (race of races) {
      const raceName = race;
      $.ajax({
        type: "GET",
        url: dataUrl.replace(".json", "-" + raceName + ".json") + "?t=" + time,
        success: function(data, status, xhr) {
            renderIndividualTable(raceName, data, hasHeats);
        },
        complete: function() {
        }
      });
    }
}

function renderIndividualTable(race, data, hasHeats) {
  const tableSelector = "#" + race + "Table";

  if (data.length == 0) {
    $(tableSelector).hide();
    $(tableSelector + " tbody").empty();
    return;
  }

  // hide sprint groups until both first 3 races complete
  if (race == "Heats") {
    if ($("#TTTable").is(":hidden") 
      || ($("#ScratchTable").is(":hidden") && $("#Scratch1Table").is(":hidden") && $("#Scratch2Table").is(":hidden"))
      || ($("#ElimTable").is(":hidden") && $("#Elim1Table").is(":hidden") && $("#Elim2Table").is(":hidden"))
      || (!$("#SprintTable").is(":hidden"))) {
        $("#HeatsTable").hide();
        return;
    }
  }

  let template = [];

  if (hasHeats) {
    template["TT"] =
      {"<>": "tr", "html":[
          {"<>": "th", "scope": "row", "text": "${Placing}"},
          {"<>": "td", "text": "${Rider Number}"},
          {"<>": "td", "text": "${Name} ${Surname}"},
          {"<>": "td", "text": "${TT Time}"},
          {"<>": "td", "text": "${Points}"},
          {"<>": "td", "text": "${Bunch Heats}"}
      ]};
  } else {
    template["TT"] =
      {"<>": "tr", "html":[
          {"<>": "th", "scope": "row", "text": "${Placing}"},
          {"<>": "td", "text": "${Rider Number}"},
          {"<>": "td", "text": "${Name} ${Surname}"},
          {"<>": "td", "text": "${TT Time}"},
          {"<>": "td", "text": "${Points}"}
      ]};
  }
  template["Scratch"] =
    {"<>": "tr", "html":[
        {"<>": "th", "scope": "row", "text": "${Place}"},
        {"<>": "td", "text": "${Number}"},
        {"<>": "td", "text": "${Name} ${Surname}"},
        {"<>": "td", "text": "${Points}"}
    ]};
  template["Scratch1"] = template["scratch"];
  template["Scratch2"] = template["scratch"];
  template["Elim"] = template["scratch"];
  template["Elim1"] = template["scratch"];
  template["Elim2"] = template["scratch"];
  template["Heats"] =
    {"<>": "tr", "html":[
        {"<>": "th", "scope": "row", "text": "${Heat}"},
        {"<>": "td", "text": "${Number}"},
        {"<>": "td", "text": "${Name} ${Surname}"}
    ]};
  template["Sprint"] =
    {"<>": "tr", "html":[
        {"<>": "th", "scope": "row", "text": "${Heat}"},
        {"<>": "td", "text": "${Place}"},
        {"<>": "td", "text": "${Number}"},
        {"<>": "td", "text": "${Name} ${Surname}"},
        {"<>": "td", "text": "${Points}"}
    ]};
  template["Points"] =
    {"<>": "tr", "html":[
        {"<>": "th", "scope": "row", "text": "${Last Lap Position}"},
        {"<>": "td", "text": "${Number}"},
        {"<>": "td", "text": "${Name} ${Surname}"},
        {"<>": "td", "text": "${Laps Gained}"},
        {"<>": "td", "text": "${Laps Lost}"},
        {"<>": "td", "text": "${Total Points}"}
    ]};
  template["PointsPrimes"] =
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