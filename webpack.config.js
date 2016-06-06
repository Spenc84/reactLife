const webpack = require('webpack');

module.exports = {
    entry: [
        './frontend/lifeApp.js'
    ],
    module: {
        loaders: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              loader: 'babel'
            },
            {
                test: /\.styl$/,
                exclude: /node_modules/,
                loader: 'style!css!stylus'
            },
            {
                test: /\.html$/,
                loader: 'html'
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                  'file?hash=sha512&prefix=img/&digest=hex&name=[name].[ext]',
                  'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}'
                ]
            }
        ]
    },
    resolve: {
        extensions: ['', '.js']
    },
    output: {
        path: __dirname + '/public',
        publicPath: '/',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: './public'
    }
    /////  MINIFIES THE ENTIRE PROJECT  //////////
     /// COMMENT OUT TO RENDER UNMINIFIED ////////
    // , plugins: [                                  //
    //     new webpack.optimize.UglifyJsPlugin({   //
    //         compress: {                         //
    //             warnings: false,                //
    //         },                                  //
    //         output: {                           //
    //             comments: false,                //
    //         },                                  //
    //     }),                                     //
    // ]                                           //
    //////////////////////////////////////////////
};
