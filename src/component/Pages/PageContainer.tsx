import { BoxProps, useMediaQuery, useTheme } from "@mui/material";
import { RadiusFrame } from "../Frame/RadiusFrame.tsx";

const PageContainer = (props: BoxProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <RadiusFrame
      {...props}
      sx={{
        flexGrow: 1,
        mb: isMobile ? 0 : 1,
        py: 4,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...props.sx,
      }}
      square={isMobile}
      withBorder={!isMobile}
    />
  );
};

export default PageContainer;
