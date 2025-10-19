import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react"; // Import Clerk hook
import "./List.css";
import EditProductModal from "./EditProductModal";

const List = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [showBestsellers, setShowBestsellers] = useState(false);
  const [sortBy, setSortBy] = useState("date-desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Replace with your actual backend URL
  const backendUrl = "http://localhost:4000";

  // Get Clerk token
  const { getToken } = useAuth();

  // Fetch all products
  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // ✅ Get Clerk token properly
      const token = await getToken({ template: "MilikiAPI" });

      const response = await axios.post(
        `${backendUrl}/api/product/list`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Add Bearer prefix
        }
      );

      if (response.data.success) {
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
        toast.success("Products loaded successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  // Delete product
  const removeProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      // ✅ Get Clerk token again here
      const token = await getToken({ template: "MilikiAPI" });

      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Product deleted successfully");
        fetchProducts(); // Refresh the list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  };

  // Open edit modal
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
  };

  // Handle product update
  const handleProductUpdate = () => {
    fetchProducts();
    handleCloseEditModal();
  };

  // Get unique categories and subcategories
  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const subCategories = ["All", ...new Set(products.map((p) => p.subCategory))];

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // SubCategory filter
    if (selectedSubCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.subCategory === selectedSubCategory
      );
    }

    // Bestseller filter
    if (showBestsellers) {
      filtered = filtered.filter((product) => product.bestseller);
    }

    // Sorting
    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "date-desc":
        filtered.sort((a, b) => b.date - a.date);
        break;
      case "date-asc":
        filtered.sort((a, b) => a.date - b.date);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [
    products,
    selectedCategory,
    selectedSubCategory,
    showBestsellers,
    sortBy,
    searchTerm,
  ]);

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>All Products</h2>
        <button onClick={fetchProducts} className="refresh-btn">
          Refresh List
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sub-Category:</label>
          <select
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="filter-select"
          >
            {subCategories.map((subCat) => (
              <option key={subCat} value={subCat}>
                {subCat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showBestsellers}
              onChange={(e) => setShowBestsellers(e.target.checked)}
            />
            Bestsellers Only
          </label>
        </div>
      </div>

      {/* Products Count */}
      <div className="products-count">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        {filteredProducts.length === 0 ? (
          <div className="no-products">No products found</div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Sub-Category</th>
                <th>Price</th>
                <th>Sizes</th>
                <th>Bestseller</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className="product-image"
                    />
                  </td>
                  <td>
                    <div className="product-name">{product.name}</div>
                    <div className="product-description">
                      {product.description.substring(0, 50)}...
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{product.subCategory}</td>
                  <td className="price">
                    KSH {product.price.toLocaleString()}
                  </td>
                  <td>
                    <div className="sizes">
                      {product.sizes.map((size, index) => (
                        <span key={index} className="size-badge">
                          {size}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {product.bestseller ? (
                      <span className="badge bestseller-badge">
                        ★ Bestseller
                      </span>
                    ) : (
                      <span className="badge regular-badge">Regular</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(product)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeProduct(product._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={handleCloseEditModal}
          onUpdate={handleProductUpdate}
        />
      )}
    </div>
  );
};

export default List;
