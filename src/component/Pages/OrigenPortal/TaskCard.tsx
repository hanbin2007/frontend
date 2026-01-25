import { Card, CardContent, Typography, Box, Chip, Avatar } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store.ts";
import { setSelectedTask, setLoading } from "../../../redux/portalSlice.ts";
import { getPortalTask, PortalTask } from "../../../api/portal.ts";
import TimeAgo from "timeago-react";

interface TaskCardProps {
  task: PortalTask;
  onRefresh: () => void;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleClick = async () => {
    dispatch(setLoading(true));
    try {
      const response = await dispatch(getPortalTask(task.id));
      dispatch(
        setSelectedTask({
          task: response.task,
          comments: response.comments || [],
        }),
      );
    } catch {
      // Error handled by API layer
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        cursor: "pointer",
        border: "1px solid",
        borderColor: "divider",
        transition: "background-color 0.2s",
        flexShrink: 0,
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          {task.title}
        </Typography>

        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* Recent comments preview */}
        {task.recent_comments && task.recent_comments.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            {task.recent_comments.map((comment) => (
              <Box
                key={comment.id}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 0.5,
                  mb: 0.5,
                }}
              >
                <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: "text.secondary", mt: 0.3 }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {comment.author?.nickname || "User"}:
                  </Box>{" "}
                  {comment.content}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {task.assignee_ids.length > 0 && (
              <Chip
                size="small"
                avatar={<Avatar sx={{ width: 20, height: 20 }} />}
                label={`${task.assignee_ids.length}`}
                sx={{ height: 24 }}
              />
            )}
          </Box>

          <Typography variant="caption" color="text.secondary">
            <TimeAgo datetime={task.created_at} />
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
