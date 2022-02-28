import axios from 'axios';

const channel_id = process.env.SLACK_CHANNEL_ID;
const slackToken = process.env.SLACK_BOT_TOKEN;

export default async function alert(message) {
    const url = 'https://slack.com/api/chat.postMessage';
    const res = await axios.post(url, {
      channel: channel_id,
      text: "New Alert!",
      blocks: JSON.stringify(message)
    }, { headers: { authorization: `Bearer ${slackToken}` } });
}
