// import user from 'API';
const user = { tasks: [], agenda: [] };

let {tasks, agenda} = user,
    map = {};
tasks.forEach((e,i)=>map[e.id] = i);

// for(let id in map){
// tasks[map[id]].id === id // true
// }
function remap(array) {
    let newMap = {};
    array.forEach((e,i)=>newMap[e.id] = i);
    return remap;
}
function addTask(task) {
    send('post', task).then(
        res=>{
        if(task.active) updateAgenda.addItem(task);
        tasks.push(task);
        map[task.id] = tasks.length-1;
        },
        err=>alert(err)
    );
}
function deleteTasks(ids) {
    if(typeof ids === 'string') ids = [ids];
    send('delete', ids).then(
        res=>{
            for(let id in ids) {
                let indx = map[id],
                    task = tasks[indx];
                if(task.active) updateAgenda.removeItem(task);
                tasks.splice(indx, 1);
            }
            map = remap(tasks);
        },
        err=>alert(err)
    );
}
function updateTask(task) {
    send('update', task).then(
        res=>{
            tasks[map[task.id]] = task;
            updateAgenda(task);
        },
        err=>console.log(err)
    );
}
function displayAgenda() {
    for(let day in agenda){
        console.log(day.date);
        for(let task in day.start){
            console.log(task.name);
        }
    }
}
