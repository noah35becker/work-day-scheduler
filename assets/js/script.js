
const DateTime = luxon.DateTime;

var events = JSON.parse(localStorage.getItem('events')) || [];

const EARLIEST_HR = '7AM';
const LATEST_HR = '6PM';

const ROW_HEIGHT = {
    size: 80,
    unit: 'px',
    string: function(){return this.size + this.unit;}
};

const HOUR_RIGHT_PADDING_BOOTSTRAP = 1;
const ROW_TEMPLATE =
    "<div class='row justify-content-center'>\
        <div class='hour-wrapper col-2 col-lg-1 pr-" + HOUR_RIGHT_PADDING_BOOTSTRAP + " d-flex align-items-start pt-1 justify-content-end'>\
            <div class='hour font-weight-bolder'></div>\
        </div>\
        <div class='description-wrapper col-6 col-sm-8 col-md-9 col-lg-10 pl-2 pl-md-3 pr-n" + HOUR_RIGHT_PADDING_BOOTSTRAP + " d-flex align-items-center justify-content-start'>\
            <div class='description'></div>\
        </div>\
        <button class='save-btn col-2 col-md-1'><i class='fa-solid fa-floppy-disk'></i></button>\
    </div>"

const REFRESH_BUFFER = 2000; // 2 seconds



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
        newRow.css('height', ROW_HEIGHT.string());
        
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

        $(this).children('.description-wrapper').removeClass('past present future');
        
        if (rowHour < currentHour)
            $(this).children('.description-wrapper').addClass('past');
        else if (rowHour == currentHour)
            $(this).children('.description-wrapper').addClass('present');
        else
            $(this).children('.description-wrapper').addClass('future');
    });

    setGradientBackgrounds();

    function setGradientBackgrounds(){
        var numPastRows = $('.past').length;
        var numFutureRows = $('.future').length;
        var index = 0;
        
        $('.past').each(function(){
            $(this).css(
                'background-size',
                1 + ROW_HEIGHT.unit + ' ' + (numPastRows * ROW_HEIGHT.size) + ROW_HEIGHT.unit);
            
            $(this).css(
                'background-position',
                '0 ' + (index++ / (numPastRows - 1) * 100) + '%'
            );
        });

        index = 0;
        $('.future').each(function(){
            $(this).css(
                'background-size',
                1 + ROW_HEIGHT.unit + ' ' + (numFutureRows * ROW_HEIGHT.size) + ROW_HEIGHT.unit);
            
            $(this).css(
                'background-position',
                '0 ' + (index++ / (numFutureRows - 1) * 100) + '%'
            );
        });
    }
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
            () => {
                thisSaveBtnIcon.switchClass('fa-check', 'fa-floppy-disk', 0);
            }, 2000);

        if (editedEl.length){ // Ensures that reverting description to non-editable text + saving to localStorage will only happen if necessary
            var nonEditableEl = $(ROW_TEMPLATE).children('.description-wrapper');
            nonEditableEl.children().text(editedEl.val().trim());

            editedEl.replaceWith(nonEditableEl);
            nonEditableEl.trigger('blur');
            
            saveEvents();
        }

        colorCoding();
    });

    // When description editor is blurred, trigger a click on the corresponding .save-btn
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
    if (twelveHr === 'Noon')
        twelveHr = '12PM';
    else if (twelveHr === 'Midnight')
        twelveHr = '12AM';
    
    return +DateTime.fromFormat(twelveHr, 'ha').toFormat('H');
}


// Get hour in 12-hour time (returns a string)
function getHour12HrTime(twentyFourHr){
    var twelveHr = DateTime.fromFormat('' + twentyFourHr, 'H').toFormat('ha');
    
    if (twelveHr === '12PM')
        return 'Noon';
    if (twelveHr === '12AM')
        return 'Midnight';
    return twelveHr;
}


// Get the Unix timestamp (in ms) of the top of the next hour from now
function topOfNextHrUnix(){
    return DateTime.fromFormat(
        DateTime.now().plus({hours:1}).toFormat('d M y H'),
        'd M y H')
      .toMillis();
}


// Get the Unix timestamp (in ms) of the top of the next day from now
function topOfNextDayUnix(){
    return DateTime.fromFormat(
        DateTime.now().plus({days:1}).toFormat('d M y'),
        'd M y')
      .toMillis();
}




// INITIALIZE PAGE
setToday();
populateContainer();
colorCoding();

// Refresh color coding at the top of every hour (delayed by REFRESH_BUFFER ms)
setTimeout(() => {
    colorCoding();
    setInterval(colorCoding, 1000 * 60 * 60)
}, topOfNextHrUnix() - DateTime.now().toMillis() + REFRESH_BUFFER);

// Refresh today's date at the top of every day (delayed by REFRESH_BUFFER ms)
setTimeout(() => {
    setToday();
    setInterval(setToday, 1000 * 60 * 60 * 24);
}, topOfNextDayUnix() - DateTime.now().toMillis() + REFRESH_BUFFER);
