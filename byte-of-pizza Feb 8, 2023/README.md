# byte-of-pizza

3 microservices
+ pizza-admin - nodejs backend for connecting admin panel and slack bot
+ pizza-bot - slack bot for making ordering pizza
+ pizza-front - angular admin panel for viewing pizza orders


To start project you will need:
+ account at https://www.cloudamqp.com/ and https://www.mongodb.com/cloud
+ add your MQ and MongoDb links in .env
+ create and setup a slack app, change the .env file accordingly

# Settings for the Slack app

+ enable socket-mode
+ enable event-subscriptions
+ enable Interactivity & Shortcuts
+ in the "OAuth & Permissions" tab, enable these Bot Token Scopes
  + chat:write
  + im:history
  + sample app manifest file:
  
  ```yaml
    display_information:
    name: pizza-byte
    description: Bot for ordering a byte of pizz
    background_color: "#413b2b"
  features:
    bot_user:
      display_name: bit-pizza
      always_online: false
  oauth_config:
    scopes:
      bot:
        - chat:write
        - im:history
  settings:
    event_subscriptions:
      request_url: https://pizza-byte.nulluall.repl.co/slack/events
      bot_events:
        - message.im
    interactivity:
      is_enabled: true
    org_deploy_enabled: false
    socket_mode_enabled: true
    token_rotation_enabled: false


