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
        if(this.props.fluid || nextProps.fluid || this.props.hidden !== nextProps.hidden) return shallowCompare(this, nextProps, nextState);
        return false;
    }
    render() {
        const { style, className, light, hidden, invisible, faded, size, onClick } = this.props;
        let _className = (className) ? `${className} ` : "";
        _className += `${this.props.i} icon`;
        if(hidden) _className += ' hidden';
        if(invisible) _className += ' invisible';
        if(faded) _className += ' faded';
        if(light) _className += ' light';
        const _style = (size) ? {fontSize: `${size*16}px`} : null;

        console.log(`RENDERED: ${this.props.i} icon`); // __DEV__
        return (
            <div className={_className}
                onClick={onClick}
                style={style}>
                <i className="material-icons"
                    style={_style}>
                    {this.props.i}
                </i>
            </div>
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
        if(size) _style.fontSize = `${size*16}px`;

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
