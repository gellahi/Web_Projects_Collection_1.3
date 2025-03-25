document.addEventListener('DOMContentLoaded', () => {
    const blogPost = document.getElementById('blogPost');
    const blogId = window.location.pathname.split('/').pop();

    async function fetchBlogPost() {
        try {
            const response = await fetch(`/api/blogs/${blogId}`);
            if (!response.ok) {
                throw new Error('Blog post not found');
            }
            const blog = await response.json();
            displayBlogPost(blog);
            document.title = `${blog.title} - Blog Platform`;
        } catch (error) {
            console.error('Error:', error);
            blogPost.innerHTML = `
                <div class="text-center py-12">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
                    <p class="text-gray-600">The blog post you're looking for doesn't exist.</p>
                    <a href="/" class="mt-6 inline-block text-sky-600 hover:text-sky-700 font-medium">
                        ← Back to Home
                    </a>
                </div>
            `;
        }
    }

    function displayBlogPost(blog) {
        blogPost.innerHTML = `
            <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(blog.title)}</h2>
            <div class="flex items-center space-x-2 text-sm text-gray-500 mb-8">
                <span>By ${escapeHtml(blog.author)}</span>
                <span>•</span>
                <span>${new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="prose prose-lg max-w-none">
                ${escapeHtml(blog.content).split('\n').map(paragraph => 
                    paragraph ? `<p class="text-gray-700 mb-4">${paragraph}</p>` : ''
                ).join('')}
            </div>
            <div class="mt-12 pt-6 border-t border-gray-200">
                <a href="/" class="text-sky-600 hover:text-sky-700 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </a>
            </div>
        `;
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    fetchBlogPost();
});