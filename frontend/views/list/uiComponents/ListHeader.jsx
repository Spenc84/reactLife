import React from 'react';
import { getDefaultTask } from '../../../defaults';
import { Icon } from '../../../uiComponents/ui';

export default class ListHeader extends React.PureComponent {
    constructor(props) {
        super(props);

        this.openTaskDetails = this.openTaskDetails.bind(this);
        this.modifySelected = this.modifySelected.bind(this);
        this.switchToCalendarView = this.switchToCalendarView.bind(this);
        this.createProject = this.createProject.bind(this);
    }

    render() {
        const { selectedTasks, resetSelectedTasks, toggleStarView, deleteTasks,
                toggleStarred, toggleCompleted, openScheduler, project, removeFromProject } = this.props;

        const projectTitle = project ? project.get('title') : '';

        console.log('RENDERED:  --- LISTHEADER ---'); // __DEV__
        return (
            <header className="list">

                <div className={`${selectedTasks.size?"":"hidden "}icons Row`}>
                    <Icon i={"arrow_back"} onClick={resetSelectedTasks} size={1.25}/>
                    <div className="functional icons">
                        <Icon i={'delete'} onClick={deleteTasks} />
                        <Icon i={'group_work'} onClick={this.createProject} title={'Group selected tasks into a project'} />
                        <Icon i={'remove_circle'} onClick={removeFromProject} title={'Remove selected tasks from project'} hidden={!project} />
                        <Icon i={'linear_scale'} />
                        <Icon i={'info'} />
                        <Icon i={'group_add'} />
                        <Icon i={'schedule'} onClick={openScheduler} />
                        <Icon i={'star'} style={{color:'rgb(241,196,15)'}} onClick={toggleStarred} />
                        {/* <Icon i={'more_vert'} /> */}
                    </div>
                    <Icon i={'check_circle'} onClick={toggleCompleted} size={1.25} />
                </div>

                <div className={`${selectedTasks.size?"hidden ":""}default Row`}>
                    <Icon i={'today'} onClick={this.switchToCalendarView} size={1.25} />
                    <div className="title">
                        <span
                            className={projectTitle?'clickable':''}
                            onClick={projectTitle?this.modifySelected:null}>
                            Projects
                        </span>
                        <span style={projectTitle?null:{display:'none'}}>/</span>
                        <span style={projectTitle?null:{display:'none'}}>{projectTitle}</span>
                    </div>
                    <Icon i={'star'} onClick={toggleStarView} size={1.25} light />
                    <Icon i={"info_outline"} onClick={this.openTaskDetails} hidden={!projectTitle} />
                </div>

            </header>
        );
    }

    openTaskDetails() {
        this.props.openTaskDetails({
            type: 'PROJECT',
            task: this.props.project
        });
    }

    modifySelected() {
        this.props.modifySelected(null, ()=>'');
    }

    switchToCalendarView() { this.props.changeSection('CALENDAR'); }

    createProject() {
        const { openTaskDetails, selectedTasks, resetSelectedTasks } = this.props;
        openTaskDetails({
            type: 'NEW',
            task: getDefaultTask().withMutations( task =>
                task.set('childTasks', selectedTasks)
                .setIn(['status', 'isProject'], true)
            ),
            onSave: resetSelectedTasks
        });
    }

}
