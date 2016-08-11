import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import config from "./webpack.config";

export default (PORT) => {
    config.entry.unshift(`webpack-dev-server/client?http://localhost:${PORT}/`, "webpack/hot/dev-server");
    config.plugins = config.plugins || [];
    config.plugins.push(new webpack.HotModuleReplacementPlugin());

    const server = new WebpackDevServer(webpack(config), {
        hot: true,
        quite: false,
        noInfo: true,
        stats: { colors: true },
        proxy: {
          "*" : `http://localhost:${PORT - 1}`
        }
    });
    server.listen(PORT, 'localhost', ()=>{ console.log(`Webpack listening on port ${PORT}`); });
}

// `http://localhost:${PORT - 1}`,
