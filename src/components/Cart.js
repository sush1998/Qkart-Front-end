import { config } from "../App";
import {
  AddOutlined,
  LocalActivity,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";
import ProductCard from "./ProductCard";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { Array.<{ productId: String, qty: Number }> } cartData
 *    Array of objects with productId and quantity of products in cart
 * 
 * @param { Array.<Product> } productsData
 *    Array of objects with complete data on all available products
 *
 * @returns { Array.<CartItem> }
 *    Array of objects with complete data on products in cart
 *
 */
export const generateCartItemsFrom = (cartData, productsData) => {
  console.log(productsData)
  console.log(cartData)

  let cartArray=[]
  for(let i in productsData)
  {
    for(let j in cartData)
    {
      if(productsData[i]._id===cartData[j]["productId"])
      {
        cartArray.push({...cartData[j],...productsData[i]})
      }
    }
  }
  //cartArray=productsData.filter(item=> item["productId"]===cartData)
  console.log(cartArray)

  return cartArray
};

/**
 * Get the total value of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products added to the cart
 *
 * @returns { Number }
 *    Value of all items in the cart
 *
 */
export const getTotalCartValue = (items) => {
  let total=items.reduce((prev,curr)=> prev + (curr.qty*curr.cost),0 )
  console.log(total)
  return total
};


export const getTotalItems = (items = []) => {

  return items.length ? items.reduce((total, item) => total +  item.qty,0)
                      : 0;

};

/**
 * Component to display the current quantity for a product and + and - buttons to update product quantity on cart
 * 
 * @param {Number} value
 *    Current quantity of product in cart
 * 
 * @param {Function} handleAdd
 *    Handler function which adds 1 more of a product to cart
 * 
 * @param {Function} handleDelete
 *    Handler function which reduces the quantity of a product in cart by 1
 * 
 * @param {Boolean} isReadOnly
 *    If product quantity on cart is to be displayed as read only without the + - options to change quantity
 * 
 */
const ItemQuantity = ({
  value,
  productId,
  handleAdd,
  handleDelete,
  handleQuantity,
  isReadOnly
  }) => {

  const baseURL=`${config.endpoint}/cart`
  const token=localStorage.getItem("token")

  handleAdd=async ()=>
  {
    console.log(productId)
    const response=await axios.post(baseURL,{"productId":productId,"qty":value+1},{headers:
    {
      'Authorization': `Bearer ${token}`,
    }})
    const data=response.data
    console.log(data)
    handleQuantity(data)
  }

  handleDelete=async ()=>
  {
    console.log(productId)
    let min=0;
    if(value<=0)
    {
      value=0
    }
    else{
      value=value-1
    }
    const response=await axios.post(baseURL,{"productId":productId,"qty":value},{headers:
      {
        'Authorization': `Bearer ${token}`,
      }})
    console.log(response.data)
    handleQuantity(response.data)
  }

  if(isReadOnly)
  {
    return(
      <Box className="card" padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
    )
  }
  else{



  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={()=>handleDelete()}>
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="small" color="primary" onClick={()=>handleAdd()}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
  }

  
};

/**
 * Component to display the Cart view
 * 
 * @param { Array.<Product> } products
 *    Array of objects with complete data of all available products
 * 
 * @param { Array.<Product> } items
 *    Array of objects with complete data on products in cart
 * 
 * @param {Function} handleDelete
 *    Current quantity of product in cart
 * 
 * @param {Boolean} isReadOnly
 *    If product quantity on cart is to be displayed as read only without the + - options to change quantity
 * 
 */
const Cart = ({
  products,
  items = [],
  handleQuantity,
  isReadOnly
}) => {

  const history=useHistory()

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  if(isReadOnly)
  {
    return (
      <>
        <Box className="cart">
          {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
          <Box
          padding="1rem"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
        >
          {items.map((product)=>
          {
            console.log(product)
            return <Box display="flex" alignItems="flex-start" padding="1rem" key={product._id}>
                <Box className="image-container">
                    <img
                        // Add product image
                        src={product.image}
                        // Add product name as alt eext
                        alt={product.name}
                        width="100%"
                        height="100%"
                    />
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    height="6rem"
                    paddingX="1rem"
                >
                    <div>{product.name}</div>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                    <Box padding="0.5rem" fontWeight="700">
                        Qty:{product.qty}
                    </Box>
                    <Box padding="0.5rem" fontWeight="700">
                        ${product.cost}
                    </Box>
                    </Box>
                </Box>
            </Box>
          })}
          <Box
            padding="1rem"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box color="#3C3C3C" alignSelf="center">
              Order total
            </Box>
            <Box
              color="#3C3C3C"
              fontWeight="700"
              fontSize="1.5rem"
              alignSelf="center"
              data-testid="cart-total"
            >
              ${getTotalCartValue(items)}
            </Box>
          </Box>

          <Box className="cart empty2">
        <h1>Order Details</h1>
         <Box
          display="flex"
          justifyContent="space-between">
          <p>Products</p>
          <p>{getTotalItems(items)}</p>
         </Box>
         <Box
          display="flex"
          justifyContent="space-between">
          <p>Subtotal</p>
           <p>${getTotalCartValue(items)}</p>
         </Box>
         <Box
          display="flex"
          justifyContent="space-between">
          <p>Shipping Charges</p>
           <p>$0</p>
         </Box>
         <Box
          display="flex"
          justifyContent="space-between">
          <h2>Total</h2>
           <h2>${getTotalCartValue(items)}</h2>
         </Box>        
    </Box>
          
          
        </Box>
        </Box>  
      </>
    );

  }
  else{
    return (
      <>
        <Box className="cart">
          {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
          {items.map((product)=>
          {
            console.log(product)
            return <Box display="flex" alignItems="flex-start" padding="1rem" key={product._id}>
                <Box className="image-container">
                    <img
                        // Add product image
                        src={product.image}
                        // Add product name as alt eext
                        alt={product.name}
                        width="100%"
                        height="100%"
                    />
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    height="6rem"
                    paddingX="1rem"
                >
                    <div>{product.name}</div>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                    <ItemQuantity 
                    // Add required props by checking implementation
                    value={product.qty} 
                    productId={product._id}
                    handleQuantity={handleQuantity}
                    isReadOnly={isReadOnly}
                    />
                    <Box padding="0.5rem" fontWeight="700">
                        ${product.cost}
                    </Box>
                    </Box>
                </Box>
            </Box>
          })}
          <Box
            padding="1rem"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box color="#3C3C3C" alignSelf="center">
              Order total
            </Box>
            <Box
              color="#3C3C3C"
              fontWeight="700"
              fontSize="1.5rem"
              alignSelf="center"
              data-testid="cart-total"
            >
              ${getTotalCartValue(items)}
            </Box>
          </Box>
  
          <Box display="flex" justifyContent="flex-end" className="cart-footer">
              <Button
                color="primary"
                variant="contained"
                startIcon={<ShoppingCart />}
                className="checkout-btn"
                onClick={()=>history.push("/checkout")}
                >
                  Checkout
              </Button>
          </Box>
          
          
        </Box>  
      </>
    );

  } 
  
};

export default Cart;
