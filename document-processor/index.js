const amqp = require('amqplib');
const QUEUE_NAME = 'document-queue';

let channel;

const initializeWorker = async () => {
  const connection = await amqp.connect('amqp://localhost');
  channel = await connection.createChannel();
  
  // Asserts an even distribution of work (as opposed to an even distribution of messages) for the
  // workers by limiting the number of messages they can fetch at any given time to 1. If this were
  // not the case, they'd be able to fetch unlimited messages and thus would default to a round-
  // robin style message distribution. This could cause issues if there's a lack of uniformity in
  // messages (eg. even numbered messages are "heavy" and odd numbered messages are "light").
  channel.prefetch(1);

  await channel.assertQueue(QUEUE_NAME, {durable: true});

  channel.consume(QUEUE_NAME, processMessage);
  console.log('Waiting for messages from upload-handler...')
};

const processMessage = async function (message) {
  await doWork(message);
  channel.ack(message);
};

const doWork = async (message) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Received message: ${message.content.toString()}`);
      resolve();
    }, 2000);
  });
}

initializeWorker();
