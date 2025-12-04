import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import React, { FunctionComponent } from "react";
import { Link as RouterLink } from "react-router-dom";

interface ActionButtonProps {
  id: string;
  onDelete: () => void;
  disabled?: boolean;
}

const ActionButton: FunctionComponent<ActionButtonProps> = ({
  id,
  onDelete,
  disabled = false,
}) => {
  return (
    <div>
      <IconButton
        size="small"
        aria-label="edit"
        component={RouterLink}
        to={`/shift/${id}/edit`}
        disabled={disabled}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        aria-label="delete"
        onClick={() => onDelete()}
        disabled={disabled}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

export default ActionButton;
