import { joiResolver } from "@hookform/resolvers/joi";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Joi from "joi";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { STAFFANY_COLORS } from "../commons/colors";
import {
  createShifts,
  getShiftById,
  updateShiftById,
} from "../helper/api/shift";
import { getErrorMessage } from "../helper/error";

interface IFormInput {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

const shiftSchema = Joi.object({
  name: Joi.string().required(),
  date: Joi.string().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
});

interface RouteParams {
  id: string;
}

// Helper to get current hour formatted as HH:00
const getCurrentHourStart = (): string => {
  const now = new Date();
  return String(now.getHours()).padStart(2, "0") + ":00";
};

// Helper to get next hour formatted as HH:00
const getNextHourStart = (): string => {
  const now = new Date();
  const nextHour = (now.getHours() + 1) % 24;
  return String(nextHour).padStart(2, "0") + ":00";
};

const ShiftForm: FunctionComponent = () => {
  const history = useHistory();
  const location = useLocation();
  const { id } = useParams<RouteParams>();
  const isEdit = id !== undefined;

  // Parse default date from URL query params
  const searchParams = new URLSearchParams(location.search);
  const defaultDateParam = searchParams.get("defaultDate");

  // Calculate default values for new shifts
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IFormInput>({
    resolver: joiResolver(shiftSchema),
    defaultValues,
  });

  useEffect(() => {
    const getData = async () => {
      try {
        if (!isEdit) {
          return;
        }

        const { result } = await getShiftById(id);

        setValue("name", result.name);
        setValue("date", result.date);
        setValue("startTime", result.startTime);
        setValue("endTime", result.endTime);
      } catch (error) {
        const message = getErrorMessage(error);
        setError(message);
      }
    };

    getData();
  }, [isEdit, id, setValue]);

  const onSubmit = async (data: IFormInput) => {
    try {
      setError("");

      if (isEdit) {
        await updateShiftById(id, data);
      } else {
        await createShifts(data);
      }

      // Navigate back - preserve the week context if coming from shift page
      history.goBack();
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
    }
  };

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
                  backgroundColor: STAFFANY_COLORS.RED,
                  color: STAFFANY_COLORS.WHITE,
                  "&:hover": {
                    backgroundColor: STAFFANY_COLORS.RED_HOVER,
                  },
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Back
              </Button>
            </Box>

            {error.length > 0 ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : <></>}
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid2 container spacing={3}>
                {/* Shift Name - Full Width */}
                <Grid2 size={12}>
                  <TextField
                    fullWidth
                    label="Shift Name *"
                    slotProps={{
                      htmlInput: { ...register("name") },
                    }}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid2>

                {/* Event date, Start Time, End Time - Same Row */}
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

                {/* Save Button - Right Aligned */}
                <Grid2 size={12}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        backgroundColor: STAFFANY_COLORS.TURQOISE,
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: STAFFANY_COLORS.TURQOISE_HOVER,
                        },
                        textTransform: "uppercase",
                        fontWeight: 600,
                        px: 4,
                      }}
                    >
                      Save
                    </Button>
                  </Box>
                </Grid2>
              </Grid2>
            </form>
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  );
};

export default ShiftForm;
