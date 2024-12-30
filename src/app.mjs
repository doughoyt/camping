import search from './search.mjs';
import cron from 'node-cron';
import buildBlock from './slack/slack_blocks.mjs';
import { alertBlock, alertText } from './slack/slack_alert.mjs';
import { searchResultEqual, resultsToHtml, checkSettings } from './utils.mjs';
import logger from './logger.mjs';
import * as http from 'http';

const cronExpression = process.env.CRON || "0 */3 * * *";

try {
    checkSettings();
  } catch (e) {
    logger.error(e.message);
    process.exit();
  }

logger.info("Starting monitor ...");


// Local alert function with error logging
async function alert(message) {
    logger.debug('Block:', JSON.stringify(message))
    await alertBlock(message).catch(err => logger.error(err));
}
async function textAlert(message) {
    logger.debug('Text:', JSON.stringify(message))
    await alertText(message).catch(err => logger.error(err));
}

// For now, rely on in-memory
let last = new Map();

// Do once right at start up
{
    textAlert("Starting monitor.");
    const results = await search();
    logger.info("Initial search conducted. Sites available:", results.size)
    // Alert if we have results
    if (results.size > 0) alert(buildBlock(results));
    last = results;

}

http.createServer(function (req, res) {
    let html = resultsToHtml(last);

    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': html.length,
        'Expires': new Date().toUTCString()
      });

    res.end(html); //end the response

}).listen(8080); //the server object listens on port 8080

// Do again every 3 hours
cron.schedule(cronExpression, async function() {
    logger.info("Scheduled search starting...")
    const results = await search();
    logger.info("Scheduled search conducted. Sites available:", results.size)
 
    // If results returned, see if they were different than last & alert
    // Caveats:
    //   This will alert if ANYTHING changes on the entire results ... so will re-alert if a site is no longer available
    //   This will not alert if results completely disappeared (all sites no longer available)
    if (results.size > 0) {
        logger.verbose("Results had sites!");
        if (!searchResultEqual(results, last)) {
            logger.verbose("  Results had different sites! ALERT!!");
            textAlert("Availability change ...");
            alert(buildBlock(results));
        }
    }
    // Set last to the current
    last = results;
});
