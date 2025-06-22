/**
* カレンダー
*/

let date = new Date();
let matchDate = new Date();
let c_allTasks = [];
let c_TaskID = parseInt (localStorage.getItem('calendar_taskId')) || 0;

//date.setMonth( 2); // 初回表示の月を変えて試したいときはコメントアウト解除　0が1月.

/* 月初の日の曜日判定 */
function firstWeekDay (date){
    date.setDate( 1);
    return date.getDay();
}

/* うるう年判定 */

function uruudoshi (year, month){
    let Days = 31;
    if(((year % 4 === 0 && year % 100 !== 0) || year % 400 == 0) && month == 2){
        Days = 29;
    } else if (month == 2){
        Days = 28;
    } else if (month === 4 || month === 6 || month === 9 || month === 11){
        Days = 30;
    }
    return Days;
}

/* カレンダー自体の描画 */

function createCalendar (today){

    const year = today.getFullYear ();
    const month = today.getMonth() + 1;

    const yearSpan = document.querySelector('.year');
    yearSpan.innerText = year;

    const monthSpan = document.querySelector('.month');
    monthSpan.innerText = month;

    const monthenSpan = document.querySelector('.month_en');
    const monthen = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
    monthenSpan.innerText = monthen[today.getMonth()];

    let calendarDays = uruudoshi (year, month);

    const firstDay = firstWeekDay (today); // 今の月の1日の曜日を出す.

    const days = document.querySelector('.days');

    let lastDay;

    if(((calendarDays + firstDay) % 7) === 0){
        lastDay = calendarDays + firstDay;
    } else {
        lastDay = (Math.floor ((calendarDays + firstDay) / 7) +1) * 7
    };

    for(i =0; i < lastDay ; i++){
        const div = document.createElement('div');
        if( ((i+1) % 7) === 0 /* iに1足して（最初が0でカレンダーが日曜始まりのため。）7で割った余りが0の時土曜 */){
            div.setAttribute("class", "saturday");
        } else if( (i % 7) === 0 /* iに7で割った余りが0の時が日曜　最初が0体から最初のdivは必ず余り0　*/){
            div.setAttribute("class", "sunday");
        }
        days.appendChild(div);
    }


    const divs = document.querySelectorAll('.days>div');
    for(i=0 ; i <calendarDays + firstDay ; i++){
        const div = divs[i];
        if( i < date.getDay() ){
        }else{
            divs[i].innerText = i - firstDay + 1;
            divs[i].setAttribute("data-date", `${year}年${month}月${i - firstDay + 1}日`)
            divs[i].setAttribute ("data-year", year)
            divs[i].setAttribute ("data-month", month)
            divs[i].setAttribute("data-day", i - firstDay + 1)
        }
    }
    for(i = 0 ; i < divs.length ; i++){
        if( divs[i].innerText === "" ){
            divs[i].setAttribute("class", "blank")
        } else if ( matchDate.getFullYear() === year && matchDate.getMonth() === today.getMonth() && Number (divs[i].innerText) === matchDate.getDate() ){
            divs[i].setAttribute("class", "today")
        }
    }
    for(i = 0; i < divs.length ; i++){
        const ul = document.createElement('ul');
        divs[i].appendChild (ul);
    }
    for(i = 0; i < divs.length ; i++){
        if( ((i+6) % 7) == 0 /* iに6足して7で割った余りが0の時が月曜 最初が0からだから最初のdivは必ず余り0 */ ){
            const ul = divs[i].children[0];
            const li = document.createElement('li');
            li.setAttribute ("data-default", true)
            li.innerText = "展開例";
            ul.appendChild(li);
        }else if ( ((i+2) % 7) === 0 /* iに2足して7で割った余りが0の時が金曜 最初が0からだから最初のdivは必ず余り0 */ ){
            const ul = divs[i].children[0];
            const li = document.createElement('li');
            li.setAttribute ("data-default", true);
            li.innerText = "調マ原稿格納";
            ul.appendChild (li);
        }
    }
}

createCalendar(date);
calendarAddTasks();


/*前、次の月への遷移*/

