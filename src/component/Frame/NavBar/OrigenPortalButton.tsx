import { Button, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RocketLaunch from "@mui/icons-material/RocketLaunch";

const OrigenPortalButton = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isMobile) {
    return null;
  }

  return (
    <Button
      variant="contained"
      onClick={() => navigate("/origen-portal")}
      startIcon={<RocketLaunch />}
      color="primary"
      sx={{ width: "100%" }}
    >
      OriGen Portal
    </Button>
  );
};

export default OrigenPortalButton;
