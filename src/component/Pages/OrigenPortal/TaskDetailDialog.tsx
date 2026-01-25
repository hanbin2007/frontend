import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store.ts";
import { closeDetailDialog, updateTask, removeTask, addComment } from "../../../redux/portalSlice.ts";
import { updatePortalTask, deletePortalTask, addPortalTaskComment } from "../../../api/portal.ts";
import TimeAgo from "timeago-react";

interface TaskDetailDialogProps {
  onRefresh: () => void;
}

const TaskDetailDialog = ({ onRefresh }: TaskDetailDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTask, selectedTaskComments, detailDialogOpen } = useSelector((state: RootState) => state.portal);

  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Sync edit fields when task changes
  useEffect(() => {
    if (selectedTask) {
      setEditTitle(selectedTask.title);
      setEditDescription(selectedTask.description || "");
    }
  }, [selectedTask]);

  const handleClose = () => {
    setIsEditing(false);
    dispatch(closeDetailDialog());
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setAnchorEl(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedTask) {
      setEditTitle(selectedTask.title);
      setEditDescription(selectedTask.description || "");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedTask || !editTitle.trim()) return;

    setLoading(true);
    try {
      const response = await dispatch(
        updatePortalTask(selectedTask.id, {
          title: editTitle.trim(),
          description: editDescription.trim(),
        }),
      );
      dispatch(updateTask(response));
      setIsEditing(false);
      onRefresh();
    } catch {
      // Error handled by API layer
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: "pending" | "in_progress" | "completed") => {
    if (!selectedTask) return;

    setLoading(true);
    try {
      const response = await dispatch(updatePortalTask(selectedTask.id, { status: newStatus }));
      dispatch(updateTask(response));
      onRefresh();
    } catch {
      // Error handled by API layer
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTask) return;

    setLoading(true);
    try {
      await dispatch(deletePortalTask(selectedTask.id));
      dispatch(removeTask(selectedTask.id));
      handleClose();
      onRefresh();
    } catch {
      // Error handled by API layer
    } finally {
      setLoading(false);
      setAnchorEl(null);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTask || !commentText.trim()) return;

    setLoading(true);
    try {
      const response = await dispatch(addPortalTaskComment(selectedTask.id, { content: commentText.trim() }));
      dispatch(addComment(response));
      setCommentText("");
      // Refresh task list to update recent_comments on cards
      onRefresh();
    } catch {
      // Error handled by API layer
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_progress":
        return "info";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return t("portal.pending", "待处理");
      case "in_progress":
        return t("portal.inProgress", "进行中");
      case "completed":
        return t("portal.completed", "已完成");
      default:
        return status;
    }
  };

  if (!selectedTask) return null;

  return (
    <Dialog open={detailDialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isEditing ? (
            <TextField
              fullWidth
              size="small"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder={t("portal.taskTitle", "任务标题")}
              sx={{ mr: 2 }}
            />
          ) : (
            <Typography variant="h6">{selectedTask.title}</Typography>
          )}
          <Box>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={handleStartEdit}>
                <EditIcon sx={{ mr: 1 }} />
                {t("portal.editTask", "编辑任务")}
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                <DeleteIcon sx={{ mr: 1 }} />
                {t("portal.deleteTask", "删除任务")}
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Task Info */}
        <Box sx={{ mb: 3 }}>
          {isEditing ? (
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder={t("portal.taskDescription", "任务描述")}
              sx={{ mb: 2 }}
            />
          ) : (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedTask.description || t("portal.noDescription", "暂无描述")}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Chip
              label={getStatusLabel(selectedTask.status)}
              color={getStatusColor(selectedTask.status) as "warning" | "info" | "success" | "default"}
              size="small"
            />
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
              <TimeAgo datetime={selectedTask.created_at} />
            </Typography>
          </Box>

          {/* Edit Action Buttons */}
          {isEditing ? (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" variant="contained" onClick={handleSaveEdit} disabled={loading || !editTitle.trim()}>
                {loading ? <CircularProgress size={16} /> : t("common:save", "保存")}
              </Button>
              <Button size="small" variant="outlined" onClick={handleCancelEdit} disabled={loading}>
                {t("common:cancel", "取消")}
              </Button>
            </Box>
          ) : (
            /* Status Change Buttons */
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="subtitle2" sx={{ alignSelf: "center", mr: 1 }}>
                {t("portal.updateStatus", "更新状态")}:
              </Typography>
              {selectedTask.status !== "pending" && (
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={() => handleStatusChange("pending")}
                  disabled={loading}
                >
                  {t("portal.pending", "待处理")}
                </Button>
              )}
              {selectedTask.status !== "in_progress" && (
                <Button
                  size="small"
                  variant="outlined"
                  color="info"
                  onClick={() => handleStatusChange("in_progress")}
                  disabled={loading}
                >
                  {t("portal.inProgress", "进行中")}
                </Button>
              )}
              {selectedTask.status !== "completed" && (
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={() => handleStatusChange("completed")}
                  disabled={loading}
                >
                  {t("portal.completed", "已完成")}
                </Button>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Comments */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          {t("portal.comments", "留言")} ({selectedTaskComments.length})
        </Typography>

        {selectedTaskComments.length > 0 ? (
          <List sx={{ maxHeight: 300, overflow: "auto" }}>
            {selectedTaskComments.map((comment) => (
              <ListItem key={comment.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={comment.author?.avatar || undefined} alt={comment.author?.nickname}>
                    {comment.author?.nickname?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                      <Typography component="span" variant="subtitle2" fontWeight="bold">
                        {comment.author?.nickname || "User"}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary">
                        <TimeAgo datetime={comment.created_at} />
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {comment.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("portal.noComments", "暂无留言")}
          </Typography>
        )}

        {/* Add Comment */}
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("portal.addComment", "添加留言")}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <IconButton color="primary" onClick={handleAddComment} disabled={!commentText.trim() || loading}>
            {loading ? <CircularProgress size={20} /> : <SendIcon />}
          </IconButton>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>{t("common:close", "关闭")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailDialog;
