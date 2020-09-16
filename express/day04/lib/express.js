const app = require('./application')
const Router = require('./router/router.js')
function express() {
  return new app()
}
express.Router = Router
exports = module.exports = express