// Globální proměnné a nastavení
const RATES = {
    'maru': 275,
    'marty': 400
};

const DEDUCTION_RATES = {
    'maru': 0.3333, // 1/3
    'marty': 0.5    // 1/2
};

// Inicializace aplikace po načtení dokumentu
document.addEventListener('DOMContentLoaded', function() {
    // Nastavení aktuálního roku v patičce
    document.getElementById('footer-year').textContent = new Date().getFullYear();

    // Inicializace dat v local storage, pokud neexistují
    initializeData();

    // Inicializace navigace
    initNavigation();

    // Načtení kategorií do select elementů
    loadCategories();

    // Inicializace časovače
    initTimer();

    // Formulář pro ruční zadání záznamu
    initManualEntryForm();

    // Formulář pro přidání finančního záznamu
    initFinanceForm();

    // Inicializace správy dluhů
    initDebtManagement();

    // Inicializace filtrů a přehledů
    initFilters();

    // Inicializace grafů
    initCharts();

    // Inicializace exportu dat
    initExportFunctions();

    // Inicializace nastavení
    initSettings();

    // Nastavení dnešního data ve formulářích
    setTodaysDate();
});

// Inicializace dat v local storage
function initializeData() {
    // Work logs
    if (!localStorage.getItem('workLogs')) {
        localStorage.setItem('workLogs', JSON.stringify([]));
    }

    // Finance records
    if (!localStorage.getItem('financeRecords')) {
        localStorage.setItem('financeRecords', JSON.stringify([]));
    }

    // Task categories
    if (!localStorage.getItem('taskCategories')) {
        localStorage.setItem('taskCategories', JSON.stringify([
            'Administrativa', 
            'Marketing', 
            'Programování', 
            'Grafika', 
            'Schůzky'
        ]));
    }

    // Expense categories
    if (!localStorage.getItem('expenseCategories')) {
        localStorage.setItem('expenseCategories', JSON.stringify([
            'Nákupy', 
            'Účty', 
            'Nájem', 
            'Doprava', 
            'Zábava', 
            'Jídlo'
        ]));
    }

    // Debts
    if (!localStorage.getItem('debts')) {
        localStorage.setItem('debts', JSON.stringify([]));
    }

    // Debt payments
    if (!localStorage.getItem('debtPayments')) {
        localStorage.setItem('debtPayments', JSON.stringify([]));
    }

    // Rent settings
    if (!localStorage.getItem('rentSettings')) {
        localStorage.setItem('rentSettings', JSON.stringify({
            amount: 0,
            day: 1
        }));
    }
}

// Inicializace navigace
function initNavigation() {
    // Menu toggle
    const menuToggle = document.getElementById('toggle-menu');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('show');
        });
    }

    // Navigační odkazy
    const navLinks = document.querySelectorAll('.main-nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Skrytí menu na mobilních zařízeních po kliknutí
            mainNav.classList.remove('show');

            // Odstranění aktivní třídy ze všech odkazů
            navLinks.forEach(l => l.classList.remove('active'));

            // Přidání aktivní třídy na aktuální odkaz
            this.classList.add('active');

            // Zobrazení příslušné sekce
            const targetId = this.getAttribute('data-section');
            document.querySelectorAll('main > section').forEach(section => {
                section.classList.remove('active');
            });

            document.getElementById(targetId).classList.add('active');

            // Aktualizace URL hash
            window.location.hash = targetId;
        });
    });

    // Kontrola URL hash při načtení stránky
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetLink = document.querySelector(`.main-nav a[data-section="${targetId}"]`);

        if (targetLink) {
            targetLink.click();
        }
    }
}

// Načtení kategorií do select elementů
function loadCategories() {
    try {
        // Načtení kategorií úkolů
        const taskCategories = JSON.parse(localStorage.getItem('taskCategories')) || [];
        const taskSelects = document.querySelectorAll('#timer-activity, #manual-activity, #filter-activity');

        taskSelects.forEach(select => {
            // Vyčištění stávajících možností kromě první (placeholder)
            while (select.options.length > 1) {
                select.remove(1);
            }

            // Přidání kategorií
            taskCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
        });

        // Načtení kategorií výdajů
        const expenseCategories = JSON.parse(localStorage.getItem('expenseCategories')) || [];
        const financeCategory = document.getElementById('finance-category');

        if (financeCategory) {
            // Vyčištění stávajících možností kromě první (placeholder)
            while (financeCategory.options.length > 1) {
                financeCategory.remove(1);
            }

            // Přidání kategorií
            expenseCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                financeCategory.appendChild(option);
            });
        }

        // Zobrazení seznamů kategorií v nastavení
        displayCategoryLists();

        // Načtení dluhů pro formulář splátky
        loadDebtsForPaymentForm();

    } catch (error) {
        console.error('Chyba při načítání kategorií:', error);
    }
}

// Zobrazení seznamů kategorií v nastavení
function displayCategoryLists() {
    // Seznam kategorií úkolů
    const taskCategoriesList = document.getElementById('task-categories-list');
    const taskCategories = JSON.parse(localStorage.getItem('taskCategories')) || [];

    if (taskCategoriesList) {
        taskCategoriesList.innerHTML = '';

        if (taskCategories.length === 0) {
            taskCategoriesList.innerHTML = '<li class="empty-placeholder">Žádné kategorie úkolů.</li>';
        } else {
            taskCategories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${category}
                    <button class="delete-button" data-category="${category}" data-type="task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                taskCategoriesList.appendChild(li);
            });

            // Posluchače událostí pro tlačítka smazání
            taskCategoriesList.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', deleteCategoryHandler);
            });
        }
    }

    // Seznam kategorií výdajů
    const expenseCategoriesList = document.getElementById('expense-categories-list');
    const expenseCategories = JSON.parse(localStorage.getItem('expenseCategories')) || [];

    if (expenseCategoriesList) {
        expenseCategoriesList.innerHTML = '';

        if (expenseCategories.length === 0) {
            expenseCategoriesList.innerHTML = '<li class="empty-placeholder">Žádné kategorie výdajů.</li>';
        } else {
            expenseCategories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${category}
                    <button class="delete-button" data-category="${category}" data-type="expense">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                expenseCategoriesList.appendChild(li);
            });

            // Posluchače událostí pro tlačítka smazání
            expenseCategoriesList.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', deleteCategoryHandler);
            });
        }
    }
}

// Obsluha smazání kategorie
function deleteCategoryHandler() {
    const category = this.getAttribute('data-category');
    const type = this.getAttribute('data-type');

    if (confirm(`Opravdu chcete smazat kategorii "${category}"?`)) {
        try {
            if (type === 'task') {
                const taskCategories = JSON.parse(localStorage.getItem('taskCategories')) || [];
                const updatedCategories = taskCategories.filter(c => c !== category);
                localStorage.setItem('taskCategories', JSON.stringify(updatedCategories));
            } else if (type === 'expense') {
                const expenseCategories = JSON.parse(localStorage.getItem('expenseCategories')) || [];
                const updatedCategories = expenseCategories.filter(c => c !== category);
                localStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));
            }

            // Aktualizace seznamů a select elementů
            loadCategories();
        } catch (error) {
            console.error('Chyba při mazání kategorie:', error);
        }
    }
}

// Načtení dluhů pro formulář splátky
function loadDebtsForPaymentForm() {
    const paymentDebtSelect = document.getElementById('payment-debt-id');

    if (paymentDebtSelect) {
        // Vyčištění stávajících možností kromě první (placeholder)
        while (paymentDebtSelect.options.length > 1) {
            paymentDebtSelect.remove(1);
        }

        try {
            const debts = JSON.parse(localStorage.getItem('debts')) || [];

            // Filtrování dluhů, které mají zbývající částku k zaplacení
            const activeDebts = debts.filter(debt => {
                const payments = JSON.parse(localStorage.getItem('debtPayments')) || [];
                const debtPayments = payments.filter(payment => payment.debtId === debt.id);
                const totalPaid = debtPayments.reduce((sum, payment) => sum + payment.amount, 0);
                return totalPaid < debt.amount;
            });

            if (activeDebts.length > 0) {
                activeDebts.forEach(debt => {
                    const option = document.createElement('option');
                    option.value = debt.id;
                    option.textContent = `${debt.description} (${debt.person === 'maru' ? 'Maru' : 'Marty'}) - ${debt.amount} ${debt.currency}`;
                    paymentDebtSelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "-- Žádné aktivní dluhy --";
                option.disabled = true;
                paymentDebtSelect.appendChild(option);
            }
        } catch (error) {
            console.error('Chyba při načítání dluhů:', error);
        }
    }
}

// Nastavení dnešního data ve formulářích
function setTodaysDate() {
    const today = new Date().toISOString().substring(0, 10);
    const dateInputs = document.querySelectorAll('input[type="date"]');

    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
}

// ===== ČASOVAČ =====
let timerState = {
    running: false,
    startTime: null,
    pausedTime: 0,
    timerInterval: null,
    person: 'maru',
    activity: '',
    note: ''
};

function initTimer() {
    // Elementy časovače
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const stopBtn = document.getElementById('timer-stop');
    const personRadios = document.getElementsByName('timer-person');
    const activitySelect = document.getElementById('timer-activity');
    const noteInput = document.getElementById('timer-note-input');

    // Výchozí zobrazení časovače
    updateTimerDisplay('00:00:00');

    // Posluchače událostí pro tlačítka časovače
    if (startBtn) {
        startBtn.addEventListener('click', startTimer);
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseTimer);
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', stopTimer);
    }

    // Posluchače událostí pro výběr osoby
    personRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            timerState.person = this.value;
            updateTimerInfo();
        });
    });

    // Posluchač události pro výběr úkolu
    if (activitySelect) {
        activitySelect.addEventListener('change', function() {
            timerState.activity = this.value;
            updateTimerInfo();
        });
    }

    // Posluchač události pro poznámku
    if (noteInput) {
        noteInput.addEventListener('input', function() {
            timerState.note = this.value;
        });
    }
}

