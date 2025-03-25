// DOM Elements
const productsTableBody = document.getElementById('productsTableBody');
const productForm = document.getElementById('productForm');
const editProductForm = document.getElementById('editProductForm');
const addProductModal = new bootstrap.Modal(document.getElementById('addProductModal'));
const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal'));

// Fetch and display products
async function fetchProducts() {
    const loadingHtml = `
        <tr>
            <td colspan="5">
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </td>
        </tr>
    `;
    productsTableBody.innerHTML = loadingHtml;

    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        showAlert('Error fetching products', 'danger');
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-circle me-2"></i>
                    Failed to load products
                </td>
            </tr>
        `;
    }
}

// Display products in table
function displayProducts(products) {
    if (products.length === 0) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-inbox me-2"></i>
                    No products found
                </td>
            </tr>
        `;
        return;
    }

    productsTableBody.innerHTML = products.map(product => `
        <tr>
            <td class="fw-medium">${product.name}</td>
            <td>
                <span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1">
                    ${product.category}
                </span>
            </td>
            <td class="fw-medium">$${product.price.toFixed(2)}</td>
            <td class="description-cell">${product.description}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-icon btn-light" onclick="editProduct('${product._id}')" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-icon btn-light text-danger" onclick="deleteProduct('${product._id}')" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Add new product
document.getElementById('saveProduct').addEventListener('click', async () => {
    const formData = new FormData(productForm);
    const productData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            addProductModal.hide();
            productForm.reset();
            fetchProducts();
            showAlert('Product added successfully', 'success');
        } else {
            throw new Error('Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showAlert('Error adding product', 'danger');
    }
});

// Edit product
async function editProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        const product = await response.json();
        
        editProductForm.elements.id.value = product._id;
        editProductForm.elements.name.value = product.name;
        editProductForm.elements.category.value = product.category;
        editProductForm.elements.price.value = product.price;
        editProductForm.elements.description.value = product.description;
        
        editProductModal.show();
    } catch (error) {
        console.error('Error fetching product details:', error);
        showAlert('Error fetching product details', 'danger');
    }
}

// Update product
document.getElementById('updateProduct').addEventListener('click', async () => {
    const formData = new FormData(editProductForm);
    const productData = Object.fromEntries(formData.entries());
    const id = productData.id;
    delete productData.id;

    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            editProductModal.hide();
            fetchProducts();
            showAlert('Product updated successfully', 'success');
        } else {
            throw new Error('Failed to update product');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showAlert('Error updating product', 'danger');
    }
});

// Delete product
async function deleteProduct(id) {
    const confirmDelete = await showConfirmDialog('Are you sure you want to delete this product?');
    if (confirmDelete) {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchProducts();
                showAlert('Product deleted successfully', 'success');
            } else {
                throw new Error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showAlert('Error deleting product', 'danger');
        }
    }
}

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

// Show confirmation dialog
function showConfirmDialog(message) {
    return new Promise((resolve) => {
        const confirmed = window.confirm(message);
        resolve(confirmed);
    });
}

// Initial load
fetchProducts();