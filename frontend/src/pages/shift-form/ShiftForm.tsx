import { joiResolver } from "@hookform/resolvers/joi";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid2 from "@mui/material/Grid2";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { STAFFANY_COLORS } from "../../commons/colors";
import ERROR_CODES from "../../commons/errorCodes";
import {
  useCreateShiftMutation,
  useShiftByIdQuery,
  useUpdateShiftMutation,
} from "../../helper/api/hooks/useShiftQueries";
import { getErrorMessage } from "../../helper/error";
import { getCurrentHourStart, getNextHourStart } from "./functions/helper";
import { IFormInput, shiftSchema } from "./schema/shiftSchema";

interface ClashingShift {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface ShiftClashWarning {
  message: string;
  results: ClashingShift[];
}

interface RouteParams {
  id: string;
}

const ShiftForm: FunctionComponent = () => {
  const theme = useTheme();
  const history = useHistory();
  const location = useLocation();
  const { id } = useParams<RouteParams>();
  const isEdit = id !== undefined;

  const searchParams = new URLSearchParams(location.search);
  const defaultDateParam = searchParams.get("defaultDate");

  const defaultValues = useMemo(() => {
    if (isEdit) {
      return {
        name: "",
        date: "",
        startTime: "",
        endTime: "",
      };
    }
    return {
      name: "",
      date: defaultDateParam || "",
      startTime: getCurrentHourStart(),
      endTime: getNextHourStart(),
    };
  }, [isEdit, defaultDateParam]);

  const [error, setError] = useState("");
  const [shiftClashWarning, setShiftClashWarning] =
    useState<ShiftClashWarning | null>(null);
  const [pendingData, setPendingData] = useState<IFormInput | null>(null);

  const { data: shiftData, error: shiftError } = useShiftByIdQuery(
    isEdit ? id : undefined
  );
  const createShiftMutation = useCreateShiftMutation();
  const updateShiftMutation = useUpdateShiftMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<IFormInput>({
    resolver: joiResolver(shiftSchema),
    defaultValues,
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (isEdit && shiftData?.results) {
      reset({
        name: shiftData.results.name,
        date: shiftData.results.date,
        startTime: shiftData.results.startTime,
        endTime: shiftData.results.endTime,
      });
    }
  }, [isEdit, shiftData, reset]);

  useEffect(() => {
    if (shiftError) {
      setError(getErrorMessage(shiftError));
    }
  }, [shiftError]);

  const submitShift = async (data: IFormInput, force: boolean = false) => {
    const payload = force ? { ...data, force: true } : data;

    if (isEdit) {
      await updateShiftMutation.mutateAsync({ id, payload });
    } else {
      await createShiftMutation.mutateAsync(payload);
    }
  };

  const onSubmit = async (data: IFormInput) => {
    try {
      setError("");
      setShiftClashWarning(null);

      await submitShift(data);

      history.goBack();
    } catch (error: any) {
      if (error.response?.data?.code === ERROR_CODES.SHIFT_CLASH) {
        setShiftClashWarning({
          message: error.response.data.message,
          results: error.response.data.results || [],
        });
        setPendingData(data);
      } else {
        const message = getErrorMessage(error);
        setError(message);
      }
    }
  };

  const handleClashWarningClose = () => {
    setShiftClashWarning(null);
    setPendingData(null);
  };

  const handleForceSubmit = async () => {
    if (!pendingData) return;

    try {
      setError("");
      await submitShift(pendingData, true);
      setShiftClashWarning(null);
      setPendingData(null);

      history.goBack();
    } catch (error: any) {
      setShiftClashWarning(null);
      setPendingData(null);
      const message = getErrorMessage(error);
      setError(message);
    }
  };

  const isSubmitting =
    createShiftMutation.isPending || updateShiftMutation.isPending;

  return (
    <Grid2 container spacing={3}>
      <Grid2 size={12}>
        <Card>
          <CardContent>
            {/* Back Button */}
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={() => history.goBack()}
                sx={{
                  backgroundColor: theme.customColors.red,
                  color: theme.customColors.white,
                  "&:hover": {
                    backgroundColor: theme.customColors.red_hover,
                  },
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Back
              </Button>
            </Box>

            {error.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid2 container spacing={3}>
                <Grid2 size={12}>
                  <TextField
                    fullWidth
                    label="Shift Name *"
                    slotProps={{
                      htmlInput: { ...register("name") },
                      inputLabel: { shrink: nameValue ? true : undefined },
                    }}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Event date"
                    type="date"
                    slotProps={{
                      htmlInput: { ...register("date") },
                      inputLabel: { shrink: true },
                    }}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    type="time"
                    slotProps={{
                      htmlInput: { ...register("startTime") },
                      inputLabel: { shrink: true },
                    }}
                    error={!!errors.startTime}
                    helperText={errors.startTime?.message}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="End Time"
                    type="time"
                    slotProps={{
                      htmlInput: { ...register("endTime") },
                      inputLabel: { shrink: true },
                    }}
                    error={!!errors.endTime}
                    helperText={errors.endTime?.message}
                  />
                </Grid2>

                <Grid2 size={12}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      sx={{
                        backgroundColor: theme.customColors.turquoise,
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: theme.customColors.turquoise_hover,
                        },
                        textTransform: "uppercase",
                        fontWeight: 600,
                        px: 4,
                      }}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                  </Box>
                </Grid2>
              </Grid2>
            </form>
          </CardContent>
        </Card>
      </Grid2>

      <Dialog
        open={shiftClashWarning !== null}
        onClose={handleClashWarningClose}
        aria-labelledby="shift-clash-dialog-title"
      >
        <DialogTitle id="shift-clash-dialog-title">
          {shiftClashWarning?.message}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }} color="text.secondary">
            This shift clashes with the following shift:
          </Typography>
          {shiftClashWarning?.results
            .filter((_, index) => index === 0)
            .map((shift, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  {shift.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {shift.date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time: {shift.startTime} - {shift.endTime}
                </Typography>
              </Box>
            ))}
          <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
            Do you want to proceed anyway?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClashWarningClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleForceSubmit}
            color="primary"
            disabled={isSubmitting}
          >
            Ignore
          </Button>
        </DialogActions>
      </Dialog>
    </Grid2>
  );
};

export default ShiftForm;
