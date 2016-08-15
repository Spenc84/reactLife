import './style.styl';
import React from 'react';

export function Column(props) {
    return <div className="column" onClick={props.onClick}>{props.children}</div>;
}
export class Row extends React.Component {
    shouldComponentUpdate() { return this.props.fluid || false; }
    render() {
        console.log(`RENDERED: Row`); // __DEV__
        const { style, className, padding, onClick, children } = this.props;
        let _className = (className) ? `row ${className}` : "row"
        let _style = style || {};
        if(padding) _style.padding = `${padding}rem`;

        return (
            <div className={_className}
                onClick={onClick}
                style={_style}>
                {children}
            </div>
        );
    }
}

export class Icon extends React.Component {
    shouldComponentUpdate() { return this.props.fluid || false; }
    render() {
        console.log(`RENDERED: ${this.props.i} icon`); // __DEV__
        const { style, className, faded, padded, size, onClick } = this.props;
        let _className = (className) ? `material-icons ${className}` : "material-icons";
        if(faded) _className += ` faded`;
        if(padded) _className += ` padded`;
        let _style = style || {};
        if(size) _style.fontSize = `${size}rem`;

        return (
            <i className={_className}
                onClick={onClick}
                style={_style}>
                {this.props.i}
            </i>
        );
    }
}

export class Span extends React.Component {
    shouldComponentUpdate() { return this.props.fluid || false; }
    render() {
        console.log(`RENDERED: Span`); // __DEV__
        const { style, className, faded, size, children } = this.props;
        let _className = (className) ? `text ${className}` : "text";
        if(faded) _className += ` faded`;
        let _style = style || {};
        if(size) _style.fontSize = `${size}rem`;
        return (
            <span className={_className}
                style={_style}>
                {children}
            </span>
        );
    }
}

export function Header(props) {
    return (
        <header>{props.children}</header>
    );
}
