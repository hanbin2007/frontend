import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { closeAnnouncementDetail, markNotificationAsRead } from "../../redux/globalStateSlice.ts";
import { useEffect } from "react";

const AnnouncementDetailDialog = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.globalState.announcementDetailOpen);
  const notification = useAppSelector((state) => state.globalState.announcementDetailNotification);

  useEffect(() => {
    // Mark as read when opened
    if (open && notification) {
      dispatch(markNotificationAsRead(notification));
    }
  }, [open, notification, dispatch]);

  const handleClose = () => {
    dispatch(closeAnnouncementDetail());
  };

  if (!notification) return null;

  const createdAt = new Date(notification.created_at);
  const formattedDate = createdAt.toLocaleString();

  return (
    <Dialog open={!!open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CampaignOutlined color="primary" />
          <Typography variant="h6" component="span" sx={{ flex: 1 }}>
            {notification.title}
          </Typography>
          <IconButton onClick={handleClose} size="small" edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {formattedDate}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {notification.content}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementDetailDialog;
