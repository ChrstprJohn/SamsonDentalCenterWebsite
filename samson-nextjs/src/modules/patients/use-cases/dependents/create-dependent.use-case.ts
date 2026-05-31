import { CreateDependentDto, DependentProfileDto } from '../../dtos';
import { PatientDependentsCommands } from '../../repositories';

export const createDependentUseCase = (
  addDependent: (data: CreateDependentDto) => Promise<DependentProfileDto>
) => {
  return async (data: CreateDependentDto): Promise<DependentProfileDto> => {
    return addDependent(data);
  };
};

// Deprecated class for backwards compatibility
export class CreateDependentUseCase {
  constructor(private readonly commands: PatientDependentsCommands) {}
  async execute(data: CreateDependentDto): Promise<DependentProfileDto> {
    return createDependentUseCase((d) => this.commands.addDependent(d))(data);
  }
}