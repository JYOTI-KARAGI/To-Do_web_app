// const taskname=document.getElementById('taskname');
// const duedate=document.getElementById('duedate');
// const duetiming=document.getElementById('duetiming');
// const Reminderset=document.getElementById('Reminder-set');
// const button=document.getElementById('final-submit');

// if('Notification' in window){
//     // getting user permission for notification
//     Notification.requestPermission().then(permission=>{
//         if(permission !=="granted"){
//             alert("Please enable notification to receive task reminders!");
//         }
//     });
// }

// storing the currect lab category
let currentCategory="Personal";//this is default tab

//logic for tab switching 
const tabs=document.querySelectorAll('.task-category span');
const allForms=document.querySelectorAll('.form-section');

tabs.forEach(tab => {
    tab.addEventListener('click' ,function(){
        const selectedCategory=tab.getAttribute('data-category');

        currentCategory=selectedCategory;
        // remove the active class from the default category/tab
        // highlight the active tab

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        //displaying the currect categoty form 
        allForms.forEach(form => form.style.display='none');
        const targetForm=document.getElementById("form-" +selectedCategory);

        if(targetForm){
            targetForm.style.display='block';
        }
        
        //load previous taks from the localstorage foe that function
        loadTask();

    });
});


//when submit button is clicked displaying the tasks 
document.getElementById('final-submit').addEventListener("click",function(e){
e.preventDefault();
displaytask();
});

document.getElementById('submit-office').addEventListener("click", function(e){
    e.preventDefault();
    displaytask();
});

document.getElementById('submit-birthday').addEventListener("click",function(e){
e.preventDefault();
displaytask();
});

document.getElementById('submit-travel').addEventListener("click",function(e){
e.preventDefault();
displaytask();
});

// since we have same id name for all the form then select the inputs based the selected 
// category create object for elements and its key
function getCurrentFormInputs(){
    switch(currentCategory){

    case "Personal":
    return {
        taskname:document.getElementById("taskname"),
        duedate:document.getElementById("duedate"),
        duetiming:document.getElementById("duetiming"),
        reminder:document.getElementById("Reminder-set"),
        destination:null
};
   case "Office":
    return{
        taskname:document.getElementById("taskname-office"),
        duedate:document.getElementById("duedate-office"),
        duetiming:document.getElementById("duetiming-office"),
        reminder:document.getElementById("Reminder-set-office"),
        destination:null
    };
    case "Birthday":
        return{
            taskname: document.getElementById("taskname-b"),
            duedate: document.getElementById("duedate-b"),
            duetiming: null,
            reminder: document.getElementById("Reminder-set-b"),
            destination: null
        };
    case "Travel":
        return {
        taskname: null, // no taskname input
        duedate:document.getElementById("duedate-t"),
        duetiming:document.getElementById("duetiming-t"),
        reminder:document.getElementById("Reminder-set-t"),
        destination:document.getElementById("destination")
        };
    }
}

function displaytask(){

const input = getCurrentFormInputs();

// handling reminder time parsing based on category
let reminderRaw = input.reminder?.value ||"";
let reminderTime="";

if(reminderRaw.includes("T")){
    [,reminderRaw]=reminderRaw.split("T");
}else{
    reminderTime=reminderRaw;
}



// creating object for getting values from the inputs
const taskdetails={
    // getting value from input block if available otherwise NULL
     nameValue:input.taskname?.value || input.destination?.value ||"",
     dateValue:input.duedate?.value||"",
     timeValue:input.duetiming?.value||"",
     reminderValue:currentCategory ==="Travel" ? reminderRaw : reminderTime||"",
     destination:input.destination?.value ||"",
     category:currentCategory
    };

    // storing initial values in the local storage (NULL)
let taskList= JSON.parse(localStorage.getItem("tasks"))||[];
//then adding the inputs to the taskList 

taskList.push(taskdetails);
//storing the in them in tasks localstorage
localStorage.setItem("tasks",JSON.stringify(taskList));

// displaying the taskbox with Task:value on the webpage
creatTaskBox(taskdetails);
// scheduling the reminder
scheduleReminder(taskdetails);

//after displaying clearing based on category input wise
if(input.taskname) input.taskname.value="";//if no needed taskaname exist for all the category
if(input.duedate) input.duedate.value="";
if(input.duetiming) input.duetiming.value="";
if(input.reminder) input.reminder.value="";
if(input.destination) input.destination.value="";

}

function loadTask(){
     
    document.getElementById('task-list').innerHTML="";//clearing the previous data

     const allTasks=JSON.parse(localStorage.getItem("tasks")||"[]");
    allTasks.forEach(task=> {
        if(task.category === currentCategory){
        creatTaskBox(task);
        }
    });
}

function creatTaskBox(taskdetails){
//taskBox is to display the tasks on the page
const taskBox=document.createElement("div");
taskBox.className="task-box";
taskBox.innerHTML=`
<strong>Task: </strong>${taskdetails.nameValue}<br>
<strong>Due date: </strong>${taskdetails.dateValue}<br>
<strong>Due time: </strong>${taskdetails.timeValue}<br>
<strong>Reminder Time: </strong>${taskdetails.reminderValue ||"Not Set"}<br>
${taskdetails.destination? `<strong>Destination:</strong> ${taskdetails.destination}<br>`:""}`;
// if task.destination block exist then then display its value otherwise blank


// to mark task done
const donebtn=document.createElement("button");

donebtn.textContent="Done";

donebtn.addEventListener("click",function(){
    taskBox.style.textDecoration="line-through";
});


// document.getElementById("task-list").appendChild(taskBox);

// delete task button

const deletebtn=document.createElement("button");
deletebtn.textContent="Delete";

deletebtn.addEventListener("click",function(){
    // remove from screen
taskBox.remove();

// to remove from the local storage

let taskList=JSON.parse(localStorage.getItem("tasks"))||[];

//filting out the deleted task

taskList = taskList.filter(t =>JSON.stringify(t) !== JSON.stringify(taskdetails));
    
localStorage.setItem("tasks",JSON.stringify(taskList));

});


taskBox.append(donebtn,deletebtn);
// append task to the display 
document.getElementById("task-list").appendChild(taskBox);

}

function scheduleReminder(task){
    // checking whether the reminder is set or not and notification permission is grated or
    // not if no then immidiate exit
    if(!task.reminderValue || Notification.permission !== "granted"){
        return;}

        // combining date an dreminder time into one datetime string 
      let reminderDateTimestring = 
      task.category ==="Travel"? task.reminderValue:task.dateValue+"T"+task.reminderValue;  
    //   converts string into javascript object then into the time stmp millisecends
      let reminderTime = new Date(reminderDateTimestring).getTime();
      let now =Date.now();
      let delay =reminderTime-now;

      if(delay >0){
        setTimeout(()=>{
            new Notification("Reminder!",{
                body:`${task.nameValue} is due soon in "${task.category}" category! `
            });
        },delay);
      }
}


//default form shows personal tab on load
window.onload= function(){
    loadTask();

 const targetForm=document.getElementById("form-" +currentCategory);
if(targetForm){
   targetForm.style.display="block"
}
    document.querySelector(`[data-category="${currentCategory}"]`).classList.add('active');
};