const preMonth = document.querySelector('#pre_month');
preMonth.onclick = prevMonth;
const nexMonth = document.querySelector('#nex_month');
nexMonth.onclick = nextMonth;

function divRemove(){
    const days = document.querySelectorAll('.days>div');
    days.forEach(div => {div.remove();});
}

function prevMonth(){
    divRemove();
    const preMonthNumber = date.getMonth() - 1;
    date.setMonth(preMonthNumber);
    createCalendar (date);
    calendarAddTasks ();
    loadCalendarTaskFromLocalStorage();
}

function nextMonth(){
    divRemove();
    const nextMonthNumber = date.getMonth() + 1;
    date.setMonth ( nextMonthNumber);
    createCalendar (date);
    calendarAddTasks ();
    loadCalendarTaskFromLocalStorage();
}

/* カレンダーに追記する奴ここから */

function calendarAddTasks(){

    const modal = document.querySelector('.modal_bg');
    const form = document.querySelector('.form_wrap');

    const divs = document.querySelectorAll('.days>div');
    divs.forEach(div => {
        div.addEventListener('click',modalVisiable);
    });

    const formClose = document.querySelector('#form_close');
    formClose.addEventListener('click', modalHidden)
}

function modalVisiable(e){
    const modal = document.querySelector('.modal_bg');
    if(e.target.closest('.calendar_taskname_remove')){
        return false; //liの中の×に反応させない書き方
    }

    modal.style.visibility = "visible";
    modal.style.opacity = "1";
    const div = this;
    const ul = div.querySelector('ul');
    ul.remove();

    const year = date.getFullYear();
    const month = date.getMonth() +1;
    const day = Number(div.innerText);
    const regiDate = document.querySelector('.regi_date');
    const dataDate = this.getAttribute('data-date');
    regiDate.innerText = dataDate;

    div.appendChild(ul);

    const priority = document.querySelector('.priority_list');
    const taskname = document.querySelector('#calendar_taskname');
    const duedateDay = document.querySelector('.duedate-day');

    const modalSubmit = document.getElementById('modal_submit');
    modalSubmit.onclick = (event) => {

        c_TaskID++;
        localStorage.setItem('calendar_taskId', c_TaskID);
        let formattedId = String (c_TaskID).padStart(4, '0');

        event.stopPropagation();
        event.preventDefault ();
        const li = document.createElement('li');
        li.setAttribute('id', formattedId);

        li.innerHTML = `${priority.value} ${taskname.value} ~${duedateMonth.value}/${duedateDay.value}<span class="calendar_taskname_remove">x</span>`;
        ul.appendChild(li);

        const obj = {
            c_taskId: formattedId,
            c_dataDate: dataDate,
            c_taskname: taskname.value,
            c_duedateMonth: duedateMonth.value,
            c_duedateDay: duedateDay.value,
            c_priority: priority.value
        }
        c_allTasks.push(obj);

        modalHidden();
        removeTaskitem();
        saveCalendarTaskToLocalStorage();
    }
    //addEventListenerだと上書きされず追加されていったので、そのためonclick.
}

/* モーダル閉じる */

function modalHidden(){
    const modal = document.querySelector('.modal_bg');
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";
    const modalform = document.querySelector('#modal_form');
    modalform.reset ();
}

/* モーダルの中の「期日」の設定とか */

const duedateMonth = document.querySelector('.duedate-month');
duedateMonth.onchange = function(){
    setModalDueDateDay (this.value, this);
}

setModalDueDateDay (1, duedateMonth);

function setModalDueDateDay (month, monthElement){
    const dateSelectElement = monthElement.parentNode.children[2];
    const today = new Date();
    const year = today.getFullYear ();
    let modalDueDateDays = uruudoshi(year, Number(monthElement.value));
    createDays (dateSelectElement, modalDueDateDays);
}

function createDays (dateSelectElement, days){
    for (let i = 1; i <= days; i++){
        const listItem = document.createElement('option');
        listItem.textContent = i;
        dateSelectElement.appendChild (listItem);
    }
}

/* ×押したらカレンダーのタスク削除 */

