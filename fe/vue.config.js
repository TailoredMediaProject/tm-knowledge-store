module.exports = {
  devServer: {
    port: 4200,
    proxy: {
      "/api/v1": {
        target: `http://${process.env.NODE_ENV === 'production' ? 'localhost' : 'knowledge-store'}:8080`,
        ws: true,
        secure: false,
        changeOrigin: true,
        logLevel: "debug",
      },
    },
  },
};
