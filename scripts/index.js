const currentDay = document.querySelector(".day-name");
const currentDate = document.querySelector(".date");
const todoList = document.getElementById("todoList");
const addBtn = document.getElementById("addBtn");
const popup = document.getElementById("popup");
const cancelBtn = document.getElementById("cancelBtn");
const todoForm = document.getElementById("todoForm");
const tabs = document.querySelectorAll(".tab");
const searchInput = document.getElementById("searchInput");
const dateInput = document.getElementById("taskDate");
const descriptionInput = document.getElementById("description");

document.addEventListener("DOMContentLoaded", () => {
  currentDay.textContent = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
  });

  currentDate.textContent = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

  const fp = flatpickr(dateInput, {
    enableTime: true,
    dateFormat: "Y-m-dTH:i",
    altInput: true,
    altFormat: "d F Y, H:i",
    time_24hr: true,
    locale: "ru",
  });

  fp.altInput.placeholder = "Дата";
  fp.altInput.value = "";

  let todos = JSON.parse(localStorage.getItem("todos")) || [];
  let editingTodoId = null;
  let currentFilter = "all";
  let searchQuery = "";

  renderTodos();

  addBtn.addEventListener("click", () => {
    editingTodoId = null;
    popup.querySelector(".submit-btn").textContent = "Добавить";
    popup.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
    todoForm.reset();
    dateInput._flatpickr.clear();
  });

  popup.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) {
      popup.classList.add("hidden");
      todoForm.reset();
      dateInput._flatpickr.clear();
      document.getElementById("description").classList.remove("input-error");
      dateInput._flatpickr.altInput.classList.remove("input-error");
    }
  });

  todoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const description = descriptionInput.value;
    const dateValue = dateInput.value;
    const reminder = document.getElementById("reminder").checked;

    if (!description || !dateValue) {
      return;
    }

    if (editingTodoId !== null) {
      const todo = todos.find((t) => t.id === editingTodoId);

      if (todo) {
        todo.description = description;
        todo.date = dateValue;
        todo.reminder = reminder;
      }
    } else {
      const newTodo = {
        id: Date.now(),
        description,
        date: dateValue,
        reminder,
        completed: false,
      };
      todos.push(newTodo);
    }

    localStorage.setItem("todos", JSON.stringify(todos));
    renderTodos();

    editingTodoId = null;
    todoForm.reset();
    dateInput._flatpickr.clear();
    popup.classList.add("hidden");
    popup.querySelector(".submit-btn").textContent = "Добавить";
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((tab) => tab.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter;
      renderTodos();
    });
  });

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.toLowerCase();
    renderTodos();
  });

  function renderTodos() {
    todoList.innerHTML = "";

    const oldMsg = document.getElementById("emptyMessage");
    if (oldMsg) oldMsg.remove();

    const filteredTodos = todos.filter((todo) => {
      const matchesFilter =
        currentFilter === "all" ||
        (currentFilter === "active" && !todo.completed) ||
        (currentFilter === "completed" && todo.completed);

      const matchesSearch = todo.description
        .toLowerCase()
        .includes(searchQuery);
      return matchesFilter && matchesSearch;
    });

    if (filteredTodos.length === 0) {
      const msg = document.createElement("p");
      msg.id = "emptyMessage";
      msg.className = "no-tasks-message";
      msg.textContent = "Нет задач для отображения";
      todoList.insertAdjacentElement("afterend", msg);
      return;
    }

    filteredTodos.forEach((todo) => {
      const item = document.createElement("li");
      item.className = "todo-item" + (todo.completed ? " completed" : "");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.classList.add("custom-checkbox");

      checkbox.addEventListener("change", () => {
        todo.completed = checkbox.checked;
        localStorage.setItem("todos", JSON.stringify(todos));
        renderTodos();
      });

      const textBlock = document.createElement("div");
      textBlock.innerHTML = `<span class="todo-date">${formatDate(
        todo.date
      )}</span><p class="todo-description">${todo.description}</p>`;

      const contentBlock = document.createElement("div");
      contentBlock.classList.add("content-wrapper");
      contentBlock.appendChild(checkbox);
      contentBlock.appendChild(textBlock);

      const editIcon = document.createElement("img");
      editIcon.src = "./icons/edit.svg";
      editIcon.classList.add("edit-icon");

      const deleteIcon = document.createElement("img");
      deleteIcon.src = "./icons/garbage-svgrepo-com.svg";
      deleteIcon.classList.add("delete-icon");

      const editBlock = document.createElement("div");
      editBlock.classList.add("edit-wrapper");
      editBlock.appendChild(editIcon);
      editBlock.appendChild(deleteIcon);

      deleteIcon.addEventListener("click", () => {
        todos = todos.filter((t) => t.id !== todo.id);
        localStorage.setItem("todos", JSON.stringify(todos));
        renderTodos();
      });

      item.querySelector("click", () => {
        contentBlock.style.display = "flex";
      });

      editIcon.addEventListener("click", () => {
        editingTodoId = todo.id; // переходим в режим редактирования
        popup.querySelector(".submit-btn").textContent = "Сохранить";

        descriptionInput.value = todo.description;
        dateInput._flatpickr.setDate(todo.date); // flatpickr.setDate
        document.getElementById("reminder").checked = todo.reminder;

        popup.classList.remove("hidden");
      });

      // item.appendChild(checkbox);
      // item.appendChild(textBlock);
      item.appendChild(contentBlock);
      item.appendChild(editBlock);
      todoList.appendChild(item);
    });
  }

  function formatDate(datetimeStr) {
    if (!datetimeStr) {
      return "";
    }

    const date = new Date(datetimeStr);

    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
});
