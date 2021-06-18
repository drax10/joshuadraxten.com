const dayInMiliseconds = 1000 * 60 * 60 * 24;

const timezoneBasedOn = {
    string: "America/Chicago",
    gmt: "GMT-6"
};
const excludedScheduleDates = [];
const excludedWeekdays = [0, 6];

const availableTimes = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
];

const getTimeZoneName = () => {
    // Get a specific point in time (here, the current date/time):
    const d = new Date();

    // Get a DateTimeFormat object for the user's current culture (via undefined)
    // Ask specifically for the long-form of the time zone name in the options
    const dtf = Intl.DateTimeFormat(undefined, {timeZoneName: 'long'});

    // Format the date to parts, and pull out the value of the time zone name
    return dtf.formatToParts(d).find((part) => part.type == 'timeZoneName').value;
}

const formatDateName = dateString => {
    const date = new Date(dateString)
    if ( new Date().getDate() === date.getDate() ) {
        return "Today";
    }
    if ( new Date().getDate()+1 === date.getDate() ) {
        return "Tomorrow";
    }
    if ( date*1 - new Date()*1 < dayInMiliseconds*7) {
        return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][date.getDay()];
    }
    return ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"][date.getMonth()]+ " " + date.getDate()
}

const formatHour = dateString => {
    const date = new Date(dateString);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;

    return hours + ':' + minutes + ampm;
}

const getDateYMD = date => {
    return `${new Date(date).getFullYear()}/${new Date(date).getMonth()+1}/${new Date(date).getDate()}`
}

const getDateHM = date => {
    return `${new Date(date).getHours()}:${new Date(date).getMinutes()}`
}

const generateAvailableDates = () => {
    // What day and time is today in Central Time?
    const centralTimeString = new Date().toLocaleString('en-US', { timeZone: timezoneBasedOn.string })
    const centralTime = {
        object: new Date(centralTimeString),
        date: new Date(getDateYMD(centralTimeString)),
        hour: new Date(centralTimeString).getHours(),
    }

    // Get all dates in the next two weeks
    const dates = [...Array(14).keys()].map(x=>x+1).map(
        daysLater => getDateYMD(new Date(centralTime.object*1 + (daysLater*dayInMiliseconds)))
    )

    // Exclude excluded dates
    .filter( date => !excludedScheduleDates.includes(date) )

    // Exclude weekends
    .filter( date => !excludedWeekdays.includes(new Date(date).getDay()) );

    let availableDateTimes = []
    dates.forEach( date => {
        availableTimes.forEach( time => {
            if ( !excludedScheduleDates.includes(`${date} ${time}`) ) {
                availableDateTimes.push(`${date} ${time} ${timezoneBasedOn.gmt}`)
            }
        });
    });

    return availableDateTimes;
}

async function submitForm( data ) {
    const queryString = new URLSearchParams( data );
    fetch('/.netlify/functions/scheduleMeeting?'+queryString)
    .then( () => {
        document.getElementById("schedule-meeting").classList.add('success')
        document.getElementById("schedule-meeting").innerHTML = "<h2>✨️</h2><p>Woohoo! We've sent the meeting invite to your inbox</p>" 
    }).catch( () => {
        document.getElementById("schedule-meeting").classList.add('success')
        document.getElementById("schedule-meeting").innerHTML = "<h2>Something went wrong</h2><p>Well, this is embarasing. <a href=\"mailto:josh@ovco.io\">Please email us directly</a> and let us know something went wrong</p>" 
    });


}

document.body.onload = () => {
    const availableDateTimes = generateAvailableDates();
    const localAvailableDateTimes = availableDateTimes.map( date => `${getDateYMD(date)} ${getDateHM(date)}`);
    
    const daySelect = document.querySelector(".schedule-cta select.day");
    const hourSelect = document.querySelector(".schedule-cta select.time");
    
    const availableDays = availableDateTimes.map( 
        date => date.split(' ')[0]
    ).filter(
        (value, index, self) => self.indexOf(value) === index
    );
    
    daySelect.innerHTML = availableDays.map( day => `<option value="${day}">${formatDateName(day)}</option>` ).join('');
    
    daySelect.onchange = () => {
        const availableHours = localAvailableDateTimes.filter( dateTime => dateTime.match(daySelect.value) );
        hourSelect.innerHTML = availableHours.map( (hour, index) => `<option value="${availableDateTimes[index]}">${formatHour(hour)}</option>` ).join('')
    };
    daySelect.onchange();

    document.querySelector('.schedule-cta .timezone').innerHTML = getTimeZoneName().replace(/ /g, "&nbsp;");

    // The modal
    const modalParent = document.querySelector('.modal-backdrop');
    const modal = modalParent.firstElementChild;
    const openModalButton = document.querySelector('.button-open-schedule-modal');

    openModalButton.onclick = () => {
        const dayLabel = daySelect.querySelector(`[value="${daySelect.value}"]`).innerText;
        modal.querySelector('.day').innerHTML = dayLabel;

        const timeLabel = hourSelect.querySelector(`[value="${hourSelect.value}"]`).innerText;
        modal.querySelector('.time').innerHTML = timeLabel;

        modalParent.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add("closing");
        setTimeout( () => {
            modalParent.classList.add("hidden")
            modal.classList.remove("closing");
        }, 200 );
    }

    modalParent.onclick = (e) => {
        if (e.target === modalParent) {
            closeModal();
        }
    }
    modal.querySelector('.close-modal').onclick = closeModal

    modal.querySelector('#schedule-meeting').onsubmit = e => {
        e.stopPropagation();
        e.preventDefault();

        submitForm({
            email: modal.querySelector('.email-address').value,
            date: hourSelect.value,
            date_pretty: modal.querySelector('.day').innerHTML + ' at ' + modal.querySelector('.time').innerHTML + ` (${getTimeZoneName()})`,
        })
    }
}