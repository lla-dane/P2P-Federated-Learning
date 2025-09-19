export const getTrainingHistory = async () => {
  return await window.electronAPI.getHistory();
};

export const addTrainingHistory = async (projectData: object) => {
  await window.electronAPI.addHistory(projectData);
};
