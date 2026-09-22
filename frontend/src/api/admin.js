import client from "./client";

export const adminApi = {
  listUsers: () => client.get("/admin/users").then((r) => r.data.users),
  setUserStatus: (id, status) => client.put(`/admin/users/${id}/status`, { status }).then((r) => r.data.user),
  upsertUserScore: (id, data) => client.put(`/admin/users/${id}/scores`, data).then((r) => r.data.scores),
  deleteUserScore: (id, date) => client.delete(`/admin/users/${id}/scores/${date}`).then((r) => r.data.scores),
  reports: () => client.get("/admin/reports").then((r) => r.data),
};
