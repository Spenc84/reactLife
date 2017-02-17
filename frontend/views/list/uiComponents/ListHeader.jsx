import React from 'react';
import { getDefaultTask } from '../../../defaults';
import { Icon } from '../../../uiComponents/ui';

export default class ListHeader extends React.PureComponent {
    constructor(props) {
        super(props);

        this.openTaskDetails = this.openTaskDetails.bind(this);
        this.modifySelected = this.modifySelected.bind(this);
        this.switchToCalendarView = this.switchToCalendarView.bind(this);
        this.addToProject = this.addToProject.bind(this);
    }

    render() {
        const { selectedTasks, resetSelectedTasks, toggleStarView, deleteTasks,
                toggleStarred, toggleFlatten, toggleCompleted, openScheduler,
                project, removeFromProject } = this.props;

        const projectTitle = project ? project.get('title') : '';

        console.log('RENDERED:  --- LISTHEADER ---'); // __DEV__
        return (
            <header className="list">

                <div className={`${selectedTasks.size?"":"hidden "}icons fill row`}>
                    <Icon i={"arrow_back"} onClick={resetSelectedTasks} size={1.25}/>
                    <div className="functional icons">
                        <Icon i={'delete'} onClick={deleteTasks} />
                        <Icon i={'group_work'} onClick={this.addToProject} title={'Group selected tasks into a project'} />
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

                <div className={`${selectedTasks.size?"hidden ":""}default fill row`}>
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
                    <Icon i={'center_focus_strong'} onClick={toggleFlatten} size={1.25} light /> {/* Could also use layers & layers_clear */}
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

    addToProject() {
        const { openTaskDetails, selectedTasks, selectedProject, resetSelectedTasks, openPicker, tasks, tIndx, addToProject } = this.props;

        // const projectList = tasks.filter(task => task.getIn(['is','project']) && task.get('_id') !== selectedProject);
        const taskList = selectedTasks.map(taskID => tasks.get(tIndx[taskID]));
        openPicker({
            list1: {
                props: {
                    title: 'Assign',
                    data: taskList
                }
            },
            list2: {
                props: {
                    title: 'To'
                }
            },
            action: addToProject
        });

        // openTaskDetails({
        //     type: 'NEW',
        //     task: getDefaultTask().withMutations( task =>
        //         task.set('childTasks', selectedTasks)
        //         .setIn(['is', 'project'], true)
        //     ),
        //     onSave: resetSelectedTasks
        // });
    }

}
