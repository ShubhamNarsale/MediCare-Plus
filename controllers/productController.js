// controllers/productController.js
// Public product catalog: browse, search, filter by category, sort by price.

const Product = require('../models/Product');
const { catchAsync } = require('../middleware/errorMiddleware');

exports.listProducts = catchAsync(async (req, res) => {
  const { search, category, sort } = req.query;

  let products;
  if (search) {
    products = await Product.search(search);
  } else if (category) {
    products = await Product.findByCategory(category);
  } else if (sort === 'price_asc') {
    products = await Product.findAllSortedByPrice('ASC');
  } else if (sort === 'price_desc') {
    products = await Product.findAllSortedByPrice('DESC');
  } else {
    products = await Product.findAll();
  }

  const categories = await Product.getCategories();

  res.render('products/products', {
    title: 'Healthcare Products',
    products,
    categories,
    filters: { search: search || '', category: category || '', sort: sort || '' }
  });
});

exports.showProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product || product.status !== 'active') {
    req.flash('error', 'Product not found.');
    return res.redirect('/products');
  }

  res.render('products/product-details', { title: product.name, product });
});
