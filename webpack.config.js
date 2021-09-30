const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: {
        app: './src/app.js'
    },
    module:{
        rules:[
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    //devtool: 'inline-source-map',
    plugins:[
        //new CleanWebpackPlugin(),
        new webpack.optimize.SplitChunksPlugin()
    ],
    output:{
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};