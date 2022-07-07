
const DateTime = luxon.DateTime;

var events = JSON.parse(localStorage.getItem('events')) || [];


// Set text of current day
function setToday(){
    $('#currentDay').text(DateTime.now().toFormat('cccc, LLLL d, y')); 
}


// Populate event descriptions on page
function populateDescriptions(){
    events.forEach(elem => {
        $('.hour:contains("' + elem.hour + '")')
            .closest('.row')
            .find('.description')
            .text(elem.description);
    });
}


// Establish past/present/future color-coding
function colorCoding(){
    $('.row').each(function(){

        // Get rowHour in 24-hr time (coerced to a number)
        var rowHour = $(this).find('.hour').text();
        rowHour = rowHour === 'Noon' ? '12PM' : rowHour;
        rowHour = +DateTime.fromFormat(rowHour, 'ha').toFormat('H');
        
        // Get currentHour in 24-hr time (coerced to a number)
        var currentHour = +DateTime.now().toFormat('H');
        
        //Add color-coded classes
        if (rowHour < currentHour)
            $(this).children('.description-wrapper').addClass('past');
        else if (rowHour == currentHour)
            $(this).children('.description-wrapper').addClass('present');
        else
            $(this).children('.description-wrapper').addClass('future');
    });
}


// Save events to localStorage
function saveEvents(){
    events = [];
    
    $('.row').each(function (){
        events.push({
            hour: $(this).find('.hour').text(),
            description: $(this).find('.description').text()
        });
    });

    localStorage.setItem('events', JSON.stringify(events));
}



// INITIALIZE PAGE
setToday();
populateDescriptions();
colorCoding();
// Add timers for refreshing current hour / current day