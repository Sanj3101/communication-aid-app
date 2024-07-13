let icons = [];
let favorites = [];
let currentCategory = 'all';

document.getElementById('new-icon').addEventListener('click', () => {
    document.getElementById('icon-modal').style.display = 'block';
});

document.getElementsByClassName('close')[0].addEventListener('click', () => {
    document.getElementById('icon-modal').style.display = 'none';
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

function showCategory(category) {
    currentCategory = category;
    displayIcons();
}

// Initial load
loadIcons();
loadFavorites();
displayIcons();
