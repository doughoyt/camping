import config from 'config';

export const desiredSites = config.get('desiredSites');
//export const desiredDays = config.get('desiredDays');
export const monthsToSearch = config.get('monthsToSearch');

const desiredDays = [];
let year = (new Date()).getFullYear();
const daysToSearch = config.get('daysToSearch');
for (const date of daysToSearch) {
    const [month, day] = date.split("/", 2);
    desiredDays.push(Date.UTC(year, month-1, day));
}
export { desiredDays };

// Output arrays for formatting
const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Availability states:
const RESERVED = 'Reserved';
const AVAILABLE = 'Available';              // Reservable
const OPEN = 'Open';                        // Reservable depending on start of reservation
const NOTRESERVABLE = 'Not Reservable';
const NOTRESERVABLEMGMT = 'Not Reservable Management';
export const desiredStatuses = [AVAILABLE];
