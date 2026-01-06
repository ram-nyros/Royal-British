const express = require("express");
const router = express.Router();

const products = [
  {
    id: 1,
    name: "Chocolate Pastry",
    price: 250,
    image: "/images/pastry.jpg",
  },
  {
    id: 2,
    name: "Croissant",
    price: 150,
    image: "/images/croissant.jpg",
  },
];

router.get("/", (req, res) => {
  res.json(products);
});

module.exports = router;
