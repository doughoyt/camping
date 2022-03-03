import search from './search.mjs';
import cron from 'node-cron';
import buildBlock from './slack/slack_blocks.mjs';
import slack_alert from './slack/slack_alert.mjs';
import { searchResultEqual } from './utils.mjs';

// Local alert function with error logging
async function alert(message) {
    await slack_alert(message).catch(err => console.log(err));
}

// For now, rely on in-memory
let last = new Map();

{
    // Do once right at start up
    const results = await search();
    console.log("Initial search conducted. Sites available:", results.size)
    // Alert if we have results
    if (results.size > 0) alert(buildBlock(results));
    last = results;
}

// Do again every 3 hours
cron.schedule('0 */3 * * *', async function() {
    const results = await search();
    console.log("Scheduled search conducted. Sites available:", results.size)

    // If results returned, see if they were different than last & alert
    // Caveats:
    //   This will alert if ANYTHING changes on the entire results ... so will re-alert if a site is no longer available
    //   This will not alert if results completely disappeared (all sites no longer available)
    if (results.size > 0) {
        console.log("Results had sites!");
        if (!searchResultEqual(results, last)) {
            console.log("  Results had different sites! ALERT!!");
            alert(buildBlock(results));
        }
    }
    // Set last to the current
    last = results;
});
