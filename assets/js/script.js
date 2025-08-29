// CET138 ePortfolio - Enhanced JavaScript Functionality
// Professional-grade JavaScript with comprehensive features

(function() {
  'use strict';

  // Utility functions
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);
  
  const utils = {
    // Debounce function for performance
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Show notification
    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.innerHTML = `
        <div class="notification-content">
          <span class="notification-message">${message}</span>
          <button class="notification-close" aria-label="Close notification">×</button>
        </div>
      `;
      
      // Add styles
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
      `;
      
      document.body.appendChild(notification);
      
      // Animate in
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
      
      // Close button
      notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      });
    },

    // Validate email
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    // Save to localStorage
    saveToStorage(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        return false;
      }
    },

    // Load from localStorage
    loadFromStorage(key) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        return null;
      }
    }
  };

  // Theme and Accessibility Management
  const ThemeManager = {
    init() {
      this.contrastBtn = $('#toggle-contrast');
      if (!this.contrastBtn) return;

      // Load saved preference
      const savedContrast = utils.loadFromStorage('contrast-mode') || 'normal';
      document.documentElement.setAttribute('data-contrast', savedContrast);
      this.contrastBtn.setAttribute('aria-pressed', savedContrast === 'high');

      this.contrastBtn.addEventListener('click', () => {
        const isHigh = document.documentElement.getAttribute('data-contrast') === 'high';
        const newMode = isHigh ? 'normal' : 'high';
        
        document.documentElement.setAttribute('data-contrast', newMode);
        this.contrastBtn.setAttribute('aria-pressed', String(!isHigh));
        utils.saveToStorage('contrast-mode', newMode);
      });
    }
  };

  // Enhanced To-Do List with Local Storage
  const TodoManager = {
    todos: [],
    
    init() {
      this.input = $('#todo-input');
      this.addBtn = $('#todo-add');
      this.list = $('#todo-list');
      
      if (!this.input || !this.addBtn || !this.list) return;

      // Load saved todos
      this.todos = utils.loadFromStorage('todos') || [];
      this.renderTodos();

      this.addBtn.addEventListener('click', () => this.addItem());
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addItem();
        }
      });

      // Add some sample todos if empty
      if (this.todos.length === 0) {
        this.addSampleTodos();
      }
    },

    addItem() {
      const text = this.input.value.trim();
      if (!text) {
        utils.showNotification('Please enter a task', 'error');
        return;
      }

      const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
      };

      this.todos.push(todo);
      this.saveTodos();
      this.renderTodos();
      this.input.value = '';
      this.input.focus();

      utils.showNotification('Task added!', 'success');
    },

    toggleTodo(id) {
      const todo = this.todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        this.saveTodos();
        this.renderTodos();
      }
    },

    deleteTodo(id) {
      this.todos = this.todos.filter(t => t.id !== id);
      this.saveTodos();
      this.renderTodos();
    },

    renderTodos() {
      this.list.innerHTML = '';
      
      this.todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = todo.completed ? 'done' : '';
        li.innerHTML = `
          <span class="todo-text">${this.escapeHtml(todo.text)}</span>
          <div class="todo-actions">
            <button class="todo-delete" aria-label="Delete task">🗑️</button>
          </div>
        `;
        
        li.addEventListener('click', (e) => {
          if (!e.target.classList.contains('todo-delete')) {
            this.toggleTodo(todo.id);
          }
        });
        
        li.querySelector('.todo-delete').addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteTodo(todo.id);
        });
        
        li.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleTodo(todo.id);
          }
        });
        
        this.list.appendChild(li);
      });
    },

    addSampleTodos() {
      const sampleTodos = [
        'Review HTML semantics',
        'Practice CSS Grid layouts',
        'Build Bootstrap components',
        'Write JavaScript functions',
        'Test responsive design'
      ];
      
      sampleTodos.forEach(text => {
        const todo = {
          id: Date.now() + Math.random(),
          text: text,
          completed: false,
          createdAt: new Date().toISOString()
        };
        this.todos.push(todo);
      });
      
      this.saveTodos();
      this.renderTodos();
    },

    saveTodos() {
      utils.saveToStorage('todos', this.todos);
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  // Enhanced Form Validation
  const FormValidator = {
    init() {
      const forms = $$('form[data-validate]');
      if (!forms.length) return;

      forms.forEach(form => {
        this.setupForm(form);
      });
    },

    setupForm(form) {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', utils.debounce(() => this.validateField(input), 300));
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
    },

    validateField(field) {
      const value = field.value.trim();
      let isValid = true;
      let message = '';

      field.classList.remove('is-invalid');
      this.removeErrorMessage(field);

      if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required';
      }

      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
      }

      if (field.hasAttribute('minlength')) {
        const minLength = parseInt(field.getAttribute('minlength'));
        if (value && value.length < minLength) {
          isValid = false;
          message = `Must be at least ${minLength} characters`;
        }
      }

      if (field.type === 'url' && value) {
        try { new URL(value); } catch { isValid = false; message = 'Please enter a valid URL'; }
      }

      if (!isValid) {
        field.classList.add('is-invalid');
        this.showErrorMessage(field, message);
      }

      return isValid;
    },

    showErrorMessage(field, message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      `;
      
      field.parentNode.appendChild(errorDiv);
    },

    removeErrorMessage(field) {
      const existingError = field.parentNode.querySelector('.error-message');
      if (existingError) existingError.remove();
    },

    handleSubmit(form) {
      const inputs = form.querySelectorAll('input, textarea, select');
      let isValid = true;

      inputs.forEach(input => { if (!this.validateField(input)) isValid = false; });

      if (isValid) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) { submitBtn.textContent = 'Submitting...'; submitBtn.disabled = true; }

        setTimeout(() => {
          utils.showNotification('Form submitted successfully!', 'success');
          form.reset();
          if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
          inputs.forEach(input => { input.classList.remove('is-invalid'); this.removeErrorMessage(input); });
        }, 1000);
      } else {
        utils.showNotification('Please fix the errors before submitting', 'error');
      }
    }
  };

  // Calculator Functionality
  const Calculator = {
    currentInput: '0',
    previousInput: '',
    operation: null,
    waitingForNewInput: false,
    
    init() {
      this.display = $('#calculator-input');
      if (!this.display) return;
      
      const buttons = $$('.calc-btn');
      buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          const action = button.dataset.action;
          const value = button.dataset.number || button.dataset.operator;
          
          switch(action) {
            case 'number':
              this.inputNumber(value);
              break;
            case 'operator':
              this.inputOperator(value);
              break;
            case 'decimal':
              this.inputDecimal();
              break;
            case 'equals':
              this.calculate();
              break;
            case 'clear':
              this.clear();
              break;
            case 'delete':
              this.delete();
              break;
          }
        });
      });
    },
    
    inputNumber(num) {
      if (this.waitingForNewInput) {
        this.currentInput = num;
        this.waitingForNewInput = false;
      } else {
        this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
      }
      this.updateDisplay();
    },
    
    inputOperator(op) {
      if (this.currentInput === '0' && this.previousInput === '') return;
      
      if (this.previousInput !== '' && !this.waitingForNewInput) {
        this.calculate();
      }
      
      this.operation = op;
      this.previousInput = this.currentInput;
      this.waitingForNewInput = true;
    },
    
    inputDecimal() {
      if (this.waitingForNewInput) {
        this.currentInput = '0.';
        this.waitingForNewInput = false;
      } else if (this.currentInput.indexOf('.') === -1) {
        this.currentInput += '.';
      }
      this.updateDisplay();
    },
    
    calculate() {
      if (this.previousInput === '' || this.waitingForNewInput) return;
      
      let result;
      const prev = parseFloat(this.previousInput);
      const current = parseFloat(this.currentInput);
      
      switch(this.operation) {
        case '+':
          result = prev + current;
          break;
        case '-':
          result = prev - current;
          break;
        case '*':
          result = prev * current;
          break;
        case '/':
          if (current === 0) {
            utils.showNotification('Cannot divide by zero!', 'error');
            return;
          }
          result = prev / current;
          break;
        default:
          return;
      }
      
      this.currentInput = result.toString();
      this.operation = null;
      this.previousInput = '';
      this.waitingForNewInput = true;
      this.updateDisplay();
    },
    
    clear() {
      this.currentInput = '0';
      this.previousInput = '';
      this.operation = null;
      this.waitingForNewInput = false;
      this.updateDisplay();
    },
    
    delete() {
      if (this.currentInput.length === 1) {
        this.currentInput = '0';
      } else {
        this.currentInput = this.currentInput.slice(0, -1);
      }
      this.updateDisplay();
    },
    
    updateDisplay() {
      this.display.value = this.currentInput;
    }
  };

  // Interactive Demo Features (trimmed)
  const DemoFeatures = {
    init() {
      this.setupCodeHighlighting();
    },

    setupCodeHighlighting() {
      const codeBlocks = $$('pre.code');
      codeBlocks.forEach(block => {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.style.cssText = `position:absolute;top:0.5rem;right:0.5rem;`;
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(block.textContent).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
          });
        });
        block.style.position = 'relative';
        block.appendChild(copyBtn);
      });
    }
  };

  function init() {
    ThemeManager.init();
    TodoManager.init();
    FormValidator.init();
    Calculator.init();
    DemoFeatures.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
