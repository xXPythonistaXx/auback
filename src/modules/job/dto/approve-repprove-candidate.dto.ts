import { IJobStepCandidateUpdate } from '@shared/interfaces';
import { IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export class ApproveReproveCandidateDTO implements IJobStepCandidateUpdate {
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
