// World Digital Clock - JavaScript

let timeFormat = '24'; // 24 or 12 hour
let timezones = JSON.parse(localStorage.getItem('selectedTimezones')) || ['UTC', 'America/New_York', 'Asia/Tokyo'];

const timezoneNames = {
    'UTC': '🌐 UTC (London)',
    'America/New_York': '🗽 New York',
    'America/Los_Angeles': '🌅 Los Angeles',
    'Europe/Paris': '🇫🇷 Paris',
    'Asia/Tokyo': '🇯🇵 Tokyo',
    'Asia/Dubai': '🏜️ Dubai',
    'Australia/Sydney': '🦘 Sydney',
    'Asia/Kolkata': '🇮🇳 India',
    'Asia/Shanghai': '🏯 Shanghai',
    'America/Toronto': '🍁 Toronto',
    'Europe/Berlin': '🇩🇪 Berlin',
    'Asia/Bangkok': '🇹🇭 Bangkok',
    'America/Mexico_City': '🌮 Mexico City',
    'Europe/Moscow': '🇷🇺 Moscow',
    'Asia/Singapore': '🇸🇬 Singapore'
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderClocks();
    setInterval(updateAllClocks, 1000);
});

// Render all clocks
function renderClocks() {
    const grid = document.getElementById('clocks-grid');
    
    if (timezones.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="emoji">⏰</div>
                <p>No timezones selected. Add one to get started!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = timezones.map(tz => `
        <div class="clock-card">
            <div class="timezone-name">${timezoneNames[tz] || tz}</div>
            <div class="clock-display">
                <div class="time" id="time-${tz}">--:--:--</div>
                <div class="date" id="date-${tz}">Loading...</div>
                <div class="day-name" id="day-${tz}"></div>
            </div>
            <button class="remove-btn" onclick="removeTimezone('${tz}')">✕ Remove</button>
        </div>
    `).join('');

    updateAllClocks();
}

// Update all clocks
function updateAllClocks() {
    timezones.forEach(tz => {
        updateClock(tz);
    });
}

// Update single clock
function updateClock(timezone) {
    try {
        const now = new Date();
        const timeString = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour12: timeFormat === '12',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(now);

        const dateString = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(now);

        const dayString = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            weekday: 'long'
        }).format(now);

        document.getElementById(`time-${timezone}`).textContent = timeString;
        document.getElementById(`date-${timezone}`).textContent = dateString;
        document.getElementById(`day-${timezone}`).textContent = dayString;
    } catch (e) {
        console.error(`Error updating timezone ${timezone}:`, e);
    }
}

// Toggle time format
function toggleFormat(format) {
    timeFormat = format;
    
    // Update button styles
    document.querySelectorAll('.btn-format').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update all clocks
    updateAllClocks();
}

// Add timezone
function addTimezone() {
    const select = document.getElementById('add-timezone');
    const timezone = select.value;
    
    if (!timezone) {
        alert('Please select a timezone');
        return;
    }
    
    if (timezones.includes(timezone)) {
        alert('This timezone is already added');
        return;
    }
    
    if (timezones.length >= 12) {
        alert('Maximum 12 timezones allowed');
        return;
    }
    
    timezones.push(timezone);
    saveTimezones();
    renderClocks();
    select.value = '';
}

// Remove timezone
function removeTimezone(timezone) {
    timezones = timezones.filter(tz => tz !== timezone);
    saveTimezones();
    renderClocks();
}

// Save timezones to localStorage
function saveTimezones() {
    localStorage.setItem('selectedTimezones', JSON.stringify(timezones));
}