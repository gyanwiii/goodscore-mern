import client from "./client";

export const charityApi = {
  list: () => client.get("/charities").then((r) => r.data.charities),
  get: (id) => client.get(`/charities/${id}`).then((r) => r.data.charity),
  create: (data) => client.post("/charities", data).then((r) => r.data.charity),
  update: (id, data) => client.put(`/charities/${id}`, data).then((r) => r.data.charity),
  remove: (id) => client.delete(`/charities/${id}`).then((r) => r.data),
};
