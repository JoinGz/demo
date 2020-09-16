const app = require('./application')
function express() {
  return new app()
}
exports = module.exports = express