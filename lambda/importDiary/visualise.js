const { DateTime } = require("luxon");
const { uploadFile } = require("./s3");

const getVisualisationHtml = (data) =>
  `<html><head><script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script><script type="text/javascript">google.charts.load("current",{packages:["calendar"]});google.charts.setOnLoadCallback(drawChart);function drawChart(){var dataTable= new google.visualization.DataTable();dataTable.addColumn({type:"date",id:"Date"});dataTable.addColumn({type:"number",id:"Won/Loss"});dataTable.addRows([${data.map(
    ([date, count]) => `[new Date("${date}"), ${count}]`
  )}]);var chart=new google.visualization.Calendar(document.getElementById("calendar_basic"));var options={title:"Journal Entries",height:350,noDataPattern:{backgroundColor:"#3a3b3c",color:"#a9a9a9",},calendar:{cellColor:{stroke:"#808080",strokeOpacity:0.5,strokeWidth:1,},},};chart.draw(dataTable,options);}</script></head><body style="display:flex;align-items:center;justify-content:center;margin:0;height:100%;"><div id="calendar_basic" style="width:1000px;height:350px"></div></body></html>`;

const generateVisualisation = (formattedDiary) => {
  const calendarData = getCalendarData(formattedDiary);
  return getVisualisationHtml(calendarData);
};

const getCalendarData = (formattedDiary) => {
  const totalledEntries = formattedDiary.reduce((prev, curr) => {
    const dayOfYear = curr.day;
    if (prev[dayOfYear] === undefined) {
      prev[dayOfYear] = 1;
    } else {
      prev[dayOfYear] = prev[dayOfYear] + 1;
    }
    return prev;
  }, {});

  return Object.entries(totalledEntries).map(([dayOfYear, count]) => {
    const [month, day] = dayOfYear.split("-");
    return [
      new Date(
        DateTime.now().year,
        Number.parseInt(month) - 1,
        Number.parseInt(day)
      ).toISOString(),
      count,
    ];
  });
};

const uploadVisualisation = async (formattedDiary) => {
  const visualisation = generateVisualisation(formattedDiary);
  await uploadFile("meta/summary.html", visualisation);
};

module.exports = {
  uploadVisualisation,
};
