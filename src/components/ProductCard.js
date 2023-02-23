import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {

  return (
    <Card className="card">
      <CardMedia
        component="img"
        height="140"
        image={product.image}
        alt="green iguana"
      />
      <CardContent>
        <Typography variant="h6">
          {product.name}
        </Typography>
        <Typography variant="h6">
          ${product.cost}
        </Typography>
        <Rating name="read-only" value={product.rating} readOnly />
      </CardContent>
      <CardActions>
        <Button variant="contained" fullWidth size="small" onClick={handleAddToCart}>ADD TO CART</Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
