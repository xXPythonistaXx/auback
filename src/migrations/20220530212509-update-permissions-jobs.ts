import { DefaultRoles, DefaultSubjects, PermissionAction } from '@shared/enums';
import {
  IPermissionCreate,
  IRole,
  IRoleCreate,
  ISubjectCreate,
} from '@shared/interfaces';
import * as mongo from 'mongodb';

const defaultSubject: ISubjectCreate = { name: DefaultSubjects.jobs };

module.exports = {
  async up(db: mongo.Db) {
    const subjectCollection = db.collection<ISubjectCreate>(
      DefaultSubjects.subjects,
    );
    const permissionsCollection = db.collection<IPermissionCreate>(
      DefaultSubjects.permissions,
    );
    const rolesCollection = db.collection<IRoleCreate>(DefaultSubjects.roles);

    await subjectCollection.insertOne(defaultSubject);
    const subjects = await subjectCollection.find().toArray();

    const jobSubjectId = subjects
      .find((subject) => subject.name === DefaultSubjects.jobs)
      ._id.toString();

    const employerJobPermissions: IPermissionCreate[] = [
      {
        action: PermissionAction.create,
        subject: jobSubjectId,
        condition: {
          role: { $in: [DefaultRoles.admin, DefaultRoles.employer] },
        },
      },
      {
        action: PermissionAction.read,
        subject: jobSubjectId,
        condition: {
          employer: { $eq: '${entityId}' },
        },
      },
      {
        action: PermissionAction.update,
        subject: jobSubjectId,
        condition: {
          employer: { $eq: '${entityId}' },
        },
      },
      {
        action: PermissionAction.delete,
        subject: jobSubjectId,
        condition: {
          employer: { $eq: '${entityId}' },
        },
      },
    ];

    const employeeJobPermissions: IPermissionCreate[] = [
      {
        action: PermissionAction.read,
        subject: jobSubjectId,
      },
    ];

    await permissionsCollection.insertMany([
      ...employerJobPermissions,
      ...employeeJobPermissions,
    ]);

    const employeePermissions = await permissionsCollection
      .find({
        $or: employeeJobPermissions,
      })
      .toArray();

    const employerPermissions = await permissionsCollection
      .find({
        $or: employerJobPermissions,
      })
      .toArray();

    await rolesCollection.updateOne(
      { name: DefaultRoles.employee },
      {
        $push: {
          permissions: {
            $each: employeePermissions.map((permission) =>
              permission._id.toString(),
            ),
          },
        },
      },
    );
    await rolesCollection.updateOne(
      { name: DefaultRoles.employer },
      {
        $push: {
          permissions: {
            $each: employerPermissions.map((permission) =>
              permission._id.toString(),
            ),
          },
        },
      },
    );
  },

  async down(db: mongo.Db) {
    const subjectCollection = db.collection<ISubjectCreate>(
      DefaultSubjects.subjects,
    );
    const permissionsCollection = db.collection<IPermissionCreate>(
      DefaultSubjects.permissions,
    );
    const rolesCollection = db.collection<IRole>(DefaultSubjects.roles);

    const subjects = await subjectCollection.find().toArray();

    const jobSubjectId = subjects
      .find((subject) => subject.name === DefaultSubjects.jobs)
      ._id.toString();

    const employerJobPermissions: IPermissionCreate[] = [
      {
        action: PermissionAction.create,
        subject: jobSubjectId,
        condition: {
          role: { $in: [DefaultRoles.admin, DefaultRoles.employer] },
        },
      },
      {
        action: PermissionAction.read,
        subject: jobSubjectId,
        condition: {
          employer: { $eq: '${entityId}' },
        },
      },
      {
        action: PermissionAction.update,
        subject: jobSubjectId,
        condition: {
          employer: { $eq: '${entityId}' },
        },
      },
      {
        action: PermissionAction.delete,
        subject: jobSubjectId,
        condition: {
          employer: { $eq: '${entityId}' },
        },
      },
    ];

    const employeeJobPermissions: IPermissionCreate[] = [
      {
        action: PermissionAction.read,
        subject: jobSubjectId,
      },
    ];

    const employerPermissions = await permissionsCollection
      .find({
        $or: [...employerJobPermissions],
      })
      .toArray();

    const employeePermissions = await permissionsCollection
      .find({
        $or: [...employeeJobPermissions],
      })
      .toArray();

    const employerPermissionsIds = employerPermissions.map(
      (permission) => permission._id,
    );
    const employeePermissionsIds = employeePermissions.map(
      (permission) => permission._id,
    );

    await rolesCollection.updateOne(
      {
        name: DefaultRoles.employer,
      },
      {
        $pullAll: {
          permissions: employerPermissionsIds.map((permission) =>
            permission.toString(),
          ) as any,
        },
      },
    );

    await rolesCollection.updateOne(
      {
        name: DefaultRoles.employee,
      },
      {
        $pullAll: {
          permissions: employeePermissionsIds.map((permission) =>
            permission.toString(),
          ) as any,
        },
      },
    );

    await permissionsCollection.deleteMany({
      _id: {
        $in: [...employerPermissionsIds, ...employeePermissionsIds],
      },
    });

    return subjectCollection.deleteOne({ name: defaultSubject.name });
  },
};
