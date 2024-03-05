//collecting data from the API
fetch("http://localhost:5678/api/works")
  .then(response => response.json())
  .then(fetchedData => {
    data = fetchedData;
    console.log(data);
    display(data, 0);
    displayModal(data);
})
.catch(error => {
    console.error('Erreur lors de la récupération des données: ', error);
});

//for each item collected from the data, a HTML element is created
function display(data, asked_category){
    const container= document.getElementById('gallery');
    container.innerHTML="";

    data.forEach(item => {
        if(item.categoryId==asked_category || asked_category==0){ //applying item filter
            const categorie= item.categoryId;
            const figure= document.createElement("figure");
            figure.className = `categorie${categorie}`;

            const image=document.createElement("img");
            image.src = item.imageUrl;
            image.alt = item.title;

            const figcaption=document.createElement("figcaption");
            figcaption.innerHTML = item.title;

            figure.appendChild(image);
            figure.appendChild(figcaption);

            container.appendChild(figure);
        }
    });
}

document.getElementById('button_category_0').addEventListener('click', () => {
    display(data, 0);
});

function displayCategoryButtons(){
    fetch("http://localhost:5678/api/categories")
        .then(response => response.json())
        .then(fetchedData => {
            categoryData = fetchedData;
            const container = document.getElementById('categories');
            categoryData.forEach(item => {
                const button = document.createElement("button");
                button.innerHTML = item.name;
                button.className="category-button";
                button.id=`button_category_${item.id}`
                button.addEventListener('click', () => {
                    display(data, item.id)
                })
                container.appendChild(button);
            });
        })
}

function displayCategoryForm(){
    fetch("http://localhost:5678/api/categories")
        .then(response => response.json())
        .then(fetchedData => {
            categoryData = fetchedData;
            const container = document.getElementById('category');
            categoryData.forEach(item => {
                const option= document.createElement("option");
                option.innerHTML= item.name;
                option.value=item.id;
                container.appendChild(option);
            });
        })
}

//function triggering on the click on "modifier" button to display its gallery in the modal window
function displayModal(data){
    const container= document.getElementById('modal-gallery');
    container.innerHTML="";

    data.forEach(item => {
        const subContainer = document.createElement("div");
        subContainer.className="modal-images";

        const trashLogo = document.createElement("i");
        trashLogo.className=`fa-solid fa-trash-can fa-xs id_${item.id}`;  

        trashLogo.addEventListener('click', function(){
            deleteItem(item.id);
        });

        const image=document.createElement("img");
        image.src = item.imageUrl;
        image.alt = item.title;

        subContainer.appendChild(image);
        subContainer.appendChild(trashLogo);

        container.appendChild(subContainer);
    });
}

//delete an item from the API when the trash logo is clicked
function deleteItem(Id){
    fetch(`http://localhost:5678/api/works/${Id}`, {
        method: "DELETE",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if(response.ok){
            console.log('Item supprimé');
            fetch("http://localhost:5678/api/works")
                .then(response => response.json())
                .then(fetchedData => {
                    displayModal(fetchedData);
                    display(fetchedData, 0)
            })
        } 
        else {
            console.error('Erreur lors de la suppression:', response.statusText);
        }
    })
    .catch(error => console.error('Erreur:', error));
}

//adds an item in the API if every information is documented
async function addItem(event){
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData();

    let formTitle = document.getElementById('title').value;
    formData.append('title',  formTitle);

    let formImageUrl = document.getElementById('file').files[0];
    formData.append('image', formImageUrl);

    let formCategoryId = document.getElementById('category').value;
    formData.append('category', formCategoryId);
    
    let response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });
    closeModal(event);
    fetch("http://localhost:5678/api/works")
        .then(response => response.json())
        .then(fetchedData => {
            display(fetchedData, 0);
            displayModal(fetchedData)
    })
};


