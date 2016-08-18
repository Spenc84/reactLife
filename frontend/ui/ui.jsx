import '../style.styl';
import React from 'react';

export class Div extends React.Component {
    shouldComponentUpdate(nextProps) { return !this.props.static || !nextProps.static }
    render() {
        const { id, className, style, flex, onClick, children } = this.props;
        let _className = (className) ? `Div ${className}` : "Div"
        let _style = style || {};
        if(flex) _style.flex = flex;

        console.log(`RENDERED: ${_className}`); // __DEV__
        return (
            <div id={id}
                className={_className}
                onClick={onClick}
                style={_style}>
                {children}
            </div>
        );
    }
}
export class Column extends React.Component {
    shouldComponentUpdate(nextProps) { return !this.props.static || !nextProps.static }
    render() {
        const { id, className, style, flex, onClick, children } = this.props;
        let _className = (className) ? `Column ${className}` : "Column"
        let _style = style || {};
        if(flex) _style.flex = flex;

        console.log(`RENDERED: ${_className}`); // __DEV__
        return (
            <div id={id}
                className={_className}
                style={_style}
                onClick={onClick}>
                {children}
            </div>
        );
    }
}
export class Row extends React.Component {
    shouldComponentUpdate(nextProps) { return !this.props.static || !nextProps.static }
    render() {
        const { id, className, style, flex, onClick, children } = this.props;
        let _className = (className) ? `Row ${className}` : "Row"
        let _style = style || {};
        if(flex) _style.flex = flex;

        console.log(`RENDERED: ${_className}`); // __DEV__
        return (
            <div id={id}
                className={_className}
                onClick={onClick}
                style={_style}>
                {children}
            </div>
        );
    }
}

export class Icon extends React.Component {
    shouldComponentUpdate(nextProps) { return this.props.fluid || nextProps.fluid || false; }
    render() {
        console.log(`RENDERED: ${this.props.i} icon`); // __DEV__
        const { style, className, faded, invisible, size, onClick } = this.props;
        let _className = (className) ? `material-icons ${className}` : "material-icons";
        if(faded) _className += ` faded`;
        if(invisible) _className += ' invisible';
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
    shouldComponentUpdate(nextProps) { return !this.props.static || !nextProps.static }
    render() {
        console.log(`RENDERED: Span`); // __DEV__
        const { style, className, faded, size, content, children } = this.props;
        let _className = (className) ? `Span ${className}` : "Span";
        if(faded) _className += ` faded`;
        let _style = style || {};
        if(size) _style.fontSize = `${size}rem`;
        return (
            <span className={_className}
                style={_style}>
                {(content) ? content : children}
            </span>
        );
    }
}
