"use strict";

let habits = [];
const habit_KEY = "habit_KEY";
let globalActivehabitId;

/* page */

const page = {
    menu: document.querySelector(".menu__list"),
    header: {
        h1: document.querySelector(".h1"),
        progressPercent: document.querySelector(".progress__percent"),
        progressCoverbar: document.querySelector(".progress__coverbar")
    },
    content: {
        daysContainer: document.querySelector("#days"),
        nextDay: document.querySelector(".habit__day")
    } 
}

/* utils */

function loadData() {
    const habitsString = localStorage.getItem(habit_KEY);
    const habitArray = JSON.parse(habitsString);
    if (Array.isArray(habitArray)) {
        habits = habitArray;
    }
}

function saveData() {
    localStorage.setItem(habit_KEY, JSON.stringify(habits));
}

/* render */
function rerenderMenu(activehabit) {
    for (const habit of habits) {
        const existed = document.querySelector(`[menu-habit-id="${habit.id}"]`);
        if (!existed) {
            const element = document.createElement("button");
            element.setAttribute("menu-habit-id", habit.id);
            element.classList.add("menu__item");
            element.addEventListener("click", () => rerender(habit.id));
            element.innerHTML = `
                <img src="images/${habit.icon}.svg" alt="${habit.name}">
            `;
            if (activehabit.id === habit.id) {
                element.classList.add("menu__item_active");
            }
            page.menu.appendChild(element);
            continue;
        }
        if (activehabit.id === habit.id) {
            existed.classList.add("menu__item_active");
        } else {
            existed.classList.remove("menu__item_active");
        }
    }
}

function rerenderHead(activehabit) {
    page.header.h1.innerText = activehabit.name;
    const progress = activehabit.days.length / activehabit.target > 1
        ? 100 
        : activehabit.days.length / activehabit.target * 100;

        page.header.progressPercent.innerText = progress.toFixed(0) + "%";
        page.header.progressCoverbar.style.width = `${progress}%`;

}

function rerenderContent(activehabit) {
    page.content.daysContainer.innerHTML = "";
    const days = activehabit.days;
    days.forEach((day, index) => {
        const element = document.createElement("div");
        element.classList.add("habit");
        element.innerHTML = `
            <div class="habit__day">День ${index + 1}</div>
            <div class="habit__comment">${day.comment}</div>
            <button class="habit__delete"  onclick="deleteDay(${index})">
                <img src="images/shape.svg" alt="Удалить день ${index + 1}">
            </button>
        `;
        page.content.daysContainer.appendChild(element);
        page.content.nextDay.innerText = `День ${ activehabit.days.length + 1 }`;
        page.content.nextDay.setAttribute("name", activehabit.name)
    });
    page.content.nextDay.innerText = `День ${ activehabit.days.length + 1 }`;
    page.content.nextDay.setAttribute("name", activehabit.name);
}

function rerender(activehabitId) {
    globalActivehabitId = activehabitId;
    const activehabit = habits.find(habit => habit.id === activehabitId);
    if (!activehabit) {
        return;
    }
    rerenderMenu(activehabit);
    rerenderHead(activehabit);
    rerenderContent(activehabit)
}

/* work with days */
function addDays(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(event.target);
    const comment = data.get("comment");
    if (!comment) {
        form["comment"].classList.add("error");
        return;
    }
    form["comment"].classList.remove("error");
    habits = habits.map(habit => {
        if (habit.id === globalActivehabitId) {
            return {
                ...habit,
                days: habit.days.concat([{ comment }])
            }
        }
        return habit;
    });
    rerender(globalActivehabitId);
    saveData();
    form["comment"].value = "";
}

function deleteDay(index) {
    habits = habits.map(habit => {
        if (habit.id === globalActivehabitId) {
            habit.days.splice(index, 1);
            return {
                ...habit,
                days: habit.days
            }
        }
        return habit;
    });
    rerender(globalActivehabitId);
    saveData();
}




/* init */
// При загрузке приложения загружаем данные из local storage
// IIFE
(() => {
    loadData();
    if (habits.length === 0) {
        return
    }
    rerender(habits[0].id)
})();
