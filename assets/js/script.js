
const DateTime = luxon.DateTime;

// Set text of current day
$('#currentDay').text(DateTime.now().toFormat('cccc, LLLL d, y')); 

// Establish past/present/future color-coding
$('.row').each(function(){
    var rowHour = $(this).find('.hour').text();
    rowHour = rowHour === 'Noon' ? '12PM' : rowHour;
    rowHour = +DateTime.fromFormat(rowHour, 'ha').toFormat('H'); // Returns rowHour in 24-hr time, coerced to a number
    
    var currentHour = +DateTime.now().toFormat('H'); //Returns currentHour in 24-hr time, coerced to a number

    if (rowHour < currentHour)
        $(this).children('.description-wrapper').addClass('past');
    else if (rowHour == currentHour)
        $(this).children('.description-wrapper').addClass('present');
    else
        $(this).children('.description-wrapper').addClass('future');
});