import './taskDetails.styl';
import React, { PureComponent } from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';

import Scheduler from '../../components/scheduler/scheduler';
import { Icon, Button, Text, TextArea } from '../../uiComponents/ui';
import { buildOperation } from '../../components/tools';
import { getDefaultTask } from '../../defaults';


// ----- PLACEHOLDERS -----
let TYPE;           // <['NEW', 'NEW_PROJECT', null]>
let TASK = Map();   // Original state of task
let ON_CLOSE;       // Callback function to be executed when task is successfully closed


// PROPS: createNewTask, updateTasks, deleteTasks, modifySelected
export default class TaskDetails extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            task: TASK,
            open: false
        };

        this.open = this.open.bind(this);
        this.confirmClose = this.confirmClose.bind(this);
        this.close = this.close.bind(this);

        this.handleFormChange = this.handleFormChange.bind(this);
        this.updateSchedule = this.updateSchedule.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
        this.toggleStarred = this.toggleStatus.bind(this, 'starred');
        this.toggleCompleted = this.toggleStatus.bind(this, 'completed');
    }

    render() {
        const { task, open } = this.state;

        return (
            <main className={`${open?'':'hidden '}TaskDetails`}>

                <header className="task_details">

                    <Icon i={"arrow_back"} onClick={this.confirmClose} size={1.25}/>
                    <div className="functional icons">
                        <Icon i={'delete'} onClick={this.deleteTask} hidden={TYPE === 'NEW'} />
                        {/* <Icon i={'group_work'} onClick={this.createProject} />
                        <Icon i={'linear_scale'} />
                        <Icon i={'info'} />
                        <Icon i={'group_add'} />
                        <Icon i={'schedule'} onClick={openScheduler} /> */}
                        <Icon i={'star'} style={{color:'rgb(241,196,15)'}} onClick={this.toggleStarred} />
                        {/* <Icon i={'more_vert'} /> */}
                    </div>
                    <Icon i={'check_circle'} onClick={this.toggleCompleted} size={1.25} />
                    <Button light
                        label={'SAVE'}
                        title={'Save changes'}
                        onClick={this.saveChanges}
                        disabled={TASK === task}
                    />

                </header>

                <div className="body">

                    <div className="title row">
                        <span className="label">Title:</span>
                        <TextArea
                            data-content="title"
                            value={task.get('title') || ""}
                            onChange={this.handleFormChange}
                        />
                    </div>

                    <div className="description row">
                        <span className="label">Description:</span>
                        <TextArea
                            data-content="description"
                            value={task.get('description') || ""}
                            onChange={this.handleFormChange}
                        />
                    </div>

                    <div className="color row">
                        <span className="label">Color:</span>
                        <input type="color"
                            data-content="color"
                            value={task.get('color') || '#0078ff'}
                            onChange={this.handleFormChange}
                        />
                    </div>

                    <div className="schedule row">
                        <span className="label">Schedule:</span>
                        <Scheduler ref={ref=>this.Scheduler=ref}
                            schedule={task.get('schedule')}
                            updateSchedule={this.updateSchedule}
                        />
                    </div>

                </div>

            </main>
        );
    }

    open({type, task, title, onClose} = {}) {

        TYPE = type;
        TASK = type === 'NEW' ? getDefaultTask() : task;
        ON_CLOSE = onClose;

        this.setState({
            task,
            open: true
        });

    }

    confirmClose() {
        const { task } = this.state;
        if( task === TASK ) this.close();
        else if( confirm("Discard changes?") ) this.close();
    }

    close() {
        TASK = Map();
        ON_CLOSE = null;
        TYPE = null;

        this.Scheduler.Accordian.reset();

        this.setState({
            task: TASK,
            open: false
        });

        if(typeof ON_CLOSE === 'function') ON_CLOSE();
    }

    handleFormChange(e) {
        const { task } = this.state;

        const field = e.target.dataset.content;
        const value = e.target.value;

        this.setState({
            task: task.setIn(field.split('.'), value)
        });
    }

    updateSchedule(newSchedule) {
        const { task } = this.state;

        this.setState({
            task: task.set('schedule', newSchedule)
        });
    }

    saveChanges() {
        const { task } = this.state;
        const { createNewTask, updateTasks } = this.props;


        if(TYPE === 'NEW') {
            createNewTask(task);
            this.close();
            return;
        }

        const operation = buildOperation(task, TASK);

        const newTask = operation['$set'].hasOwnProperty('status.scheduled')
            ?   task.withMutations( task => {
                    task.setIn(['status', 'scheduled'], operation['$set']['status.scheduled'])
                        .setIn(['status', 'inactive'], operation['$set']['status.inactive'])
                        .setIn(['status', 'active'], operation['$set']['status.active'])
                        .setIn(['status', 'pending'], operation['$set']['status.pending']);
                })
            :   task;

        const ACTION = task.get('schedule') !== TASK.get('schedule') ? 'SCHEDULE' : 'MODIFY';
        updateTasks({task: newTask, operation}, ACTION);

        TASK = newTask;
        this.setState({task: TASK});
    }

    deleteTask() {
        this.props.deleteTasks( List([TASK.get('_id')]), () => {
            this.props.modifySelected( selectedTasks => {
                const _id = TASK.get('_id');
                const index = selectedTasks.findIndex( id => id === _id );
                return index === -1 ? selectedTasks : selectedTasks.delete(index);
            });
            this.close();
        });
    }

    toggleStatus(key) {
        const { task } = this.state;
        const value = !task.getIn(['status', key]);
        this.setState({
            task: task.setIn(['status', key], value)
        });
    }
}
