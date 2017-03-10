import '../main.styl';
import React, { PureComponent } from 'react';

export function Icon(props) {
    const { className, light, hidden, invisible, faded, size,
            onClick, disabled, i:icon, ...otherProps } = props;
    let _className = `${icon} Icon` +
        (className ? ` ${className}` : '') +
        (hidden ? ' hidden' : '') +
        (invisible ? ' invisible' : '') +
        (faded ? ' faded' : '') +
        (light ? ' light' : '') +
        (disabled ? ' disabled' : '');

    const _style = size ? {fontSize: `${size*2.4}rem`} : null;

    return (
        <div
            {...otherProps}
            className={_className}
            onClick={disabled ? null : onClick}
        >
            <i className="material-icons"
                style={_style}>
                {icon}
            </i>
        </div>
    );
}

export class Button extends PureComponent {
    render() {
        const { label, title, onClick, type, light, colored, disabled, hidden } = this.props;
        const buttonType = (type === "raised" || type === "floating") ? type : "flat";
        const buttonClass = (
            (hidden ? 'hidden ' : '') +
            (disabled ? 'disabled ' : '') +
            (light ? 'light ' : '') +
            (colored ? 'colored ' : '') +
            `${buttonType} Button`
        );

        return(
            <div className={buttonClass}
                title={title}
                onClick={disabled ? null : onClick}>
                {label}
            </div>
        );
    }
}

export class Text extends PureComponent {
    constructor(props) {
        super(props);
        this.handleEscape = this.handleEscape.bind(this);
    }

    render() {
        return this.props.readOnly
            ?   <div className="Text">
                    {this.props.value}
                </div>

            :   <input
                    type="text"
                    className="Text"
                    {...this.props}
                />;
    }

    handleEscape(e) {
        if(e.keyCode === 27) {
            e.target.value = "";
            e.target.blur();
            if(typeof this.props.onChange === 'function') this.props.onChange(e);
        }
        if(typeof this.props.onKeyDown === 'function') this.props.onKeyDown(e);
    }
}

import TextBox from './textBox/textBox';
import TextArea from './textArea/textArea';
export { TextBox, TextArea };
