document.addEventListener('DOMContentLoaded', () => {
    const blogForm = document.getElementById('blogForm');
    const blogPosts = document.getElementById('blogPosts');

    // Load existing blog posts
    fetchBlogs();

    // Handle form submission
    blogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Publishing...';
        submitButton.disabled = true;
        
        const formData = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            content: document.getElementById('content').value
        };

        try {
            const response = await fetch('/api/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create blog post');
            }

            blogForm.reset();
            fetchBlogs();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to create blog post');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });

    async function fetchBlogs() {
        try {
            const response = await fetch('/api/blogs');
            const blogs = await response.json();
            displayBlogs(blogs);
        } catch (error) {
            console.error('Error:', error);
            blogPosts.innerHTML = '<p class="text-red-600">Failed to load blog posts</p>';
        }
    }

    function displayBlogs(blogs) {
        blogPosts.innerHTML = blogs.map(blog => `
            <article class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                <div class="p-6">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">${escapeHtml(blog.title)}</h3>
                    <div class="text-sm text-gray-500 mb-4 flex items-center space-x-2">
                        <span>By ${escapeHtml(blog.author)}</span>
                        <span>•</span>
                        <span>${new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p class="text-gray-600 mb-4 line-clamp-3">${escapeHtml(blog.content.substring(0, 150))}${blog.content.length > 150 ? '...' : ''}</p>
                    <a href="/blog/${blog._id}" 
                       class="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium transition-colors duration-200">
                        Read More
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </article>
        `).join('');
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});