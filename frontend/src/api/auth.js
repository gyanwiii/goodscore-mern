import client from "./client";

export const authApi = {
  register: (data) => client.post("/auth/register", data).then((r) => r.data),
  login: (data) => client.post("/auth/login", data).then((r) => r.data),
  me: () => client.get("/auth/me").then((r) => r.data),
};

export const subscriptionApi = {
  subscribe: (data) => client.post("/subscriptions", data).then((r) => r.data),
  updateCharity: (data) => client.put("/subscriptions/me/charity", data).then((r) => r.data),
  cancel: () => client.delete("/subscriptions/me").then((r) => r.data),
};

export const userApi = {
  updateProfile: (data) => client.put("/users/me", data).then((r) => r.data),
  upsertScore: (data) => client.post("/users/me/scores", data).then((r) => r.data),
  deleteScore: (date) => client.delete(`/users/me/scores/${date}`).then((r) => r.data),
};
