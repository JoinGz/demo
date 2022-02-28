function JSONloader(source) {
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
}
