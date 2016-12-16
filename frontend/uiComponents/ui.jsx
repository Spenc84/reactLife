import '../style.styl';
import React from 'react';

export class Icon extends React.PureComponent {
    render() {
        const { style, className, light, hidden, invisible, faded, size, onClick } = this.props;
        let _className = (className) ? `${className} ` : "";
        _className += `${this.props.i} Icon`;
        if(hidden) _className += ' hidden';
        if(invisible) _className += ' invisible';
        if(faded) _className += ' faded';
        if(light) _className += ' light';
        const _style = (size) ? {fontSize: `${size*2.4}rem`} : null;

        console.log(`RENDERED: ${this.props.i} Icon`); // __DEV__
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

export class Button extends React.PureComponent {
    render() {
        const { label, title, onClick, type, light, disabled, hidden } = this.props;
        const buttonType = (type === "raised" || type === "floating") ? type : "flat";
        const buttonClass = (
            (hidden ? 'hidden ' : '') +
            (disabled ? 'disabled ' : '') +
            (light ? 'light ' : '') +
            `${buttonType} Button`
        );

        return(
            <div className={buttonClass}
                title={title}
                onClick={onClick}>
                {label}
            </div>
        );
    }
}
