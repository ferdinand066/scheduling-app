import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import React, { FunctionComponent } from "react";
import { formatDateForApi, formatPublishedDate, formatWeekDisplay } from "../functions/helper";
import { PublishWeek } from "../../../helper/api/publishWeek";
import { useCreatePublishWeekMutation } from "../../../helper/api/hooks/usePublishWeekQueries";
import { useHistory } from "react-router-dom";
import { getErrorMessage } from "../../../helper/error";
import { useTheme } from "@mui/material";
import { ShiftData } from "../hooks/useShiftColumns";

interface ShiftHeaderProps {
  isPublished: boolean;
  publishWeek: PublishWeek | null;
  currentWeekStart: Date;
  currentWeekEnd: Date;

  rows: ShiftData[];
  setErrMsg: (message: string) => void;

}
const ShiftHeader: FunctionComponent<ShiftHeaderProps> = ({
  isPublished,
  publishWeek,
  currentWeekStart,
  currentWeekEnd,

  rows,
  setErrMsg,
}) => {
    const theme = useTheme();
  const history = useHistory();
  const createPublishWeekMutation = useCreatePublishWeekMutation();

  const startDate = formatDateForApi(currentWeekStart);
  const endDate = formatDateForApi(currentWeekEnd);

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
  

  // Publish the current week
  const handlePublish = async () => {
    try {
      setErrMsg("");
      await createPublishWeekMutation.mutateAsync({ startDate, endDate });
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      {/* Week Picker */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <IconButton
          size="small"
          onClick={goToPreviousWeek}
          aria-label="Previous week"
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 500,
            minWidth: 150,
            textAlign: "center",
            ...(isPublished && { color: theme.customColors.turquoise }),
          }}
        >
          {formatWeekDisplay(currentWeekStart, currentWeekEnd)}
        </Typography>
        <IconButton
          size="small"
          onClick={goToNextWeek}
          aria-label="Next week"
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Published Status */}
        {isPublished && publishWeek && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CheckCircleOutlineIcon
              sx={{ color: theme.customColors.turquoise, fontSize: 18 }}
            />
            <Typography
              variant="body2"
              sx={{ color: theme.customColors.turquoise }}
            >
              {formatPublishedDate(publishWeek.createdAt)}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleAddShift}
            disabled={isPublished}
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
            onClick={handlePublish}
            sx={{
              backgroundColor: theme.customColors.turquoise,
              color: theme.customColors.white,
              "&:hover": {
                backgroundColor: theme.customColors.turquoise_hover,
              },
            }}
            disabled={
              rows.length === 0 ||
              isPublished ||
              createPublishWeekMutation.isPending
            }
          >
            {createPublishWeekMutation.isPending ? "PUBLISHING..." : "PUBLISH"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ShiftHeader;
