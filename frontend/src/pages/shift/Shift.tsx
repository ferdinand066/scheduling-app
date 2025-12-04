import { Grid2 } from "@mui/material";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import React, { FunctionComponent, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useLocation } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
  usePublishWeekQuery
} from "../../helper/api/hooks/usePublishWeekQueries";
import {
  useDeleteShiftMutation,
  useShiftsQuery,
} from "../../helper/api/hooks/useShiftQueries";
import { PublishWeek } from "../../helper/api/publishWeek";
import { getErrorMessage } from "../../helper/error/index";
import ShiftHeader from "./components/ShiftHeader";
import {
  formatDateForApi,
  getEndOfWeek,
  getStartOfWeek
} from "./functions/helper";
import { useShiftColumns } from "./hooks/useShiftColumns";

interface ShiftData {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

const Shift: FunctionComponent = () => {
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

  const currentWeekEnd = useMemo(
    () => getEndOfWeek(currentWeekStart),
    [currentWeekStart]
  );

  const startDate = formatDateForApi(currentWeekStart);
  const endDate = formatDateForApi(currentWeekEnd);

  const {
    data: shiftsData,
    isLoading,
    error: shiftsError,
  } = useShiftsQuery(startDate, endDate);

  const { data: publishWeekData } = usePublishWeekQuery(startDate, endDate);

  const deleteShiftMutation = useDeleteShiftMutation();

  const rows: ShiftData[] = shiftsData?.results ?? [];
  const publishWeek: PublishWeek | null = publishWeekData ?? null;
  const isPublished = publishWeek !== null;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState("");

  const onDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const { baseColumns } = useShiftColumns(isPublished, onDeleteClick);

  const onCloseDeleteDialog = () => {
    setSelectedId(null);
    setShowDeleteConfirm(false);
  };

  const deleteDataById = async () => {
    try {
      setErrMsg("");

      if (selectedId === null) {
        throw new Error("ID is null");
      }

      await deleteShiftMutation.mutateAsync(selectedId);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      onCloseDeleteDialog();
    }
  };

  // Combine errors from queries and mutations
  const displayError =
    errMsg ||
    (shiftsError ? getErrorMessage(shiftsError) : "");

  return (
    <Grid2 container spacing={3}>
      <Grid2 size={12}>
        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <ShiftHeader 
              isPublished={isPublished}
              publishWeek={publishWeek}
              currentWeekStart={currentWeekStart}
              currentWeekEnd={currentWeekEnd}
              rows={rows}
              setErrMsg={setErrMsg}
            />
            {displayError.length > 0 && (
              <Alert severity="error">{displayError}</Alert>
            )}
            <DataTable
              title="Shifts"
              columns={baseColumns}
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
      </Grid2>
      <ConfirmDialog
        title="Delete Confirmation"
        description={`Do you want to delete this data ?`}
        onClose={onCloseDeleteDialog}
        open={showDeleteConfirm}
        onYes={deleteDataById}
        loading={deleteShiftMutation.isPending}
      />
    </Grid2>
  );
};

export default Shift;
