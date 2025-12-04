import { BusinessCenter } from "@mui/icons-material";
import { ListItemButton } from "@mui/material";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

export const mainListItems = (
  <div>
    <ListItem disablePadding>
      <ListItemButton component={RouterLink} to="/shift">
        <ListItemIcon>
          <BusinessCenter />
        </ListItemIcon>
        <ListItemText primary="Shifts" />
      </ListItemButton>
    </ListItem>
  </div>
);