// Spuštění časovače
function startTimer() {
    // Kontrola, zda je vybrán úkol
    if (!document.getElementById('timer-activity').value) {
        alert('Vyberte prosím úkol před spuštěním časovače.');
        return;
    }

    // Aktualizace stavu tlačítek
    document.getElementById('timer-start').disabled = true;
    document.getElementById('timer-pause').disabled = false;
    document.getElementById('timer-stop').disabled = false;

    timerState.running = true;

    if (!timerState.startTime) {
        // První spuštění
        timerState.startTime = new Date().getTime() - timerState.pausedTime;
    } else {
        // Obnovení po pauze
        timerState.startTime = new Date().getTime() - timerState.pausedTime;
    }

    // Spuštění intervalu pro aktualizaci časovače
    timerState.timerInterval = setInterval(updateTimer, 1000);

    // Aktualizace informací o časovači
    updateTimerInfo();

    // Zobrazení časovače v hlavičce
    document.getElementById('header-timer').classList.remove('hidden');
}

// Pozastavení časovače
function pauseTimer() {
    if (!timerState.running) return;

    // Aktualizace stavu tlačítek
    document.getElementById('timer-start').disabled = false;
    document.getElementById('timer-pause').disabled = true;

    timerState.running = false;
    clearInterval(timerState.timerInterval);

    // Uložení uplynulého času
    timerState.pausedTime = new Date().getTime() - timerState.startTime;
}

// Zastavení a uložení časovače
function stopTimer() {
    if (!timerState.startTime) return;

    // Výpočet celkového času a výdělku
    const endTime = new Date().getTime();
    const totalTime = endTime - timerState.startTime;
    const totalHours = totalTime / (1000 * 60 * 60);
    const rate = RATES[timerState.person];
    const earnings = totalHours * rate;

    // Vytvoření záznamu o práci
    const workLog = {
        id: generateId(),
        person: timerState.person,
        activity: document.getElementById('timer-activity').value,
        note: document.getElementById('timer-note-input').value,
        startTime: new Date(timerState.startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration: totalTime,
        earnings: Math.round(earnings)
    };

    // Uložení záznamu
    saveWorkLog(workLog);

    // Restartování časovače
    resetTimer();

    // Informování uživatele
    alert(`Záznam byl uložen. Výdělek: ${Math.round(earnings)} Kč.`);
}

// Aktualizace zobrazení časovače
function updateTimer() {
    if (!timerState.running || !timerState.startTime) return;

    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - timerState.startTime;

    // Formátování času
    const formattedTime = formatTime(elapsedTime);

    // Aktualizace zobrazení hlavního časovače
    updateTimerDisplay(formattedTime);

    // Aktualizace zobrazení výdělku
    updateEarningsDisplay(elapsedTime);

    // Aktualizace časovače v hlavičce
    document.getElementById('header-timer-time').textContent = formattedTime;
}

// Formátování času v milisekundách na HH:MM:SS
function formatTime(ms) {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Aktualizace zobrazení časovače
function updateTimerDisplay(timeString) {
    const timerDisplay = document.getElementById('timer-time');
    if (timerDisplay) {
        timerDisplay.textContent = timeString;
    }
}

// Aktualizace zobrazení výdělku
function updateEarningsDisplay(elapsedTime) {
    const earningsDisplay = document.getElementById('timer-earnings');

    if (!earningsDisplay) return;

    const hours = elapsedTime / (1000 * 60 * 60);
    const rate = RATES[timerState.person];
    const earnings = hours * rate;

    earningsDisplay.textContent = `${Math.round(earnings)} Kč`;
}

// Aktualizace informací o časovači
function updateTimerInfo() {
    // Informace o osobě a úkolu v hlavním časovači
    const personName = timerState.person.charAt(0).toUpperCase() + timerState.person.slice(1);
    const activityName = document.getElementById('timer-activity').value;

    document.getElementById('timer-person').textContent = personName;
    document.getElementById('timer-activity-display').textContent = activityName || '';

    // Informace o osobě a úkolu v hlavičce
    document.getElementById('header-timer-person').textContent = personName;
    document.getElementById('header-timer-activity').textContent = activityName || '';
}

// Resetování časovače
function resetTimer() {
    // Zastavení časovače
    clearInterval(timerState.timerInterval);

    // Resetování stavu časovače
    timerState.running = false;
    timerState.startTime = null;
    timerState.pausedTime = 0;

    // Aktualizace zobrazení
    updateTimerDisplay('00:00:00');
    document.getElementById('timer-earnings').textContent = '';

    // Aktualizace stavu tlačítek
    document.getElementById('timer-start').disabled = false;
    document.getElementById('timer-pause').disabled = true;
    document.getElementById('timer-stop').disabled = true;

    // Skrytí časovače v hlavičce
    document.getElementById('header-timer').classList.add('hidden');
}

// Uložení záznamu o práci
function saveWorkLog(workLog) {
    try {
        const workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];
        workLogs.push(workLog);
        localStorage.setItem('workLogs', JSON.stringify(workLogs));

        // Aktualizace přehledů
        if (document.getElementById('work-logs-accordion')) {
            loadWorkLogs();
        }
    } catch (error) {
        console.error('Chyba při ukládání záznamu o práci:', error);
    }
}

// ===== RUČNÍ ZADÁNÍ ZÁZNAMU =====
function initManualEntryForm() {
    const manualEntryForm = document.getElementById('manual-entry-form');
    const cancelEditButton = document.getElementById('cancel-edit-button');

    if (manualEntryForm) {
        manualEntryForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Kontrola, zda je vybrán úkol
            if (!document.getElementById('manual-activity').value) {
                alert('Vyberte prosím úkol.');
                return;
            }

            // Získání hodnot z formuláře
            const id = document.getElementById('edit-log-id').value || generateId();
            const person = document.getElementById('manual-person').value;
            const date = document.getElementById('manual-date').value;
            const startTime = document.getElementById('manual-start-time').value;
            const endTime = document.getElementById('manual-end-time').value;
            const breakTime = parseInt(document.getElementById('manual-break-time').value) || 0;
            const activity = document.getElementById('manual-activity').value;
            const note = document.getElementById('manual-note').value;

            // Vytvoření objektů Date pro začátek a konec
            const startDate = new Date(`${date}T${startTime}`);
            const endDate = new Date(`${date}T${endTime}`);

            // Kontrola, zda je konec po začátku
            if (endDate <= startDate) {
                alert('Konec musí být po začátku.');
                return;
            }

            // Výpočet trvání v milisekundách (s odečtením pauzy)
            const durationMs = endDate.getTime() - startDate.getTime() - (breakTime * 60 * 1000);

            if (durationMs <= 0) {
                alert('Celková doba práce (po odečtení pauzy) musí být větší než 0.');
                return;
            }

            // Výpočet výdělku
            const durationHours = durationMs / (1000 * 60 * 60);
            const rate = RATES[person];
            const earnings = durationHours * rate;

            // Vytvoření záznamu o práci
            const workLog = {
                id: id,
                person: person,
                activity: activity,
                note: note,
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
                breakTime: breakTime,
                duration: durationMs,
                earnings: Math.round(earnings)
            };

            // Uložení nebo aktualizace záznamu
            if (document.getElementById('edit-log-id').value) {
                // Editace existujícího záznamu
                updateWorkLog(workLog);
                alert('Záznam byl upraven.');
            } else {
                // Nový záznam
                saveWorkLog(workLog);
                alert(`Záznam byl uložen. Výdělek: ${Math.round(earnings)} Kč.`);
            }

            // Resetování formuláře
            manualEntryForm.reset();
            document.getElementById('edit-log-id').value = '';
            document.getElementById('save-log-button').innerHTML = '<i class="fas fa-plus"></i> Přidat záznam';
            document.getElementById('cancel-edit-button').style.display = 'none';

            // Nastavení dnešního data
            setTodaysDate();
        });
    }

    // Tlačítko pro zrušení úpravy
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', function() {
            manualEntryForm.reset();
            document.getElementById('edit-log-id').value = '';
            document.getElementById('save-log-button').innerHTML = '<i class="fas fa-plus"></i> Přidat záznam';
            document.getElementById('cancel-edit-button').style.display = 'none';
            setTodaysDate();
        });
    }
}

