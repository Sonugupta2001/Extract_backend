const urls = [
    "https://www.amazon.com",
    "https://www.walmart.com",
    "https://www.flipkart.com",
    "https://www.myntra.com",
  ];
  
  const prompt =
    "Extract the products from all given URLs and get the products with best prices, along with their details such as, product name, current price, original price, discount, promotional offers, stock status, website, and URL.";
  
module.exports = { urls, prompt };  