import { BrowserWindow } from 'electron';
import {
  Client,
  TopicId,
  TopicMessageQuery,
  SubscriptionHandle,
} from '@hashgraph/sdk';
import Store from 'electron-store';
import { OPERATOR_ID, OPERATOR_KEY } from './utils.js';

interface TrainingProject {
  id: string;
  logs?: LogEntry[];
}

interface LogEntry {
  content: string;
  timestamp: string;
}

const store = new Store();

export class LogService {
  private subscription: SubscriptionHandle | null = null;
  private client: Client;

  constructor() {
    if (!OPERATOR_ID || !OPERATOR_KEY) {
      console.error('Operator credentials not found in .env for LogService.');
      this.client = Client.forTestnet();
      return;
    }
    this.client = Client.forTestnet().setOperator(OPERATOR_ID, OPERATOR_KEY);
  }

  public startSubscription(
    mainWindow: BrowserWindow,
    projectId: string,
    topicId: string
  ) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    console.log(
      `Starting HCS log subscription for Project ${projectId} on Topic ${topicId}`
    );

    this.subscription = new TopicMessageQuery()
      .setTopicId(TopicId.fromString(topicId))
      .subscribe(this.client, null, (message) => {
        const newLog: LogEntry = {
          content: Buffer.from(message.contents).toString(),
          timestamp: message.consensusTimestamp.toString(),
        };

        console.log('New Log Received:', newLog);

        const logKey = `logs-${projectId}`;

        const currentLogs = store.get(logKey, []) as any[];
        currentLogs.push(newLog);

        store.set(logKey, currentLogs);

        mainWindow.webContents.send('hcs:new-log', newLog);
      });
  }

  public stopSubscription() {
    if (this.subscription) {
      console.log('Stopping HCS log subscription.');
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}
