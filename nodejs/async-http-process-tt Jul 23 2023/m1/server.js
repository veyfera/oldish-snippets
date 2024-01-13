import { listenMq, sendMessageToMq } from './utils/mq-functions.js';
import http from 'http';
import url from 'url';
import { logger } from './utils/logger.js';

const host = 'localhost';
const port = process.env.PORT;

async function requestListener(req, res) {
    const query = url.parse(req.url, true).query;
    logger.info('got HTTP request: ', query)

    await sendMessageToMq(query);
};

async function resultsHandler(result) {
    logger.info('Doing something with the result');
}

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    logger.info(`Server is running on http://${host}:${port}`);
});

listenMq(resultsHandler);

process.on('SIGINT', async () => {
    logger.info('Gracefully shuting down the server...');

    process.exit(0);
});
