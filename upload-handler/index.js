const express = require('express');
const amqp = require('amqplib');
const PORT = 3000;
const QUEUE_NAME = 'document-queue';

const initialize = async () => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  channel.assertQueue(QUEUE_NAME, {durable: false});

  const app = express();
  app.use(express.json());

  app.post('/upload', (req, res) => {
    console.log('Received new message')
    channel.sendToQueue(QUEUE_NAME, Buffer.from(req.body.test));
    res.json({
      status: 200
    });
  });
  
  app.get('/healthcheck', (req, res) => {
    res.json({
      status: 200
    });
  });
  
  app.listen(PORT, () => {
    console.log(`Upload handler listening on ${PORT}`);
  });
};

initialize();
