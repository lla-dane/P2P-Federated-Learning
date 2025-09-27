import axios from 'axios';

const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';
const TOPIC_ID = '0.0.6914391'; // replace with your topic ID

async function getMessages() {
  try {
    const url = `${MIRROR_NODE_URL}/topics/${TOPIC_ID}/messages`;
    const response = await axios.get(url);

    const messages = response.data.messages;
    messages.forEach((msg: any) => {
      const decoded = Buffer.from(msg.message, 'base64').toString('utf8');
      console.log(msg);
      console.log('Sequence:', msg.sequence_number);
      console.log('Timestamp:', msg.consensus_timestamp);
      console.log('Message:', decoded);
      console.log('------------------');
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
  }
}

getMessages();
