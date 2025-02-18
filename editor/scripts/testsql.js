function createDynamicTable(data) {
  const table = $("#dynamicTable");
  const thead = table.find("thead");
  const tbody = table.find("tbody");

  // Clear existing content
  thead.empty();
  tbody.empty();

  // Get dynamic column names (keys of the first object)
  const columns = Object.keys(data[0]);

  // Create table headers
  const headerRow = $("<tr>");
  columns.forEach((col) => {
    headerRow.append(`<th>${col}</th>`);
  });
  thead.append(headerRow);

  // Create table rows
  data.forEach((row) => {
    const tableRow = $("<tr>");
    columns.forEach((col) => {
      tableRow.append(`<td>${row[col] !== null ? row[col] : ""}</td>`);
    });
    tbody.append(tableRow);
  });
}

function testSql() {
  $.ajax({
    type: "GET",
    url: "/api/previewsql",
    async: false,
    data: {
      sql: $("#sql-textarea").val(),
      params: $("#param-text").val(),
    },
    success: (data) => {
      createDynamicTable(data);
    },
    error: (err) => {
      alert(err.responseJSON.message);
    },
  });
}
