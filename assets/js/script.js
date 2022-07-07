
const DateTime = luxon.DateTime;

$('#currentDay').text(DateTime.now().toFormat('cccc, LLLL d, y')); 