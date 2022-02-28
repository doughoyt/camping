'use strict';
import fetch from 'node-fetch';
import { desiredSites, desiredDays, monthsToSearch } from './config.mjs';

// Output arrays for formatting
const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Async fetch of camground-month JSON data from API
async function getCampgoundMonth(campgroundId, month) {
    month = ('0' + month).slice(-2);    // Add leading 0 to month to pass to API
    const fetchUrl = `https://www.recreation.gov/api/camps/availability/campground/${campgroundId}/month?` +
        new URLSearchParams({start_date: `2022-${month}-01T00:00:00.000Z`});

    const response = await fetch(fetchUrl);
    const data = await response.json();
    return data;
  };

// Availability states:
const RESERVED = 'Reserved';
const AVAILABLE = 'Available';              // Reservable
const OPEN = 'Open';                        // Reservable depending on start of reservation
const NOTRESERVABLE = 'Not Reservable';
const NOTRESERVABLEMGMT = 'Not Reservable Management';

console.log("Starting...");

// Loop through Desired sites
for (const campground of desiredSites) {
    console.log('==================================');
    console.log(campground.campgroundName);

    // Output collector
    let availableSiteNights = new Map();

    // Loop though remaining months
    for(const monthToSearch of monthsToSearch) {

        // get the API JSON for the campground-month pair
        const campgroundMonth = await getCampgoundMonth(campground.campgroundId, monthToSearch);
        const sites = Object.values(campgroundMonth.campsites);
        
        for (const site in sites) {
            const siteDetails = sites[site];
            const siteId = siteDetails.site;
            if (campground.campgroundSites.includes(siteId)) {
                // Feel like there is a more Javascripty way to do this?
                if (availableSiteNights.has(siteId)){
                    //already found, add the availabilities
                    Object.assign(availableSiteNights.get(siteId).availabilities, siteDetails.availabilities);
                } else {
                    //add to map
                    availableSiteNights.set(siteId, siteDetails);
                }
            }
        }

    }

    // Now we have a Map of the desired sites with availabilities merged from all months
    // Loop again to test for dates and states
    for (const [siteId, siteDetails] of availableSiteNights) {
        const availabilities = siteDetails.availabilities;
        let availableNights = [];

        // Loop through availabilities
        for (const night in availabilities) {
            const nightDate = new Date(night);
            const nightStatus = availabilities[night];

            // If night is available (or open) and is one of the nights of the week to report
            // push to the availableNights array
            //if ((nightStatus === AVAILABLE || nightStatus === OPEN) &&
            if ((nightStatus === AVAILABLE) &&
                    desiredDays.includes(nightDate.getUTCDay())) {
                availableNights.push({
                    night: nightDate,
                    status: nightStatus
                })
            }
            
        }

        if(availableNights.length > 0) {
            // At least one night is available, we can FINALLY display the site details and availability
            console.log('----------------------------------');
            console.log('  Site: ' + siteId);
            console.log('  Type: ' + siteDetails.campsite_type);
            console.log('  Capacity: ' + siteDetails.capacity_rating);
            availableNights.forEach((nightObj) => {
                console.log('    ',
                    nightObj.night.toUTCString().substring(0,16),
                    nightObj.status
                )
            });
    
        }
}

}

console.log("...Completed");