// Aktualizace záznamu o práci
function updateWorkLog(workLog) {
    try {
        const workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];
        const index = workLogs.findIndex(log => log.id === workLog.id);

        if (index !== -1) {
            workLogs[index] = workLog;
            localStorage.setItem('workLogs', JSON.stringify(workLogs));

            // Aktualizace přehledů
            if (document.getElementById('work-logs-accordion')) {
                loadWorkLogs();
            }
        }
    } catch (error) {
        console.error('Chyba při aktualizaci záznamu o práci:', error);
    }
}

// ===== FINANCE =====
function initFinanceForm() {
    const financeForm = document.getElementById('finance-form');
    const cancelFinanceEditButton = document.getElementById('cancel-finance-edit-button');

    if (financeForm) {
        financeForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Získání hodnot z formuláře
            const id = document.getElementById('edit-finance-id').value || generateId();
            const type = document.getElementById('finance-type').value;
            const date = document.getElementById('finance-date').value;
            const description = document.getElementById('finance-description').value;
            const category = document.getElementById('finance-category').value;
            const amount = parseFloat(document.getElementById('finance-amount').value);
            const currency = document.getElementById('finance-currency').value;

            // Kontrola platnosti částky
            if (isNaN(amount) || amount <= 0) {
                alert('Zadejte platnou částku větší než 0.');
                return;
            }

            // Vytvoření finančního záznamu
            const financeRecord = {
                id: id,
                type: type,
                date: date,
                description: description,
                category: category,
                amount: amount,
                currency: currency
            };

            // Uložení nebo aktualizace záznamu
            if (document.getElementById('edit-finance-id').value) {
                // Editace existujícího záznamu
                updateFinanceRecord(financeRecord);
                alert('Finanční záznam byl upraven.');
            } else {
                // Nový záznam
                saveFinanceRecord(financeRecord);
                alert('Finanční záznam byl uložen.');
            }

            // Resetování formuláře
            financeForm.reset();
            document.getElementById('edit-finance-id').value = '';
            document.getElementById('save-finance-button').innerHTML = '<i class="fas fa-plus"></i> Přidat';
            document.getElementById('cancel-finance-edit-button').style.display = 'none';

            // Nastavení dnešního data
            setTodaysDate();

            // Načtení finančních záznamů
            loadFinanceRecords();
        });
    }

    // Tlačítko pro zrušení úpravy
    if (cancelFinanceEditButton) {
        cancelFinanceEditButton.addEventListener('click', function() {
            financeForm.reset();
            document.getElementById('edit-finance-id').value = '';
            document.getElementById('save-finance-button').innerHTML = '<i class="fas fa-plus"></i> Přidat';
            document.getElementById('cancel-finance-edit-button').style.display = 'none';
            setTodaysDate();
        });
    }

    // Načtení finančních záznamů při zobrazení sekce
    const financeLink = document.querySelector('a[data-section="finance"]');
    if (financeLink) {
        financeLink.addEventListener('click', loadFinanceRecords);
    }

    // Načtení finančních záznamů při načtení stránky
    loadFinanceRecords();
}

// Uložení finančního záznamu
function saveFinanceRecord(record) {
    try {
        const financeRecords = JSON.parse(localStorage.getItem('financeRecords')) || [];
        financeRecords.push(record);
        localStorage.setItem('financeRecords', JSON.stringify(financeRecords));
    } catch (error) {
        console.error('Chyba při ukládání finančního záznamu:', error);
    }
}

// Aktualizace finančního záznamu
function updateFinanceRecord(record) {
    try {
        const financeRecords = JSON.parse(localStorage.getItem('financeRecords')) || [];
        const index = financeRecords.findIndex(r => r.id === record.id);

        if (index !== -1) {
            financeRecords[index] = record;
            localStorage.setItem('financeRecords', JSON.stringify(financeRecords));
        }
    } catch (error) {
        console.error('Chyba při aktualizaci finančního záznamu:', error);
    }
}

