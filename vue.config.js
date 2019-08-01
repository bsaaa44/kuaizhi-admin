module.exports = {
  devServer: {
      // 设置主机地址
      host: 'localhost',
      // 设置默认端口
      port: 8080,
      // 设置代理
      proxy: {
          '/admin': {
              // 目标 API 地址
              target: 'http://dev.kz.sync163.com/',
              // 如果要代理 websockets
              ws: true,
              // 将主机标头的原点更改为目标URL
              changeOrigin: true
            //   pathRewrite: {
            //     '^/admin': ''    //代理的路径
            //   }
          }
      }
  }
}
