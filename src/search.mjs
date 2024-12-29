'use strict';
import fetch from 'node-fetch';
import { desiredSites, desiredDays, desiredStatuses, monthsToSearch } from './config.mjs';
import logger from './logger.mjs';

export default async function() { 

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
            const campgroundMonth = await getCampgoundMonth(campground.campgroundId, monthToSearch).catch(err => logger.error(err));

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
                    siteDetails.availabilities = filter(siteDetails.availabilities, desiredDays, desiredStatuses);

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
        if (availableSiteNights.size > 0) output.set(campground.campgroundName, availableSiteNights)

    }

    return output;

}

// Async fetch of camground-month JSON data from API
async function getCampgoundMonth(campgroundId, month) {
    let today = new Date();
    month = ('0' + month).slice(-2);    // Add leading 0 to month to pass to API
    const year = (process.env.YEAR === undefined) ? today.getFullYear() : process.env.YEAR;

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
function filter(availabilities, desiredDays, desiredStatuses) {
    const asArray = Object.entries(availabilities).
        filter(([night, status]) => {
            return desiredDays.includes((new Date(night)).getUTCDay()) && desiredStatuses.includes(status);
        });
    return Object.fromEntries(asArray);
}