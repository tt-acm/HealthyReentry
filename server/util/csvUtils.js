const moment = require("moment");
const enumStatusMap = require("../../server/util/enumStatusMap.js");


let csvHeader = "Name,Email,Number Of Direct Encounters,Degree of Separation,Status,Status Last Updated, Last Encountered\r\n";

let csvUtil = {};

let nodeToCsvLine = function nodeToCsvLine(node) {
  let status = enumStatusMap.filter(i => i.code === node.status)[0];
  if (node['statusLastUpdated'] !== "N/A") return `${node.name},${node.email},${node['number_of_encounters']},${node['degree-of-separation']},${status.label},${String(moment(node['statusLastUpdated']).format('lll')).replace(/\,/g, '')},${String(moment(node['encountered_date']).format('ll')).replace(/\,/g, '')}\r\n`;
  else return `${node.name},${node.email},${node['number_of_encounters']},${node['degree-of-separation']},${status.label},${node['statusLastUpdated']},${String(moment(node['encountered_date']).format('lll')).replace(/\,/g, '')}\r\n`;
}

csvUtil.nodeToCsvLine = nodeToCsvLine;


csvUtil.graphToCsv = function graphToCsv(graph) {
  let csv = csvHeader;
  graph.map(n => {
    csv += nodeToCsvLine(n);
  });
  return csv;
}


module.exports = csvUtil;
// module.exports = graphToCsv;