//Displays the preview of the image in the form
document.getElementById('file').addEventListener('change', function(event){
    const file = event.target.files[0]; 
    if (file){
        var fileType = file["type"];
        var validFileType = ["image/jpeg", "image/png"];
        //if the file isn't an image or exceeds 4Mo an alert pops up
        if (!validFileType.includes(fileType) || file.size > 4*1024*1024){
            alert("Veuillez sélectionner un fichier image valide (JPEG ou PNG) de 4Mo max.");
            return;
        }

        var imageReader = new FileReader();
        imageReader.onload = function(e){
            var img = document.createElement('img');
            img.src = e.target.result;
            var imageForm = document.getElementById('hidden-form');
            imageForm.classList.add("hidden");
            var preview = document.getElementById('image-preview');
            preview.appendChild(img);
        };
        imageReader.readAsDataURL(file);
    }
});

document.getElementById('modal-form').addEventListener('submit', addItem);

let token = localStorage.getItem('token');

//adds and remove classes from the html to hide and add content related to the administrator
function adminLoad(){
    if(token){
        document.getElementById("admin-header").classList.remove("hidden");
        document.getElementById("js-modal1").classList.remove("hidden");
        document.getElementById("categories").classList.add("hidden");
        document.getElementById("menu-login").classList.add("hidden");
        document.getElementById("menu-logout").classList.remove("hidden");
        const categoryButtons=document.querySelectorAll(".category-button");
        categoryButtons.forEach(function(button){
            button.classList.add("hidden");
        });
    }
}

//adds and remove classes from the html to hide and add content related to the administrator
function logout(){
    localStorage.setItem('token', '');
    document.getElementById("admin-header").classList.add("hidden");
    document.getElementById("js-modal1").classList.add("hidden");
    document.getElementById("categories").classList.remove("hidden");
    document.getElementById("menu-login").classList.remove("hidden");
    document.getElementById("menu-logout").classList.add("hidden");
    const categoryButtons=document.querySelectorAll(".category-button");
    categoryButtons.forEach(function(button){
        button.classList.remove("hidden");
    });
}

document.getElementById("menu-logout").addEventListener("click", logout)

document.addEventListener('DOMContentLoaded', adminLoad)
document.addEventListener('DOMContentLoaded', displayCategoryForm)
document.addEventListener('DOMContentLoaded', displayCategoryButtons)

let modal=null

const openModal = function(event){
    event.preventDefault()
    // if exists, close the actual openned modal
    if (modal !== null){
        closeModal(event);
    }
    // find the parent element if the href is not in the targeted anchor
    let target = event.target;
    while(target !== null && !target.href){
        target = target.parentNode;
    }
    //if we find that parent element, we open the new modal related to his href
    const newModal = document.querySelector(target.getAttribute('href'));
    if (newModal){
        newModal.classList.remove("hidden");
        newModal.removeAttribute('aria-hidden');
        newModal.setAttribute('aria-modal', 'true');
        modal = newModal;
        modal.addEventListener('click', closeModal);
        modal.querySelector('.close').addEventListener('click', closeModal);
        modal.querySelector('.modal-wrapper').addEventListener('click', stopPropagation);
    }
    
}

//closing the modal and clearing eventlistener
const closeModal = function(event){
    if(modal===null) return
    event.preventDefault()
    modal.classList.add("hidden");
    modal.setAttribute('aria-hidden', 'true')
    modal.removeAttribute('aria-modal')
    modal.removeEventListener('click', closeModal)
    modal.querySelector('.close').removeEventListener('click', closeModal)
    modal.querySelector('.modal-wrapper').removeEventListener('click', stopPropagation)
    modal=null
}

const stopPropagation = function(event){
    event.stopPropagation()
}

document.getElementById("js-modal1").addEventListener('click', openModal)
document.getElementById("add-image").addEventListener('click', openModal)
document.getElementById("modal-arrow-left1").addEventListener('click', openModal)