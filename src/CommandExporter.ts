//Used for easy exporting of all commands to the Command Importer in DadBot
//Each command must be imported and added to the export list for it to work
import addBirthday from "./commands/AddBirthday";
import dadJoke from "./commands/DadJoke";
import deleteMessages from "./commands/DeleteMessages";
import info from "./commands/Info";
import join from "./commands/Join";
import list from "./commands/List";
import play from "./commands/Play";
import removeBirthday from "./commands/RemoveBirthday";
import repeat from "./commands/Repeat";
import server from "./commands/Server";
import skip from "./commands/Skip";
import stop from "./commands/Stop";

export default [
  addBirthday,
  dadJoke,
  deleteMessages,
  info,
  join,
  list,
  play,
  removeBirthday,
  repeat,
  server,
  skip,
  stop,
];
