# Camping
Scrape camping site availability

The goal of this project is to periodically check the reacreation.gov campsite availabilities for ..
- Campgrounds and sites that we want
- On 'night of the week' (like Friday & Saturday)
- Reservable status

Secondarily, it serves as a test project for my learning of ...
- server-side node.js & Javascript
- ECMAScript modules
- async/await for promises
- API interfaces (to Slack, Recreation.gov)
- Logging with library (winston)
- Unit Testing (jest)
- Docker image build and deploy

Admittedly, Javascript probably not the best choice for this project with its asynchronous nature (we need to dicate the order of API calls and processing), lack of any front end (where JS really shines), and using node.js with ESMs (where they don't _seem_ to be fully embraced yet).
