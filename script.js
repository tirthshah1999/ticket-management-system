let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let mainContainer = document.querySelector(".main-container");
let modal = document.querySelector(".modal-container");
let textArea = document.querySelector(".text-container");
let createTicketBtn = document.querySelector(".create-ticket-btn");
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolBoxColors = document.querySelectorAll(".colors");
let noTickets = document.querySelector(".no-tickets");

let colors = ["lightpink", "lightblue", "lightgreen", "black"];

// Set modal default priority color if not selected
let modalPriorityColor = colors[colors.length - 1];
console.log(noTickets);
let showModal = false;
let isToRemoveTicket = false;
let isTicketAvailable = false;
let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketsArr = [];

if(localStorage.getItem("tickets")){
    // Retrieve and display tickets
    ticketsArr = JSON.parse(localStorage.getItem("tickets"));
    ticketsArr.forEach((ticketObj) => {
      createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
    })
}

// Add Functionality
addBtn.addEventListener("click", (e) => {
    showModal = !showModal;
    if(showModal){
        addBtn.classList.add("selected");
        modal.style.display = "flex";  
    }else{
        addBtn.classList.remove("selected");
        modal.style.display = "none";
    }
})

// Remove Functionality
removeBtn.addEventListener("click", (e) => {
    isToRemoveTicket = !isToRemoveTicket;
    if(isToRemoveTicket){
        removeBtn.classList.add("selected");
    }else{
        removeBtn.classList.remove("selected");
    }

})

// Selecting priority color on modal as an current active 
allPriorityColors.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColorElem) => {
            priorityColorElem.classList.remove("selected");
        })

        colorElem.classList.add("selected");
        modalPriorityColor = colorElem.classList[0];
    })
})

// Add event to create ticket button
createTicketBtn.addEventListener("click", (e) => {
    if(textArea.value.trim() === ""){
        alert("Task can't be created as blank");
        return;
    }

    createTicket(modalPriorityColor, textArea.value);
    addBtn.classList.remove("selected");
    showModal = false;
    setDefaultModal();
})

// Create Ticket
function createTicket(ticketColor, ticketTask, ticketId){
    let id = ticketId || shortid();
    let ticketContainer = document.createElement("div");
    ticketContainer.setAttribute("class", "ticket-container");
    ticketContainer.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="task">${ticketTask}</div>
        <div class="ticket-lock">
            <i class="fas fa-lock"></i>
        </div>
    `;

    mainContainer.appendChild(ticketContainer);
    
    // If ticketId is undefined, then push it in arr bcoz we dont want any duplicates in out arr
    if(!ticketId){
        ticketsArr.push({ticketColor, ticketTask, ticketId: id});
        localStorage.setItem("tickets", JSON.stringify(ticketsArr));
    }
    
    if(ticketsArr.length > 0){
        noTickets.style.display = "none";
    }

    handleRemoval(ticketContainer, id);
    handleLock(ticketContainer, id);
    handleColor(ticketContainer, id);
}

// Remove Ticket
function handleRemoval(ticket, id){
    ticket.addEventListener("click", (e) => {
        if(!isToRemoveTicket) return;
        
        let ticketIdx = getTicketByIdx(id);
        ticketsArr.splice(ticketIdx, 1);
        localStorage.setItem("tickets", JSON.stringify(ticketsArr));
        ticket.remove(); // UI remove
        
        if(ticketsArr.length > 0){
            noTickets.style.display = "none";
        }else{
            noTickets.style.display = "block";
        }
    })
}

// Handle Lock
function handleLock(ticket, id){
    let ticketLockElem = ticket.querySelector(".ticket-lock");

    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task");

    ticketLock.addEventListener("click", (e) => {
        if(ticketLock.classList.contains(lockClass)){
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }else{
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        let ticketIdx = getTicketByIdx(id);
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("tickets", JSON.stringify(ticketsArr));
    })
}

// Handle Color
function handleColor(ticket, id){
    let ticketColor = ticket.querySelector(".ticket-color");

    ticketColor.addEventListener("click", (e) => {
        let currTicketColor = ticketColor.classList[1];
        let currTicketColorIdx = colors.findIndex((color) => {
            return color === currTicketColor;
        })

        currTicketColorIdx++;
        let newTicketColorIdx = currTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];

        ticketColor.classList.remove(currTicketColor);
        ticketColor.classList.add(newTicketColor);

        let ticketIdx = getTicketByIdx(id);
        ticketsArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("tickets", JSON.stringify(ticketsArr));
    })
}

// Get Ticket By Index
function getTicketByIdx(id){
    let ticketIdx = ticketsArr.findIndex((ticketObj) => {
        return id === ticketObj.ticketId;
    })

    return ticketIdx;
}

// Default values for Modal 
function setDefaultModal(){
    modal.style.display = "none";
    textArea.value = "";
    modalPriorityColor = colors[colors.length - 1];
    allPriorityColors.forEach((priorityColorElem) => {
        priorityColorElem.classList.remove("selected");
    })

    allPriorityColors[allPriorityColors.length - 1].classList.add("selected");
}

// Toolbox color add event, so they can filter accordingly
for(let i = 0; i < toolBoxColors.length; i++){
    // Add filter when click
    toolBoxColors[i].addEventListener("click", (e) => {
        if(e.currentTarget.classList.contains("active")){
            e.currentTarget.classList.remove("active");
            // Remove previous tickets
            let allTickets = document.querySelectorAll(".ticket-container");
            for (let i = 0; i < allTickets.length; i++) {
                 allTickets[i].remove();
            }

            // Display all tickets
            ticketsArr.forEach((ticketObj) => {
                createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
            })

            return;
        }
        
        let selectedElement = document.querySelectorAll(".colors");   
        
        for(let i = 0; i < selectedElement.length; i++){
            if(selectedElement[i].classList[2] === "active"){
                selectedElement[i].classList.remove("active");            
            }
        }

        e.currentTarget.classList.add("active");
        
        let currToolBoxColor = toolBoxColors[i].classList[0];
        let filteredTickets = ticketsArr.filter((ticketObj) => {
            return currToolBoxColor === ticketObj.ticketColor;
        })

        // Remove previous tickets
        let allTickets = document.querySelectorAll(".ticket-container");

        for(let i = 0; i < allTickets.length; i++){
            allTickets[i].remove();
        }

        // Display new filtered tickets
        filteredTickets.forEach((ticketObj) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
        })
    })
}





