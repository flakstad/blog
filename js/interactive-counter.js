class InteractiveCounter extends HTMLElement {
  constructor() {
    super();
    this.count = 0;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --counter-bg: #f8f9fa;
          --counter-border: #dee2e6;
          --counter-text: #495057;
          --button-bg: #007bff;
          --button-hover: #0056b3;
          --button-text: white;
        }

        .counter-container {
          background: var(--counter-bg);
          border: 2px solid var(--counter-border);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          max-width: 300px;
          margin: 2rem auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .counter-title {
          margin: 0 0 1rem 0;
          color: var(--counter-text);
          font-size: 1.2rem;
          font-weight: 600;
        }

        .counter-display {
          font-size: 3rem;
          font-weight: bold;
          color: var(--counter-text);
          margin: 1rem 0;
          min-height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .counter-controls {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .counter-button {
          background: var(--button-bg);
          color: var(--button-text);
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 60px;
        }

        .counter-button:hover {
          background: var(--button-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .counter-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .counter-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .counter-reset {
          background: #6c757d;
          margin-top: 1rem;
        }

        .counter-reset:hover {
          background: #545b62;
        }

        .counter-info {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #6c757d;
        }

        @media (prefers-color-scheme: dark) {
          :host {
            --counter-bg: #2d3748;
            --counter-border: #4a5568;
            --counter-text: #e2e8f0;
            --button-bg: #3182ce;
            --button-hover: #2c5aa0;
          }
        }
      </style>

      <div class="counter-container">
        <h3 class="counter-title">Interactive Counter</h3>
        <div class="counter-display" id="display">0</div>
        <div class="counter-controls">
          <button class="counter-button" id="decrement">-</button>
          <button class="counter-button" id="increment">+</button>
        </div>
        <button class="counter-button counter-reset" id="reset">Reset</button>
        <div class="counter-info">
          Click the buttons to interact with the counter
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const incrementBtn = this.shadowRoot.getElementById('increment');
    const decrementBtn = this.shadowRoot.getElementById('decrement');
    const resetBtn = this.shadowRoot.getElementById('reset');
    const display = this.shadowRoot.getElementById('display');

    incrementBtn.addEventListener('click', () => {
      this.count++;
      this.updateDisplay();
      this.animateChange(display, 'positive');
    });

    decrementBtn.addEventListener('click', () => {
      this.count--;
      this.updateDisplay();
      this.animateChange(display, 'negative');
    });

    resetBtn.addEventListener('click', () => {
      this.count = 0;
      this.updateDisplay();
      this.animateChange(display, 'reset');
    });

    // Add keyboard support
    this.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowUp':
        case '+':
          e.preventDefault();
          incrementBtn.click();
          break;
        case 'ArrowDown':
        case '-':
          e.preventDefault();
          decrementBtn.click();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetBtn.click();
          break;
      }
    });

    // Make the component focusable
    this.setAttribute('tabindex', '0');
  }

  updateDisplay() {
    const display = this.shadowRoot.getElementById('display');
    display.textContent = this.count;
  }

  animateChange(element, type) {
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 100);
  }
}

// Register the custom element
customElements.define('interactive-counter', InteractiveCounter);