// Načtení finančních záznamů
function loadFinanceRecords() {
    const financeTable = document.getElementById('finance-table');

    if (!financeTable) return;

    try {
        const financeRecords = JSON.parse(localStorage.getItem('financeRecords')) || [];

        if (financeRecords.length === 0) {
            financeTable.innerHTML = '<tr><td colspan="7" class="text-center empty-placeholder">Žádné finanční záznamy.</td></tr>';
            return;
        }

        // Seřazení záznamů podle data (nejnovější první)
        financeRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Vytvoření HTML pro záznamy
        const html = financeRecords.map(record => {
            // Formátování data
            const date = new Date(record.date).toLocaleDateString('cs-CZ');

            // Formátování typu
            const typeText = record.type === 'income' ? 'Příjem' : 'Výdaj';
            const typeClass = record.type === 'income' ? 'success-color' : 'danger-color';

            return `
                <tr>
                    <td class="${typeClass}">${typeText}</td>
                    <td>${record.description}</td>
                    <td>${record.amount.toFixed(2)}</td>
                    <td>${record.currency}</td>
                    <td>${date}</td>
                    <td>${record.category || '-'}</td>
                    <td>
                        <button class="edit-finance-button" data-id="${record.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-finance-button" data-id="${record.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        financeTable.innerHTML = html;

        // Přidání posluchačů událostí pro tlačítka úpravy a smazání
        financeTable.querySelectorAll('.edit-finance-button').forEach(button => {
            button.addEventListener('click', editFinanceRecord);
        });

        financeTable.querySelectorAll('.delete-finance-button').forEach(button => {
            button.addEventListener('click', deleteFinanceRecord);
        });
    } catch (error) {
        console.error('Chyba při načítání finančních záznamů:', error);
    }
}

// Úprava finančního záznamu
function editFinanceRecord() {
    const recordId = this.getAttribute('data-id');

    try {
        const financeRecords = JSON.parse(localStorage.getItem('financeRecords')) || [];
        const record = financeRecords.find(r => r.id === recordId);

        if (record) {
            // Naplnění formuláře daty
            document.getElementById('edit-finance-id').value = record.id;
            document.getElementById('finance-type').value = record.type;
            document.getElementById('finance-date').value = record.date;
            document.getElementById('finance-description').value = record.description;
            document.getElementById('finance-category').value = record.category || '';
            document.getElementById('finance-amount').value = record.amount;
            document.getElementById('finance-currency').value = record.currency;

            // Změna textu tlačítka a zobrazení tlačítka pro zrušení
            document.getElementById('save-finance-button').innerHTML = '<i class="fas fa-save"></i> Uložit změny';
            document.getElementById('cancel-finance-edit-button').style.display = 'inline-block';

            // Posun na formulář
            document.getElementById('finance-form').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Chyba při úpravě finančního záznamu:', error);
    }
}

// Smazání finančního záznamu
function deleteFinanceRecord() {
    const recordId = this.getAttribute('data-id');

    if (confirm('Opravdu chcete smazat tento finanční záznam?')) {
        try {
            const financeRecords = JSON.parse(localStorage.getItem('financeRecords')) || [];
            const updatedRecords = financeRecords.filter(r => r.id !== recordId);
            localStorage.setItem('financeRecords', JSON.stringify(updatedRecords));

            // Aktualizace zobrazení
            loadFinanceRecords();
        } catch (error) {
            console.error('Chyba při mazání finančního záznamu:', error);
        }
    }
}

// ===== SPRÁVA DLUHŮ =====
function initDebtManagement() {
    const debtForm = document.getElementById('debt-form');
    const paymentForm = document.getElementById('payment-form');
    const cancelDebtEditButton = document.getElementById('cancel-debt-edit-button');

    // Inicializace formuláře pro dluh
    if (debtForm) {
        debtForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Získání hodnot z formuláře
            const id = document.getElementById('edit-debt-id').value || generateId();
            const person = document.getElementById('debt-person').value;
            const description = document.getElementById('debt-description').value;
            const amount = parseFloat(document.getElementById('debt-amount').value);
            const currency = document.getElementById('debt-currency').value;
            const date = document.getElementById('debt-date').value;
            const dueDate = document.getElementById('debt-due-date').value || null;

            // Kontrola platnosti částky
            if (isNaN(amount) || amount <= 0) {
                alert('Zadejte platnou částku větší než 0.');
                return;
            }

            // Vytvoření záznamu o dluhu
            const debt = {
                id: id,
                person: person,
                description: description,
                amount: amount,
                currency: currency,
                date: date,
                dueDate: dueDate,
                createdAt: new Date().toISOString()
            };

            // Uložení nebo aktualizace záznamu
            if (document.getElementById('edit-debt-id').value) {
                // Editace existujícího záznamu
                updateDebt(debt);
                alert('Dluh byl upraven.');
            } else {
                // Nový záznam
                saveDebt(debt);
                alert('Dluh byl uložen.');
            }

            // Resetování formuláře
            debtForm.reset();
            document.getElementById('edit-debt-id').value = '';
            document.getElementById('save-debt-button').innerHTML = '<i class="fas fa-plus"></i> Přidat dluh';
            document.getElementById('cancel-debt-edit-button').style.display = 'none';

            // Nastavení dnešního data
            setTodaysDate();

            // Načtení dluhů
            loadDebts();

            // Aktualizace select elementu pro splátky
            loadDebtsForPaymentForm();
        });
    }

    // Tlačítko pro zrušení úpravy dluhu
    if (cancelDebtEditButton) {
        cancelDebtEditButton.addEventListener('click', function() {
            debtForm.reset();
            document.getElementById('edit-debt-id').value = '';
            document.getElementById('save-debt-button').innerHTML = '<i class="fas fa-plus"></i> Přidat dluh';
            document.getElementById('cancel-debt-edit-button').style.display = 'none';
            setTodaysDate();
        });
    }

    // Inicializace formuláře pro splátku
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Získání hodnot z formuláře
            const debtId = document.getElementById('payment-debt-id').value;
            const amount = parseFloat(document.getElementById('payment-amount').value);
            const date = document.getElementById('payment-date').value;
            const note = document.getElementById('payment-note').value;

            // Kontrola, zda je vybrán dluh
            if (!debtId) {
                alert('Vyberte prosím dluh pro splátku.');
                return;
            }

            // Kontrola platnosti částky
            if (isNaN(amount) || amount <= 0) {
                alert('Zadejte platnou částku větší než 0.');
                return;
            }

            // Kontrola, zda splátka nepřevyšuje zbývající částku dluhu
            const debts = JSON.parse(localStorage.getItem('debts')) || [];
            const debt = debts.find(d => d.id === debtId);

            if (debt) {
                const payments = JSON.parse(localStorage.getItem('debtPayments')) || [];
                const debtPayments = payments.filter(p => p.debtId === debtId);
                const totalPaid = debtPayments.reduce((sum, p) => sum + p.amount, 0);
                const remaining = debt.amount - totalPaid;

                if (amount > remaining) {
                    alert(`Splátka nemůže být vyšší než zbývající částka dluhu (${remaining.toFixed(2)} ${debt.currency}).`);
                    return;
                }
            }

            // Vytvoření záznamu o splátce
            const payment = {
                id: generateId(),
                debtId: debtId,
                amount: amount,
                date: date,
                note: note,
                createdAt: new Date().toISOString()
            };

            // Uložení splátky
            savePayment(payment);

            // Resetování formuláře
            paymentForm.reset();

            // Nastavení dnešního data
            setTodaysDate();

            // Načtení dluhů
            loadDebts();

            // Aktualizace select elementu pro splátky
            loadDebtsForPaymentForm();

            alert('Splátka byla uložena.');
        });
    }

    // Načtení dluhů při zobrazení sekce
    const srazkyLink = document.querySelector('a[data-section="srazky"]');
    if (srazkyLink) {
        srazkyLink.addEventListener('click', function() {
            loadDebts();
            loadDeductionsSummary();
        });
    }

    // Načtení dluhů při načtení stránky
    loadDebts();
    loadDeductionsSummary();
}

// Uložení dluhu
function saveDebt(debt) {
    try {
        const debts = JSON.parse(localStorage.getItem('debts')) || [];
        debts.push(debt);
        localStorage.setItem('debts', JSON.stringify(debts));
    } catch (error) {
        console.error('Chyba při ukládání dluhu:', error);
    }
}

// Aktualizace dluhu
function updateDebt(debt) {
    try {
        const debts = JSON.parse(localStorage.getItem('debts')) || [];
        const index = debts.findIndex(d => d.id === debt.id);

        if (index !== -1) {
            debts[index] = debt;
            localStorage.setItem('debts', JSON.stringify(debts));
        }
    } catch (error) {
        console.error('Chyba při aktualizaci dluhu:', error);
    }
}

// Uložení splátky
function savePayment(payment) {
    try {
        const payments = JSON.parse(localStorage.getItem('debtPayments')) || [];
        payments.push(payment);
        localStorage.setItem('debtPayments', JSON.stringify(payments));
    } catch (error) {
        console.error('Chyba při ukládání splátky:', error);
    }
}

// Načtení dluhů
function loadDebts() {
    const debtsList = document.getElementById('debts-list');

    if (!debtsList) return;

    try {
        const debts = JSON.parse(localStorage.getItem('debts')) || [];
        const payments = JSON.parse(localStorage.getItem('debtPayments')) || [];

        if (debts.length === 0) {
            debtsList.innerHTML = '<div class="accordion-empty">Žádné dluhy k zobrazení. Přidejte dluh níže.</div>';
            return;
        }

        // Vytvoření HTML pro dluhy
        const html = debts.map(debt => {
            // Výpočet zaplacené částky
            const debtPayments = payments.filter(p => p.debtId === debt.id);
            const totalPaid = debtPayments.reduce((sum, p) => sum + p.amount, 0);
            const remaining = debt.amount - totalPaid;
            const isPaid = remaining <= 0;

            // Formátování dat
            const dateCreated = new Date(debt.date).toLocaleDateString('cs-CZ');
            const dateDue = debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('cs-CZ') : '-';

            // Vytvoření HTML pro splátky
            let paymentsHtml = '';

            if (debtPayments.length > 0) {
                // Seřazení splátek podle data (nejnovější první)
                debtPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

                paymentsHtml = `
                    <div class="payments-list">
                        <h4>Splátky</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Datum</th>
                                    <th>Částka</th>
                                    <th>Poznámka</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${debtPayments.map(payment => {
                                    const paymentDate = new Date(payment.date).toLocaleDateString('cs-CZ');
                                    return `
                                        <tr>
                                            <td>${paymentDate}</td>
                                            <td>${payment.amount.toFixed(2)} ${debt.currency}</td>
                                            <td>${payment.note || '-'}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }

            // Výpočet procenta splacení
            const paymentPercentage = (totalPaid / debt.amount) * 100;

            return `
                <div class="accordion-item">
                    <div class="accordion-header" data-id="${debt.id}">
                        <div class="debt-header-info">
                            <span class="debt-person">${debt.person === 'maru' ? 'Maru' : 'Marty'}</span>
                            <span class="debt-description">${debt.description}</span>
                        </div>
                        <div class="debt-header-amount">
                            <span class="debt-status ${isPaid ? 'success-color' : 'warning-color'}">
                                ${isPaid ? 'Splaceno' : 'Aktivní'}
                            </span>
                            <span class="debt-amount">
                                ${totalPaid.toFixed(2)} / ${debt.amount.toFixed(2)} ${debt.currency}
                            </span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>
                    <div class="accordion-content">
                        <div class="debt-details">
                            <div class="debt-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${paymentPercentage}%;"></div>
                                </div>
                                <div class="progress-text">
                                    Splaceno: ${paymentPercentage.toFixed(1)}%
                                </div>
                            </div>

                            <div class="debt-info">
                                <p><strong>Osoba:</strong> ${debt.person === 'maru' ? 'Maru' : 'Marty'}</p>
                                <p><strong>Popis:</strong> ${debt.description}</p>
                                <p><strong>Celková částka:</strong> ${debt.amount.toFixed(2)} ${debt.currency}</p>
                                <p><strong>Zaplaceno:</strong> ${totalPaid.toFixed(2)} ${debt.currency}</p>
                                <p><strong>Zbývá:</strong> ${remaining.toFixed(2)} ${debt.currency}</p>
                                <p><strong>Datum vzniku:</strong> ${dateCreated}</p>
                                <p><strong>Datum splatnosti:</strong> ${dateDue}</p>
                            </div>

                            ${paymentsHtml}

                            <div class="debt-actions">
                                <button class="edit-debt-button" data-id="${debt.id}">
                                    <i class="fas fa-edit"></i> Upravit
                                </button>
                                <button class="delete-debt-button" data-id="${debt.id}">
                                    <i class="fas fa-trash-alt"></i> Smazat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        debtsList.innerHTML = html;

        // Přidání posluchačů událostí pro akordeony
        debtsList.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', function() {
                this.classList.toggle('active');
                const content = this.nextElementSibling;

                if (content.classList.contains('active')) {
                    content.classList.remove('active');
                } else {
                    content.classList.add('active');
                }
            });
        });

        // Přidání posluchačů událostí pro tlačítka úpravy a smazání
        debtsList.querySelectorAll('.edit-debt-button').forEach(button => {
            button.addEventListener('click', editDebt);
        });

        debtsList.querySelectorAll('.delete-debt-button').forEach(button => {
            button.addEventListener('click', deleteDebt);
        });
    } catch (error) {
        console.error('Chyba při načítání dluhů:', error);
    }
}

// Úprava dluhu
function editDebt(e) {
    e.stopPropagation();
    const debtId = this.getAttribute('data-id');

    try {
        const debts = JSON.parse(localStorage.getItem('debts')) || [];
        const debt = debts.find(d => d.id === debtId);

        if (debt) {
            // Naplnění formuláře daty
            document.getElementById('edit-debt-id').value = debt.id;
            document.getElementById('debt-person').value = debt.person;
            document.getElementById('debt-description').value = debt.description;
            document.getElementById('debt-amount').value = debt.amount;
            document.getElementById('debt-currency').value = debt.currency;
            document.getElementById('debt-date').value = debt.date;

            if (debt.dueDate) {
                document.getElementById('debt-due-date').value = debt.dueDate;
            } else {
                document.getElementById('debt-due-date').value = '';
            }

            // Změna textu tlačítka a zobrazení tlačítka pro zrušení
            document.getElementById('save-debt-button').innerHTML = '<i class="fas fa-save"></i> Uložit změny';
            document.getElementById('cancel-debt-edit-button').style.display = 'inline-block';

            // Posun na formulář
            document.getElementById('debt-form').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Chyba při úpravě dluhu:', error);
    }
}

// Smazání dluhu
function deleteDebt(e) {
    e.stopPropagation();
    const debtId = this.getAttribute('data-id');

    if (confirm('Opravdu chcete smazat tento dluh a všechny jeho splátky?')) {
        try {
            const debts = JSON.parse(localStorage.getItem('debts')) || [];
            const payments = JSON.parse(localStorage.getItem('debtPayments')) || [];

            // Odstranění dluhu
            const updatedDebts = debts.filter(d => d.id !== debtId);
            localStorage.setItem('debts', JSON.stringify(updatedDebts));

            // Odstranění splátek dluhu
            const updatedPayments = payments.filter(p => p.debtId !== debtId);
            localStorage.setItem('debtPayments', JSON.stringify(updatedPayments));

            // Aktualizace zobrazení
            loadDebts();

            // Aktualizace select elementu pro splátky
            loadDebtsForPaymentForm();
        } catch (error) {
            console.error('Chyba při mazání dluhu:', error);
        }
    }
}

// Načtení přehledu srážek
function loadDeductionsSummary() {
    const deductionsTable = document.getElementById('deductions-summary-table');

    if (!deductionsTable) return;

    try {
        const workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];

        if (workLogs.length === 0) {
            deductionsTable.innerHTML = '<tr><td colspan="5" class="text-center empty-placeholder">Žádné záznamy pro výpočet srážek.</td></tr>';
            return;
        }

        // Získání unikátních osob a měsíců
        const workLogsByMonth = {};

        workLogs.forEach(log => {
            const date = new Date(log.startTime);
            const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthKey = `${month}-${log.person}`;

            if (!workLogsByMonth[monthKey]) {
                workLogsByMonth[monthKey] = {
                    person: log.person,
                    month: month,
                    totalDuration: 0,
                    totalEarnings: 0
                };
            }

            workLogsByMonth[monthKey].totalDuration += log.duration;
            workLogsByMonth[monthKey].totalEarnings += log.earnings;
        });

        // Příprava dat pro tabulku
        const summaryData = Object.values(workLogsByMonth);

        // Seřazení podle data a osoby
        summaryData.sort((a, b) => {
            if (a.month !== b.month) {
                return b.month.localeCompare(a.month);
            }
            return a.person.localeCompare(b.person);
        });

        // Kontrola, zda je měsíc kompletní
        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

        // Vytvoření HTML pro tabulku
        const html = summaryData.map(summary => {
            // Přeskočení aktuálního měsíce
            if (summary.month === currentMonth) {
                return '';
            }

            // Formátování měsíce
            const [year, month] = summary.month.split('-');
            const monthText = new Date(year, month - 1, 1).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });

            // Výpočet srážky
            const deductionRate = DEDUCTION_RATES[summary.person];
            const deduction = Math.round(summary.totalEarnings * deductionRate);

            // Formátování doby
            const hours = Math.floor(summary.totalDuration / (1000 * 60 * 60));
            const minutes = Math.floor((summary.totalDuration % (1000 * 60 * 60)) / (1000 * 60));
            const formattedDuration = `${hours} h ${minutes} min`;

            return `
                <tr>
                    <td>${summary.person === 'maru' ? 'Maru' : 'Marty'}</td>
                    <td>${monthText}</td>
                    <td>${formattedDuration}</td>
                    <td>${summary.totalEarnings.toFixed(0)} Kč</td>
                    <td>${deduction.toFixed(0)} Kč</td>
                </tr>
            `;
        }).filter(html => html !== '').join('');

        if (html === '') {
            deductionsTable.innerHTML = '<tr><td colspan="5" class="text-center empty-placeholder">Žádné záznamy pro výpočet srážek.</td></tr>';
        } else {
            deductionsTable.innerHTML = html;
        }
    } catch (error) {
        console.error('Chyba při načítání přehledu srážek:', error);
    }
}

