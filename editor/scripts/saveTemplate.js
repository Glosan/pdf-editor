function saveAsNew(rb, templateNames) {
  let templateName = $("#templateNameInput").val();

  if (templateName === "-- Nová šablona --") {
    alert("Prosím zadejte jméno šablony");
    return;
  }
  if (templateNames.find((item) => item.name === templateName)) {
    alert("Šablona s tímto názvem již existuje");
    return;
  }

  let success = true;
  const report = rb.getReport();
  const response = $.ajax({
    type: "POST",
    contentType: "application/json",
    url: "/api/saveNewTemplate",
    async: false,
    data: JSON.stringify({
      name: templateName,
      template: report,
      sql: $("#sql-textarea").val(),
    }),
    success: (data) => {
      alert(`Šablona ${templateName} uspěšně uložena`);
    },
    error: (res) => {
      alert(res.responseJSON.message);
      success = false;
    },
  });
  return success ? response.responseJSON : undefined;
}

function save(rb, loadedTemplate) {
  if (!loadedTemplate || loadedTemplate.Name === "-- Nová šablona --") {
    alert("Tato šablona zatím neexistuje. Použij 'Uložit jako nové'");
    return;
  }

  const report = rb.getReport();
  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: "/api/saveTemplate",
    data: JSON.stringify({
      id: loadedTemplate.ID,
      name: $("#templateNameInput").val(),
      template: report,
      sql: $("#sql-textarea").val(),
      archived: loadedTemplate.archived,
    }),
    success: (res) => {
      alert(`Šablona ${loadedTemplate.Name} uspěšně uložena`);
    },
    error: (res) => {
      alert(res.responseJSON.message);
    },
  });
}
