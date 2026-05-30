import { CreateDependentDto, DependentProfileDto } from '../../dtos';
import { PatientDependentsCommands } from '../../repositories';

export class CreateDependentUseCase {
  constructor(private readonly commands: PatientDependentsCommands) {}

  async execute(data: CreateDependentDto): Promise<DependentProfileDto> {
    return this.commands.addDependent(data);
  }
}