// ===== FILTRY A PŘEHLEDY =====
function initFilters() {
    const applyFiltersButton = document.getElementById('apply-filters');
    const resetFiltersButton = document.getElementById('reset-filters');

    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', function() {
            loadWorkLogs();
            updateCharts();
        });
    }

    if (resetFiltersButton) {
        resetFiltersButton.addEventListener('click', function() {
            // Resetování formuláře filtrů
            document.getElementById('filter-person').value = '';
            document.getElementById('filter-activity').value = '';
            document.getElementById('filter-start-date').value = '';
            document.getElementById('filter-end-date').value = '';

            // Znovu načtení záznamů a grafů
            loadWorkLogs();
            updateCharts();
        });
    }

    // Načtení přehledů při zobrazení sekce
    const prehledyLink = document.querySelector('a[data-section="prehledy"]');
    if (prehledyLink) {
        prehledyLink.addEventListener('click', function() {
            loadWorkLogs();
            updateCharts();
        });
    }

    // Přepínač typů grafů
    const chartTypeButtons = document.querySelectorAll('.chart-options button');
    if (chartTypeButtons.length > 0) {
        chartTypeButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Odstranění aktivní třídy ze všech tlačítek
                chartTypeButtons.forEach(btn => btn.classList.remove('active'));

                // Přidání aktivní třídy na kliknuté tlačítko
                this.classList.add('active');

                // Aktualizace grafu
                updateCharts();
            });
        });
    }
}

