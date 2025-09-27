export const getTrainingHistory = async () => {
  return await window.electronAPI.getHistory();
};

export const addTrainingHistory = async (projectData: object) => {
  await window.electronAPI.addHistory(projectData);
};

export const updateTrainingHistoryItem = (data: {
  projectId: string;
  newStatus?: string;
  newWeightsHash?: string;
}) => {
  return window.electronAPI.updateHistoryItem(data);
};

export const deleteHistoryItem = (projectId: string) => {
  return window.electronAPI.deleteHistoryItem(projectId);
};
