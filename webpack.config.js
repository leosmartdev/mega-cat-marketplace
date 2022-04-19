module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      https: require.resolve('./node_modules/https-browserify'),
      http: require.resolve('./node_modules/stream-http'),
      crypto: require.resolve('./node_modules/crypto-browserify'),
      stream: require.resolve('./node_modules/stream-browserify')
    }
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: ['ts-loader']
      }
    ]
  }
};
