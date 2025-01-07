'use strict';
import fetch from 'node-fetch';
import { desiredSites, desiredDays, desiredStatuses } from './config.mjs';
import logger from './logger.mjs';

export default async function() { 

    // Make desiredDays an array of actual Date objects
    const desiredDates = desiredDays.map(x => new Date(x));
    // Derive monthsToSearch from list of dates
    //  Even though we're using distinct dates now, API call is still monthly
    const monthsToSearch = getDistinctMonths(desiredDates); 
    // Derive year from first date in list
    //  This will allow us to set up next year's dates in advance and not worry about ENV VAR update
    const year = desiredDates[0].getFullYear();

    let output = new Map();

    // Loop through Desired sites
    for (const campground of desiredSites) {

        // Output collector
        let availableSiteNights = new Map();

        const campgroundMonthsToSearch = campground.monthsToSearch ? campground.monthsToSearch : monthsToSearch;

        // Loop though remaining months
        // TODO: Put a delay to reduce chance of a 429 response?
        for(const monthToSearch of campgroundMonthsToSearch) {

            // get the API JSON for the campground-month pair
            const campgroundMonth = await getCampgoundMonth(campground.campgroundId, monthToSearch, year).catch(err => logger.error(err));

            if (Object.keys(campgroundMonth).length === 0) continue;    // Skip if no results returned

            const sites = Object.values(campgroundMonth.campsites);
            
            for (const site in sites) {
                const siteDetails = sites[site];
                const siteId = siteDetails.site;
                const wildcard = '*';

                // Ignore non-numeric sites (usually group sites)
                if (isNaN(siteId)) continue;

                if (campground.campgroundSites.includes(siteId) || campground.campgroundSites.includes(wildcard)) {
                    // Found a site we desire, let's filter the availabilites by status & night-of-the-week
                    siteDetails.availabilities = filter(siteDetails.availabilities, desiredDates, desiredStatuses);

                    // If nothing qualifies, go to next site
                    if (Object.keys(siteDetails.availabilities).length === 0) continue;

                    // We have some nights that qualify!  Add to the Map (or update from a previous month)
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

        // If any sites are available for this campground, add to output Map
        if (availableSiteNights.size > 0) output.set(`${campground.campgroundName}.${campground.campgroundId}`, availableSiteNights)

    }

    return output;

}

// Async fetch of camground-month JSON data from API
async function getCampgoundMonth(campgroundId, month, year) {
    let today = new Date();
    month = ('0' + month).slice(-2);    // Add leading 0 to month to pass to API

    // If searching in the current year, check that month is not in the past
    // Javascript Date getMonth returns 0-indexed month number--month passed to this method is 1-indexed
    if (year <= today.getFullYear() && month < today.getMonth() + 1) return {};

    const fetchUrl = `https://www.recreation.gov/api/camps/availability/campground/${campgroundId}/month?` +
        new URLSearchParams({start_date: `${year}-${month}-01T00:00:00.000Z`});

    logger.verbose("Fetching: " + fetchUrl)
    const response = await fetch(fetchUrl);
    if (!response.ok) {
        logger.warn(response.status, response.text(), fetchUrl)
        return {};
    } else {
        logger.debug(response.status, fetchUrl)
    }
    const data = await response.json();
    return data;
};

// Filter availabilities object by nights and statuses
// Filter for back-to-back days
function filter(availabilities, desiredDates, desiredStatuses) {

    const desiredDatesStr = desiredDates.map(date => date.toISOString().slice(0, 10));

    const asArray = Object.entries(availabilities).
        filter(([night, status]) => {
            return desiredDatesStr.includes((new Date(night)).toISOString().slice(0, 10)) && desiredStatuses.includes(status);
        });

    const filter1 = Object.fromEntries(asArray);

    const asArray2 = 
        asArray.filter(([night, status]) => {
            const currDate = new Date(night);
            return diffDate(currDate, 1) in filter1 || diffDate(currDate, -1) in filter1;
        });

    return Object.fromEntries(asArray2);
}

function diffDate(date, int) {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + int)
    return newDate.toISOString().slice(0,19)+"Z"
}

function getDistinctMonths(dates) {
    const uniqueMonths = new Set();
  
    for (const date of dates) {
      const month = new Date(date).getMonth() + 1; // 1 for January, 2 for February, etc.
      uniqueMonths.add(month);
    }
  
    return Array.from(uniqueMonths); 
}
