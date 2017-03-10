/**     <TextBox>
 * This Component is a wrapper around the <TextArea> Component which will optionally
 * add a label above and/or customizable 'SAVE' and 'CANCEL' action buttons below
 * the <TextArea> Component. It also internally tracks 'value' which can be acquired
 * via an 'onSave' callback function that will be called when the 'SAVE' action
 * button is clicked, or by calling 'getValue()' via a ref to this component.
 * NOTE: All props are optional.
 * /

/**     -example-
    <TextBox
        className="comment"
        startingValue="This will be the initial value"
        placeHolder="Add your comment here..."
        label="Add a Comment"
        onSave={(value, callback)=>{
            // use value (the current string value of the textarea element)
            // Maybe set readOnly or hide to true?
            callback("'value' will be changed to this string on TextBox's state");
        }}
        saveDisplay="POST"
        saveTitle="Post your comment"
        onCancel={()=>{
            // Maybe set readOnly or hide to true?
        }}
        cancelDisplay="('CANCEL' by default)"
        cancelTitle="Cancel your comment"
        readOnly={null}
        hide={null}
        handleEscape
    />
*/

/**
 * @prop {string} startingValue - The value that the textarea will start with,
 * and will default back to if 'CANCEL' is pressed. The 'SAVE' button will be
 * disabled whenever the 'startingValue' is === to 'value'.
 *** NOTE: DEFAULT: ''
 * @prop {string/element} label - If included, the 'label' string (or component)
 * will appear at the top of the <TextArea> Component.
 * @prop {function} onSave (value, callback) - When included an action button will
 * appear at the bottom of the <TextArea> Component. When clicked, 'onSave' will
 * be called and passed two arguments:
 *** @argument value: 'the current 'value' of the textarea element',
 *** @argument callback: 'a function that when called will set 'value' to
 * whatever string is passed in'
 *** NOTE: If excluded, or if 'readOnly' is passed in as true, no Action buttons
 * will be rendered. If 'label' is also exluded, then <TextBox> will only render
 * the UI of <TextArea>.
 * @prop {string} saveDisplay - When included, this will be what's displayed on
 * the 'SAVE' button instead of 'SAVE'.
 *** NOTE: DEFAULT: 'SAVE'
 *** NOTE: Requires that 'onSave' also be included. (see Note under 'onSave')
 * @prop {string} saveTitle - When included, this will be displayed as a tooltip
 * on the 'SAVE' button.
 *** NOTE: Requires that 'onSave' also be included. (see Note under 'onSave')
 * @prop {function} onCancel () - When included along with an onSave function, an
 * additional action button will be rendered. When clicked it will reset the
 * value of <TextBox> to the 'startingValue' which is '' by default. Then 'onCancel()'
 * will be called. No arguments will be passed through.
 *** NOTE: Requires that 'onSave' also be included. (see Note under 'onSave')
 * @prop {string} cancelDisplay - When included, this will be what's displayed on
 * the 'CANCEL' button instead of 'CANCEL'.
 *** NOTE: DEFAULT: 'CANCEL'
 *** NOTE: Requires that 'onSave' also be included. (see Note under 'onSave')
 * @prop {string} cancelTitle - When included, this will be displayed as a tooltip
 * on the 'CANCEL' button.
 *** NOTE: Requires that 'onSave' also be included. (see Note under 'onSave')
 * @prop {boolean} handleEscape - If true, the escape key will reset 'value' back
 * to 'startingValue' and drop focus.
 * @prop {boolean} readOnly - While true no Action Buttons will be rendered, and
 * 'value' will be displayed as an immutable <div> element instead of a <textarea>
 * element.
 * @prop {boolean} hide - Hides the component by giving it {display: 'none'}
 * @prop {string} className - Any classes you'd like to include on the container
 * @prop <...props> Any other props that are included will be passed down to the
 * <TextArea> component.
 */

import './textBox.styl';
import React, { PureComponent, PropTypes } from 'react';
import TextArea from '../textArea/textArea';

export default class TextBox extends PureComponent {
    constructor(props) {
        super(props);

        this.state = { value: props.startingValue };

        /// Used internally
        this.update = this.update.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.handleEscape = this.handleEscape.bind(this);

        // Used externally (outside API methods)
        this.getValue = this.getValue.bind(this);
        this.setValue = this.setValue.bind(this);
        this.updateValue = this.updateValue.bind(this);
        this.reset = this.reset.bind(this);
    }

    render() {
        const { value } = this.state;
        const { startingValue, label, onSave, saveDisplay, saveTitle, onCancel,
                cancelDisplay, cancelTitle, handleEscape, onKeyDown, onChange,
                hide, className, ...props } = this.props;

        const { readOnly } = this.props;
        const disabled = value === startingValue;

        const LabelComponent
            = !label ? null
            : typeof label === 'string' ? <span className="label"> {label} </span>
            : label

        const TextAreaComponent = (
            <TextArea
                value={value}
                onChange={this.update}
                onKeyDown={handleEscape ? this.handleEscape : onKeyDown}
                {...props}
            />
        );

        return !(label || onSave) && !hide ? TextAreaComponent :
        (
            <div className={`${hide?'hidden ':''}${className?className+' ':''}TextBox`}>

                {LabelComponent}

                {TextAreaComponent}

                { !onSave || readOnly ? null :
                <div className="actions">

                    { !onCancel ? null :
                    <div className="action"
                        title={cancelTitle}
                        onClick={this.cancel}>
                        {cancelDisplay}
                    </div>}

                    <div className={`${disabled?'disabled ':''}action`}
                        title={saveTitle}
                        onClick={disabled?null:this.save}>
                        {saveDisplay}
                    </div>

                </div>}

            </div>
        );
    }

    // INTERNAL METHODS
    update(e) {
        this.setState({ value: e.target.value });
        if(typeof this.props.onChange === 'function') this.props.onChange(e);
    }

    cancel() {
        const { startingValue, onCancel } = this.props;
        this.setState({ value: startingValue });
        if(typeof onCancel === 'function') onCancel();
    }

    save() {
        if(typeof this.props.onSave === 'function')
        this.props.onSave(
            this.state.value,
            newValue=>this.setState({ value: newValue })
        );
    }

    handleEscape(e) {
        const { startingValue, handleEscape, onChange, onKeyDown, onCancel } = this.props;
        if(handleEscape && e.keyCode === 27) {
            e.target.value = startingValue;
            e.target.blur();
            this.setState({ value: startingValue });
            if(typeof onCancel === 'function') onCancel(e);
            else if(typeof onChange === 'function') onChange(e);
        }
        if(typeof onKeyDown === 'function') onKeyDown(e);
    }

    // EXTERNAL METHODS (API)
    getValue() {
        return this.state.value;
    }

    setValue(value = '') {
        if(typeof value === 'string') this.setState({ value });
    }

    updateValue(callback) {
        if(typeof callback === 'function') {
            let value = callback(this.state.value);
            this.setValue(value);
        }
    }

    reset() {
        this.setState({ value: startingValue });
    }

}
TextBox.propTypes = {
    startingValue: PropTypes.string,
    label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element
    ]),
    onSave: PropTypes.func,
    saveDisplay: PropTypes.string,
    saveTitle: PropTypes.string,
    onCancel: PropTypes.func,
    cancelDisplay: PropTypes.string,
    cancelTitle: PropTypes.string,
    handleEscape: PropTypes.bool,
    readOnly: PropTypes.bool,
    hide: PropTypes.bool,
    className: PropTypes.string
}
TextBox.defaultProps = {
    startingValue: '',
    saveDisplay: 'SAVE',
    cancelDisplay: 'CANCEL'
}
