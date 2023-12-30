import { listenMq, sendMessageToMq } from './utils/mq-functions.js';
import { logger } from './utils/logger.js';

async function taskHandler(task) {
    logger.info('Doing something with the task');
    const result = `result ${Math.random()}`;
    await sendMessageToMq(result);
}

listenMq(taskHandler);

process.on('SIGINT', async () => {
    logger.info('Gracefully shuting down the server...');

    process.exit(0);
});

