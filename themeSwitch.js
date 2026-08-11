// Theme switcher button with animation
document.addEventListener('DOMContentLoaded', function() {
    // First, let's create our theme toggle button
    const themeToggle = document.createElement('div');
    themeToggle.classList.add('theme-toggle');
    
    // Create the icons for sun and moon
    const sunIcon = document.createElement('div');
    sunIcon.classList.add('sun-icon');
    sunIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
      </svg>
    `;
    
    const moonIcon = document.createElement('div');
    moonIcon.classList.add('moon-icon');
    moonIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" />
      </svg>
    `;
    
    // Add icons to the toggle button
    themeToggle.appendChild(sunIcon);
    themeToggle.appendChild(moonIcon);
    
    // Add the button to the body
    document.body.appendChild(themeToggle);
    
    // Add CSS for the theme toggle
    const style = document.createElement('style');
    style.textContent = `
      .theme-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color:rgba(255, 255, 255, 0.94);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.75);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        transition: all 0.3s ease;
        overflow: hidden;
      }
      
      .theme-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 0 20px rgba(14, 14, 14, 0.87);
        border: 1px solid rgba(253, 253, 253, 0.63);
      }
      
      .sun-icon {
        position: absolute;
        width: 30px;
        height: 30px;
        color:rgb(185, 152, 42);
        transition: all 0.3s ease;
      }

       .moon-icon {
        position: absolute;
        width: 30px;
        height: 30px;
        color:rgb(255, 255, 255);
        transition: all 0.3s ease;
      }
      
      .sun-icon svg, .moon-icon svg {
        width: 100%;
        height: 100%;
      }
      
      /* For light theme */
      html.theme-light .moon-icon {
        opacity: 0;
        transform: rotate(180deg) scale(0);
      }
      
      html.theme-light .sun-icon {
        opacity: 1;
        transform: rotate(0) scale(1);
      }
      
      /* For dark theme */
      html.theme-dark .sun-icon {
        opacity: 0;
        transform: rotate(-180deg) scale(0);
      }
      
      html.theme-dark .moon-icon {
        opacity: 1;
        transform: rotate(0) scale(1);
      }
      
      /* Dark theme specific styling for the toggle button */
      html.theme-dark .theme-toggle {
        background-color: #0f12726c;
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
      }
      
      html.theme-dark .theme-toggle:hover {
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        border: 1px solid rgba(100, 100, 100, 0.63);
      }
      
      /* Auto theme behavior will depend on system settings */
      @media (prefers-color-scheme: dark) {
        html.theme-auto .sun-icon {
          opacity: 0;
          transform: rotate(-180deg) scale(0);
        }
        
        html.theme-auto .moon-icon {
          opacity: 1;
          transform: rotate(0) scale(1);
        }
        
        /* Apply dark theme styling for auto in dark mode */
        html.theme-auto .theme-toggle {
          background-color: rgba(30, 30, 30, 0.94);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
        }
        
        html.theme-auto .theme-toggle:hover {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          border: 1px solid rgba(100, 100, 100, 0.63);
        }
      }
      
      @media (prefers-color-scheme: light) {
        html.theme-auto .moon-icon {
          opacity: 0;
          transform: rotate(180deg) scale(0);
        }
        
        html.theme-auto .sun-icon {
          opacity: 1;
          transform: rotate(0) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
    
    // Initialize the current theme
    let currentTheme = document.documentElement.className.match(/theme-(auto|light|dark)/)?.[0] || 'theme-auto';
      
    // Function to update the theme and save preference
    function setTheme(theme) {
      // Remove all theme classes
      document.documentElement.classList.remove('theme-auto', 'theme-light', 'theme-dark');
      // Add the new theme class
      document.documentElement.classList.add(theme);
      // Store the preference
      localStorage.setItem('theme-preference', theme);
      // Update current theme tracking
      currentTheme = theme;
      
      // Add animation to the icons during transition
      if (theme === 'theme-light') {
        sunIcon.style.animation = 'fadeIn 0.5s forwards';
        moonIcon.style.animation = 'fadeOut 0.5s forwards';
      } else if (theme === 'theme-dark') {
        sunIcon.style.animation = 'fadeOut 0.5s forwards';
        moonIcon.style.animation = 'fadeIn 0.5s forwards';
      } else {
        // Auto theme - check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          sunIcon.style.animation = 'fadeOut 0.5s forwards';
          moonIcon.style.animation = 'fadeIn 0.5s forwards';
        } else {
          sunIcon.style.animation = 'fadeIn 0.5s forwards';
          moonIcon.style.animation = 'fadeOut 0.5s forwards';
        }
      }
    }
    
    // Check for saved theme preference or set a default
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // If no preference, use the one on HTML
      setTheme(currentTheme);
    }
    
    // Toggle through themes on click
    themeToggle.addEventListener('click', function() {
      // Cycle through themes: auto -> light -> dark -> auto
      if (currentTheme === 'theme-auto') {
        setTheme('theme-light');
      } else if (currentTheme === 'theme-light') {
        setTheme('theme-dark');
      } else {
        setTheme('theme-auto');
      }
      
      // Add click animation
      this.classList.add('clicked');
      setTimeout(() => {
        this.classList.remove('clicked');
      }, 300);
    });
    
    // Add keyframe animations
    const keyframes = document.createElement('style');
    keyframes.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: rotate(180deg) scale(0);
        }
        to {
          opacity: 1;
          transform: rotate(0) scale(1);
        }
      }
      
      @keyframes fadeOut {
        from {
          opacity: 1;
          transform: rotate(0) scale(1);
        }
        to {
          opacity: 0;
          transform: rotate(-180deg) scale(0);
        }
      }
      
      .theme-toggle.clicked {
        transform: scale(0.9);
      }
    `;
    document.head.appendChild(keyframes);
    
    // Listen for system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (currentTheme === 'theme-auto') {
          // Re-apply auto theme to update based on new system preference
          setTheme('theme-auto');
        }
      });
    }
  });