function removeTaskitem(){
    const ctr = document.querySelectorAll(".calendar_taskname_remove");
    ctr.forEach(span => {
        span.addEventListener('click', function(){
            const removeId = this.closest('li').getAttribute('id');
            this.closest('li').remove();
            for(i = 0; i < c_allTasks.length ; i++ ){
                if(c_allTasks[i].c_taskId === removeId){
                    const newArray = c_allTasks.filter (obj => (obj !== c_allTasks[i]));
                    c_allTasks = newArray;
                }
            }
            saveCalendarTaskToLocalStorage();
        });
    });
}

removeTaskitem();

/* ローカルストレージへの保存と読み込み */


function saveCalendarTaskToLocalStorage(){
    const c_tasksJSON = JSON.stringify(c_allTasks);
    localStorage.setItem('c_tasks', c_tasksJSON);
}

function loadCalendarTaskFromLocalStorage(){
    const storedCTasks = localStorage.getItem('c_tasks');
    if (storedCTasks){
        const c_tasks = JSON.parse (storedCTasks);
        c_tasks.forEach(task => {
            createCalendarTaskElement(task);
        });
    c_allTasks = c_tasks;
    }
}

function createCalendarTaskElement(task){
    const taskDate = task.c_dataDate;
    const taskItem = task.c_taskname;
    const duedateMonth = task.c_duedateMonth;
    const duedateDay = task.c_duedateDay;
    const priority = task.c_priority;
    const formattedId = String (task.c_taskId).padStart(4, '0');

    const divs = document.querySelectorAll('.days>div');

    divs.forEach(div => {
        if(taskDate === div.getAttribute('data-date') ){
            const ul = div.querySelector('ul');
            const li = document.createElement('li');
            const span = '<span class="calendar_taskname_remove"> x </span>' ;
            li.setAttribute('id', formattedId);
            li.innerHTML = `${priority} ${taskItem} ～${duedateMonth}/${duedateDay}<span class="calendar_taskname_remove">x</span>`;
            ul.appendChild(li);
            removeTaskitem();
        }
    });
}

/**
* 今の時刻機能
*/

function nowTime(){
    const now = new Date();
    const nHour = now.getHours();
    const nMin = now.getMinutes();
    const nSec = now.getSeconds();
    const thour = document.getElementById('thour');
    const tmin = document.getElementById('tmin');
    const tsec = document.getElementById('tsec');

    thour.innerText = String (nHour).padStart (2, '0');
    tmin.innerText = String (nMin).padStart(2, '0');
    tsec.innerText = String(nSec).padStart (2, '0');
    refresh ();
}

function refresh(){
    setTimeout (nowTime, 1000);
}

nowTime();

/**
* 月曜・金曜のアラート
*/

function weekdayAlert(){
    const todaysDay = matchDate.getDay();
    const nHour = matchDate.getHours();
    const nMin = matchDate.getMinutes();
    const nSec = matchDate.getSeconds();
    if (todaysDay === 1 && nHour < 11 ){
        alert ("展開例の校正データ出した？！");
    }else if(todaysDay === 5 && nHour < 13){
        alert ("調マプロパー原稿格納した？！");
    }
    alertRefresh();
}

function alertRefresh(){
    setTimeout(weekdayAlert, 3600000);
}
weekdayAlert();

/**
* TODO
*/

const setupDateMonth = document.querySelector('.setup-date-month');
const limitDateMonth = document.querySelector('.limit-date-month');
const form = document.querySelector('#todo_form');
let taskId = parseInt(localStorage.getItem('taskId')) || 0;
let allTasks = [];

setupDateMonth.onchange = function(){setDay(this.value, this);}
limitDateMonth.onchange = function(){setDay(this.value, this);}

