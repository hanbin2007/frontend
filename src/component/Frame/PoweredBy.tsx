import { Box, BoxProps, Typography } from "@mui/material";

export interface PoweredByProps extends BoxProps {}

const PoweredBy = ({ ...rest }: PoweredByProps) => {
  return (
    <Box {...rest}>
      <Box
        component="span"
        marginBottom={2}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          textDecoration: "none",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: (theme) => theme.palette.action.disabled,
          }}
          fontWeight={500}
        >
          Powered by
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: (theme) => theme.palette.action.disabled,
          }}
          fontWeight={600}
        >
          OriGen Tech
        </Typography>
      </Box>
    </Box>
  );
};

export default PoweredBy;
