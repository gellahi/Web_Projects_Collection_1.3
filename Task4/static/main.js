let currentJobs = [];
let isAdminView = false;
let filteredJobs = [];
let searchTerm = "";
let selectedJobType = "";

// Fetch and display jobs
async function fetchJobs() {
    try {
        const response = await fetch('/api/jobs');
        currentJobs = await response.json();
        displayJobs();
    } catch (error) {
        console.error('Error fetching jobs:', error);
    }
}

async function seedJobs() {
    try {
        const response = await fetch('/api/seed-jobs');
        const data = await response.json();
        alert(data.message);
        fetchJobs(); // Refresh job listings after seeding
    } catch (error) {
        console.error('Error seeding jobs:', error);
        alert('Error seeding jobs');
    }
}
function displayJobs() {
    const jobListings = document.getElementById('jobListings');
    filteredJobs = currentJobs;

    if (selectedJobType) {
        filteredJobs = filteredJobs.filter(job => job.type === selectedJobType);
    }

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredJobs = filteredJobs.filter(job =>
            job.title.toLowerCase().includes(term) ||
            job.company.toLowerCase().includes(term) ||
            job.description.toLowerCase().includes(term) ||
            job.location.toLowerCase().includes(term)
        );
    }

    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        if (filteredJobs.length === 0) {
            resultsCount.innerHTML = 'No jobs found';
            resultsCount.classList.remove('hidden');
        } else if (filteredJobs.length < currentJobs.length) {
            resultsCount.innerHTML = `Showing ${filteredJobs.length} of ${currentJobs.length} jobs`;
            resultsCount.classList.remove('hidden');
        } else {
            resultsCount.classList.add('hidden');
        }
    }

    if (filteredJobs.length === 0) {
        jobListings.innerHTML = `
            <div class="col-span-full text-center py-8">
                <img src="https://cdn-icons-png.flaticon.com/512/7486/7486760.png" alt="No jobs found" class="w-24 h-24 mx-auto mb-4 opacity-50">
                <h3 class="text-xl font-bold text-gray-700">No jobs found</h3>
                <p class="text-gray-500">Try adjusting your search or filter criteria</p>
                <button onclick="resetFilters()" class="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                    Reset Filters
                </button>
            </div>
        `;
    } else {
        jobListings.innerHTML = filteredJobs.map(job => `
            <div class="job-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div class="job-content">
                    <h2 class="text-xl font-bold text-gray-900 mb-2">${job.title}</h2>
                    <p class="text-emerald-600 font-semibold mb-2">${job.company}</p>
                    <p class="text-gray-600 mb-2"><i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>${job.location}</p>
                    <p class="text-gray-700 mb-4">${truncateText(job.description, 150)}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${job.requirements.map(req =>
            `<span class="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">${req}</span>`
        ).join('')}
                    </div>
                </div>
                <div class="flex justify-between items-center mt-auto">
                    <span class="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">${job.type}</span>
                    <button 
                        onclick="openApplicationModal('${job._id}', '${job.title}')"
                        class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition flex items-center"
                    >
                        <i class="fas fa-paper-plane mr-2"></i>Apply Now
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Function to truncate text with ellipsis
function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Add these functions to handle search and filter
function handleSearch() {
    searchTerm = document.getElementById('jobSearchInput').value.trim();
    displayJobs();
}

function handleFilterChange() {
    selectedJobType = document.getElementById('jobFilterType').value;
    displayJobs();
}

function resetFilters() {
    document.getElementById('jobSearchInput').value = '';
    document.getElementById('jobFilterType').value = '';
    searchTerm = '';
    selectedJobType = '';
    displayJobs();
}

// Add event listeners for search and filter
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the search input
    const searchInput = document.getElementById('jobSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }

    // Initialize the filter dropdown
    const filterSelect = document.getElementById('jobFilterType');
    if (filterSelect) {
        filterSelect.addEventListener('change', handleFilterChange);
    }
});

// Update the openApplicationModal function
function openApplicationModal(jobId, jobTitle) {
    // Reset the form first to clear any previous data
    document.getElementById('applicationForm').reset();

    // Set the job ID and title
    document.getElementById('jobId').value = jobId;
    document.getElementById('modalJobTitle').textContent = jobTitle;

    // Show the modal
    const modal = document.getElementById('applicationModal');
    modal.classList.remove('hidden');

    // Add the modal-open class to body to prevent background scrolling
    document.body.classList.add('modal-open');

    // Set focus on the first input field for better accessibility
    setTimeout(() => {
        document.getElementById('name').focus();
    }, 100);

    // Reset scroll position to top
    const modalContent = modal.querySelector('.max-h-\\[90vh\\]');
    if (modalContent) {
        modalContent.scrollTop = 0;
    }
}

function closeModal() {
    document.getElementById('applicationModal').classList.add('hidden');
    document.getElementById('applicationForm').reset();
    document.body.classList.remove('modal-open');
}
// event listener for job form submission
document.getElementById('jobForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        title: document.getElementById('jobTitle').value,
        company: document.getElementById('jobCompany').value,
        location: document.getElementById('jobLocation').value,
        description: document.getElementById('jobDescription').value,
        requirements: document.getElementById('jobRequirements').value.split(',').map(req => req.trim()),
        salary: document.getElementById('jobSalary').value,
        type: document.getElementById('jobType').value
    };

    try {
        const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Job created successfully!');
            document.getElementById('jobForm').reset();
            fetchJobs();
        } else {
            alert('Error creating job');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating job');
    }
});

// Handle application submission
// Update the application form submit handler
document.getElementById('applicationForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        jobId: document.getElementById('jobId').value,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        resumeLink: document.getElementById('resumeLink').value,
        coverLetter: document.getElementById('coverLetter').value || '' // Include optional cover letter
    };

    try {
        const response = await fetch('/api/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Application submitted successfully!');
            closeModal();
            if (isAdminView) {
                fetchApplicants(formData.jobId);
            }
        } else {
            alert('Error submitting application');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting application');
    }
});

function displayApplicants() {
    const applicantsList = document.getElementById('applicantsList');
    applicantsList.innerHTML = '';

    currentJobs.forEach(job => {
        const jobSection = document.createElement('div');
        jobSection.className = 'bg-white p-6 rounded-lg shadow-md mb-4';
        jobSection.id = `job-applicants-${job._id}`;
        jobSection.innerHTML = `
            <h3 class="text-lg font-bold mb-3">${job.title} - Applicants</h3>
            <p class="text-gray-500 mb-2">Loading applicants...</p>
        `;
        applicantsList.appendChild(jobSection);

        // Fetch applicants for this job
        fetchApplicants(job._id);
    });
}

// Update the fetchApplicants function
// Update the fetchApplicants function
async function fetchApplicants(jobId) {
    try {
        const response = await fetch(`/api/applicants/${jobId}`);
        const applicants = await response.json();

        const jobSection = document.getElementById(`job-applicants-${jobId}`);
        if (jobSection) {
            jobSection.innerHTML = `
                <h3 class="text-lg font-bold mb-3">${currentJobs.find(j => j._id === jobId).title} - Applicants</h3>
                ${applicants.length === 0 ?
                    '<p class="text-gray-500">No applications yet</p>' :
                    `<div class="space-y-4">
                        ${applicants.map(app => `
                            <div class="border rounded-lg p-4 hover:bg-gray-50 transition">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-semibold">${app.name}</p>
                                        <p class="text-gray-600">${app.email}</p>
                                    </div>
                                    <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                        ${new Date(app.appliedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div class="mt-2">
                                    <a href="${app.resumeLink}" target="_blank" class="text-emerald-600 hover:text-emerald-800 flex items-center">
                                        <i class="fas fa-file-alt mr-1"></i> View Resume
                                    </a>
                                </div>
                                ${app.coverLetter ?
                            `<div class="mt-3 border-t pt-3">
                                        <p class="text-sm text-gray-700">${app.coverLetter}</p>
                                    </div>` :
                            ''
                        }
                            </div>
                        `).join('')}
                    </div>`
                }
            `;
        }
    } catch (error) {
        console.error('Error fetching applicants:', error);
    }
}

// Update the toggleAdminView function
function toggleAdminView() {
    isAdminView = !isAdminView;
    const adminView = document.getElementById('adminView');
    const jobListings = document.getElementById('jobListings');

    if (isAdminView) {
        adminView.classList.remove('hidden');
        jobListings.classList.add('hidden');
        displayApplicants(); // Call the improved function
    } else {
        adminView.classList.add('hidden');
        jobListings.classList.remove('hidden');
    }
}

// Replace the showJobListings function with this corrected version
function showJobListings() {
    // Switch from admin view to job listings if needed
    if (isAdminView) {
        // Update the state
        isAdminView = false;

        // Get the correct elements
        const adminView = document.getElementById('adminView');
        const jobListingsSection = document.getElementById('jobListingsSection');

        // Hide admin view and show job listings
        if (adminView) adminView.classList.add('hidden');
        if (jobListingsSection) jobListingsSection.classList.remove('hidden');
    }

    // Make sure job listings are visible (in case the toggle used a different ID)
    const jobListings = document.getElementById('jobListings');
    if (jobListings && jobListings.classList.contains('hidden')) {
        jobListings.classList.remove('hidden');
    }

    // Refresh the jobs listing
    fetchJobs();

    // Scroll to the job listings section
    const section = document.getElementById('jobListingsSection');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize
fetchJobs();