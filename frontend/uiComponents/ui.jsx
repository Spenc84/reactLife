import '../main.styl';
import React, { PureComponent } from 'react';

export class Icon extends PureComponent {
    render() {
        const { className, light, hidden, invisible, faded, size,
                onClick, disabled, silent, i:icon, ...other } = this.props;
        let _className = `${this.props.i} Icon` +
            (className ? ` ${className}` : '') +
            (hidden ? ' hidden' : '') +
            (invisible ? ' invisible' : '') +
            (faded ? ' faded' : '') +
            (light ? ' light' : '') +
            (disabled ? ' disabled' : '');

        const _style = size ? {fontSize: `${size*2.4}rem`} : null;

        if(!silent) console.log(`RENDERED: ${this.props.i} Icon`); // __DEV__
        return (
            <div className={_className}
                onClick={disabled ? null : onClick}
                {...other}>
                <i className="material-icons"
                    style={_style}>
                    {icon}
                </i>
            </div>
        );
    }
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

export function Text(props) {
    return props.readOnly
        ?   <div className="Text">
                {props.value}
            </div>

        :   <input
                type="text"
                className="Text"
                {...props}
            />
}

export class TextArea extends PureComponent {
    constructor(props) {
        super(props);
        this.handleEscape = this.handleEscape.bind(this);
    }

    componentDidUpdate() {
        const rows = Math.floor(this.spacer.scrollHeight/18);
        if(rows !== this.textarea.getAttribute('rows'))
            this.textarea.setAttribute('rows', rows);
    }

    render() {
        const { value, readOnly } = this.props;

        return (
            <div className="TextArea">

                <div ref={ref=>this.spacer=ref}
                    className={`${readOnly?'':'invisible '}spacer`}>
                    {value}
                </div>

                <textarea ref={ref=>this.textarea=ref}
                    {...this.props}
                    className={readOnly?'hidden':''}
                    onKeyDown={this.handleEscape}
                />

            </div>
        )
    }

    handleEscape(e) {
        if(e.keyCode === 27) {
            e.target.value = "";
            e.target.blur();
        }
        if(typeof this.props.onKeyDown === 'function') this.props.onKeyDown(e);
    }

}
