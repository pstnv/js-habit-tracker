"use strict";

let habits = [];
const HABIT_KEY = "HABIT_KEY";
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
    },
    popup: {
        index: document.querySelector('#add-habbit_popup'),
        iconField: document.querySelector('.popup__form input[name="icon"]')
    }
}

/* utils */

function loadData() {
    const habitsString = localStorage.getItem(HABIT_KEY);
    const habitArray = JSON.parse(habitsString);
    if (Array.isArray(habitArray)) {
        habits = habitArray;
    }
}

function saveData() {
    localStorage.setItem(HABIT_KEY, JSON.stringify(habits));
}

function togglePopup () {
    page.popup.index.classList.toggle('cover_hidden');
}

function validateAndGetForm(form, fields) {
    const formData = new FormData(form);

    const res = fields.reduce((acc, field) => {
        const fieldValue = formData.get(field);
        form[field].classList.remove("error");
        if (!fieldValue) {
            form[field].classList.add("error");
        }
        acc[field] = fieldValue;
        return acc;
    }, {});
    const isValid = fields.every(field => res[field]);
    if (!isValid) {
        return;
    }
    return res;
}

function resetForm(form, fields) {
    fields.forEach(field => {
        form[field].value = "";
    });
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
                <img src="images/delete.svg" alt="Удалить день ${index + 1}">
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
    document.location.replace(document.location.pathname + '#' + activehabitId);
    rerenderMenu(activehabit);
    rerenderHead(activehabit);
    rerenderContent(activehabit)
}

/* work with days */
function addDays(event) {
    event.preventDefault();
    const form = event.target;

    const data = validateAndGetForm(form, ["comment"]);
    if (!data) {
        return;
    }

    habits = habits.map(habit => {
        if (habit.id === globalActivehabitId) {
            return {
                ...habit,
                days: habit.days.concat([{ comment: data.comment }])
            }
        }
        return habit;
    });
    resetForm(form, ["comment"]);
    rerender(globalActivehabitId);
    saveData();
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

/* working with habits */

function setIcon(context, icon) {
    page.popup.iconField.value = icon;
    const activeIcon = document.querySelector('.icon.icon_active');
    activeIcon.classList.remove('icon_active');
    context.classList.add('icon_active');
}
function addHabit(event) {
    event.preventDefault();
    const form = event.target;
    const data = validateAndGetForm(form, ["name", "icon", "target"]);
    if (!data) {
        return;
    }
    const maxId = habits.reduce((acc, habit) => acc > habit.id ? acc : habit.id, 0)
    habits.push({
        id: maxId + 1,
        name: data.name,
        icon: data.icon,
        target: data.target,
        days: []
    });
    resetForm(form, ["name", "target"]);
    togglePopup();
    saveData();
    rerender(maxId + 1);
}


/* init */
// При загрузке приложения загружаем данные из local storage
// IIFE
(() => {
    loadData();
    if (habits.length === 0) {
        return
    }
    const hashId = Number(document.location.hash.replace('#', ''));
    const urlHabitId = habits.find(habit => habit.id == hashId);
    if (urlHabitId) {
        rerender(urlHabitId.id)
    } else {
        rerender(habits[0].id)
    }
})();