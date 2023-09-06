import { IJobStepCandidatesUpdate } from '@shared/interfaces';
import { IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export class ApproveReproveCandidatesDTO implements IJobStepCandidatesUpdate {
  @IsNotEmpty({ message: 'Candidatos é obrigatório.' })
  @ValidateIf((value) => !!value.candidates)
  @IsOptional()
  candidates: string[];

  @IsNotEmpty({ message: 'Mensagem é obrigatória.' })
  @ValidateIf(
    (value) =>
      !!value.customFeedback ||
      !!value.customFeedbackFrom ||
      !!value.customFeedbackTitle,
  )
  @IsOptional()
  customFeedback?: string;

  @IsNotEmpty({ message: 'Título é obrigatório.' })
  @ValidateIf(
    (value) =>
      !!value.customFeedback ||
      !!value.customFeedbackFrom ||
      !!value.customFeedbackTitle,
  )
  @IsOptional()
  customFeedbackTitle?: string;

  @IsNotEmpty({ message: 'Remetente é obrigatório.' })
  @ValidateIf(
    (value) =>
      !!value.customFeedback ||
      !!value.customFeedbackFrom ||
      !!value.customFeedbackTitle,
  )
  @IsOptional()
  customFeedbackFrom?: string;
}
