// Array of objects with campground id, name, and sites [array of strings] we might want
export const desiredSites = [
    {
        campgroundId : 231860,
        campgroundName : 'Arapaho Bay',
        campgroundSites : ['026','031','051','058','059','060','061','070','071','072','073','074','075','076','077','078',]
    },
    {
        campgroundId : 232017,
        campgroundName : 'Baby Dow',
        campgroundSites : ['002','004','006','008','010','011','013','014','028','029','030','031']
    },
    {
        campgroundId : 232073,
        campgroundName : 'Molly Brown',
        campgroundSites : ['002','003','004','007','006','008','009','010','011','012','013','014']
    },
    {
        campgroundId : 232387,
        campgroundName : 'White Star',
        campgroundSites : ['006','007','008','008','009','010','011','012','013','014','015','016','017','018']
    },
    {
        campgroundId : 231853,
        campgroundName : 'Chambers Lake',
        campgroundSites : ['034','035','036','037','038','039','040','041','042','043','044','045','046','047','048','049','050','051']
    }
];


// Output arrays for formatting
const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];


// Desired 'night' of week range (Thursday - Saturday) or (Fri & Sat)
//const desiredDays = [4,5,6];
export const desiredDays = [5,6];

// Months to loop ("real" month numbers ... not 'zero-indexed' months)
// May (5) through Sep (9)
export const monthsToSearch = [5,6,7,8];

// Availability states:
const RESERVED = 'Reserved';
const AVAILABLE = 'Available';              // Reservable
const OPEN = 'Open';                        // Reservable depending on start of reservation
const NOTRESERVABLE = 'Not Reservable';
const NOTRESERVABLEMGMT = 'Not Reservable Management';
export const desiredStatuses = [AVAILABLE];
