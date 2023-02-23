import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Button
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart"
import "./Products.css";



const Products = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [productList,setProductList]=useState([])
  const [isLoading,setLoading]=useState(false)
  const [cartData,setCartData]=useState([])

  const products=
  {
  "name":"Tan Leatherette Weekender Duffle",
  "category":"Fashion",
  "cost":150,
  "rating":4,
  "image":"https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
  "_id":"PmInA797xJhMIPti"
  }

  useEffect(async ()=>
  {
    setLoading(true)
    console.log("useEffect called")
    const getProducts=await performAPICall()
    setLoading(false)
    console.log(getProducts)
    setProductList(getProducts)
    fetchCart(localStorage.getItem("token"))
  },[])

  const performAPICall=async ()=>
  {
    try
    {
      const response=await axios.get(`${config.endpoint}/products`)
      console.log(response.data)
      return response.data
    }
    catch(err)
    {
      enqueueSnackbar(err.response.message,{variant:"error"})
    }
  }

  const performSearch=async (text)=>
  {
    console.log(text)
    try
    {
      setLoading(true)
      const searchProducts=await axios.get(`${config.endpoint}/products/search?value=${text}`)
      setLoading(false)
      console.log(searchProducts.data)
      setProductList(searchProducts.data)
      return searchProducts.data;
    }
    catch(error)
    {
      setLoading(false)
      console.log(error)
      setProductList([])
      return null
    }
    
  }

  const debounceSearch=(event,debounceTimeout)=>
  {
    let timeout
    if(timeout)
    {
      clearTimeout(timeout)
    }
    timeout=setTimeout(()=>
    {
      console.log(event.target.value)
      performSearch(event.target.value)
    },500)
  }
  
  {/*fetch data from cart */}
  const fetchCart = async (token) => {

    console.log("FETCHING CART DETAILS")
    if (!token) return;
    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      console.log("CART DETAILS for :: "+token) 
      //const data={"productId":"BW0jAAeDJmlZCF8i","qty":1}
      const cartData=await axios.get(`${config.endpoint}/cart`,{
        headers:{'Authorization': `Bearer ${token}`}
      })

      console.log(cartData.data)
      setCartData(cartData.data)

    }
      catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );                
      }
      return null;
    }
  };


  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    
    let isProductPresent=items.some(item=> item.productId===productId)
    console.log(isProductPresent)
    return isProductPresent
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {

    console.log()

    if(localStorage.getItem("token"))
    {
      if(isItemInCart(items,productId))
      {
        enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.",{variant:"warning"})
      }
      else{
        let productToAdd={
          "productId":productId,
          "qty":qty
        }
        try{

          const response=await axios.post(`${config.endpoint}/cart`,productToAdd,{headers:{
            'Authorization': `Bearer ${token}`
          }})
          console.log(response.data)
          setCartData(response.data)
        }
        catch(e)
        {
          console.log(e.message )
          enqueueSnackbar(e.response.data.message,{variant:"error"})
        }
      }
    }
    else{
      enqueueSnackbar("Login to add an item to the Cart",{variant:"warning"})
      return
    }
   
  };




  // eslint-disable-next-line no-undef
  //const  hasHiddenAuthButtons=localStorage.getItem("token"==="")
  return (
    <div>
      <Header>
      <TextField
        className="search-desktop" 
        id="outlined-search" 
        label="Search field" 
        type="search"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        onChange={(e)=>debounceSearch(e)}
        placeholder="Search for items/categories"
        name="search"
      />


      </Header>
      
       {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        onChange={(e)=>debounceSearch(e)}
        placeholder="Search for items/categories"
        name="search"
      />

      <Grid
      container
      direction="row"
      spacing={1}
      >
        
        <Grid
          md={9}
          item
          container
          direction="column"
          spacing={1}>

            <Grid item >
              <Box className="hero">
                <p className="hero-heading">
                  India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                  to your door step
                </p>
              </Box>
            </Grid>

            <Grid item container >
              {isLoading?<Box className="loading">
                <CircularProgress/>
                <p>Loading products...</p>
              </Box>:productList.length==0?<Box className="loading">
                <SentimentDissatisfied />
                No Products Found
                .</Box>:productList.map((productItem)=>
              {
                return (<Grid key={productItem._id} item md={3} xs={6}> 
                  
                  <ProductCard product={productItem} handleAddToCart={()=>addToCart(
                    localStorage.getItem("token"),
                    cartData,
                    productList,
                    productItem._id,
                    1
                  )}/>
                </Grid>)
              })}
            </Grid>
            
        </Grid>

        <Grid container
          item
          md={3}
          justifyContent="flex-start"
          alignItems="flex-start"
          spacing={1}
          >
          <Cart items={generateCartItemsFrom(cartData,productList)} handleQuantity={setCartData} isReadOnly={false}>
            
          </Cart>
        </Grid>
       
      </Grid>
      
      
      
      <Footer />
    </div>
  );
};



export default Products;
