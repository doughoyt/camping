'use strict';
import cron from 'node-cron';

export function searchResultEqual(map1, map2){
    if(map1 == undefined || map2 == undefined) return false;

    if(map1.size !== map2.size) return false;

    // Search results structure is a Map of Maps
    // Outer map is the campground (order does not matter)
    // Inner map is sites within the campground
    // Inner map key 'availabilities' is a literal object of nights that can change

    const map1Outer = Array.from(map1.keys()).sort();
    const map2Outer = Array.from(map2.keys()).sort();
    // Shallow test that the list of campgrounds matches
    if (JSON.stringify(map1Outer) !== JSON.stringify(map2Outer)) return false;

    // Loop through campgrounds and do shallow test of sites
    // Since both map keys are equal here, we will arbitrarily iterate map1's keys
    for(const key of map1Outer) {
        const map1Inner = Array.from(map1.get(key).keys()).sort();
        const map2Inner = Array.from(map2.get(key).keys()).sort();
        // Shallow test that the list of sites matches
        if (JSON.stringify(map1Inner) !== JSON.stringify(map2Inner)) return false;

        // Likewise, inner maps would be equal by here
        // Remember that availabilities is an object literal, NOT a Map
        for(const site of map1Inner) {
            const map1availabilities = Object.keys(map1.get(key).get(site).availabilities).sort();
            const map2availabilities = Object.keys(map2.get(key).get(site).availabilities).sort();

            // Final test ... are the availabiliy dates the same?
            if (JSON.stringify(map1availabilities) !== JSON.stringify(map2availabilities)) return false;
        }

    }

    return true;

}

export function resultsToHtml(results){
    
    let header = [`
        <style>
            body { font-size: 32px !important; }
            h3 { margin: 10px 0px 0px 0px; }
            p { margin: 0px 0px 0px 20px; }
            table, th, td { border: 1px solid black; border-collapse: collapse; }
            table { width: 80%; margin: 10px 20px 10px 20px;}
        </style>
    `];
    let body = [];



    for(const [campground, availableSiteNights] of results) {

        const [campgroundName, campgroundId] = campground.split(".");

        body.push(`<h1><a href="https://www.recreation.gov/camping/campgrounds/${campgroundId}">${campgroundName}</a></h1>`);
        body.push(`<\hr>`);
        
        // Now we have a Map of the desired sites with availabilities merged from all months
        // Loop again to test for dates and states
        // ** Note that this is UNsorted and might be nicer by site "ID" **
        for (const [siteId, siteDetails] of availableSiteNights) {
            const availabilities = siteDetails.availabilities;

            body.push(`<h3><a href="https://www.recreation.gov/camping/campsites/${siteDetails.campsite_id}"><strong>Site: ${siteId}</strong></a></h3>`);
            body.push(`<p><b>Type:</b> ${siteDetails.campsite_type}</p>`);
            body.push(`<p><b>Capacity:</b> ${siteDetails.capacity_rating}</p>`);

            body.push(`<table>`);
            body.push(`<tr>`);
            body.push(`<th>Night</th>`);
            body.push(`<th>Status</th>`);
            body.push(`</tr>`);
            
            // Loop through availabilities
            for (const night in availabilities) {
                const nightDate = new Date(night);
                const nightStatus = availabilities[night];

                body.push(`<tr>`);
                body.push(`<td>${nightDate.toUTCString().substring(0,16)}</td>`);
                body.push(`<td>${nightStatus}</td>`);
                body.push(`</tr>`);

            }
            body.push(`</table>`);
            body.push(`</hr>`);

        }


    }

    return '<!DOCTYPE html>'
    + '<html><head>' + header.join("\n") + '</head><body>' + body.join("\n") + '</body></html>';

}

export function checkSettings() {

    if (process.env.SLACK_CHANNEL_ID === undefined ||
        process.env.SLACK_BOT_TOKEN === undefined) {
            throw new Error("Missing SLACK environment variables");
        }

    if (process.env.CRON !== undefined &&
        !cron.validate(process.env.CRON)) {
            throw new Error("Provided CRON invalid");
        }

}
