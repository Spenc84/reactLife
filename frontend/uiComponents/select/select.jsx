import './select.styl';
import React, {PureComponent} from 'react';
// PROPS: display, options, onChange, hideInput
/**
 *  Option <shape>:
 *  {
 *      value:
 *      display:
 *      title:
 *      disabled:
 *  }
 */
export default class Select extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
        this.toggleSelect = this.toggleSelect.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    render() {
        const { open } = this.state;
        const { display, options, onChange, hideInput } = this.props;
        return (
            <main className="Select" onClick={this.toggleSelect}>

                {   (hideInput) ? null :
                    <div className={`${open?'active ':''}input`}>
                        {display}
                    </div>
                }

                <div className="options" style={open?null:{display:'none'}}>
                {
                    options.map(({value, display:optDisplay, title, disabled}, index) => {
                        const className
                            = (display === optDisplay ? 'selected ' : '')
                            + 'option'
                            + (disabled ? ' disabled' : '');
                        return (
                            <span key={index}
                                className={className}
                                title={title}
                                value={value}
                                onClick={this.onChange}
                            >
                                {optDisplay}
                            </span>
                        );
                    })
                }
                </div>

            </main>
        );
    }

    toggleSelect(e) {
        if(this.state.open) document.removeEventListener('click', this.toggleSelect);
        else document.addEventListener('click', this.toggleSelect);

        this.setState({ open: !this.state.open });
        e.stopPropagation();
    }

    onChange(e) {
        const value = e.target.getAttribute('value');
        if(typeof this.props.onChange === 'function') this.props.onChange(value);
    }
}
