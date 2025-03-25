document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      const todos = await response.json();
      renderTodos(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // Render todos
  const renderTodos = (todos) => {
    todoList.innerHTML = '';
    todos.forEach(todo => {
      const li = createTodoElement(todo);
      todoList.appendChild(li);
    });
  };

  // Create todo element
  const createTodoElement = (todo) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo._id;

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
      <input type="text" class="todo-text" value="${todo.text}">
      <div class="todo-actions">
        <button class="delete-btn">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    // Add event listeners
    const checkbox = li.querySelector('.todo-checkbox');
    const textInput = li.querySelector('.todo-text');
    const deleteBtn = li.querySelector('.delete-btn');

    checkbox.addEventListener('change', () => toggleTodo(todo._id, checkbox.checked));
    textInput.addEventListener('change', () => updateTodoText(todo._id, textInput.value));
    deleteBtn.addEventListener('click', () => deleteTodo(todo._id));

    return li;
  };

  // Add new todo
  const addTodo = async (text) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      const newTodo = await response.json();
      const todoElement = createTodoElement(newTodo);
      todoList.insertBefore(todoElement, todoList.firstChild);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });
      const updatedTodo = await response.json();
      const todoElement = document.querySelector(`[data-id="${id}"]`);
      todoElement.className = `todo-item ${updatedTodo.completed ? 'completed' : ''}`;
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  // Update todo text
  const updateTodoText = async (id, text) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      const todoElement = document.querySelector(`[data-id="${id}"]`);
      todoElement.remove();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // Form submit handler
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
      addTodo(text);
      todoInput.value = '';
    }
  });

  // Initial load
  fetchTodos();
});