// Načtení záznamů o práci (s filtry)
function loadWorkLogs() {
    const workLogsAccordion = document.getElementById('work-logs-accordion');

    if (!workLogsAccordion) return;

    try {
        const workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];

        if (workLogs.length === 0) {
            workLogsAccordion.innerHTML = '<div class="accordion-empty">Žádné záznamy k zobrazení. Zkuste změnit filtry nebo přidejte záznam v sekci Docházka.</div>';
            return;
        }

        // Aplikace filtrů
        const filterPerson = document.getElementById('filter-person').value;
        const filterActivity = document.getElementById('filter-activity').value;
        const filterStartDate = document.getElementById('filter-start-date').value;
        const filterEndDate = document.getElementById('filter-end-date').value;

        const filteredLogs = workLogs.filter(log => {
            const logDate = new Date(log.startTime).toISOString().substring(0, 10);

            return (
                (!filterPerson || log.person === filterPerson) &&
                (!filterActivity || log.activity === filterActivity) &&
                (!filterStartDate || logDate >= filterStartDate) &&
                (!filterEndDate || logDate <= filterEndDate)
            );
        });

        if (filteredLogs.length === 0) {
            workLogsAccordion.innerHTML = '<div class="accordion-empty">Žádné záznamy odpovídající filtrům. Zkuste změnit filtry.</div>';
            return;
        }

        // Seřazení záznamů podle data (nejnovější první)
        filteredLogs.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        // Seskupení záznamů podle data
        const logsByDate = {};

        filteredLogs.forEach(log => {
            const date = new Date(log.startTime).toISOString().substring(0, 10);

            if (!logsByDate[date]) {
                logsByDate[date] = [];
            }

            logsByDate[date].push(log);
        });

        // Vytvoření HTML pro akordeon
        let html = '';

        Object.keys(logsByDate).sort((a, b) => b.localeCompare(a)).forEach(date => {
            const logs = logsByDate[date];
            const formattedDate = new Date(date).toLocaleDateString('cs-CZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            // Výpočet celkového času a výdělku za den
            const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
            const totalEarnings = logs.reduce((sum, log) => sum + log.earnings, 0);

            // Formátování celkového času
            const hours = Math.floor(totalDuration / (1000 * 60 * 60));
            const minutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));
            const formattedDuration = `${hours} h ${minutes} min`;

            html += `
                <div class="accordion-item">
                    <div class="accordion-header" data-date="${date}">
                        <div class="date-header-info">
                            <span class="date-text">${formattedDate}</span>
                            <span class="date-summary">${logs.length} záznam(ů), celkem ${formattedDuration}</span>
                        </div>
                        <div class="date-header-amount">
                            <span class="date-earnings">${totalEarnings.toFixed(0)} Kč</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>
                    <div class="accordion-content">
                        <div class="logs-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Osoba</th>
                                        <th>Úkol</th>
                                        <th>Začátek</th>
                                        <th>Konec</th>
                                        <th>Doba</th>
                                        <th>Výdělek</th>
                                        <th>Poznámka</th>
                                        <th>Akce</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${logs.map(log => {
                                        // Formátování časů
                                        const startTime = new Date(log.startTime).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
                                        const endTime = new Date(log.endTime).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });

                                        // Formátování doby
                                        const logHours = Math.floor(log.duration / (1000 * 60 * 60));
                                        const logMinutes = Math.floor((log.duration % (1000 * 60 * 60)) / (1000 * 60));
                                        const logDuration = `${logHours} h ${logMinutes} min`;

                                        return `
                                            <tr>
                                                <td>${log.person === 'maru' ? 'Maru' : 'Marty'}</td>
                                                <td>${log.activity}</td>
                                                <td>${startTime}</td>
                                                <td>${endTime}</td>
                                                <td>${logDuration}</td>
                                                <td>${log.earnings.toFixed(0)} Kč</td>
                                                <td>${log.note || '-'}</td>
                                                <td>
                                                    <button class="edit-log-button" data-id="${log.id}">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button class="delete-log-button" data-id="${log.id}">
                                                        <i class="fas fa-trash-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        });

        workLogsAccordion.innerHTML = html;

        // Přidání posluchačů událostí pro akordeon
        workLogsAccordion.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', function() {
                this.classList.toggle('active');
                const content = this.nextElementSibling;

                if (content.classList.contains('active')) {
                    content.classList.remove('active');
                } else {
                    content.classList.add('active');
                }
            });
        });

        // Přidání posluchačů událostí pro tlačítka úpravy a smazání
        workLogsAccordion.querySelectorAll('.edit-log-button').forEach(button => {
            button.addEventListener('click', editWorkLog);
        });

        workLogsAccordion.querySelectorAll('.delete-log-button').forEach(button => {
            button.addEventListener('click', deleteWorkLog);
        });
    } catch (error) {
        console.error('Chyba při načítání záznamů o práci:', error);
    }
}

// Úprava záznamu o práci
function editWorkLog(e) {
    e.stopPropagation();
    const logId = this.getAttribute('data-id');

    try {
        const workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];
        const log = workLogs.find(l => l.id === logId);

        if (log) {
            // Přepnutí na sekci Docházka
            document.querySelector('a[data-section="dochazka"]').click();

            // Naplnění formuláře pro ruční zadání záznamu
            document.getElementById('edit-log-id').value = log.id;
            document.getElementById('manual-person').value = log.person;

            // Formátování data a časů
            const startDate = new Date(log.startTime);
            const endDate = new Date(log.endTime);

            document.getElementById('manual-date').value = startDate.toISOString().substring(0, 10);
            document.getElementById('manual-start-time').value = startDate.toTimeString().substring(0, 5);
            document.getElementById('manual-end-time').value = endDate.toTimeString().substring(0, 5);

            document.getElementById('manual-break-time').value = log.breakTime || 0;
            document.getElementById('manual-activity').value = log.activity;
            document.getElementById('manual-note').value = log.note || '';

            // Změna textu tlačítka a zobrazení tlačítka pro zrušení
            document.getElementById('save-log-button').innerHTML = '<i class="fas fa-save"></i> Uložit změny';
            document.getElementById('cancel-edit-button').style.display = 'inline-block';

            // Posun na formulář
            document.getElementById('manual-entry-form').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Chyba při úpravě záznamu o práci:', error);
    }
}

// Smazání záznamu o práci
function deleteWorkLog(e) {
    e.stopPropagation();
    const logId = this.getAttribute('data-id');

    if (confirm('Opravdu chcete smazat tento záznam o práci?')) {
        try {
            const workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];
            const updatedLogs = workLogs.filter(l => l.id !== logId);
            localStorage.setItem('workLogs', JSON.stringify(updatedLogs));

            // Aktualizace zobrazení
            loadWorkLogs();
            updateCharts();
            loadDeductionsSummary();
        } catch (error) {
            console.error('Chyba při mazání záznamu o práci:', error);
        }
    }
}

// ===== GRAFY =====
let chart = null;

function initCharts() {
    // Inicializace grafů při načtení aplikace
    updateCharts();
}

