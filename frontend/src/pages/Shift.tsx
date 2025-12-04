import React, { FunctionComponent, useEffect, useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import { getErrorMessage } from "../helper/error/index";
import { deleteShiftById, getShifts } from "../helper/api/shift";
import DataTable from "react-data-table-component";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useHistory, useLocation, Link as RouterLink } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "@mui/material/Alert";

interface ActionButtonProps {
  id: string;
  onDelete: () => void;
}

interface ShiftData {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

const ActionButton: FunctionComponent<ActionButtonProps> = ({
  id,
  onDelete,
}) => {
  return (
    <div>
      <IconButton
        size="small"
        aria-label="edit"
        component={RouterLink}
        to={`/shift/${id}/edit`}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" aria-label="delete" onClick={() => onDelete()}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

// Helper functions for week calculations
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfWeek = (startOfWeek: Date): Date => {
  const d = new Date(startOfWeek);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatWeekDisplay = (startOfWeek: Date, endOfWeek: Date): string => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const startMonth = months[startOfWeek.getMonth()];
  const endMonth = months[endOfWeek.getMonth()];
  const startDay = startOfWeek.getDate();
  const endDay = endOfWeek.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
};

const Shift: FunctionComponent = () => {
  const theme = useTheme();
  const history = useHistory();
  const location = useLocation();

  // Parse week from URL query params
  const searchParams = new URLSearchParams(location.search);
  const weekParam = searchParams.get("week");

  // Calculate current week dates based on URL param or current date
  const currentWeekStart = useMemo(() => {
    if (weekParam) {
      const parsedDate = new Date(weekParam);
      if (!isNaN(parsedDate.getTime())) {
        return getStartOfWeek(parsedDate);
      }
    }
    return getStartOfWeek(new Date());
  }, [weekParam]);

  const currentWeekEnd = useMemo(() => getEndOfWeek(currentWeekStart), [currentWeekStart]);

  const [rows, setRows] = useState<ShiftData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const onDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const onCloseDeleteDialog = () => {
    setSelectedId(null);
    setShowDeleteConfirm(false);
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    history.push(`/shift?week=${formatDateForApi(prevWeek)}`);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    history.push(`/shift?week=${formatDateForApi(nextWeek)}`);
  };

  // Navigate to add shift with the first day of current week as default date
  const handleAddShift = () => {
    const defaultDate = formatDateForApi(currentWeekStart);
    history.push(`/shift/add?defaultDate=${defaultDate}`);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        setErrMsg("");
        const startDate = formatDateForApi(currentWeekStart);
        const endDate = formatDateForApi(currentWeekEnd);
        const { results } = await getShifts(startDate, endDate);
        setRows(results);
      } catch (error) {
        const message = getErrorMessage(error);
        setErrMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [currentWeekStart, currentWeekEnd]);

  const columns = [
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
        <ActionButton id={row.id} onDelete={() => onDeleteClick(row.id)} />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const deleteDataById = async () => {
    try {
      setDeleteLoading(true);
      setErrMsg("");

      if (selectedId === null) {
        throw new Error("ID is null");
      }

      await deleteShiftById(selectedId);

      const tempRows = [...rows];
      const idx = tempRows.findIndex((v) => v.id === selectedId);
      tempRows.splice(idx, 1);
      setRows(tempRows);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setDeleteLoading(false);
      onCloseDeleteDialog();
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            {/* Header with week picker and buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              {/* Week Picker */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={goToPreviousWeek}
                  aria-label="Previous week"
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500, minWidth: 150, textAlign: "center" }}
                >
                  {formatWeekDisplay(currentWeekStart, currentWeekEnd)}
                </Typography>
                <IconButton
                  size="small"
                  onClick={goToNextWeek}
                  aria-label="Next week"
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddShift}
                  sx={{
                    borderColor: theme.customColors.turquoise,
                    color: theme.customColors.turquoise,
                    "&:hover": {
                      borderColor: theme.customColors.turquoise,
                      backgroundColor: "rgba(80, 217, 205, 0.08)",
                    },
                  }}
                >
                  ADD SHIFT
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: theme.customColors.turquoise,
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#3fc9bd",
                    },
                  }}
                >
                  PUBLISH
                </Button>
              </Box>
            </Box>

            {errMsg.length > 0 ? (
              <Alert severity="error">{errMsg}</Alert>
            ) : (
              <></>
            )}
            <DataTable
              title="Shifts"
              columns={columns}
              data={rows}
              progressPending={isLoading}
              noDataComponent="No shifts found"
              defaultSortFieldId="name"
              dense
              pagination
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
            />
          </CardContent>
        </Card>
      </Grid>
      <ConfirmDialog
        title="Delete Confirmation"
        description={`Do you want to delete this data ?`}
        onClose={onCloseDeleteDialog}
        open={showDeleteConfirm}
        onYes={deleteDataById}
        loading={deleteLoading}
      />
    </Grid>
  );
};

export default Shift;
