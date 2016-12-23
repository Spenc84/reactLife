import './modal.styl';
import React, { PureComponent, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';

import { Icon, Button } from '../ui';

// PROPS: onModalOpen, onModalClose, header, footer, locked
export default class Modal extends React.Component {
    constructor(props) {
        super(props);

        this.state = { open: false };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (this.state.open || nextState.open);
    }

    render() {
        const { open } = this.state;
        const { header:headerContent, footer:footerActions, locked } = this.props;

        const header = (typeof headerContent === "undefined") ? null
            : (
                <header>
                    {(typeof headerContent === "string")
                        ?   <span className="label"> {headerContent} </span>
                        :   <div className="header_content">
                                {headerContent}
                            </div>
                    }
                    {/* <Icon i="close" onClick={this.closeModal} /> */}
                </header>
            );

        const footer = (footerActions)
            ?   <footer>
                    {footerActions.map( (action, index) => (
                        <Button key={`action_${index+1}`}
                            type={action.type}
                            label={action.label}
                            title={action.title}
                            disabled={action.disabled}
                            onClick={action.onClick} />
                    ))}
                </footer>
            :   null;

        return (
            <div ref={ref=>this.Modal = ref}
                className="Modal"
                style={open ? null : {display: 'none'}}
                onClick={locked ? null : this.closeModal}
            >
                <div className="inner">
                    {header}
                    {this.props.children}
                    {footer}
                </div>
            </div>
        );
    }

    openModal() {
        if(typeof this.props.onModalOpen === 'function') this.props.onModalOpen();
        this.setState({ open: true });
    }

    closeModal(e) {
        /* If no header is supplied, then user should be able to close out the Modal
            by clicking on the faded background. The following statement prevents
            handler from firing when a child is clicked.     */
        if(this.props.headerContent === undefined && e && e.target !== this.Modal) return;

        if(typeof this.props.onModalClose === 'function') this.props.onModalClose();
        this.setState({ open: false });
    }
}


Modal.propTypes = {
    onModalOpen: PropTypes.func,
    onModalClose: PropTypes.func,
    header: PropTypes.any,
    footer: PropTypes.arrayOf(
        PropTypes.shape({
            display: PropTypes.any,
            title: PropTypes.string,
            onClick: PropTypes.func,
            disabled: PropTypes.bool
        })
    ),
    locked: PropTypes.bool
};
