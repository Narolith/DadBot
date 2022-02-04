import * as dotenv from "dotenv";
dotenv.config();

export default {
  botToken: process.env.BOT_TOKEN,
  appId: process.env.APP_ID,
  server: process.env.SERVER_ID,
  generalChannel: process.env.GENERAL_CHANNEL,
  announcementRole: process.env.ANNOUNCEMENT_ROLE,
  youtubeCookie: process.env.YOUTUBE_COOKIE,
  fireStoreProjectId: process.env.FIRESTORE_PROJECT_ID,
  apiKey: process.env.API_KEY,
  dbUrl: process.env.DB_URL,
};
