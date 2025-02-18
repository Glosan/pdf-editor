function load(rb) {
  const id = $("#template-select").find(":selected").val();
  let success = true;
  const response = $.ajax({
    type: "GET",
    async: false,
    url: "/api/getTemplate",
    data: {
      id,
    },
    success: (data) => {
      console.log(data);
      rb.load(data.templateDef);
      $("#sql-textarea").val(data.sql);
      $("#popup-overlay").fadeOut();
      $("#templateNameInput").val(data.Name);
      archiveButtonDisplay(data.archived);
    },
    error: (err) => {
      alert(err.responseJSON.message);
      success = false;
    },
  });

  return success ? response.responseJSON : undefined;
}

function getTemplateNames() {
  let templateNames = [];
  $.ajax({
    type: "GET",
    url: "/api/getTemplateNames",
    async: false,
    success: (data) => {
      templateNames = data;
      console.log(data);
    },
    error: (err) => {
      console.log(err);
    },
  });
  return templateNames;
}

function populateLoadSelect(templateNames) {
  let $select = $("#template-select");
  if (templateNames.length === 0) {
    return false;
  }
  $("#template-select option").remove();
  templateNames.forEach((element) => {
    if (!element.archived) {
      $select.append($("<option />").val(element.id).text(element.name));
    }
  });
  templateNames.forEach((element) => {
    if (element.archived) {
      $select.append(
        $("<option />").val(element.id).text(element.name).addClass("archived")
      );
    }
  });
  hideArchived();
  return true;
}

function hideArchived() {
  $(".archived").fadeOut();
}

function showArchived() {
  $(".archived").fadeIn();
}
