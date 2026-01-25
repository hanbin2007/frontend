import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import AssignmentIndOutlined from "@mui/icons-material/AssignmentIndOutlined";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import InboxOutlined from "@mui/icons-material/InboxOutlined";
import TaskOutlined from "@mui/icons-material/TaskOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import {
  closeNotificationHistory,
  openAnnouncementDetail,
  markNotificationAsRead,
  clearNotifications,
  InboxNotification,
} from "../../redux/globalStateSlice.ts";
import ResponsiveTabs, { Tab } from "../Common/ResponsiveTabs.tsx";

enum HistoryTab {
  All = "all",
  Announcements = "announcements",
  Tasks = "tasks",
}

const NotificationHistoryDialog = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<HistoryTab>(HistoryTab.All);

  const open = useAppSelector((state) => state.globalState.notificationHistoryOpen);
  const unreadNotifications = useAppSelector((state) => state.globalState.notifications) || [];
  const readNotifications = useAppSelector((state) => state.globalState.readNotifications) || [];

  // Combine all notifications and sort by time (newest first)
  const allNotifications = [...unreadNotifications, ...readNotifications].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  const handleClose = () => {
    dispatch(closeNotificationHistory());
  };

  const handleNotificationClick = (notification: InboxNotification, isUnread: boolean) => {
    if (notification.type === "announcement") {
      dispatch(openAnnouncementDetail(notification));
    } else if (notification.type === "task_assigned") {
      if (isUnread) {
        dispatch(markNotificationAsRead(notification));
      }
      dispatch(closeNotificationHistory());
      navigate("/origen-portal");
    }
  };

  const handleMarkAllRead = () => {
    dispatch(clearNotifications());
  };

  const tabs: Tab<HistoryTab>[] = [
    {
      label: t("inbox.all", "全部"),
      value: HistoryTab.All,
      icon: <InboxOutlined />,
    },
    {
      label: t("inbox.announcements", "公告"),
      value: HistoryTab.Announcements,
      icon: <CampaignOutlined />,
    },
    {
      label: t("inbox.tasks", "任务"),
      value: HistoryTab.Tasks,
      icon: <TaskOutlined />,
    },
  ];

  // Helper to check if a notification is a task-related type
  const isTaskNotification = (type: string) => {
    return type === "task_assigned" || type === "portal_task_updated" || type === "portal_task_comment";
  };

  const getFilteredNotifications = () => {
    switch (tab) {
      case HistoryTab.Announcements:
        return allNotifications.filter((n) => n.type === "announcement");
      case HistoryTab.Tasks:
        return allNotifications.filter((n) => isTaskNotification(n.type));
      default:
        return allNotifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const isUnread = (notification: InboxNotification) =>
    unreadNotifications.some((n) => n.id === notification.id && n.type === notification.type);

  return (
    <Dialog open={!!open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HistoryOutlined />
            <Typography variant="h6" component="span">
              {t("inbox.history", "通知历史")}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" edge="end">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 2 }}>
          <ResponsiveTabs value={tab} onChange={(_e, newValue) => setTab(newValue)} tabs={tabs} />
        </Box>

        {unreadNotifications.length > 0 && (
          <Box sx={{ px: 2, pt: 1 }}>
            <Button size="small" onClick={handleMarkAllRead} sx={{ textTransform: "none" }}>
              {t("inbox.markAllRead", "全部标为已读")}
            </Button>
          </Box>
        )}

        <Box sx={{ height: 400, overflow: "auto", p: 2, pt: 1 }}>
          {filteredNotifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                color: "text.secondary",
              }}
            >
              <Typography>{t("inbox.noMessages", "暂无消息")}</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredNotifications.map((notification, index) => {
                const unread = isUnread(notification);
                return (
                  <ListItem
                    key={`${notification.type}-${notification.id}-${index}`}
                    divider
                    sx={{
                      py: 1.5,
                      cursor: "pointer",
                      bgcolor: unread ? "action.hover" : "transparent",
                      borderRadius: 2,
                      mb: 0.5,
                      borderLeft: unread ? 3 : 0,
                      borderColor: unread ? "primary.main" : "transparent",
                      "&:hover": { bgcolor: "action.selected" },
                    }}
                    onClick={() => handleNotificationClick(notification, unread)}
                  >
                    <ListItemIcon sx={{ minWidth: 40, position: "relative" }}>
                      {unread && (
                        <FiberManualRecordIcon
                          sx={{
                            fontSize: 8,
                            position: "absolute",
                            top: 0,
                            left: 0,
                            color: "primary.main",
                          }}
                        />
                      )}
                      {notification.type === "announcement" ? (
                        <CampaignOutlined color={unread ? "primary" : "inherit"} />
                      ) : (
                        <AssignmentIndOutlined color={unread ? "secondary" : "inherit"} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight={unread ? 600 : 400}>
                            {notification.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
                            {notification.created_at ? new Date(notification.created_at).toLocaleString() : ""}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        notification.type === "task_assigned" && notification.from_user
                          ? t("inbox.assignedBy", {
                              user: notification.from_user,
                              defaultValue: `由 ${notification.from_user} 分配`,
                            })
                          : notification.content
                      }
                      secondaryTypographyProps={{
                        sx: {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        },
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationHistoryDialog;
