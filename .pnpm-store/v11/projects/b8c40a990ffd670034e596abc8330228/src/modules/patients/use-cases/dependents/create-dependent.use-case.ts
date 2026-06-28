import { CreateDependentDto, DependentProfileDto } from '../../dtos/exports';

export const createDependentUseCase = (
  addDependent: (data: CreateDependentDto) => Promise<DependentProfileDto>
) => {
  return async (data: CreateDependentDto): Promise<DependentProfileDto> => {
    return addDependent(data);
  };
};