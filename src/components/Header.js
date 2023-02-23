import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useHistory, Link } from "react-router-dom";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {

  const handleLogout = async() =>
  {
    console.log("Logout clicked")
    await localStorage.clear()
    window.location.reload();
  }

  const username = localStorage.getItem("username")
  const history=useHistory()
  return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {children}
      {hasHiddenAuthButtons ?
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={()=> history.push("/")}>
          Back to Explore
        </Button> : username ? <div className="header">
        <Avatar src="avatar.png" alt={username} />
        <p>{username}</p>
          <Button
            className="explore-button"
            onClick={() => {
            localStorage.clear()
            window.location.reload()
          }}>Logout</Button>
        </div> :
          <div>
            <Button
              className="explore-button"
              variant="text"
              onClick={() => history.push("/login")}>Login</Button>
            <Button
              className="button"
              variant="contained"
              onClick={() => history.push("/register")}>Register</Button>
          </div>
      }
      {/* {children}
        {hasHiddenAuthButtons?<Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Back to explore
      </Button> : username ? <div className="header">
        <img src="avatar.png" alt="User avatar"/>
        <Button>
          {username}
          </Button>
          <Button
          className="explore-button"
          onClick={handleLogout}
          >
          Logout
          </Button> </div>: <div className="header">
            <Button
            onClick={history.push("/login")}
            variant="text">
            Login</Button>
            <Button
            onClick={history.push("/register")}
            variant="contained">
            Register</Button>
          </div>}
         */}
      </Box>
    );
};

export default Header;
