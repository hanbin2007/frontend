import { useEffect, useCallback } from "react";
import { Box, Button, Typography, CircularProgress, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ViewListOutlined from "@mui/icons-material/ViewListOutlined";
import CreateOutlined from "@mui/icons-material/CreateOutlined";
import AssignmentIndOutlined from "@mui/icons-material/AssignmentIndOutlined";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store.ts";
import { setTasks, setFilter, setLoading, setCreateDialogOpen, PortalTaskFilter } from "../../../redux/portalSlice.ts";
import { listPortalTasks, PortalTask } from "../../../api/portal.ts";
import TaskCard from "./TaskCard.tsx";
import CreateTaskDialog from "./CreateTaskDialog.tsx";
import TaskDetailDialog from "./TaskDetailDialog.tsx";
import ResponsiveTabs, { Tab } from "../../Common/ResponsiveTabs.tsx";

const TaskBoard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, filter, loading, createDialogOpen, detailDialogOpen, refreshTrigger } = useSelector(
    (state: RootState) => state.portal,
  );

  const fetchTasks = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const response = await dispatch(listPortalTasks({ filter, page: 0, page_size: 100 }));
      dispatch(
        setTasks({
          tasks: response.tasks || [],
          page: response.page || 0,
          pageSize: response.page_size || 20,
          totalItems: response.total_items || 0,
        }),
      );
    } catch {
      // Error handled by API layer
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, filter]);

  // Fetch tasks on filter change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Refetch tasks when refreshTrigger changes (real-time updates)
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("TaskBoard: Refresh triggered by SSE notification");
      fetchTasks();
    }
  }, [refreshTrigger, fetchTasks]);

  const handleFilterChange = (_: React.SyntheticEvent, newValue: PortalTaskFilter) => {
    dispatch(setFilter(newValue));
  };

  const tabs: Tab<PortalTaskFilter>[] = [
    {
      label: t("portal.allTasks", "全部"),
      value: "all",
      icon: <ViewListOutlined />,
    },
    {
      label: t("portal.createdByMe", "我创建的"),
      value: "created",
      icon: <CreateOutlined />,
    },
    {
      label: t("portal.assignedToMe", "分配给我的"),
      value: "assigned",
      icon: <AssignmentIndOutlined />,
    },
  ];

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexShrink: 0,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {t("portal.taskBoard", "任务分派板")}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => dispatch(setCreateDialogOpen(true))}>
          {t("portal.newTask", "新建任务")}
        </Button>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ mb: 3, flexShrink: 0 }}>
        <ResponsiveTabs value={filter} onChange={handleFilterChange} tabs={tabs} />
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Task Columns */}
      {!loading && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Pending Column */}
          <TaskColumn
            title={t("portal.pending", "待处理")}
            tasks={pendingTasks}
            color="#ff9800"
            onRefresh={fetchTasks}
          />

          {/* In Progress Column */}
          <TaskColumn
            title={t("portal.inProgress", "进行中")}
            tasks={inProgressTasks}
            color="#2196f3"
            onRefresh={fetchTasks}
          />

          {/* Completed Column */}
          <TaskColumn
            title={t("portal.completed", "已完成")}
            tasks={completedTasks}
            color="#4caf50"
            onRefresh={fetchTasks}
          />
        </Box>
      )}

      {/* Dialogs */}
      {createDialogOpen && <CreateTaskDialog onSuccess={fetchTasks} />}
      {detailDialogOpen && <TaskDetailDialog onRefresh={fetchTasks} />}
    </Box>
  );
};

interface TaskColumnProps {
  title: string;
  tasks: PortalTask[];
  color: string;
  onRefresh: () => void;
}

const TaskColumn = ({ title, tasks, color, onRefresh }: TaskColumnProps) => {
  const { t } = useTranslation();

  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: "background.default",
        borderTop: `3px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            bgcolor: color,
            color: "white",
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          {tasks.length}
        </Typography>
      </Box>

      <Box
        sx={{
          overflowY: "auto",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {tasks.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            {t("portal.noTasks", "暂无任务")}
          </Typography>
        )}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onRefresh={onRefresh} />
        ))}
      </Box>
    </Paper>
  );
};

export default TaskBoard;
