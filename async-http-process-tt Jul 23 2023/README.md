# Mechanism for asynchronous processing of HTTP request

## Getting started

1. m1 service
	1. run `cd m1`
	2. run `npm i`
	3. rename `env` to `.env`
	4. you can change the port number from `8000` in the `.env` file
	5. in `.env` change the variable 'RABBITMQ_URI' to your url (if you have one, otherwise you can follow the instructions bellow)
	6. run `node server.js`
	
	the `m1` service is ready for work and is listening on the port you specified in `.env` file

* m2 service
	1. run `cd m2`
	2. run `npm i`
	2. rename 'env' to '.env' of m1 in 
	3. in `.env` change the variable 'RABBITMQ_URI' to your url (if you have one, otherwise you can follow the instructions bellow)
	4. run `node server.js`
	
	the `m1` service is ready for work and is listening on the port you specified in `.env` file

## Setting up RabbitMq locally (in a Linux environment)

 1. make sure that your docker daemon is running by executing `sudo systemctl status docker`
 2. run `sudo docker-compose up`
 3. the process should fail in the end and shutdown, it's ok
 4. run `chmod -R 777 ./data/rabbitmq/log/ (can require 'sudo' in some cases)
`
5. run `sudo docker-compose up` again
6. check that everything is  working correctly by opening `http://localhost:15672` in your browser (default username and password is `guest`)
