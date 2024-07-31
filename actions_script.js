let icons = [];
let favorites = [];
let categories = ['greetings', 'needs', 'emotions'];
let currentCategory = 'all';
let usageCount = {};

document.getElementById('new-icon').addEventListener('click', () => {
    document.getElementById('icon-modal').style.display = 'block';
    populateCategoryOptions();
});

document.getElementById('add-category').addEventListener('click', () => {
    document.getElementById('category-modal').style.display = 'block';
});

document.getElementsByClassName('close')[0].addEventListener('click', () => {
    document.getElementById('icon-modal').style.display = 'none';
});

document.getElementsByClassName('close-category')[0].addEventListener('click', () => {
    document.getElementById('category-modal').style.display = 'none';
});

document.getElementById('icon-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const category = document.getElementById('category').value;
    const imageFile = document.getElementById('image').files[0];
    const audioFile = document.getElementById('audio').files[0];

    if (!imageFile || !audioFile) {
        alert('Please select both image and audio files.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;

        const audioReader = new FileReader();
        audioReader.onload = function(e) {
            const audioUrl = e.target.result;
            const icon = { category, imageUrl, audioUrl };
            icons.push(icon);
            saveIcons();
            displayIcons();
            document.getElementById('icon-form').reset();
            document.getElementById('icon-modal').style.display = 'none';
        };
        audioReader.readAsDataURL(audioFile);
    };
    reader.readAsDataURL(imageFile);
});

document.getElementById('category-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const newCategory = document.getElementById('new-category').value.trim();
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        saveCategories();
        displayCategories();
        document.getElementById('category-form').reset();
        document.getElementById('category-modal').style.display = 'none';
    } else {
        alert('Category already exists or is invalid.');
    }
});

function saveIcons() {
    localStorage.setItem('icons', JSON.stringify(icons));
}

function loadIcons() {
    const storedIcons = localStorage.getItem('icons');
    if (storedIcons) {
        icons = JSON.parse(storedIcons);
    }
}

function displayIcons() {
    const iconContainer = document.getElementById('icon-container');
    iconContainer.innerHTML = '';

    let filteredIcons = icons;
    if (currentCategory !== 'all') {
        filteredIcons = icons.filter(icon => icon.category === currentCategory || (currentCategory === 'favorites' && favorites.includes(icon)));
    }

    filteredIcons.forEach((icon, index) => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'icon';
        iconDiv.innerHTML = `
            <img src="${icon.imageUrl}" alt="Icon">
            <span class="favorite" onclick="toggleFavorite(${index})">${favorites.includes(icon) ? '★' : '☆'}</span>
            <button class="delete" onclick="deleteIcon(${index})">Delete</button>
        `;
        iconDiv.addEventListener('click', (event) => {
            if (event.target.tagName !== 'BUTTON') {
                const audio = new Audio(icon.audioUrl);
                audio.play();
                trackUsage(icon.category);
            }
        });
        iconContainer.appendChild(iconDiv);
    });
}

function deleteIcon(index) {
    icons.splice(index, 1);
    saveIcons();
    displayIcons();
}

function toggleFavorite(index) {
    const icon = icons[index];
    if (favorites.includes(icon)) {
        favorites = favorites.filter(fav => fav !== icon);
    } else {
        favorites.push(icon);
    }
    saveFavorites();
    displayIcons();
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadFavorites() {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
    }
}

function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

function loadCategories() {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
    }
}

function displayCategories() {
    const categoryContainer = document.getElementById('category-container');
    categoryContainer.innerHTML = `
        <button onclick="showCategory('all')">All</button>
        <button onclick="showCategory('favorites')">Favorites</button>
    `;
    categories.forEach(category => {
        const categoryButton = document.createElement('button');
        categoryButton.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryButton.onclick = () => showCategory(category);

        const deleteButton = document.createElement('span');
        deleteButton.className = 'delete-category';
        deleteButton.textContent = 'x';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            deleteCategory(category);
        };
        categoryButton.appendChild(deleteButton);

        categoryContainer.appendChild(categoryButton);
    });
    populateCategoryOptions();
}

function populateCategoryOptions() {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    });
}

function showCategory(category) {
    currentCategory = category;
    displayIcons();
}

function deleteCategory(category) {
    if (category === 'favorites' || category === 'all') {
        alert('Cannot delete default categories.');
        return;
    }

    categories = categories.filter(cat => cat !== category);
    icons = icons.filter(icon => icon.category !== category);
    saveCategories();
    saveIcons();
    displayCategories();
    displayIcons();
}

function trackUsage(category) {
    usageCount[category] = (usageCount[category] || 0) + 1;
    saveUsageCount();
    displaySuggestions();
}

function saveUsageCount() {
    localStorage.setItem('usageCount', JSON.stringify(usageCount));
}

function loadUsageCount() {
    const storedUsageCount = localStorage.getItem('usageCount');
    if (storedUsageCount) {
        usageCount = JSON.parse(storedUsageCount);
    }
}

function getSuggestions() {
    const suggestions = Object.keys(usageCount).sort((a, b) => usageCount[b] - usageCount[a]);
    return suggestions.slice(0, 5); // Return top 5 suggestions
}

function displaySuggestions() {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';

    const suggestions = getSuggestions();
    suggestions.forEach(suggestion => {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'suggestion';
        suggestionDiv.textContent = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
        suggestionDiv.onclick = () => showCategory(suggestion);
        suggestionsContainer.appendChild(suggestionDiv);
    });
}

// Initial load
loadIcons();
loadFavorites();
loadCategories();
loadUsageCount();
displayCategories();
displayIcons();