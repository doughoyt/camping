export default function (output) {

    let blocks = [];

    for(const [campgroundName, availableSiteNights] of output) {

        blocks.push({
            type: "header",
            text: {
              type: "plain_text",
              text: `${campgroundName}`
            }
        });
        blocks.push({
           "type": "divider"
        });

        // Now we have a Map of the desired sites with availabilities merged from all months
        // Loop again to test for dates and states
        // ** Note that this is UNsorted and might be nicer by site "ID" **
        for (const [siteId, siteDetails] of availableSiteNights) {
            const availabilities = siteDetails.availabilities;

            let block = {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Site: ${siteId}* -- Type: ${siteDetails.campsite_type} -- Capacity: ${siteDetails.capacity_rating}`
                }
            }

            // Loop through availabilities
            let table = [{
                type: 'mrkdwn',
                text: '*Night*'
            },
            {
                type: 'mrkdwn',
                text: '*Status*'
            }];
            for (const night in availabilities) {
                const nightDate = new Date(night);
                const nightStatus = availabilities[night];

                table.push({
                    type: 'plain_text',
                    text: nightDate.toUTCString().substring(0,16)
                },
                {
                    type: 'plain_text',
                    text: nightStatus
                });

            }
            block.fields = table;

            blocks.push(block);

        }


    }

    return blocks;

}