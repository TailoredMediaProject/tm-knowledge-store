module.exports = {
  devServer: {
    port: 4200,
    proxy: {
      "/api/v1": {
        target: `http://localhost:8080`,
        ws: true,
        secure: false,
        changeOrigin: true,
        logLevel: "debug",
      },
    },
  },
  productionSourceMap: false
};
