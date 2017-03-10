/**     TextArea
 * A wrapper component for <textarea /> that will continually resize it to fit it's
 * content and will provide a much cleaner UI when readOnly is passed in.
 */

/*     - Example -
    <TextArea
        value={value}
        onChange={this.update}
        readOnly={false}
        minRows={2}
    />
*/

/**
 * @prop {string:REQUIRED} value - The value of the content string
 * @prop {function:REQUIRED} onChange - Will be called every time the value of the textarea is changed
 * @prop {boolean} readOnly - If true, the textarea will be replaced by a div with 'value' as it's content
 * @prop {number} minRows - The minimum number of rows that will be displayed by the textarea element
 * @prop <...props> You may pass in any other props you'd like and they'll be passed down to the textarea element
 */


import './textArea.styl';
import React, { PureComponent, PropTypes } from 'react';

export default class TextArea extends PureComponent {

    componentDidMount() {
        this.setHeight();
    }

    componentDidUpdate() {
        this.setHeight();
    }

    render() {
        const { minRows, ...props } = this.props;
        const { value, readOnly } = props;

        return (
            <div className="TextArea">

                <div ref={ref=>this.placeHolder=ref}
                    className={`${readOnly?'':'invisible '}placeHolder`}>
                    {value}
                </div>

                <textarea ref={ref=>this.textarea=ref}
                    {...props}
                    className={readOnly?'hidden':''}
                />

            </div>
        )
    }

    setHeight() {
        const style = window.getComputedStyle(this.placeHolder);
        let lineHeight = parseFloat(style.lineHeight);
        if( isNaN(lineHeight) ) lineHeight = parseFloat(style.fontSize) * 1.5;
        const minHeight =
            (lineHeight * this.props.minRows) +
            parseFloat(style.borderBottomWidth) +
            parseFloat(style.borderTopWidth) +
            parseFloat(style.paddingTop) +
            parseFloat(style.paddingBottom);
        this.textarea.style.fontSize = style.fontSize;
        this.textarea.style.lineHeight = lineHeight + 'px';
        this.textarea.style.height = this.placeHolder.scrollHeight + 2 + 'px';
        this.textarea.style.minHeight = minHeight + 'px';
        this.placeHolder.style.minHeight = minHeight + 'px';
    }

}

TextArea.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    minRows: PropTypes.number
}

TextArea.defaultProps = {
    readOnly: false,
    minRows: 2
}
