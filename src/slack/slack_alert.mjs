import axios from 'axios';

const channel_id = process.env.SLACK_CHANNEL_ID;
const slackToken = process.env.SLACK_BOT_TOKEN;

export async function alertBlock(message) {
    const url = 'https://slack.com/api/chat.postMessage';
    const res = await axios.post(url, {
      channel: channel_id,
      text: "New Alert!",
      blocks: JSON.stringify(message)
    }, { headers: { authorization: `Bearer ${slackToken}` } });
}

export async function alertText(message) {
  const url = 'https://slack.com/api/chat.postMessage';
  const res = await axios.post(url, {
    channel: channel_id,
    text: message
  }, { headers: { authorization: `Bearer ${slackToken}` } });
}
