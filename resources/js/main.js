const models = (function () {
    class Blogs {
        constructor() { }

        getAllBlogs() {
            return fetch('https://mosia-blog.herokuapp.com', { method: 'GET' })
                .then(results => {
                    return results.json();
                })
                .then(AllBlogs => {
                    this.blogs = AllBlogs.allBlogs;
                    return this.blogs;
                })
                .catch(err => {
                    console.log(err);
                })
        };

        getOneBlog(id) {
            return fetch(`https://mosia-blog.herokuapp.com/blogs/${id}`, { method: 'GET' })
                .then(results => {
                    return results.json();
                })
                .then(blog => {
                    this.blog = blog.blog;
                    return this.blog;
                })
                .catch(err => {
                    console.log(err);
                })
        };
    }

    return {
        createNewBlogObject: async () => {
            let results = new Blogs();
            await results.getAllBlogs();
            return results.blogs;
        },
        getABlog: async (id) => {
            let results = new Blogs();
            await results.getOneBlog(id);
            return results.blog;
        }

    }
})();

const views = (function() {
    const DOMStrings = {
        // rootServer: 'http://localhost:8080',
        rootServer: 'https://mosia-blog.herokuapp.com',
        home: '.home-link',
        blogsHeading: '.blogs-heading',
        blogTitle: '.blog__title',
        blogText: '.bllog',
        blog: '.blog__text',
        other: '.other-blog',
        blogsContainer: '.blogs-container',
        recommendedBlog: '.recommended-blog__title',
        comments: '.comments',
        next: '.next',
        prev: '.prev',
    }
    const seletors = {
        home: document.querySelector('.home-link'),
        blogsHeading: document.querySelector('.blogs-heading'),
        blogTitle: document.querySelector('.blog__title'),
        blogText: document.querySelector('.bllog'),
        blog: document.querySelector('.blog__text'),
        other: document.querySelector('.other-blog'),
        blogsContainer: document.querySelector('.blogs-container'),
        comments: document.querySelector('.comments'),
        recommendedBlog: document.querySelector('#recommended-blog__title'),
        pageNumber: document.querySelector('.pageNumber'),
    }

    return {
        getDOMStrings: () => {
            return DOMStrings;
        },
        getSelectors: () => {
            return seletors;
        },
        clearInputField: () => {
            document.querySelector('.search-input').value = '';
        },
        getPageNumber: () => {
            return document.querySelector('.pageNumber').textContent.trim();
        },
        getNextPage: () => {
            let number = document.querySelector('.pageNumber').textContent.trim();
            return Math.ceil(number) + 1;
        },
        setTotalPages: (total) => {
            document.querySelector('.total-pages').textContent = Math.ceil(total);
        },
        getPreviousPage: () => {
            let number = document.querySelector('.pageNumber').textContent.trim();
            return Math.ceil(number) - 1;
        },
        renderBlogTitles: (blogs, start, itemsPerPage = 4) => {
            const found = [...blogs];
            seletors.blogsContainer.textContent = '';

            found.splice(start, itemsPerPage).forEach(blog => {
                
                seletors.blogsContainer.insertAdjacentHTML("afterbegin", `
                        <div class="other-blog" id="${blog._id}" 
                            style="background-image: 
                            linear-gradient(rgba(37, 37, 37, 0.853), rgba(27, 27, 27, 0.737)), 
                            url('${blog.imageUrl}')";>
                                ${blog.title}
                        </div>`
                )
            });
        },
        clearBlogArea: () => {
            seletors.blogText.style.opacity = '0';
            seletors.blogText.textContent = '';
        },
        clearBlogAreaAsync: () => {
            setTimeout(() => {
                seletors.blogText.textContent = '';
            }, 500);
            seletors.blogText.style.opacity = '0';
        },
        showBlog: () => {
            setTimeout(() => {
                seletors.blogText.style.opacity = '1';
            }, 200);
            seletors.blogText.style.display = 'block';
        },
        getBlogText: (res) => {
            return `
                    <h1 class="blog__title" style="background-image: linear-gradient(rgba(37, 37, 37, 0.853), rgba(27, 27, 27, 0.737)), url('${res.imageUrl}')">
                        ${res.title}
                    </h1>
                    <p class="blog__text">
                        ${res.text}
                        
                        <a class="delete" id="close">close</a>
                    </p>

                    <h2 class="heading">
                        recommended
                    </h2>
                    <div>
                        <h1 class="recommended-blog__title" id="recommended-blog__title">
                        </h1>
                    </div>`
        },
        renderComments: (comments) => {
            comments.forEach(comment => {
                com.insertAdjacentHTML('afterbegin', `  
                <h3 class="commenter">${comment.creator}</h3>
                <p class="comment-text">
                    ${comment.text}
                </p>`
                )
            })
        }
    }

})();

