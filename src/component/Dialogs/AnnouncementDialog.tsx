import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { closeAnnouncementDialog, nextAnnouncement, setAnnouncementDialogOpen } from "../../redux/globalStateSlice.ts";
import { getMyAnnouncements } from "../../api/api.ts";
import { Announcement } from "../../api/dashboard.ts";

const ANNOUNCEMENT_READ_KEY = "announcement_read_ids";

// Get the IDs of announcements that have been read
const getReadAnnouncementIds = (): Set<number> => {
  try {
    const stored = localStorage.getItem(ANNOUNCEMENT_READ_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.error("Failed to parse read announcement IDs", e);
  }
  return new Set();
};

// Mark an announcement as read
const markAnnouncementAsRead = (id: number) => {
  const readIds = getReadAnnouncementIds();
  readIds.add(id);
  localStorage.setItem(ANNOUNCEMENT_READ_KEY, JSON.stringify([...readIds]));
};

// Filter announcements to only show unread ones
export const filterUnreadAnnouncements = (announcements: Announcement[]): Announcement[] => {
  const readIds = getReadAnnouncementIds();
  return announcements.filter((a) => !readIds.has(a.id));
};

const AnnouncementDialog = () => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.globalState.announcementDialogOpen);
  const announcements = useAppSelector((state) => state.globalState.announcements);
  const currentIndex = useAppSelector((state) => state.globalState.announcementCurrentIndex) ?? 0;

  const currentAnnouncement = announcements && announcements[currentIndex];
  const isLastAnnouncement = announcements ? currentIndex >= announcements.length - 1 : true;

  const handleNext = useCallback(() => {
    if (currentAnnouncement) {
      markAnnouncementAsRead(currentAnnouncement.id);
    }
    dispatch(nextAnnouncement());
  }, [dispatch, currentAnnouncement]);

  const handleClose = useCallback(() => {
    if (currentAnnouncement) {
      markAnnouncementAsRead(currentAnnouncement.id);
    }
    dispatch(closeAnnouncementDialog());
  }, [dispatch, currentAnnouncement]);

  if (!open || !currentAnnouncement) {
    return null;
  }

  return (
    <Dialog open={!!open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {currentAnnouncement.title || t("settings.announcement")}
        {announcements && announcements.length > 1 && (
          <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
            ({currentIndex + 1}/{announcements.length})
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {currentAnnouncement.content}
        </Typography>
        {currentAnnouncement.created_at && (
          <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary">
              {t("announcement.publishedAt", "发布于")}: {new Date(currentAnnouncement.created_at).toLocaleString()}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!isLastAnnouncement ? (
          <Button onClick={handleNext} variant="contained" autoFocus>
            {t("application:fileManager.next", "下一条")}
          </Button>
        ) : (
          <Button onClick={handleClose} variant="contained" autoFocus>
            {t("application:modals.continueAction", "知道了")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Fetch and show announcements for current user
export const fetchAndShowAnnouncements = () => {
  return async (dispatch: any) => {
    try {
      const res = await dispatch(getMyAnnouncements());
      if (res && res.announcements && res.announcements.length > 0) {
        const unread = filterUnreadAnnouncements(res.announcements);
        if (unread.length > 0) {
          dispatch(setAnnouncementDialogOpen({ open: true, announcements: unread }));
        }
      }
    } catch (e) {
      console.error("Failed to fetch announcements", e);
    }
  };
};

export default AnnouncementDialog;
