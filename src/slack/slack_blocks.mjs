export default function (output) {

    let blocks = [];

    for(const [campground, availableSiteNights] of output) {

        const [campgroundName, campgroundId] = campground.split(".");

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
            let index = 1;
            for (const night in availabilities) {
                const nightDate = new Date(night);
                const nightStatus = availabilities[night];

                if (index > 4) {
                    index = 0;
                    block.fields = table;
                    blocks.push(block);
                    block = {"type": "section"};
                    table = [];                    
                }

                table.push({
                    type: 'plain_text',
                    text: nightDate.toUTCString().substring(0,16)
                },
                {
                    type: 'plain_text',
                    text: nightStatus
                });

                index++;

            }
            block.fields = table;

            blocks.push(block);

        }


    }

    return blocks;

}