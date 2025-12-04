import { TableColumn } from "react-data-table-component";
import React from "react";
import ActionButton from "../components/ActionButton";

export interface ShiftData {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const useShiftColumns = (isPublished: boolean, onDeleteClick: (id: string) => void) => {
  const baseColumns: TableColumn<ShiftData>[] = [
    {
      id: "name",
      name: "Name",
      selector: (row: ShiftData) => row.name || "",
      sortable: true,
    },
    {
      id: "date",
      name: "Date",
      selector: (row: ShiftData) => row.date || "",
      sortable: true,
    },
    {
      id: "startTime",
      name: "Start Time",
      selector: (row: ShiftData) => row.startTime || "",
      sortable: true,
    },
    {
      id: "endTime",
      name: "End Time",
      selector: (row: ShiftData) => row.endTime || "",
      sortable: true,
    },
    {
      id: "actions",
      name: "Actions",
      cell: (row: ShiftData) => (
        <ActionButton
          id={row.id}
          onDelete={() => onDeleteClick(row.id)}
          disabled={isPublished}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return {
    baseColumns,
  }
};