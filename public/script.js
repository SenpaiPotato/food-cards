const API_KEY = "2dcb082567fd413193937ccd8ed6e5af";
const API_URL = "https://api.spoonacular.com/food/detect";

const titleForm = document.querySelector("#title-form");
const tagForm = document.querySelector("#tag-form");
const searchForm = document.querySelector("#filter-form");
const potentialTagsContainer = document.querySelector("#potential-tags");
const foodRef = firebase.database().ref();

const currentCards = {};
foodRef.on('value', (snapshot) => {
    const data = snapshot.val();
    for (const recordKey in data) {

        let card = data[recordKey];
        if (!currentCards.hasOwnProperty(recordKey)) {
            const parent = document.querySelector("#grid");
            const container = createInnerCard(card, recordKey);
            parent.appendChild(container);

            currentCards[recordKey] = card;
        }
    };

});



function createInnerCard(card, recordKey) {
    const container = document.createElement("div");
    container.classList.add("card");
    container.setAttribute("id", recordKey);

    const cardHeader = document.createElement("header");
    cardHeader.classList.add("card-header");

    const deleteCardButton = document.createElement("button");
    deleteCardButton.classList.add("is-danger", "delete");
    cardHeader.appendChild(deleteCardButton);
    
    deleteCardButton.addEventListener("click", e => {
        delete currentCards[recordKey];
        firebase.database().ref(recordKey).remove();
        container.remove();
    });

    container.appendChild(cardHeader);

    const cardImage = document.createElement("div");
    cardImage.classList.add("card-image");
    cardImage.innerHTML = `
                <figure class="image is-square">
              <img
                src="${card.imgURL}"
                alt="${card.title}"
              />
            </figure>
    `;

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");
    const content = document.createElement("div");
    content.classList.add("content");

    content.innerHTML = `
     <p class="title is-4">${card.title}</p>
    <p class="subtitle is-6">
    `;

    const tagsContainer = document.createElement("div");
    tagsContainer.classList.add("tags");
    if (!card.hasOwnProperty("tags")) {
        card["tags"] = [];
    }

    card.tags.forEach(tag => {
        tagsContainer.appendChild(buildTag(card, tag, recordKey));
    })        

    const addTagButton = document.createElement("button");
    addTagButton.classList.add("button", "is-small", "is-primary", "is-align-self-flex-end");
    addTagButton.textContent = "Add Tag";

    addTagButton.addEventListener('click', e => {
        let tag = prompt("New tag:").trim();
        
        if (tag !== null && tag !== "") {
            tagsContainer.insertBefore(buildTag(card, tag, recordKey), addTagButton)
            const updatedCard = {
                ...card,
                tags: card.tags.concat([tag]),
            };
            console.log(updatedCard);
            currentCards[recordKey] = updatedCard;
            firebase.database().ref(recordKey).set(updatedCard);
        }
    });

    tagsContainer.appendChild(addTagButton);

    content.appendChild(tagsContainer);
    cardContent.appendChild(content);

    container.appendChild(cardImage);
    container.appendChild(cardContent);
    return container;
}

function hideUnfilteredCards(searchTerm) {
    // Create a regular expression that checks if the search term is anywhere inside a string 
    // .* on both sides means that any characters can come before or after the search term
    const searchRe = new RegExp(`.*(${searchTerm.toLowerCase()}).*`, 'g');
    for (const cardKey in currentCards) {
        let card = currentCards[cardKey];
        // Check if the search term mastches the card titlee
        const foundTitleMatch = searchRe.test(card.title.toLowerCase());
        // Check if search term matches some (one or more) of the tags. If any matches, it returns true
        const foundTagMatch = card.tags.some(tagValue => searchRe.test(tagValue.toLowerCase()));
        if (searchTerm === "" || foundTitleMatch || foundTagMatch) {
            document.getElementById(cardKey).hidden = false;
        } else {
            document.getElementById(cardKey).hidden = true;
        }
    }
}
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function createCard() {
    let title = titleForm.value;
    // TODO Check for URL with re
    console.log(tagForm.value);
    // Get all new tags and get its value (Have to convert from NodeList returned by querySelector all to an Array)
    const tags = Array.from( document.querySelectorAll(".new-tag")).map(element => element.textContent.trim());
    
    removeAllChildNodes(potentialTagsContainer);

    console.log(tags);

    titleForm.value = "";
    tagForm.value = "";

    if (title === "") {
        alert("Need to input title");
        return;
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("text", title);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };


    fetch(`${API_URL}?apiKey=${API_KEY}`, requestOptions)
        .then(response => response.json())
        .then(data => {
            let annotations = data["annotations"];
            let imageURL;
            if (annotations.length < 1) {
                imageURL = "https://toppng.com/uploads/preview/clipart-free-seaweed-clipart-draw-food-placeholder-11562968708qhzooxrjly.png";
            } else {
                imageURL = annotations[0].image;
            }
            let card = {
                imgURL: imageURL,
                title: title,
                tags: tags
            };
            firebase.database().ref().push(card);

        });
}

searchForm.addEventListener('keyup', e => hideUnfilteredCards(e.target.value));
tagForm.addEventListener('change', e => {
    const tagValue = tagForm.value.trim();
    if (tagValue === "") {
        return;
    }

    
    const newTagElement = document.createElement("span");
    newTagElement.classList.add("new-tag", "tag", "is-dark");
    newTagElement.textContent = tagValue;
    const tagDeleteButton = document.createElement("button");
    tagDeleteButton.classList.add("delete");
    newTagElement.appendChild(tagDeleteButton);
    tagDeleteButton.addEventListener('click', event => {
        newTagElement.remove();
    });
    potentialTagsContainer.appendChild(newTagElement);

    tagForm.value = "";
});

function buildTag(card, tag, recordKey) {
    const currentTagElement = document.createElement('span');
    currentTagElement.classList.add("tag", "is-dark");
    const tagButton = document.createElement("button");
    tagButton.classList.add('delete');
    currentTagElement.textContent = tag;
    currentTagElement.appendChild(tagButton);
    tagButton.addEventListener('click', e => {
        currentTagElement.remove();
        const updatedCard = {
            ...card,
            tags: card.tags.filter(item => item !== tag),
        };
        console.log(updatedCard);
        currentCards[recordKey] = updatedCard;
        firebase.database().ref(recordKey).set(updatedCard);
    });

    return currentTagElement;
}