const controller = (function (models, views) {
    const state = {};
    const itemsPerPage = 2;
    const DOM = views.getDOMStrings();
    const selectors = views.getSelectors();

    const paginationLogic = () => {
        if (views.getPreviousPage() == 0) {
            document.querySelector(DOM.prev).style.opacity = '.2';
        }
        if (views.getNextPage() > itemsPerPage) {
            document.querySelector(DOM.next).style.opacity = '.2';
        }
        if (views.getPreviousPage() > 0) {
            document.querySelector(DOM.prev).style.opacity = '1';
        }
        if (views.getNextPage() <= Math.ceil(state.blogs.length / itemsPerPage)) {
            document.querySelector(DOM.next).style.opacity = '1';
        }
    }

    const fetchBlogs = () => {
        return models.createNewBlogObject()
            .then((found) => {
                state.blogs = found;
                state.blogsCount = found.length;
                views.setTotalPages(state.blogsCount / itemsPerPage);
            })
            .catch(err => {
                console.log(err)
            })
    }
    const fetchSearchBlogs = (string) => {
        return fetch(`${DOM.rootServer}/blogs/search?searchId=${string}`, { method: 'GET' })
            .then((found) => {
                return found.json()
            })
            .then(found => {
                const foundBlogs = found.blogs;
                state.blogs = foundBlogs;
                state.blogsCount = foundBlogs.length;
                views.setTotalPages(state.blogsCount / itemsPerPage);
                views.clearInputField();
                getBlogs(0);
                selectors.pageNumber.textContent = '1';
                paginationLogic();
            })
            .catch(err => {
                console.log(err)
            })
    }
    
    const getBlogs = async (start) => {
        views.clearInputField();
        selectors.blogsContainer.style.opacity = '1';
        views.renderBlogTitles(state.blogs, start * itemsPerPage, itemsPerPage);
    }

    const getBlog = (id) => {
        models.getABlog(id)
            .then(res => {
                views.clearBlogArea();
                selectors.blogText.insertAdjacentHTML('afterbegin', views.getBlogText(res))
                views.showBlog();
                return fetch(`${DOM.rootServer}/blog/` + res._id + '/comments', { method: 'GET' })
            })
            .then(result => {
                return result.json();
            })
            .then(foundComments => {
                const comments = foundComments.comments.comments;
                document.querySelector(DOM.recommendedBlog).textContent = 'how to kill two birds with one stone';
                if (comments.length > 0) {
                    views.renderComments(comments);
                } else {
                    document.querySelector(DOM.comments).innerHTML = `<h1 class="no-comments">no comments yet</h1>`
                }
            })
            .catch(err => {
                console.log(err);
            })
    }

    const addEventListeners = async () => {
        //event listeners
        selectors.home.addEventListener('click', async () => {
            views.clearBlogAreaAsync();
            fetchBlogs()
                .then(res => {
                    selectors.pageNumber.textContent = '1';
                    document.querySelector(DOM.prev).style.opacity = '.2';
                    paginationLogic();
                    getBlogs(0);
                })
                .catch(err => {
                    console.log(err);
                })
        });

        document.querySelector('.search-btn').addEventListener('click', () => {
            const word = document.querySelector('.search-input').value;
            if(word) {
                fetchSearchBlogs(word)
                    .then(res => {
                        if(state.blogs.length < 1) {
                            document.querySelector('.blogs-container').innerHTML = '<h1 style="text-align:center">no blogs found</h1>';
                        }
                    })
            }
        })

        document.querySelector('.search-input').addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                const word = document.querySelector('.search-input').value;
                if (word) {
                    fetchSearchBlogs(word)
                        .then(res => {
                            if (state.blogs.length < 1) {
                                document.querySelector('.blogs-container').innerHTML = '<h1 style="text-align:center">no blogs found</h1>';
                            }
                        })
                }
            }
        })

        selectors.blogsContainer.addEventListener('click', async () => {
            const blogId = event.target.id;
            try {
                if(blogId) {
                    await getBlog(blogId);
                    $('html, body').animate({ scrollTop: $('.bllog').offset().top }, 500);
                }
            } catch(err) {
                console.log(err)
            }
        });

        selectors.blogText.addEventListener('click', async () => {
            if (event.target.id === 'close') {
                views.clearBlogAreaAsync();
                $('html, body').animate({ scrollTop: $('nav').offset().top }, 500);
            }

            if(event.target.id === 'recommended-blog__title') {
                try {
                    await getBlog('5ce7e7c3b990d6491430d2ef');
                    $('html, body').animate({ scrollTop: $('.bllog').offset().top }, 500);
                } catch (err) {
                    console.log(err);
                }
            }
        });

        document.querySelector(DOM.next).addEventListener('click', async () => {
            const nextPage = views.getNextPage();

            if (nextPage <= Math.ceil(state.blogs.length/itemsPerPage)) {
                selectors.blogsContainer.textContent = '';
                getBlogs(nextPage - 1)
                document.querySelector('.pageNumber').textContent = nextPage;
            }

        });

        document.querySelector(DOM.prev).addEventListener('click', async () => {
            const prev = views.getPreviousPage();

            if(prev > 0) {
                selectors.blogsContainer.textContent = '';
                document.querySelector('.pageNumber').textContent = prev;
                getBlogs(prev - 1);
            }
           
        })
        document.querySelector('.pagination').addEventListener('click', () => {
            paginationLogic();
        })

        document.querySelector('.blogs-heading').addEventListener('click', () => {
            views.clearBlogAreaAsync();
            fetchBlogs()
                .then(res => {
                    selectors.pageNumber.textContent = '1';
                    paginationLogic();
                    getBlogs(0);
                })
                .catch(err => {
                    console.log(err);
                })
        })
    }

    return {
        init: () => {
            fetchBlogs()
                .then(res => {
                    paginationLogic();
                    getBlogs(0);
                })
                .catch(err => {
                    console.log(err);
                })
            addEventListeners();
        }
    }
})(models, views);

controller.init();