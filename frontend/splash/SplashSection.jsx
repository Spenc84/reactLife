import React from 'react';

export default class SplashSection extends React.Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.active;
    }

    render() {
        console.log("RENDERED: Splash");
        return <section className="SplashSection" ref="container"></section>;
    }
}
