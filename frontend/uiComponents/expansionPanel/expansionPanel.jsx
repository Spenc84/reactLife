import './expansionPanel.styl';
import React, { PropTypes, Component } from "react";
import { Icon, Button } from "../ui";

// PROPS: label, title, display, className, isModified, disabled, onSave, onCancel, onOpen, onClose, expanded, togglePanel

export default class ExpansionPanel extends Component {
	constructor(props) {
		super(props);

		this.state = { expanded: props.expanded };

		this.expandPanel = this.expandPanel.bind(this);
		this.collapsePanel = this.collapsePanel.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if(this.props.expanded !== nextProps.expanded) this.setState({ expanded: nextProps.expanded });
	}

	render() {
		const { expanded } = this.state;
        const { label, title, display, className, isModified, disabled, onSave, onCancel } = this.props;

		const panelClasses
			= (expanded ? 'expanded ' : '')
			+ (disabled ? 'disabled ' : '')
			+ "ExpansionPanel "
			+ (className || '');

        const togglePanel = (expanded) ? this.collapsePanel : this.expandPanel;
        const icon = (expanded) ? 'expand_less' : 'expand_more';
		const hideFooter = this.props.hideFooter || !(typeof onSave === 'function' && typeof onCancel === 'function');
		const collapsableBody = (expanded) ? null : {display: 'none'};
        const collapsableFooter = (expanded) ? null : {display: 'none'};

		return(
			<div className={panelClasses}>

				<div className="header" onClick={disabled?null:togglePanel} title={title || ""}>
					<div className="label">{label}</div>
					<div className="display">{display}</div>
					<Icon i={icon} invisible={disabled} />
				</div>


				<div className="body" style={collapsableBody}>
                    {this.props.children}
                </div>

				{(hideFooter) ?	null
				:	<div className="footer" style={collapsableFooter}>
						{(isModified)
							? [
								<Button
									key={1}
									label="CANCEL"
									title="Cancel"
									onClick={onCancel} />,

								<Button
									key={2}
									label="SAVE"
									title="Save Changes"
									disabled={disabled}
									onClick={onSave} />
							]

							:   <Button
									label="DONE"
									title="Close"
									onClick={this.collapsePanel} />
						}
	                </div>
				}

			</div>
		);
	}

	expandPanel() {
        const { onOpen, togglePanel } = this.props;
		if(typeof onOpen === 'function') onOpen();
		if(typeof togglePanel === 'function') return togglePanel();
		this.setState({ expanded: true });
    }

    collapsePanel() {
		const { onClose, togglePanel } = this.props;
		if(typeof onClose === 'function') onClose();
		if(typeof togglePanel === 'function') return togglePanel();
		this.setState({ expanded: false });
    }
}
