import '../style.styl';
import React, { PureComponent } from 'react';

export class Icon extends PureComponent {
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

export class Button extends PureComponent {
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
                    className={readOnly?'hidden':''}
                    {...this.props}
                />

            </div>
        )
    }

}
