import {ChangeOutPath} from './changeoutpath.js'

function JSONloader (source) {
  return `export default ${JSON.stringify(source)}`
}

export default {
  module: {
    rules: [
      {
        test: /\.json$/,
        loader: [JSONloader],
        options: {
          jsonloaderOption: true,
        },
      },
    ],
  },
  plugins: [
    new ChangeOutPath()
  ]
}