function setDay (month, monthElement){
    const dateSelectElement = monthElement.parentNode.children[3];
    const today = new Date();
    const year= today.getFullYear ();
    let days = 31;
    if(((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) && month === '2'){
        days = 29;
    } else if (month === '2'){ 
        days = 28;
    } else if (month == '4' || month == '6' || month === '9' || month === '11'){
        days = 30;
    }
    createDays (dateSelectElement, days);
}

function createDays (dateSelectElement, days){
    dateSelectElement.innerHTML = '';
    for(let i= 1; i <= days ; i++){
        const listItem = document.createElement('option');
        listItem.textContent = i;
        dateSelectElement.appendChild(listItem);
    }
}

createDays (document.querySelector('.setup-date-day'), 31);
createDays (document.querySelector('.limit-date-day'), 31);

const todoSubmit = document.querySelector('#todo_submit');

form.addEventListener('submit' , function (event){
    event.stopPropagation();
    event.preventDefault();
    createNewTask();
    console.log ("aaa");
});

function createNewTask(){
    const priority = document.querySelector('.todo_priority');
    const setupDateDay = document.querySelector('.setup-date-day');
    const taskname = document.querySelector('#taskname');
    const limitDateDay = document.querySelector('.limit-date-day');
    const progressTaskArea = document.getElementById('progressTaskArea');
    const newTaskDiv = document.createElement('div');
    newTaskDiv.setAttribute('class', 'taskarea--block');
    /* taskの連番設定 */
    taskId++;
    localStorage.setItem('taskId', taskId);
    let formattedId = String(taskId).padStart(4, '0');
    newTaskDiv.setAttribute('id', formattedId);
    newTaskDiv.innerHTML = `              <div class="upper-btn_area"><button class="upper-btn">▲</button></div>
    <div class="lower-btn_area"><button class="lower-btn">▼</button> </div>
    <ul>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
    </ul>
    <div class="completed-btn__area"><button class="completed-btn">完了</button></div>
    <div class="delete-btn__area"><button class="delete-btn">削除</button></div>`;
    progressTaskArea.insertBefore(newTaskDiv, progressTaskArea.firstChild);
    const newTaskList = newTaskDiv.querySelectorAll('ul li');
    const newTaskData = {
        taskId: formattedId,
        priority: priority.value,
        setupDate: `${setupDateMonth.value}月${setupDateDay.value}日`,
        taskName: taskname.value,
        limitDate: `${limitDateMonth.value}月${limitDateDay.value}日`,
        completed: false
    }
    allTasks.push (newTaskData);
    saveTaskToLocalStorage ();
    newTaskList[0].innerHTML = priority.value;
    newTaskList[1].innerHTML = `${setupDateMonth.value}月${setupDateDay.value}日`;
    newTaskList[2].innerHTML = taskname.value;
    newTaskList[3].innerHTML = limitDateMonth.value + '月' + limitDateDay.value + '日';

    newTaskDiv.querySelector('.upper-btn').addEventListener('click', moveTaskUp);
    newTaskDiv.querySelector('.lower-btn').addEventListener('click', moveTaskDown);

    newTaskDiv.querySelector('.delete-btn').addEventListener('click', deleteTask);
    newTaskDiv.querySelector('.completed-btn').addEventListener('click', moveTaskToCompleted);
}

function moveTaskUp (event){
    const taskContainer = event.target.closest('.taskarea--block');
    const previousDiv = taskContainer.previousElementSibling;
    if (previousDiv && previousDiv.tagName !== 'H2'){
        taskContainer.parentNode.insertBefore(taskContainer, previousDiv);
    };
    reloadAllTasks();
}

function moveTaskDown (event){
    const taskContainer = event.target.closest('.taskarea--block');
    const nextDiv = taskContainer.nextElementSibling;
    if (nextDiv && nextDiv.nextElementSibling){
        taskContainer.parentNode.insertBefore(taskContainer, nextDiv.nextElementSibling);
    } else if (nextDiv){
        taskContainer.parentNode.appendChild(taskContainer);
    };
    reloadAllTasks();
}

function deleteTask (event){
    event.target.closest('.taskarea--block' ).remove();
    reloadAllTasks();
}

function moveTaskToCompleted (event){
    const taskContainer = event.target.closest('.taskarea--block');
    const completedTaskArea = document.getElementById('completedTaskArea');
    completedTaskArea.insertBefore(taskContainer, completedTaskArea.firstChild);
    taskContainer.classList.add('completed');
    const btn = taskContainer.querySelector('.completed-btn');
    btn.textContent = "戻す";
    btn.removeEventListener('click', moveTaskToCompleted);
    btn.addEventListener('click', moveTaskToInProgress);
    reloadAllTasks();
}

function moveTaskToInProgress (event){
    const taskContainer = event.target.closest('.taskarea--block');
    const progressTaskArea = document.getElementById('progressTaskArea');
    progressTaskArea.insertBefore(taskContainer, progressTaskArea.firstChild);

    // ボタンのテキストを元に戻す
    taskContainer.classList.remove('completed');
    const btn = taskContainer.querySelector('.completed-btn');
    btn.textContent = '完了';

    btn.removeEventListener('click', moveTaskToInProgress);
    btn.addEventListener('click', moveTaskToCompleted);
    reloadAllTasks();
}

function saveTaskToLocalStorage(){
    const tasksJSON = JSON.stringify(allTasks);
    localStorage.setItem('tasks', tasksJSON);
}

function reloadAllTasks(){
    allTasks = [];
    const taskContainers = document.querySelectorAll('.taskarea--block');
    taskContainers.forEach(taskContainer => {
        const taskId = taskContainer.id;
        const taskLis = taskContainer.querySelectorAll('ul li');
        const obj = {
            taskId: taskId,
            priority: taskLis[0].textContent,
            setupDate: taskLis[1].textContent,
            taskName: taskLis[2].textContent,
            limitDate: taskLis[3].textContent,
            completed: taskContainer.classList.contains('completed')
        };
        allTasks.push (obj);
    });
    saveTaskToLocalStorage();
}

function loadTaskFromLocalStorage(){
    const storedTasks = localStorage.getItem('tasks');
    if(storedTasks){
        const tasks = JSON.parse(storedTasks);
        tasks.forEach(task => {
            createTaskElement (task);
        });
    }
}

function createTaskElement (task){
    const progressTaskArea = document.getElementById('progressTaskArea');
    const completedTaskArea = document.getElementById('completedTaskArea');
    const newTaskDiv = document.createElement('div');
    newTaskDiv.setAttribute('class', 'taskarea--block');
    newTaskDiv.setAttribute('id', task.taskId);
    newTaskDiv.innerHTML = `              <div class="upper-btn__area"><button class="upper-btn">▲</button></div>
    <div class="lower-btn__area"><button class="lower-btn">▼</button></div>
    <ul>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
    </ul>
    <div class="completed-btn__area"><button class="completed-btn">完了</button></div>
    <div class="delete-btn__area"><button class="delete-btn">削除</button></div>`;
    const newTaskList = newTaskDiv.querySelectorAll('ul li');
    newTaskList[0].innerHTML = task.priority;
    newTaskList[1].innerHTML = task.setupDate;
    newTaskList[2].innerHTML = task.taskName;
    newTaskList[3].innerHTML = task.limitDate;

    newTaskDiv.querySelector('.upper-btn' ).addEventListener('click', moveTaskUp);
    newTaskDiv.querySelector('.lower-btn' ).addEventListener('click', moveTaskDown);
    newTaskDiv.querySelector('.delete-btn' ).addEventListener('click', deleteTask);
    newTaskDiv.querySelector('.completed-btn' ).addEventListener('click', moveTaskToCompleted);

    if (task.completed){
    newTaskDiv.classList.add('completed');
    const btn = newTaskDiv.querySelector('.completed-btn');
    btn.textContent = '戻す';
    btn.removeEventListener('click', moveTaskToCompleted);
    btn.addEventListener('click', moveTaskToInProgress);
    completedTaskArea.insertBefore(newTaskDiv, completedTaskArea.firstChild);
    }else{
    progressTaskArea.insertBefore(newTaskDiv, progressTaskArea.firstChild);
    }
}

document.getElementById('resetButton').addEventListener('click', function(){
    localStorage.clear();
});

window.onload = function(){
    loadCalendarTaskFromLocalStorage();
    loadTaskFromLocalStorage();
    reloadAllTasks();
};