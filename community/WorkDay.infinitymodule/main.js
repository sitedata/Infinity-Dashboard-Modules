//
// Program:     Life Lived
//
// Description: This is a Infinity Dashboard module for showing
//              the percentage of life lived so far based on an
//              average life expectancy that the user can configure.
//

//
// Load library.
//
const fiplab = require('fiplab');

//
// Get the preferences from the user.
//
let dstart = fiplab.arguments.wdaystart.split(" ")[1].split(':');
let dstartt = parseInt(dstart[0]) + (parseInt(dstart[1])/60);
let dend = fiplab.arguments.wdayend.split(" ")[1].split(':');
let dendt = parseInt(dend[0]) + (parseInt(dend[1])/60);
let lunch = fiplab.arguments.wlunch.split(" ")[1].split(':');
let luncht = parseInt(lunch[0]) + (parseInt(lunch[1])/60);
let lunchLen = fiplab.arguments.lunchbreaklen;
let workDayLen = fiplab.arguments.workDayLength;

//
// Get the current time.
//
let now = new Date();
let ctime = now.getHours() + (now.getMinutes()/60.0)

//
// Figure the percentage of the work day done.
//
var percent = 0
if ((ctime > dstartt)&&(ctime < luncht)) {
   percent = Math.floor(((ctime - dstartt)/workDayLen) * 100)
} else if ((ctime > luncht)&&(ctime < (luncht + lunchLen))) {
   percent = Math.floor(((luncht-dstartt)/workDayLen) * 100)
} else {
   percent = Math.floor(((ctime-dstartt-lunchLen)/workDayLen)*100)
   if (percent > 100) {
      percent = 100
   }
}

//
// Display the results to the user.
//
fiplab.exit(String(percent) + "%", true);
