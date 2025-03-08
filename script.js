let cards = JSON.parse(localStorage.getItem('cards')) || [];
let draggedCardId = null;

const addCardBtn = document.getElementById('add-card-btn');
const deleteAllCardsBtn = document.getElementById('delete-all-cards-btn');
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');
const saveCardBtn = document.getElementById('save-card-btn');
const cardTitleInput = document.getElementById('card-title');
const cardDescriptionInput = document.getElementById('card-description');
let editingCardId = null; // شناسه کارتی که در حال ویرایش است

// Render cards
function renderCards() {
    const todoColumn = document.getElementById('todo');
    const doingColumn = document.getElementById('doing');
    const doneColumn = document.getElementById('done');

    todoColumn.innerHTML = '<h2>To Do</h2>';
    doingColumn.innerHTML = '<h2>Doing</h2>';
    doneColumn.innerHTML = '<h2>Done</h2>';

    cards.forEach((card) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.id = card.id;
        cardElement.draggable = true;

        // Add delete and edit buttons
        const deleteButton = `<button class="delete-card-btn" data-id="${card.id}"><i class="fas fa-trash-alt"></i></button>`;
        const editButton = `<button class="edit-card-btn" data-id="${card.id}"><i class="fas fa-edit"></i></button>`;

        cardElement.innerHTML = `
            <h3>${card.title}</h3>
            <p>${card.description}</p>
            <div class="card-actions">
                ${deleteButton}
                ${editButton}
            </div>
        `;
        cardElement.addEventListener('dragstart', dragStart);

        if (card.status === 'todo') {
            todoColumn.appendChild(cardElement);
        } else if (card.status === 'doing') {
            doingColumn.appendChild(cardElement);
        } else {
            doneColumn.appendChild(cardElement);
        }
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-card-btn').forEach((button) => {
        button.addEventListener('click', deleteCard);
    });

    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-card-btn').forEach((button) => {
        button.addEventListener('click', editCard);
    });
}

// Open modal
addCardBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    editingCardId = null; // اطمینان حاصل شود که در حالت افزودن کارت جدید هستیم
    cardTitleInput.value = '';
    cardDescriptionInput.value = '';
});

// Close modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    cardTitleInput.value = '';
    cardDescriptionInput.value = '';
    editingCardId = null; // پاک کردن شناسه کارت در حال ویرایش
});

// Save card
saveCardBtn.addEventListener('click', () => {
    const title = cardTitleInput.value.trim();
    const description = cardDescriptionInput.value.trim();

    if (!title || title.length === 0) {
        alert('Please enter a valid title.');
        return;
    }

    if (!description || description.length === 0) {
        alert('Please enter a valid description.');
        return;
    }

    if (editingCardId) {
        // ویرایش کارت موجود
        const cardIndex = cards.findIndex((card) => card.id === editingCardId);
        if (cardIndex !== -1) {
            cards[cardIndex].title = title;
            cards[cardIndex].description = description;
        }
        editingCardId = null; // پس از ویرایش، شناسه کارت در حال ویرایش را پاک کنید
    } else {
        // افزودن کارت جدید
        const newCard = {
            id: Date.now(),
            title: title,
            description: description,
            status: 'todo',
        };
        cards.push(newCard);
    }

    localStorage.setItem('cards', JSON.stringify(cards));
    renderCards();

    modal.style.display = 'none';
    cardTitleInput.value = '';
    cardDescriptionInput.value = '';
});

// Delete all cards
deleteAllCardsBtn.addEventListener('click', () => {
    if (cards.length === 0) {
        return; // اگر کارتی وجود ندارد، کاری انجام نده
    }

    if (confirm('Are you sure you want to delete all cards?')) {
        cards = [];
        localStorage.setItem('cards', JSON.stringify(cards));
        renderCards();
    }
});

// Delete card
function deleteCard(event) {
    const cardId = parseInt(event.currentTarget.dataset.id);
    cards = cards.filter((card) => card.id !== cardId);
    localStorage.setItem('cards', JSON.stringify(cards));
    renderCards();
}

// Edit card
function editCard(event) {
    editingCardId = parseInt(event.target.closest('.edit-card-btn').dataset.id); // ثبت شناسه کارت در حال ویرایش
    const card = cards.find((card) => card.id === editingCardId);

    cardTitleInput.value = card.title;
    cardDescriptionInput.value = card.description;
    modal.style.display = 'block';
}

// Drag & Drop
function dragStart(event) {
    draggedCardId = event.target.id;
    event.dataTransfer.setData('text', draggedCardId);
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const targetColumn = event.target;
    const cardId = event.dataTransfer.getData('text');
    const card = document.getElementById(cardId);

    if (card && targetColumn.classList.contains('column')) {
        targetColumn.appendChild(card);

        const cardIndex = cards.findIndex((c) => c.id === parseInt(cardId));
        cards[cardIndex].status = targetColumn.id;
        localStorage.setItem('cards', JSON.stringify(cards));
    }
}

renderCards();  
