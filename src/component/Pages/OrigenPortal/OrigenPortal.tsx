import { Box, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import PageContainer from "../PageContainer.tsx";

const OrigenPortal = () => {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: "center",
            bgcolor: "background.paper",
            maxWidth: 600,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            OriGen Portal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to the OriGen Portal
          </Typography>
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default OrigenPortal;
