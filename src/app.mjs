import search from './search.mjs';
import cron from 'node-cron';
import buildBlock from './blocks.mjs';
import slack_alert from './slack_alert.mjs';

// Local alert function with error logging
async function alert(message) {
    await slack_alert(message).catch(err => console.log(err));
}

{
    // Do once right at start up
    const results = await search();
    console.log(results);
    // Alert if we have results
    if (results.size > 0) alert(buildBlock(results));
}

// Do again every 3 hours
cron.schedule('0 */3 * * *', function() {
    const results = search();
    console.log(results);
    if (results.size > 0) alert(buildBlock(results));
});


