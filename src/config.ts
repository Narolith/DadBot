import * as dotenv from "dotenv";
dotenv.config();

export default {
  botToken: process.env.BOT_TOKEN,
  server: process.env.SERVER_ID,
  generalChannel: process.env.GENERAL_CHANNEL,
  mongoUri: process.env.DATABASE_URI,
  announcementRole: process.env.ANNOUNCEMENT_ROLE,
  youtubeCookie: process.env.YOUTUBE_COOKIE,
  fireStoreProjectId: process.env.FIRESTORE_PROJECT_ID,
  fireStoreClientEmail: process.env.FIRESTORE_CLIENT_EMAIL,
  fireStorePrivateKey: process.env.FIRESTORE_PRIVATE_KEY,
};
