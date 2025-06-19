## SYSTEM DESIGN
![image](https://github.com/user-attachments/assets/27390d33-e680-44d8-9ec3-21ebd0bd1462)

API Collection https://github.com/venussa/BE-Dexa-Test/blob/master/rest-api.postman_collection.json

## REQUIRED
1. Node JS
2. Postgres
3. Rabbit MQ
4. Firebase
   You need to download the service account file from the Firebase Console and place it in `./src/config/service-account.json`

## APPLICATION SETUP
1. git clone https://github.com/venussa/BE-Dexa-Test.git
2. copy `env.example` to `.env`
3. set postgress, rabbit, firebase config in `.env`
4. run `npm install`

## DATABASE MIGRATION & START SERVICE
1. create 2 database in postgres. for `main application` and `logging`
2. run `npm run migration:run`
3. run `npm run start`
4. service will running in port `3000`
