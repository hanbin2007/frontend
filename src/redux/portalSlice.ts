import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PortalTask, PortalTaskComment } from "../api/portal.ts";

export type PortalTaskFilter = "all" | "created" | "assigned";

export interface PortalState {
  tasks: PortalTask[];
  selectedTask: PortalTask | null;
  selectedTaskComments: PortalTaskComment[];
  filter: PortalTaskFilter;
  loading: boolean;
  createDialogOpen: boolean;
  detailDialogOpen: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  refreshTrigger: number;
}

const initialState: PortalState = {
  tasks: [],
  selectedTask: null,
  selectedTaskComments: [],
  filter: "all",
  loading: false,
  createDialogOpen: false,
  detailDialogOpen: false,
  page: 0,
  pageSize: 20,
  totalItems: 0,
  refreshTrigger: 0,
};

export const portalSlice = createSlice({
  name: "portal",
  initialState,
  reducers: {
    setTasks(
      state,
      action: PayloadAction<{
        tasks: PortalTask[];
        page: number;
        pageSize: number;
        totalItems: number;
      }>,
    ) {
      state.tasks = action.payload.tasks;
      state.page = action.payload.page;
      state.pageSize = action.payload.pageSize;
      state.totalItems = action.payload.totalItems;
    },
    setFilter(state, action: PayloadAction<PortalTaskFilter>) {
      state.filter = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setSelectedTask(
      state,
      action: PayloadAction<{
        task: PortalTask;
        comments: PortalTaskComment[];
      } | null>,
    ) {
      if (action.payload) {
        state.selectedTask = action.payload.task;
        state.selectedTaskComments = action.payload.comments;
        state.detailDialogOpen = true;
      } else {
        state.selectedTask = null;
        state.selectedTaskComments = [];
        state.detailDialogOpen = false;
      }
    },
    closeDetailDialog(state) {
      state.detailDialogOpen = false;
      state.selectedTask = null;
      state.selectedTaskComments = [];
    },
    setCreateDialogOpen(state, action: PayloadAction<boolean>) {
      state.createDialogOpen = action.payload;
    },
    addTask(state, action: PayloadAction<PortalTask>) {
      state.tasks.unshift(action.payload);
      state.totalItems += 1;
    },
    updateTask(state, action: PayloadAction<PortalTask>) {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.selectedTask?.id === action.payload.id) {
        state.selectedTask = action.payload;
      }
    },
    removeTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      state.totalItems -= 1;
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
        state.detailDialogOpen = false;
      }
    },
    addComment(state, action: PayloadAction<PortalTaskComment>) {
      state.selectedTaskComments.push(action.payload);
    },
    triggerRefresh(state) {
      state.refreshTrigger += 1;
    },
  },
});

export const {
  setTasks,
  setFilter,
  setLoading,
  setSelectedTask,
  closeDetailDialog,
  setCreateDialogOpen,
  addTask,
  updateTask,
  removeTask,
  addComment,
  triggerRefresh,
} = portalSlice.actions;

export default portalSlice.reducer;
