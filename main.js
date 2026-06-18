// Dialogues and buttons

//these elements are selected first because they control the main game feedback. the intro dialog explains the game rules
//before the interaction starts, and the result dialog gives feedback after the player submits the drink.
const introDialog = document.querySelector("#intro-dialog");
const resultDialog = document.querySelector("#result-dialog");
const startBtn = document.querySelector("#start-btn");
const resetBtn = document.querySelector("#reset-btn");
const doneBtn = document.querySelector("#done-btn");
const closeResultBtn = document.querySelector("#close-result-btn");
const resultTitle = document.querySelector("#result-title");
const resultMessage = document.querySelector("#result-message");

introDialog.showModal();

//game is used as the main container for dynamically created drag images. Cup Zone is the target area used to check
//whether an ingredient has been dropped into the milk tea cup.
const game = document.querySelector(".game");
// allow players to drag and drop
const hitAreas = document.querySelectorAll(".hit-area");
const cupZone = document.querySelector("#cup-zone");

//these images represent different completed states of the drink. they are hidden at the beginning and shown step by step
//when the correct ingredient is added.
const iceDrop = document.querySelector("#ice-drop");
const puddingDrop = document.querySelector("#pudding-drop");
const bobaDrop = document.querySelector("#boba-drop");


//the orderSteps array controls the required sequence of the drink. The player must add ingredients in this exact order:
//ice first, then milk pudding, then boba.
const orderSteps = ["ice", "milk-pudding", "boba"];
// 0 means the game is waiting for ice, 1 means the game is waiting for milk pudding.
let currentStep = 0;

// draggable sources
const dragSources = {
    ice: "source/ice.png",
    "milk-pudding": "source/milk pudding.png",
    boba: "source/boba.png",
    cream: "source/cream.png"
};


startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
doneBtn.addEventListener("click", checkOrder);

//after the result dialog is closed, the game resets automatically. this allows the player to start a new round without
//manually pressing reset.
closeResultBtn.addEventListener("click", () => {
    resultDialog.close();
    resetGame();
});

//each transparent hit area receives the same drag function. the specific ingredient is identified through its data-item value.
hitAreas.forEach((area) => {
    area.addEventListener("mousedown", startDragFromHitArea);
});

//the game begins after the player reads the instruction dialog. closing the dialog reveals the playable interface underneath.
function startGame() {
    introDialog.close();
}


//this function creates a new draggable ingredient image when the player presses on one of the hit areas.
function startDragFromHitArea(event) {
    event.preventDefault();

    const itemName = event.currentTarget.dataset.item;
    const itemSrc = dragSources[itemName];

    if (!itemSrc) {
        return;
    }

    //a new image element is created only when the player starts dragging. this keeps the HTML cleaner and makes the drag
    //interaction feel more active.
    const dragImg = document.createElement("img");

    dragImg.src = itemSrc;
    dragImg.alt = itemName;
    dragImg.dataset.item = itemName;
    dragImg.classList.add("drag-item");

    game.appendChild(dragImg);

//the drag image size is used to keep the image centered around the cursor.
    const dragWidth = 110;
    const dragHeight = 110;

    moveDragImage(dragImg, event.clientX, event.clientY, dragWidth, dragHeight);

    //while the mouse moves, the ingredient image follows the cursor.
    function onMouseMove(event) {
        moveDragImage(dragImg, event.clientX, event.clientY, dragWidth, dragHeight);
    }

    function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

//the temporary drag image is removed after dropping. if the ingredient is correct, the drink state image will appear instead.
//if it is wrong, the dragged image simply disappears to show rejection.
        if (isInsideCup(dragImg)) {
            const isCorrect = handleCorrectDrop(itemName);

            if (isCorrect) {
                dragImg.remove();
            } else {
                dragImg.remove();
            }
        } else {
            dragImg.remove();
        }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}


//this function positions the draggable image at the mouse location. subtracting half of the image size keeps the image centered on the cursor.
function moveDragImage(img, mouseX, mouseY, width, height) {
    img.style.left = mouseX - width / 2 + "px";
    img.style.top = mouseY - height / 2 + "px";
}


//this function compares the center point of the dragged item with the cup zone area. using the center point makes the
// drop check. feel more natural than checking only the mouse position.
// I learnt it from ChatGPT
function isInsideCup(element) {
    const elementRect = element.getBoundingClientRect();
    const cupRect = cupZone.getBoundingClientRect();
    const elementCenterX = elementRect.left + elementRect.width / 2;
    const elementCenterY = elementRect.top + elementRect.height / 2;

    return (
        elementCenterX > cupRect.left &&
        elementCenterX < cupRect.right &&
        elementCenterY > cupRect.top &&
        elementCenterY < cupRect.bottom
    );
}

//because my drop images are complete cup state images, only one state image should be visible at a time. before showing
// the new state, all previous states are hidden.*/
function showCupState(itemName) {
    iceDrop.classList.add("hidden");
    puddingDrop.classList.add("hidden");
    bobaDrop.classList.add("hidden");

    if (itemName === "ice") {
        iceDrop.classList.remove("hidden");
    }
    if (itemName === "milk-pudding") {
        puddingDrop.classList.remove("hidden");
    }
    if (itemName === "boba") {
        bobaDrop.classList.remove("hidden");
    }
}


//this function checks whether the dropped ingredient matches the current required step. this creates the step-by-step gameplay,
//so the player must follow the order instead of adding toppings randomly.
function handleCorrectDrop(itemName) {
    if (itemName !== orderSteps[currentStep]) {
        return false;
    }
    showCupState(itemName);
    currentStep++;
    return true;
}


// RESET
function resetGame() {
    currentStep = 0;
    iceDrop.classList.add("hidden");
    puddingDrop.classList.add("hidden");
    bobaDrop.classList.add("hidden");

    const dragItems = document.querySelectorAll(".drag-item");
    dragItems.forEach((item) => {
        item.remove();
    });
}

//when the player presses done, the game checks whether all steps have been completed. if the currentStep reaches the
//length of orderSteps, the order is correct. otherwise, the customer gives a complaint.
function checkOrder() {
    if (currentStep === orderSteps.length) {
        resultTitle.textContent = "Great Job!";
        resultMessage.textContent = "The customer is very happy with your drink.";
    } else {
        resultTitle.textContent = "Customer Complaint!";
        resultMessage.textContent = "You made the drink incorrectly.";
    }

    resultDialog.showModal();
}

//I used ChatGPT to debug both in CSS and JS.
//especially on how to show dropped imgs.
//AND I also ues it to teach me to do some tricky features.