function updateCharts() {
    const chartArea = document.getElementById('chart-area');
    const chartNoData = document.getElementById('chart-no-data');

    if (!chartArea || !chartNoData) return;

    try {
        const workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];

        // Aplikace filtrů
        const filterPerson = document.getElementById('filter-person')?.value;
        const filterActivity = document.getElementById('filter-activity')?.value;
        const filterStartDate = document.getElementById('filter-start-date')?.value;
        const filterEndDate = document.getElementById('filter-end-date')?.value;

        const filteredLogs = workLogs.filter(log => {
            const logDate = new Date(log.startTime).toISOString().substring(0, 10);

            return (
                (!filterPerson || log.person === filterPerson) &&
                (!filterActivity || log.activity === filterActivity) &&
                (!filterStartDate || logDate >= filterStartDate) &&
                (!filterEndDate || logDate <= filterEndDate)
            );
        });

        if (filteredLogs.length === 0) {
            // Zobrazení zprávy o žádných datech
            chartNoData.style.display = 'block';

            // Zničení existujícího grafu, pokud existuje
            if (chart) {
                chart.destroy();
                chart = null;
            }

            return;
        }

        // Skrytí zprávy o žádných datech
        chartNoData.style.display = 'none';

        // Určení typu grafu podle aktivního tlačítka
        const activeChartType = document.querySelector('.chart-options button.active')?.getAttribute('data-chart-type') || 'person';

        // Příprava dat pro graf
        let labels = [];
        let data = [];
        let backgroundColor = [];
        let title = '';

        switch (activeChartType) {
            case 'person':
                title = 'Rozdělení práce podle osoby (hodiny)';

                // Seskupení podle osoby
                const dataByPerson = {
                    'maru': 0,
                    'marty': 0
                };

                filteredLogs.forEach(log => {
                    dataByPerson[log.person] += log.duration / (1000 * 60 * 60);
                });

                labels = Object.keys(dataByPerson).map(person => person === 'maru' ? 'Maru' : 'Marty');
                data = Object.values(dataByPerson).map(hours => Math.round(hours * 100) / 100);
                backgroundColor = ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)'];
                break;

            case 'activity':
                title = 'Rozdělení práce podle úkolu (hodiny)';

                // Seskupení podle úkolu
                const dataByActivity = {};

                filteredLogs.forEach(log => {
                    if (!dataByActivity[log.activity]) {
                        dataByActivity[log.activity] = 0;
                    }

                    dataByActivity[log.activity] += log.duration / (1000 * 60 * 60);
                });

                labels = Object.keys(dataByActivity);
                data = Object.values(dataByActivity).map(hours => Math.round(hours * 100) / 100);

                // Generování barev pro každou aktivitu
                backgroundColor = labels.map((_, index) => {
                    const hue = (index * 137) % 360;
                    return `hsla(${hue}, 70%, 60%, 0.8)`;
                });
                break;

            case 'month':
                title = 'Rozdělení práce podle měsíce (hodiny)';

                // Seskupení podle měsíce
                const dataByMonth = {};

                filteredLogs.forEach(log => {
                    const date = new Date(log.startTime);
                    const month = date.toLocaleString('cs-CZ', { month: 'long', year: 'numeric' });

                    if (!dataByMonth[month]) {
                        dataByMonth[month] = 0;
                    }

                    dataByMonth[month] += log.duration / (1000 * 60 * 60);
                });

                // Seřazení měsíců chronologicky
                const monthNames = Object.keys(dataByMonth);
                const sortedMonths = monthNames.sort((a, b) => {
                    const [aMonth, aYear] = a.split(' ');
                    const [bMonth, bYear] = b.split(' ');

                    if (aYear !== bYear) {
                        return parseInt(aYear) - parseInt(bYear);
                    }

                    const monthOrder = {
                        'leden': 0, 'únor': 1, 'březen': 2, 'duben': 3, 'květen': 4, 'červen': 5,
                        'červenec': 6, 'srpen': 7, 'září': 8, 'říjen': 9, 'listopad': 10, 'prosinec': 11
                    };

                    return monthOrder[aMonth] - monthOrder[bMonth];
                });

                labels = sortedMonths;
                data = labels.map(month => Math.round(dataByMonth[month] * 100) / 100);

                // Generování barev pro každý měsíc
                backgroundColor = labels.map((_, index) => {
                    const hue = (index * 30) % 360;
                    return `hsla(${hue}, 70%, 60%, 0.8)`;
                });
                break;
        }

        // Vytvoření nebo aktualizace grafu
        if (chart) {
            chart.destroy();
        }

        chart = new Chart(chartArea, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColor,
                    borderColor: backgroundColor.map(color => color.replace('0.8', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: title,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const percentage = Math.round((value / data.reduce((a, b) => a + b, 0)) * 100);
                                return `${label}: ${value} h (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Chyba při aktualizaci grafů:', error);
    }
}

// ===== NASTAVENÍ =====
function initSettings() {
    // Přidání kategorie úkolu
    const addTaskCategoryBtn = document.getElementById('add-task-category');
    const newTaskCategoryInput = document.getElementById('new-task-category');

    if (addTaskCategoryBtn && newTaskCategoryInput) {
        addTaskCategoryBtn.addEventListener('click', function() {
            const newCategory = newTaskCategoryInput.value.trim();

            if (newCategory) {
                try {
                    const taskCategories = JSON.parse(localStorage.getItem('taskCategories')) || [];

                    // Kontrola, zda kategorie již neexistuje
                    if (taskCategories.includes(newCategory)) {
                        alert('Tato kategorie již existuje.');
                        return;
                    }

                    taskCategories.push(newCategory);
                    localStorage.setItem('taskCategories', JSON.stringify(taskCategories));

                    // Vyčištění vstupu
                    newTaskCategoryInput.value = '';

                    // Aktualizace seznamů a select elementů
                    loadCategories();
                } catch (error) {
                    console.error('Chyba při přidávání kategorie úkolu:', error);
                }
            }
        });
    }

    // Přidání kategorie výdajů
    const addExpenseCategoryBtn = document.getElementById('add-expense-category');
    const newExpenseCategoryInput = document.getElementById('new-expense-category');

    if (addExpenseCategoryBtn && newExpenseCategoryInput) {
        addExpenseCategoryBtn.addEventListener('click', function() {
            const newCategory = newExpenseCategoryInput.value.trim();

            if (newCategory) {
                try {
                    const expenseCategories = JSON.parse(localStorage.getItem('expenseCategories')) || [];

                    // Kontrola, zda kategorie již neexistuje
                    if (expenseCategories.includes(newCategory)) {
                        alert('Tato kategorie již existuje.');
                        return;
                    }

                    expenseCategories.push(newCategory);
                    localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));

                    // Vyčištění vstupu
                    newExpenseCategoryInput.value = '';

                    // Aktualizace seznamů a select elementů
                    loadCategories();
                } catch (error) {
                    console.error('Chyba při přidávání kategorie výdajů:', error);
                }
            }
        });
    }

    // Nastavení nájmu
    const saveRentSettingsBtn = document.getElementById('save-rent-settings');

    if (saveRentSettingsBtn) {
        saveRentSettingsBtn.addEventListener('click', function() {
            const rentAmount = parseFloat(document.getElementById('rent-amount').value);
            const rentDay = parseInt(document.getElementById('rent-day').value);

            if (isNaN(rentAmount) || isNaN(rentDay) || rentDay < 1 || rentDay > 31) {
                alert('Zadejte platné hodnoty pro nájem a den splatnosti.');
                return;
            }

            try {
                localStorage.setItem('rentSettings', JSON.stringify({
                    amount: rentAmount,
                    day: rentDay
                }));

                alert('Nastavení nájmu bylo uloženo.');
            } catch (error) {
                console.error('Chyba při ukládání nastavení nájmu:', error);
            }
        });

        // Načtení existujících nastavení nájmu
        try {
            const rentSettings = JSON.parse(localStorage.getItem('rentSettings')) || { amount: 0, day: 1 };
            document.getElementById('rent-amount').value = rentSettings.amount;
            document.getElementById('rent-day').value = rentSettings.day;
        } catch (error) {
            console.error('Chyba při načítání nastavení nájmu:', error);
        }
    }

    // Zálohování dat
    const backupDataBtn = document.getElementById('backup-data');

    if (backupDataBtn) {
        backupDataBtn.addEventListener('click', function() {
            try {
                const data = {
                    workLogs: JSON.parse(localStorage.getItem('workLogs')) || [],
                    financeRecords: JSON.parse(localStorage.getItem('financeRecords')) || [],
                    taskCategories: JSON.parse(localStorage.getItem('taskCategories')) || [],
                    expenseCategories: JSON.parse(localStorage.getItem('expenseCategories')) || [],
                    debts: JSON.parse(localStorage.getItem('debts')) || [],
                    debtPayments: JSON.parse(localStorage.getItem('debtPayments')) || [],
                    rentSettings: JSON.parse(localStorage.getItem('rentSettings')) || { amount: 0, day: 1 }
                };

                const jsonData = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const now = new Date();
                const dateStr = now.toISOString().substring(0, 10);
                const filename = `pracovni-vykazy-zaloha-${dateStr}.json`;

                // Vytvoření dočasného odkazu pro stažení
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = filename;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Chyba při zálohování dat:', error);
                alert('Chyba při zálohování dat. Zkuste to znovu.');
            }
        });
    }

    // Obnovení dat ze zálohy
    const importDataInput = document.getElementById('import-data-input');

    if (importDataInput) {
        importDataInput.addEventListener('change', function(e) {
            if (e.target.files.length === 0) return;

            const file = e.target.files[0];

            if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
                alert('Vyberte platný soubor JSON.');
                return;
            }

            if (confirm('Obnovením dat ze zálohy přepíšete všechna existující data. Chcete pokračovat?')) {
                const reader = new FileReader();

                reader.onload = function(event) {
                    try {
                        const data = JSON.parse(event.target.result);

                        // Kontrola platnosti dat
                        if (!data.workLogs || !data.financeRecords || !data.taskCategories || !data.expenseCategories || !data.debts || !data.debtPayments) {
                            throw new Error('Neplatný formát dat.');
                        }

                        // Uložení dat do local storage
                        localStorage.setItem('workLogs', JSON.stringify(data.workLogs));
                        localStorage.setItem('financeRecords', JSON.stringify(data.financeRecords));
                        localStorage.setItem('taskCategories', JSON.stringify(data.taskCategories));
                        localStorage.setItem('expenseCategories', JSON.stringify(data.expenseCategories));
                        localStorage.setItem('debts', JSON.stringify(data.debts));
                        localStorage.setItem('debtPayments', JSON.stringify(data.debtPayments));

                        if (data.rentSettings) {
                            localStorage.setItem('rentSettings', JSON.stringify(data.rentSettings));
                        }

                        alert('Data byla úspěšně obnovena ze zálohy. Stránka bude obnovena.');
                        location.reload();
                    } catch (error) {
                        console.error('Chyba při obnovování dat:', error);
                        alert('Chyba při obnovování dat. Ujistěte se, že máte platný soubor zálohy.');
                    }
                };

                reader.readAsText(file);
            }

            // Vyčištění vstupu pro případ, že by uživatel chtěl znovu nahrát stejný soubor
            e.target.value = '';
        });
    }

    // Smazání všech dat
    const clearAllDataBtn = document.getElementById('clear-all-data');

    if (clearAllDataBtn) {
        clearAllDataBtn.addEventListener('click', function() {
            if (confirm('POZOR! Opravdu chcete smazat všechna data? Tato akce je nevratná!')) {
                if (confirm('Poslední varování: Všechna vaše data budou smazána. Pokračovat?')) {
                    try {
                        localStorage.removeItem('workLogs');
                        localStorage.removeItem('financeRecords');
                        localStorage.removeItem('taskCategories');
                        localStorage.removeItem('expenseCategories');
                        localStorage.removeItem('debts');
                        localStorage.removeItem('debtPayments');
                        localStorage.removeItem('rentSettings');

                        alert('Všechna data byla smazána. Stránka bude obnovena.');
                        location.reload();
                    } catch (error) {
                        console.error('Chyba při mazání dat:', error);
                        alert('Chyba při mazání dat.');
                    }
                }
            }
        });
    }
}

// ===== EXPORT DAT =====
function initExportFunctions() {
    // Initialize event listeners for export buttons
    document.getElementById('export-work-logs')?.addEventListener('click', exportWorkLogs);
    document.getElementById('export-finance')?.addEventListener('click', exportFinance);
    document.getElementById('export-deductions')?.addEventListener('click', exportDeductions);
    document.getElementById('export-debts')?.addEventListener('click', exportDebts);
}

function exportWorkLogs() {
    try {
        const workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];

        if (workLogs.length === 0) {
            alert('Žádné záznamy k exportu.');
            return;
        }

        // Aplikace filtrů
        const filterPerson = document.getElementById('filter-person')?.value;
        const filterActivity = document.getElementById('filter-activity')?.value;
        const filterStartDate = document.getElementById('filter-start-date')?.value;
        const filterEndDate = document.getElementById('filter-end-date')?.value;

        const filteredLogs = workLogs.filter(log => {
            const logDate = new Date(log.startTime).toISOString().substring(0, 10);

            return (
                (!filterPerson || log.person === filterPerson) &&
                (!filterActivity || log.activity === filterActivity) &&
                (!filterStartDate || logDate >= filterStartDate) &&
                (!filterEndDate || logDate <= filterEndDate)
            );
        });

        if (filteredLogs.length === 0) {
            alert('Žádné záznamy odpovídající filtrům.');
            return;
        }

        // Vytvoření CSV dat
        let csvContent = 'Osoba,Úkol,Začátek,Konec,Doba (h),Výdělek (Kč),Poznámka\n';

        filteredLogs.forEach(log => {
            const person = log.person === 'maru' ? 'Maru' : 'Marty';
            const startTime = new Date(log.startTime).toLocaleString('cs-CZ');
            const endTime = new Date(log.endTime).toLocaleString('cs-CZ');
            const duration = (log.duration / (1000 * 60 * 60)).toFixed(2);
            const earnings = log.earnings.toFixed(0);
            const note = log.note ? `"${log.note.replace(/"/g, '""')}"` : '';

            csvContent += `${person},${log.activity},${startTime},${endTime},${duration},${earnings},${note}\n`;
        });

        // Export do souboru
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const dateStr = now.toISOString().substring(0, 10);
        const filename = `pracovni-vykazy-export-${dateStr}.csv`;

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Chyba při exportu záznamů:', error);
        alert('Chyba při exportu záznamů.');
    }
}

