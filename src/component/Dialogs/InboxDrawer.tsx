import {
  Box,
  Chip,
  Drawer,
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
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import {
  closeInboxDrawer,
  clearNotifications,
  openAnnouncementDetail,
  markNotificationAsRead,
  openNotificationHistory,
  InboxNotification,
} from "../../redux/globalStateSlice.ts";
import ResponsiveTabs, { Tab } from "../Common/ResponsiveTabs.tsx";

enum InboxTab {
  Announcements = "announcements",
  Tasks = "tasks",
}

const InboxDrawer = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState<InboxTab>(InboxTab.Announcements);
  const open = useAppSelector((state) => state.globalState.inboxDrawerOpen);
  const announcements = useAppSelector((state) => state.globalState.announcements);
  const notifications = useAppSelector((state) => state.globalState.notifications);

  const handleClose = () => {
    dispatch(closeInboxDrawer());
  };

  const handleClearNotifications = () => {
    dispatch(clearNotifications());
  };

  const handleAnnouncementClick = (notification: InboxNotification) => {
    dispatch(openAnnouncementDetail(notification));
  };

  const handleTaskClick = (notification: InboxNotification) => {
    dispatch(markNotificationAsRead(notification));
    dispatch(closeInboxDrawer());
    navigate("/origen-portal");
  };

  const handleViewHistory = () => {
    dispatch(openNotificationHistory());
  };

  // Helper to check if a notification is a task-related type
  const isTaskNotification = (type: string) => {
    return type === "task_assigned" || type === "portal_task_updated" || type === "portal_task_comment";
  };

  const taskNotifications = notifications?.filter((n) => isTaskNotification(n.type)) || [];
  const announcementNotifications = notifications?.filter((n) => n.type === "announcement") || [];

  const tabs: Tab<InboxTab>[] = [
    {
      label: t("inbox.announcements", "公告"),
      value: InboxTab.Announcements,
      icon: <CampaignOutlined />,
    },
    {
      label: (
        <Stack direction="row" spacing={1} alignItems="center">
          <span>{t("inbox.tasks", "任务")}</span>
          {taskNotifications.length > 0 && (
            <Chip label={taskNotifications.length} size="small" color="primary" sx={{ height: 18, fontSize: 12 }} />
          )}
        </Stack>
      ),
      value: InboxTab.Tasks,
      icon: <AssignmentIndOutlined />,
    },
  ];

  return (
    <Drawer anchor="right" open={!!open} onClose={handleClose}>
      <Box sx={{ width: 360, height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" p={2} pb={0}>
          <Typography variant="h6">{t("navbar.inbox")}</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ px: 2 }}>
          <ResponsiveTabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)} tabs={tabs} />
        </Box>

        <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
          {tabValue === InboxTab.Announcements && (
            <>
              {(!announcements || announcements.length === 0) && announcementNotifications.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 200,
                    color: "text.secondary",
                  }}
                >
                  <Typography>{t("inbox.noMessages")}</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {announcementNotifications.map((notification, index) => (
                    <ListItem
                      key={`notif-${index}`}
                      divider
                      sx={{
                        py: 1.5,
                        cursor: "pointer",
                        borderRadius: 2,
                        mb: 0.5,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                      onClick={() => handleAnnouncementClick(notification)}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CampaignOutlined color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={notification.content}
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
                  ))}
                  {announcements?.map((announcement, index) => (
                    <ListItem
                      key={`ann-${index}`}
                      divider
                      sx={{
                        py: 1.5,
                        cursor: "pointer",
                        borderRadius: 2,
                        mb: 0.5,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                      onClick={() =>
                        handleAnnouncementClick({
                          type: "announcement",
                          id: announcement.id,
                          title: announcement.title,
                          content: announcement.content,
                          created_at: announcement.created_at || new Date().toISOString(),
                        })
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CampaignOutlined />
                      </ListItemIcon>
                      <ListItemText
                        primary={announcement.title}
                        secondary={announcement.content}
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
                  ))}
                </List>
              )}
            </>
          )}

          {tabValue === InboxTab.Tasks && (
            <>
              {taskNotifications.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 200,
                    color: "text.secondary",
                  }}
                >
                  <Typography>{t("inbox.noTasks", "暂无任务通知")}</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {taskNotifications.map((notification, index) => (
                    <ListItem
                      key={index}
                      divider
                      sx={{
                        py: 1.5,
                        cursor: "pointer",
                        borderRadius: 2,
                        mb: 0.5,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                      onClick={() => handleTaskClick(notification)}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <AssignmentIndOutlined color="secondary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          notification.from_user
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
                            whiteSpace: "nowrap",
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </Box>

        <Box sx={{ p: 2, pt: 0, borderTop: 1, borderColor: "divider" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {(notifications?.length ?? 0) > 0 && (
              <Typography variant="body2" color="primary" sx={{ cursor: "pointer" }} onClick={handleClearNotifications}>
                {t("inbox.markAllRead", "全部已读")}
              </Typography>
            )}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                ml: "auto",
                "&:hover": { color: "primary.main" },
              }}
              onClick={handleViewHistory}
            >
              <HistoryOutlined sx={{ fontSize: 16 }} />
              {t("inbox.viewHistory", "查看历史")}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default InboxDrawer;
