$(document).ready(function () {
  const rb = new ReportBro(document.getElementById("reportbro"), {
    additionalFonts: [
      { name: "DejaVuSans", value: "dejavusans" },
      { name: "Purisa", value: "purisa" },
      { name: "FreeSans", value: "freesans" },
    ],
    reportServerUrl: "/api/preview",
    defaultFont: "dejavusans",
  });
  let templateNames = getTemplateNames();
  let loadedTemplate;

  // Save as new button functionality START
  $("#savenew-button").click(() => {
    const lt = saveAsNew(rb, templateNames);
    if (lt) {
      loadedTemplate = lt;
      templateNames = getTemplateNames();
    }
  });
  // Save as new button functionality END

  // Save button functionality START
  $("#save-button").click(() => {
    if (
      !confirm(
        `Skutečně chcete změnit šablonu s názvem ${loadedTemplate.Name} ?`
      )
    ) {
      return;
    }
    save(rb, loadedTemplate);
  });
  // Save button functionality END

  // Load template START
  $("#load-button").click(() => {
    const lt = load(rb);
    if (lt) loadedTemplate = lt;
    console.log(loadedTemplate);
  });
  // Load template END
  $("#load-popup").on("click", function () {
    templateNames = getTemplateNames();
    if (populateLoadSelect(templateNames)) {
      $("#popup-overlay").fadeIn();
    }
  });

  $("#close-popup").on("click", function () {
    $("#popup-overlay").fadeOut();
  });

  $("#popup-overlay").on("click", function (event) {
    if ($(event.target).is("#popup-overlay")) {
      $(this).fadeOut();
    }
  });

  $("#archive-button").on("click", () => {
    if (!loadedTemplate || loadedTemplate.Name === "-- Nová šablona --") {
      alert("Nelze archivovat");
      return;
    }
    if (
      !confirm(
        `Skutečně chcete změnit šablonu s názvem ${loadedTemplate.Name} ?`
      )
    ) {
      return;
    }
    loadedTemplate.archived = !loadedTemplate.archived;
    archiveButtonDisplay(loadedTemplate.archived);
    save(rb, loadedTemplate);
  });

  $("#archive-display-switch").on("click", () => {
    console.log($("#archive-display-switch").val());
    if ($("#archive-display-switch").prop("checked")) {
      showArchived();
    } else {
      hideArchived();
    }
  });

  //SQL EDITOR START

  $("#sql-button").on("click", function (event) {
    $("#sql-popup-overlay").fadeIn();
  });

  $("#sql-popup-overlay").on("click", function (event) {
    if ($(event.target).is("#sql-popup-overlay")) {
      $(this).fadeOut();
    }
  });

  $("#close-sql").on("click", function () {
    $("#sql-popup-overlay").fadeOut();
  });

  $("#test-sql").on("click", function (event) {
    testSql();
  });

  // SQL EDITOR END
  // HELP POPUP START

  $("#help-button").click(function () {
    $("#help-overlay").fadeIn();
    $("#help-popup").fadeIn();
  });

  $(".help-close-button").click(function () {
    $("#help-overlay").fadeOut();
    $("#help-popup").fadeOut();
  });

  $("#help-overlay").click(function (event) {
    if ($(event.target).is("#help-overlay")) {
      $("#help-overlay").fadeOut();
      $("#help-popup").fadeOut();
    }
  });

  // HELP POPUP END
});

function archiveButtonDisplay(archived) {
  if (archived) {
    $("#archive-button").text("Archivováno");
    $("#archive-button").removeClass("archive-button");
    $("#archive-button").addClass("archive-button-archived");
  } else {
    $("#archive-button").text("Archivovat");
    $("#archive-button").addClass("archive-button");
    $("#archive-button").removeClass("archive-button-archived");
  }
}
