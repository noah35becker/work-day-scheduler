
const DateTime = luxon.DateTime;

var events = JSON.parse(localStorage.getItem('events')) || [];

const EARLIEST_HR = '6AM';
const LATEST_HR = '6PM';

const ROW_TEMPLATE =
    "<div class='row'>\
        <div class='hour-wrapper col-1 mr-3 d-flex align-items-center justify-content-end'>\
            <div class='hour'></div>\
        </div>\
        <div class='description-wrapper col-10 pl-3 mr-n3 d-flex align-items-center justify-content-start'>\
            <div class='description'></div>\
        </div>\
        <button class='save-btn col-1'><i class='fa-solid fa-floppy-disk'></i></button>\
    </div>"



// Set text of current day
function setToday(){
    $('#currentDay').text(DateTime.now().toFormat('cccc, LLLL d, y')); 
}


//Populate container with rows
function populateContainer(){
    var earliestHr24 = getHour24HrTime(EARLIEST_HR);
    var latestHr24 = getHour24HrTime(LATEST_HR);
    
    for (h = earliestHr24; h <= latestHr24; h++){
        var newRow = $(ROW_TEMPLATE);
        
        var thisHour = getHour12HrTime(h);
        newRow.find('.hour').text(thisHour);

        var desc = events.find(elem => elem.hour === thisHour);
        if (desc){
            desc = desc.description;
            newRow.find('.description').text(desc);
        }

        $('.container').append(newRow);
    }
}


// Color-coding (past/present/future)
function colorCoding(){
    $('.row').each(function(){
        var rowHour = getHour24HrTime($(this).find('.hour').text());
        var currentHour = +DateTime.now().toFormat('H');
        
        if (rowHour < currentHour)
            $(this).children('.description-wrapper').addClass('past');
        else if (rowHour == currentHour)
            $(this).children('.description-wrapper').addClass('present');
        else
            $(this).children('.description-wrapper').addClass('future');
    });
}


// Edit event descriptions

    // When description is clicked, change to editable textarea
    $('.container').on('click', '.description-wrapper', function(){    
        var editableEl = $('<textarea>')
            .addClass(
                $(this).attr('class')
                .replace('description-wrapper', 'description-editor'))
            .addClass('form-control rounded-0')
            .text($(this).text().trim());
        
        $(this).replaceWith(editableEl);

        editableEl.trigger('focus');
    });

    // When save button is clicked, display animation, revert description to non-editable text and save to localStorage
    $('.container').on('click', '.save-btn', function(){
        var thisSaveBtnIcon = $(this).children();
        var editedEl = $(this).closest('.row').children('.description-editor');

        thisSaveBtnIcon.switchClass('fa-floppy-disk', 'fa-check', 0);
        setTimeout(
            () => thisSaveBtnIcon.switchClass('fa-check', 'fa-floppy-disk', 0),
            2000);

        if (editedEl.length){ // Ensures that reverting description to non-editable text + saving to localStorage will only happen if necessary
            var nonEditableEl = $(ROW_TEMPLATE).children('.description-wrapper');
            nonEditableEl.children().text(editedEl.val().trim());

            editedEl.replaceWith(nonEditableEl);
            
            saveEvents();
        }

        colorCoding();
    });

    // 
    $('.container').on('blur', '.description-editor', function(){
        $(this).siblings('.save-btn').trigger('click');
    });


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


// Get hour in 24-hour time (returns a number)
function getHour24HrTime(twelveHr){    
    twelveHr = twelveHr === 'Noon' ? '12PM' : '' + twelveHr;
    
    return +DateTime.fromFormat(twelveHr, 'ha').toFormat('H');
}


// Get hour in 12-hour time (returns a string)
function getHour12HrTime(twentyFourHr){
    twentyFourHr = '' + twentyFourHr;
    
    var twelveHr = DateTime.fromFormat(twentyFourHr, 'H').toFormat('ha');
    
    return twelveHr === '12PM' ? 'Noon' : twelveHr;
}


// INITIALIZE PAGE
setToday();
populateContainer();
colorCoding();
// Add timers for refreshing current hour / current day
    // (include N milliseconds as a RENDER_BUFFER, in both the outer setTimeout and inner setInterval methods)
    // use Luxon's toMillis() function