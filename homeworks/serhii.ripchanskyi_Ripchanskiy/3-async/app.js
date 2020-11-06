const getNode = (selector) => document.querySelector(selector);
const postsListNode = getNode('[data-posts-list]');
const loaderNode = getNode('[data-loader]');
const dataSortNode = getNode('[data-sort]');
const dataSearchInputNode = getNode('[data-search-input]');
const posts = [];
const initialPosts = [];
let sortBy = 'default';
let searchValue = '';

const handleErrors = (res) => {
    if (!res.ok) throw new Error('Something went wrong');
    return res;
};

const sortNamesByAsc = (a, b) => {
    const aFirstTitleWord = a.title.split(' ')[0].toLowerCase();
    const bFirstTitleWord = b.title.split(' ')[0].toLowerCase();
    if (aFirstTitleWord < bFirstTitleWord) {
        return -1;
    }
    if (aFirstTitleWord > bFirstTitleWord) {
        return 1;
    }
    return 0;
};

const search = (searchString, data) => {
    const keyWords = searchString.trim().toLowerCase();
    const filteredPosts = [];

    data.forEach((post) => {
        const postTitle = post.title.trim().toLowerCase();
        if (postTitle.indexOf(keyWords) !== -1) {
            filteredPosts.push(post);
        }
    });

    return filteredPosts;
};

async function getPosts() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    handleErrors(response);
    return response.json();
}

const renderPostsList = (postsData) => postsData.map(({ body, title }) => {
    const clearedTitle = title.replace(/[^\w\s]/gi, '');
    const clearedBody = body.replace(/[^\w\s]/gi, '');
    return `<li>${clearedTitle}<p>${clearedBody}</p></li>`;
}).join('');

const insertPosts = (postsData) => {
    postsListNode.insertAdjacentHTML('beforeend', renderPostsList(postsData));
};

const appendPosts = () => {
    getPosts()
        .then((data) => {
            postsListNode.insertAdjacentHTML('beforeend', renderPostsList(data));
            loaderNode.classList.toggle('loader-disable');
            posts.push(...data);
            initialPosts.push(...data);
        })
        .catch((error) => {
            console.log(error.message);
        });
};

setTimeout(appendPosts, 3000);

dataSortNode.addEventListener('change', (event) => {
    const sortingPattern = event.currentTarget.value;
    postsListNode.querySelectorAll('li').forEach((n) => n.remove());

    sortBy = event.currentTarget.value;
    postsListNode.querySelectorAll('li').forEach((n) => n.remove());

    if (sortingPattern === 'default') {
        sortBy = sortingPattern;
        insertPosts(searchValue ? search(searchValue, initialPosts) : initialPosts);
    } else {
        const searchedData = searchValue ? search(searchValue, posts) : posts;
        const postSorted = sortBy === 'desc' ? searchedData.sort(sortNamesByAsc).reverse() : searchedData.sort(sortNamesByAsc);
        insertPosts(postSorted);
        sortBy = sortingPattern;
    }
});

['input', 'paste'].forEach((evt) => dataSearchInputNode.addEventListener(evt, (event) => {
    searchValue = dataSearchInputNode.value;

    if (event.type === 'paste') {
        searchValue += event.clipboardData.getData('text');
    }
    postsListNode.querySelectorAll('li').forEach((n) => n.remove());

    if (sortBy === 'default') {
        insertPosts(searchValue ? search(searchValue, initialPosts) : initialPosts);
    } else {
        const searchedData = searchValue ? search(searchValue, posts) : posts;
        const postSorted = sortBy === 'desc' ? searchedData.sort(sortNamesByAsc).reverse() : searchedData.sort(sortNamesByAsc);
        insertPosts(postSorted);
    }
}));
