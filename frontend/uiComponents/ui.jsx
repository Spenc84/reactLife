import '../style.styl';
import React from 'react';
import shallowCompare from 'react-addons-shallow-compare';

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
    shouldComponentUpdate(nextProps) {
        if(this.props.static && nextProps.static) return false;
        if(this.props.check !== undefined && this.props.check === nextProps.check) return false;
        return true;
    }
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
    shouldComponentUpdate(nextProps) {
        if(this.props.static && nextProps.static) return false;
        if(this.props.check !== undefined && this.props.check === nextProps.check) return false;
        return true;
    }
    render() {
        const { id, className, style, flex, onClick, children } = this.props;
        let _className = (className) ? `Row ${className}` : "Row"
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

export class Icon extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.fluid || nextProps.fluid) return shallowCompare(this, nextProps, nextState);
        return false;
    }
    render() {
        console.log(`RENDERED: ${this.props.i} icon`); // __DEV__
        const { style, className, light, faded, invisible, size, onClick } = this.props;
        let _className = (className) ? `material-icons ${className}` : "material-icons";
        if(faded) _className += ` faded`;
        if(invisible) _className += ' invisible';
        if(light) _className += ' light';
        let _style = style || {};
        if(size) _style.fontSize = `${size}rem`;

        return (
            <i className={_className}
                style={_style}
                onClick={onClick}>
                {this.props.i}
            </i>
        );
    }
}

export class Span extends React.Component {
    shouldComponentUpdate(nextProps) { return !this.props.static || !nextProps.static }
    render() {
        const { id, style, className, faded, size, content, children } = this.props;
        let _className = (className) ? `Span ${className}` : "Span";
        if(faded) _className += ` faded`;
        let _style = style || {};
        if(size) _style.fontSize = `${size}rem`;

        console.log(`RENDERED: ${_className}`); // __DEV__
        return (
            <span id={id}
                className={_className}
                style={_style}>
                {(content) ? content : children}
            </span>
        );
    }
}
