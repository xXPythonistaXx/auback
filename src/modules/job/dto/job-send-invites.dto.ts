import { IsNotEmpty, IsString } from 'class-validator';

interface IJobSendInvites {
  jobId: string;
  candidatesId: string[];
}

export class JobSendInvitesDTO implements IJobSendInvites {
  @IsNotEmpty({ message: 'A área de atuação é obrigatória.' })
  @IsString()
  jobId: string;

  @IsNotEmpty({ message: 'Informe a lista de candidatos corretamente' })
  candidatesId: string[];
}
