//
// Program:     Life Lived
//
// Description: This is a Infinity Dashboard module for showing
//              the percentage of life lived so far based on an
//              average life expectancy that the user can configure.
//

const fiplab = require('fiplab');
const moment = require('moment');
require('moment-precise-range-plugin');

let eventDate = new moment(fiplab.arguments.eventDate);
let now = new moment();
let D = moment.preciseDiff(eventDate, now, true);
var result = "";

if (D.years > 0) {
   result += D.years + " y";
   if (D.months > 0 || D.days > 0) {
      result += ", ";
   }
}

if (D.months > 0) {
   result += D.months + " m";
   if (D.days > 0) {
      result += ", ";
   }
}

if (D.days > 0) {
   result += D.days + " d";
}

fiplab.exit(result, true);