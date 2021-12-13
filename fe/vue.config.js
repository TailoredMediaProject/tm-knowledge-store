module.exports = {
  devServer: {
    proxy: {
      "/api/v1/": {
        target: "http://localhost:4000/api/v1/",
        ws: true,
        secure: true,
        changeOrigin: true,
      },
    },
  },
};
