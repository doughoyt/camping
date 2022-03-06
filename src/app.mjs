import search from './search.mjs';
import cron from 'node-cron';
import buildBlock from './slack/slack_blocks.mjs';
import { alertBlock, alertText } from './slack/slack_alert.mjs';
import { searchResultEqual, checkSettings, log } from './utils.mjs';


if (!checkSettings()) {
    log("ERROR: Minimum ENV settings not provided.");
    process.exit();
}

// Local alert function with error logging
async function alert(message) {
    await alertBlock(message).catch(err => log(err));
}
async function textAlert(message) {
    await alertText(message).catch(err => log(err));
}

// For now, rely on in-memory
let last = new Map();

{
    textAlert("Starting monitor.");
    // Do once right at start up
    const results = await search();
    log("Initial search conducted. Sites available:", results.size)
    // Alert if we have results
    if (results.size > 0) alert(buildBlock(results));
    last = results;
}

// Do again every 3 hours
cron.schedule('0 */3 * * *', async function() {
    log("Scheduled search starting...")
    const results = await search();
    log("Scheduled search conducted. Sites available:", results.size)
 
    // If results returned, see if they were different than last & alert
    // Caveats:
    //   This will alert if ANYTHING changes on the entire results ... so will re-alert if a site is no longer available
    //   This will not alert if results completely disappeared (all sites no longer available)
    if (results.size > 0) {
        log("Results had sites!");
        if (!searchResultEqual(results, last)) {
            log("  Results had different sites! ALERT!!");
            alert(buildBlock(results));
        }
    }
    // Set last to the current
    last = results;
});
