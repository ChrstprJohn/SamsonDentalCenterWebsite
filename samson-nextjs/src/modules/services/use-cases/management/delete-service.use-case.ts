export const deleteServiceUseCase = (deleteService: (id: string) => Promise<void>) => {
  return async (id: string): Promise<void> => {
    await deleteService(id);
  };
};
