//Take inputs and add to database
const titleForm = document.querySelector("#title-form");
const tagForm = document.querySelector("#tag-form");
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
              <p class="subtitle is-6">${Array.from(card.tags).map(tag => {
        return `<span class="tag is-dark">${tag}</span>`;
    }).join('')}</p>
            </div>
          </div>

  `;
}

function hideUnfilteredcards(searchTerm) {}

function createCard() {
    let title = titleForm.value;
    // TODO Check for URL with re
    console.log(tagForm.value);
    let tags = tagForm.value.split(",");

    const tagSet = new Set(tags.map(tag => tag.trim()));

    titleForm.value = "";
    tagForm.value = "";

    if (title === "") {
        alert("Need to input title");
        return;
    }


    fetch("https://foodish-api.herokuapp.com/api")
        .then(response => response.json())
        .then(data => {
            let card = {
                imgURL: data.image,
                title: title,
                tags: tags
            };
            firebase.database().ref().push(card);

        });



}