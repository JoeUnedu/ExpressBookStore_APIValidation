/** Server for bookstore. */

const app = require("./app");
const { CFG_PORT } = require("./config");

app.listen(CFG_PORT, () => {
  console.log(`${(new Date()).toISOString()}: Server listening on port ${CFG_PORT}.`);
});
