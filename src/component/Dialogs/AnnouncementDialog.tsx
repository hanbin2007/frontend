import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { closeAnnouncementDialog } from "../../redux/globalStateSlice.ts";
import { getStoredAnnouncement } from "../Admin/Settings/SiteInformation/SiteInformation.tsx";

const ANNOUNCEMENT_READ_KEY = "announcement_read_hash";

const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString();
};

const AnnouncementDialog = () => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.globalState.announcementDialogOpen);
  const announcement = getStoredAnnouncement();

  const handleClose = useCallback(() => {
    if (announcement) {
      localStorage.setItem(ANNOUNCEMENT_READ_KEY, hashString(announcement));
    }
    dispatch(closeAnnouncementDialog());
  }, [dispatch, announcement]);

  if (!announcement) {
    return null;
  }

  return (
    <Dialog open={!!open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("settings.announcement")}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {announcement}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" autoFocus>
          {t("application:modals.continueAction", "知道了")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const shouldShowAnnouncement = (): boolean => {
  const announcement = getStoredAnnouncement();
  if (!announcement || announcement.trim() === "") {
    return false;
  }
  const readHash = localStorage.getItem(ANNOUNCEMENT_READ_KEY);
  const currentHash = hashString(announcement);
  return readHash !== currentHash;
};

export default AnnouncementDialog;
