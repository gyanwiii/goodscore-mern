import client from "./client";

export const drawApi = {
  listPublished: () => client.get("/draws").then((r) => r.data.draws),
  listMine: () => client.get("/draws/mine").then((r) => r.data.draws),
  listAll: () => client.get("/draws/all").then((r) => r.data.draws),
  createDraft: () => client.post("/draws").then((r) => r.data.draw),
  setType: (id, type) => client.put(`/draws/${id}/type`, { type }).then((r) => r.data.draw),
  simulate: (id) => client.post(`/draws/${id}/simulate`).then((r) => r.data.draw),
  publish: (id) => client.post(`/draws/${id}/publish`).then((r) => r.data.draw),
  discard: (id) => client.delete(`/draws/${id}`).then((r) => r.data),
  uploadProof: (id, proofUrl) => client.post(`/draws/${id}/proof`, { proofUrl }).then((r) => r.data),
  setWinnerStatus: (id, winnerId, payStatus) =>
    client.put(`/draws/${id}/winners/${winnerId}`, { payStatus }).then((r) => r.data.draw),
};
