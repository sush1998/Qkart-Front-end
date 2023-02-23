/* eslint-disable */
import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

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

const AddNewAddressView=({addAddress,setDisplayButton,newAddress,token,handleNewAddress})=>
{
  
  return (
    <div>
      <TextField 
        placeholder="Enter your complete address"
        multiline
        minRows={4}
        fullWidth
        value={newAddress.value}
        onChange={(e)=>handleNewAddress(
          {
            value:e.target.value
          }
        )}
/>
      <Box>
        <Button variant="contained"
        onClick={()=>addAddress(token,newAddress.value)}
        >Add</Button>
        <Button onClick={()=>setDisplayButton(true)}>Cancel</Button>
      </Box>
    </div>
  )
}


const Checkout = () => {

  const [items,setItems]=useState([])
  const [products,setProducts]=useState([])
  const [newAddress,setNewAddress]=useState({value:""})
  const [address,setAddress]=useState({ all: [], selected: "" })
  const [displayButton,setDisplayButton]=useState(true)
  const history=useHistory()
  const { enqueueSnackbar } = useSnackbar();

  const token=localStorage.getItem("token")



  const addAddress=async (token,newAddress)=>
  {
    try{
      const response=await axios.post(`${config.endpoint}/user/addresses`,{"address":`${newAddress}`},{headers:{
        'Authorization': `Bearer ${token}`
      }})
      console.log(response.data)
      setAddress((currAddress) => ({
        ...currAddress,
        all: response.data
      }))

      console.log(address.all)

      setNewAddress({value:""})
      setDisplayButton(true)
      
      return response.data
    }
    catch(error)
    {
      console.log(error.response.data.message)
    }
  }

  const deleteAddress=async(token,addressId)=>
  {
    try{
      const response=await axios.delete(`${config.endpoint}/user/addresses/${addressId}`,{headers:{
        'Authorization': `Bearer ${token}`
      }})
      console.log(response.data)
      setAddress((currAddress) => ({
        ...currAddress,
        all: response.data
      }))
      return response.data
    }
    catch(e)
   {
    console.log(error.response.data.message)
   }
  }

  const getProducts=async ()=>
  {
    try{
      const response=await axios.get(`${config.endpoint}/products`)
    console.log(response.data)
    setProducts(response.data)
    return response.data
    }
    catch(error)
    {
      if(error.response)
      {
        enqueueSnackbar(error.response.data.message,{variant:"error"})
      }
      else{
        enqueueSnackbar("Could not fetch product details. Check that the backend is running, reachable and returns valid JSON.",{variant: "error",});           
      }
      return null
    }
    
  }
  
  const getCartData=async(token)=>
  {
    console.log("FETCHING CART DETAILS")
    if (!token) return;
    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      console.log("CART DETAILS for :: "+token) 
      //const data={"productId":"BW0jAAeDJmlZCF8i","qty":1}
      const response=await axios.get(`${config.endpoint}/cart`,{
        headers:{'Authorization': `Bearer ${token}`}
      })

      console.log(response.data)
      //setCartData(cartData.data)
      return response.data

    }
    catch(error)
    {
      if(error.response)
      {
        enqueueSnackbar(error.response.data.message,{variant:"error"})
      }
      else{
        enqueueSnackbar("Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",{variant: "error",});           
      }
      return null
    }

  }

  const getAddress=async (token)=>
  {
    if(!token) return
    try
    {
      const response=await axios.get(`${config.endpoint}/user/addresses`,{headers:{
        'Authorization': `Bearer ${token}`
      }})
      console.log(response.data)
      setAddress((currAddress) => ({
          ...currAddress,
          all: response.data
        }))
      console.log(address.all)
      return response.data
  
    }
    catch(error)
    {
      if(error.response)
      {
        enqueueSnackbar(error.response.data.message,{variant:"error"})
      }
      else{
        enqueueSnackbar("Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",{variant: "error",});           
      }
      return null
    }
  }

  const toggleStyle=(id)=>
  {
    if(address.selected===id)
    {
      return "address-item selected"
    }
    else
    {
      return "address-item not-selected"
    }
  }

  const validateRequest=(address,items)=>
  {
     
    if(!address.all.length)
    {
      enqueueSnackbar("Please add a new address before proceeding.",{variant: 'warning',})
      return false
    }

    if(getTotalCartValue(items)>localStorage.getItem("balance"))
    {
      enqueueSnackbar("You do not have enough balance to place order.",{variant: 'warning',})
      return false      
    }

    if(address.selected === "")
    {
      enqueueSnackbar("Please select one shipping address to proceed",{variant: 'warning',})
      return false   
    }

   return true
  }

  const updateBalance=(items)=>
  {
    const prevBalance=localStorage.getItem("balance")
    const cartAmount=getTotalCartValue(items)
    console.log(prevBalance-cartAmount)
    localStorage.setItem("balance",prevBalance-cartAmount)
  }

  const performCheckout=async (address,items)=>
  {
    
    if(validateRequest(address,items))
    {
      try{
        const response=await axios.post(`${config.endpoint}/cart/checkout`,{"addressId":`${address.selected}`},{headers:{
          'Authorization': `Bearer ${token}`
        }})
        console.log(response.data)

        updateBalance(items)

        enqueueSnackbar('Order placed successfully!',{ 
          variant: 'success',
        })
        history.push("/thanks")
      }
      catch(e)
      {
        if (e.response && e.response.status === 400)
        {
          enqueueSnackbar( e.response.data.message, { variant: 'error'});
        } 
       else 
       {
          enqueueSnackbar( "You do not have enough balance to place order.", { variant: 'error'});
       }
      }
    }
    else
    {
      enqueueSnackbar("Please select one shipping address to proceed",{variant:"error"})
    }
    
  }

  useEffect(async ()=>
  {
    const token=localStorage.getItem("token")
    console.log("UseEffect Checkout called")
    const productData=await getProducts()
    const cartData=await getCartData(token)
    if(productData && cartData)
    {
      const cartDetails=await generateCartItemsFrom(cartData,productData)
      console.log(cartDetails)
      setItems(cartDetails)
    }
    const addressOnLoad=await getAddress(token)
    console.log(addressOnLoad)
    console.log(address.all)
  },[])

  return (
    <>
      <Header hasHiddenAuthButtons={true}/>
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Display list of addresses and corresponding "Delete" buttons, if present, of which 1 can be selected */}
              
              {
                address.all.length?
                  address.all.map((addressItem)=>
                  {
                    return(
                      <Box 
                        key={addressItem._id}
                        onClick={()=>setAddress({...address,selected:addressItem._id})
                        }
                        className={toggleStyle(addressItem._id)}
                      
                      >
                        <Typography>
                          {addressItem.address}
                        </Typography>
                        <Button
                        startIcon={<Delete />}
                        onClick={()=>{
                          console.log(addressItem._id)
                          deleteAddress(token,addressItem._id)
                        }}
                        >Delete</Button>
                        
                      </Box>
                    )
                  })
                :<Typography my="1rem">
                No addresses found for this account. Please add one to proceed
              </Typography>
              }
              
            </Box>

            {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Dislay either "Add new address" button or the <AddNewAddressView> component to edit the currently selected address */}
            {
              displayButton?<Button
              color="primary"
              variant="contained"
              id="add-new-btn"
              size="large"
              onClick={() => {
                setDisplayButton(false)
              }}
            >
              Add new address
          </Button>: <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
                setDisplayButton={setDisplayButton}
            />
            
            }
            
          
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={()=>performCheckout(address,items)}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly={true} products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;



