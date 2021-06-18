const HOMEPAGE_TITLE = document.title;

function addClassToAll( nodeList, className ){
    nodeList.forEach( node => node.classList.add(className) )
}
function removeClassFromAll( nodeList, className ){
    nodeList.forEach( node => node.classList.remove(className) )
}
function openArticle( articleElem ){
    articleElem.classList.add("single-post");
    articleElem.querySelector('.back-button').classList.remove('hidden')
    
    // Animate hiding other article headers 
    const articlesToClose = [...document.querySelectorAll("article:not(.single-post)")]
    
    addClassToAll(articlesToClose, "header-leave");

    setTimeout(function(){
        addClassToAll( articlesToClose, "hidden" );
        removeClassFromAll(articlesToClose, "header-leave");
    }, 1000);

    // Scroll to the top
    window.scrollBy({left: 0, top: -window.pageYOffset, behavior: 'smooth'})

    // Change url
    const linkElem = articleElem.querySelector("header > a");
    history.pushState({}, null, linkElem.getAttribute('href'));
    document.title = articleElem.querySelector('h1').innerText + " |" + HOMEPAGE_TITLE.split('|')[1]

    // Add content
    if ( !articleElem.querySelector('.content') ) {
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('animate')
        contentContainer.classList.add('content')
        fetch("/post-data/"+articleElem.dataset.slug)
            .then( response => response.text() )
            .then( content => {
                contentContainer.innerHTML = content;
                articleElem.appendChild(contentContainer);
            })
    }
}

function closeArticle( articleElem ){
    // Remove the content
    const contentToDelete = articleElem.querySelector('.content');
    if (contentToDelete){
        contentToDelete.parentElement.removeChild(contentToDelete);
    }

    // Animate the other articles back
    const articlesToOpen = [...document.querySelectorAll("article:not(.single-post)")];
    addClassToAll( articlesToOpen, "header-enter" );
    removeClassFromAll(articlesToOpen, "hidden");

    setTimeout(function(){
        removeClassFromAll(articlesToOpen, "header-enter");
    }, 1000);

    const articleIndex = [...document.querySelectorAll("article")].findIndex( article => article === articleElem );
    const headerHeight = articleElem.children[0].offsetHeight;
    const centeredArticleYPosition = Math.floor( headerHeight * articleIndex - headerHeight*0.7 );
    const scrollToArticle = () => window.scrollBy({left: 0, top: centeredArticleYPosition - window.pageYOffset, behavior: 'smooth'})
    // Scroll to the article as soon as possible
    setTimeout(scrollToArticle, 350);
    // Before the animation stops, scroll agian
    // (Helps with older articles)
    setTimeout(scrollToArticle, 900);

    articleElem.classList.remove("single-post");
    articleElem.querySelector('.back-button').classList.add('hidden')

    // Set the url to the homepage
    history.pushState({}, null, "/");
    document.title = HOMEPAGE_TITLE;
}

function toggleOpenArticle( articleElem ){
    // If there's an animation in progress, ignore this
    if (document.querySelector(".header-enter, .header-exit")) return;

    // Are there other articles?
    const hiddenArticles = document.querySelectorAll('article.hidden');

    if ( hiddenArticles.length > 0 ) {
        closeArticle( articleElem );
        actions.push(
            () => closeArticle( articleElem )
        )
    } else {
        openArticle( articleElem )
        actions.push(
            () => openArticle( articleElem )
        )
    }
};

// Take care of back button functionality
let actions = [];
window.onpopstate = function( e ) {
    const prevAction = actions.slice(-2,-1)[0];
    console.log( e, prevAction, actions )
    if ( prevAction ) {
        prevAction();
        actions = actions.slice(0, -1)
    } else {
        // Must be the homepage
        closeArticle( document.querySelector('article:not(.hidden)') )
        actions = [];
    }
};

(() => {
    // For now, the animation only works if we start on the homepage
    if ( window.location.pathname !== '/' ) return;

    [...document.querySelectorAll('article > header > a')].forEach( linkElem => {
        const articleElem = linkElem.parentElement.parentElement;
        linkElem.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            toggleOpenArticle( articleElem );
        })
    });

    return;
})();