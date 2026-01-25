import { ThunkResponse } from "./request.ts";
import { send, defaultOpts } from "./request.ts";

// Portal Task interfaces
export interface CommentAuthorInfo {
  id: string;
  nickname: string;
  avatar: string;
}

export interface PortalTaskComment {
  id: string;
  content: string;
  author_id: string;
  author?: CommentAuthorInfo;
  created_at: string;
}

export interface PortalTask {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  creator_id: string;
  assignee_ids: string[];
  created_at: string;
  updated_at: string;
  recent_comments?: PortalTaskComment[];
}

export interface ListPortalTasksRequest {
  filter?: "all" | "created" | "assigned";
  status?: string;
  page?: number;
  page_size?: number;
}

export interface ListPortalTasksResponse {
  tasks: PortalTask[];
  page: number;
  page_size: number;
  total_items: number;
}

export interface CreatePortalTaskRequest {
  title: string;
  description?: string;
  assignee_ids: string[];
}

export interface GetPortalTaskResponse {
  task: PortalTask;
  comments: PortalTaskComment[];
}

export interface UpdatePortalTaskRequest {
  title?: string;
  description?: string;
  status?: "pending" | "in_progress" | "completed";
  assignee_ids?: string[];
}

export interface AddCommentRequest {
  content: string;
}

// API functions

export function listPortalTasks(req: ListPortalTasksRequest): ThunkResponse<ListPortalTasksResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/portal-task",
        {
          method: "GET",
          params: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function createPortalTask(req: CreatePortalTaskRequest): ThunkResponse<PortalTask> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/portal-task",
        {
          method: "PUT",
          data: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getPortalTask(id: string): ThunkResponse<GetPortalTaskResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/portal-task/${id}`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function updatePortalTask(id: string, req: UpdatePortalTaskRequest): ThunkResponse<PortalTask> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/portal-task/${id}`,
        {
          method: "PUT",
          data: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deletePortalTask(id: string): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/portal-task/${id}`,
        {
          method: "DELETE",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function addPortalTaskComment(taskId: string, req: AddCommentRequest): ThunkResponse<PortalTaskComment> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/portal-task/${taskId}/comment`,
        {
          method: "PUT",
          data: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}
