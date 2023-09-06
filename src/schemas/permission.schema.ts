/* eslint-disable @typescript-eslint/ban-types */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PermissionAction } from '@shared/enums';
import { IPermission, PermissionCondition } from '@shared/interfaces';
import { Document, SchemaTypes } from 'mongoose';
import { Subject } from './subject.schema';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true })
export class Permission implements IPermission {
  _id: string;

  @Prop({ trim: true, lowercase: true })
  action: PermissionAction;

  @Prop({ type: JSON })
  condition?: JSON;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Subject', autopopulate: true })
  subject: Subject;

  /**
   * @param condition: {"departmentId": "${id}"}
   * @param variables: {"id: 1"}
   * @return condition after parse: {"departmentId": 1}
   */
  public static parseCondition(
    condition: PermissionCondition,
    variables: Record<string, any>,
  ): PermissionCondition {
    if (!condition) return null;
    const parsedCondition = {};
    for (const [key, rawValue] of Object.entries(condition)) {
      if (Array.isArray(rawValue)) {
        parsedCondition[key] = rawValue;
        continue;
      }
      if (rawValue !== null && typeof rawValue === 'object') {
        const value = this.parseCondition(rawValue, variables);
        parsedCondition[key] = value;
        continue;
      }
      if (typeof rawValue !== 'string') {
        parsedCondition[key] = rawValue;
        continue;
      }

      const matches = /\$\{([_a-zA-Z0-9]+)\}/.exec(rawValue);
      if (!matches) {
        parsedCondition[key] = rawValue;
        continue;
      }
      const value = variables[matches[1]];
      if (typeof value === 'undefined') {
        throw new ReferenceError(`Variable ${key} is not defined`);
      }
      parsedCondition[key] = value;
    }
    return parsedCondition;
  }
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
