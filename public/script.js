//Take inputs and add to database
const titleForm = document.querySelector("#title-form");
const tagForm = document.querySelector("#tag-form");
const searchForm = document.querySelector("#filter-form");
const foodRef = firebase.database().ref();

const currentCards = {};
foodRef.on('value', (snapshot) => {
    const data = snapshot.val();
    for (const recordKey in data) {

        let card = data[recordKey];
        if (!currentCards.hasOwnProperty(recordKey)) {
            const parent = document.querySelector("#grid");
            const container = document.createElement("div");
            container.setAttribute("id", recordKey);
            container.classList.add("card");
            container.innerHTML = createInnerCard(card);
            parent.appendChild(container);

            currentCards[recordKey] = card;
        }
    };

});



function createInnerCard(card) {
    return `
        <!-- CARD -->
        
          <div class="card-image">
            <figure class="image is-square">
              <img
                src="${card.imgURL}"
                alt="${card.title}"
              />
            </figure>
          </div>
          <div class="card-content">
            <div class="content">
              <p class="title is-4">${card.title}</p>
              <p class="subtitle is-6">${card.tags.map(tag => {
        return `<span class="tag is-dark">${tag}</span>`;
    }).join('')}</p>
            </div>
          </div>

  `;
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

function createCard() {
    let title = titleForm.value;
    // TODO Check for URL with re
    console.log(tagForm.value);
    let tags = tagForm.value.split(",");


    titleForm.value = "";
    tagForm.value = "";

    if (title === "") {
        alert("Need to input title");
        return;
    }


    fetch("https://foodish-api.herokuapp.com/api")
        .then(response => response.json())
        .then(data => {
            tags = tags.map(tag => tag.trim());
            let card = {
                imgURL: data.image,
                title: title,
                tags: tags
            };
            firebase.database().ref().push(card);

        });
}

searchForm.addEventListener('keyup', e => hideUnfilteredCards(e.target.value));