function exportFinance() {
    try {
        const financeRecords = JSON.parse(localStorage.getItem('financeRecords')) || [];

        if (financeRecords.length === 0) {
            alert('Žádné finanční záznamy k exportu.');
            return;
        }

        // Vytvoření CSV dat
        let csvContent = 'Typ,Popis,Částka,Měna,Datum,Kategorie\n';

        financeRecords.forEach(record => {
            const type = record.type === 'income' ? 'Příjem' : 'Výdaj';
            const date = new Date(record.date).toLocaleDateString('cs-CZ');
            const description = `"${record.description.replace(/"/g, '""')}"`;
            const category = record.category ? `"${record.category.replace(/"/g, '""')}"` : '';

            csvContent += `${type},${description},${record.amount.toFixed(2)},${record.currency},${date},${category}\n`;
        });

        // Export do souboru
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const dateStr = now.toISOString().substring(0, 10);
        const filename = `finance-export-${dateStr}.csv`;

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Chyba při exportu finančních záznamů:', error);
        alert('Chyba při exportu finančních záznamů.');
    }
}

function exportDeductions() {
    try {
        const workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];

        if (workLogs.length === 0) {
            alert('Žádné záznamy pro výpočet srážek.');
            return;
        }

        // Výpočet srážek podle měsíců
        const deductionsByMonth = {};

        workLogs.forEach(log => {
            const date = new Date(log.startTime);
            const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthKey = `${month}-${log.person}`;

            if (!deductionsByMonth[monthKey]) {
                deductionsByMonth[monthKey] = {
                    person: log.person,
                    month: month,
                    totalDuration: 0,
                    totalEarnings: 0
                };
            }

            deductionsByMonth[monthKey].totalDuration += log.duration;
            deductionsByMonth[monthKey].totalEarnings += log.earnings;
        });

        // Příprava dat pro CSV
        const summaryData = Object.values(deductionsByMonth);

        // Seřazení podle data a osoby
        summaryData.sort((a, b) => {
            if (a.month !== b.month) {
                return b.month.localeCompare(a.month);
            }
            return a.person.localeCompare(b.person);
        });

        // Kontrola, zda je měsíc kompletní
        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

        // Filtrace kompletních měsíců
        const completeMonths = summaryData.filter(summary => summary.month !== currentMonth);

        if (completeMonths.length === 0) {
            alert('Žádné kompletní měsíce pro výpočet srážek.');
            return;
        }

        // Vytvoření CSV dat
        let csvContent = 'Osoba,Měsíc,Celkem odpracováno (h),Hrubý výdělek (Kč),Srážka (%),Srážka (Kč)\n';

        completeMonths.forEach(summary => {
            const person = summary.person === 'maru' ? 'Maru' : 'Marty';
            const [year, month] = summary.month.split('-');
            const monthText = new Date(year, month - 1, 1).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });

            // Výpočet srážky
            const deductionRate = DEDUCTION_RATES[summary.person] * 100;
            const deduction = Math.round(summary.totalEarnings * DEDUCTION_RATES[summary.person]);

            // Formátování doby
            const hours = (summary.totalDuration / (1000 * 60 * 60)).toFixed(2);

            csvContent += `${person},${monthText},${hours},${summary.totalEarnings.toFixed(0)},${deductionRate.toFixed(2)},${deduction}\n`;
        });

        // Export do souboru
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const dateStr = now.toISOString().substring(0, 10);
        const filename = `srazky-export-${dateStr}.csv`;

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Chyba při exportu srážek:', error);
        alert('Chyba při exportu srážek.');
    }
}

function exportDebts() {
    try {
        const debts = JSON.parse(localStorage.getItem('debts')) || [];
        const payments = JSON.parse(localStorage.getItem('debtPayments')) || [];

        if (debts.length === 0) {
            alert('Žádné dluhy k exportu.');
            return;
        }

        // Vytvoření CSV dat pro dluhy
        let csvContent = 'Osoba,Popis,Celková částka,Měna,Datum vzniku,Datum splatnosti,Zaplaceno,Zbývá\n';

        debts.forEach(debt => {
            const person = debt.person === 'maru' ? 'Maru' : 'Marty';
            const dateCreated = new Date(debt.date).toLocaleDateString('cs-CZ');
            const dateDue = debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('cs-CZ') : '';

            // Výpočet zaplacené částky
            const debtPayments = payments.filter(p => p.debtId === debt.id);
            const totalPaid = debtPayments.reduce((sum, p) => sum + p.amount, 0);
            const remaining = debt.amount - totalPaid;

            // Popis (escapování uvozovek)
            const description = `"${debt.description.replace(/"/g, '""')}"`;

            csvContent += `${person},${description},${debt.amount.toFixed(2)},${debt.currency},${dateCreated},${dateDue},${totalPaid.toFixed(2)},${remaining.toFixed(2)}\n`;
        });

        // Export do souboru
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const dateStr = now.toISOString().substring(0, 10);
        const filename = `dluhy-export-${dateStr}.csv`;

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Chyba při exportu dluhů:', error);
        alert('Chyba při exportu dluhů.');
    }
}

// Pomocná funkce pro generování ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}