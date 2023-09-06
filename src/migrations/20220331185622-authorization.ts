import { DefaultRoles, DefaultSubjects, PermissionAction } from '@shared/enums';
import {
  IPermissionCreate,
  IRole,
  IRoleCreate,
  ISubjectCreate,
} from '@shared/interfaces';
import * as mongo from 'mongodb';

const defaultSubjects: ISubjectCreate[] = [
  { name: DefaultSubjects.all },
  { name: DefaultSubjects.subjects },
  { name: DefaultSubjects.permissions },
  { name: DefaultSubjects.roles },
  { name: DefaultSubjects.refreshTokens },
  { name: DefaultSubjects.addresses },
  { name: DefaultSubjects.users },
  { name: DefaultSubjects.employees },
  { name: DefaultSubjects.employers },
  { name: DefaultSubjects.opportunities },
  { name: DefaultSubjects.states },
  { name: DefaultSubjects.universities },
  { name: DefaultSubjects.courses },
  { name: DefaultSubjects.academicBackgrounds },
  { name: DefaultSubjects.experiences },
  { name: DefaultSubjects.tools },
  { name: DefaultSubjects.languages },
  { name: DefaultSubjects.segments },
  { name: DefaultSubjects.benefits },
];

module.exports = {
  async up(db: mongo.Db) {
    const subjectCollection = db.collection<ISubjectCreate>(
      DefaultSubjects.subjects,
    );
    const permissionsCollection = db.collection<IPermissionCreate>(
      DefaultSubjects.permissions,
    );
    const rolesCollection = db.collection<IRoleCreate>(DefaultSubjects.roles);

    await subjectCollection.insertMany(defaultSubjects);
    const subjects = await subjectCollection.find().toArray();

    const employeeSubjectId = subjects
      .find((subject) => subject.name === DefaultSubjects.employees)
      ._id.toString();
    const employerSubjectId = subjects
      .find((subject) => subject.name === DefaultSubjects.employers)
      ._id.toString();
    const allSubjectId = subjects
      .find((subject) => subject.name === DefaultSubjects.all)
      ._id.toString();
    const usersSubjectId = subjects
      .find((subject) => subject.name === DefaultSubjects.users)
      ._id.toString();

    const condition = {
      user: { $eq: '${_id}' },
    };

    const userPermissions: IPermissionCreate[] = [
      {
        action: PermissionAction.read,
        subject: usersSubjectId,
        condition: {
          _id: { $eq: '${_id}' },
        },
      },
      {
        action: PermissionAction.update,
        subject: usersSubjectId,
        condition: {
          _id: { $eq: '${_id}' },
        },
      },
      {
        action: PermissionAction.delete,
        subject: usersSubjectId,
        condition: {
          _id: { $eq: '${_id}' },
        },
      },
    ];

    const defaultEmployeePermissions: IPermissionCreate[] = [
      {
        action: PermissionAction.read,
        subject: employeeSubjectId,
        condition,
      },
      {
        action: PermissionAction.update,
        subject: employeeSubjectId,
        condition,
      },
      {
        action: PermissionAction.delete,
        subject: employeeSubjectId,
        condition,
      },
      {
        action: PermissionAction.read,
        subject: employerSubjectId,
      },
    ];
    const defaultEmployerPermissions: IPermissionCreate[] = [
      {
        action: PermissionAction.read,
        subject: employerSubjectId,
        condition,
      },
      {
        action: PermissionAction.update,
        subject: employerSubjectId,
        condition,
      },
      {
        action: PermissionAction.delete,
        subject: employerSubjectId,
        condition,
      },
      {
        action: PermissionAction.read,
        subject: employeeSubjectId,
      },
    ];

    const defaultAdminPermissions: IPermissionCreate[] = [
      {
        action: PermissionAction.manage,
        subject: allSubjectId,
      },
    ];

    await permissionsCollection.insertMany([
      ...defaultEmployeePermissions,
      ...defaultEmployerPermissions,
      ...defaultAdminPermissions,
      ...userPermissions,
    ]);

    const employeePermissions = await permissionsCollection
      .find({
        $or: [
          {
            $and: [
              {
                action: PermissionAction.read,
              },
              {
                subject: employeeSubjectId,
              },
              {
                condition: { $ne: null },
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.update,
              },
              {
                subject: employeeSubjectId,
              },
              {
                condition: { $ne: null },
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.delete,
              },
              {
                subject: employeeSubjectId,
              },
              {
                condition: { $ne: null },
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.read,
              },
              {
                subject: employerSubjectId,
              },
              {
                condition: null,
              },
            ],
          },
          ...userPermissions,
        ],
      })
      .toArray();

    const employerPermissions = await permissionsCollection
      .find({
        $or: [
          {
            $and: [
              {
                action: PermissionAction.read,
              },
              {
                subject: employerSubjectId,
              },
              {
                condition: { $ne: null },
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.update,
              },
              {
                subject: employerSubjectId,
              },
              {
                condition: { $ne: null },
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.delete,
              },
              {
                subject: employerSubjectId,
              },
              {
                condition: { $ne: null },
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.read,
              },
              {
                subject: employeeSubjectId,
              },
              {
                condition: null,
              },
            ],
          },
          ...userPermissions,
        ],
      })
      .toArray();

    const adminPermissions = await permissionsCollection
      .find({
        action: PermissionAction.manage,

        subject: allSubjectId,
      })
      .toArray();

    const defaultRoles: IRoleCreate[] = [
      {
        name: DefaultRoles.admin,
        permissions: [
          ...adminPermissions.map((permission) => permission._id.toString()),
        ],
      },
      {
        name: DefaultRoles.employee,
        permissions: [
          ...employeePermissions.map((permission) => permission._id.toString()),
        ],
      },
      {
        name: DefaultRoles.employer,
        permissions: [
          ...employerPermissions.map((permission) => permission._id.toString()),
        ],
      },
    ];

    await rolesCollection.insertMany(defaultRoles);
  },

  async down(db: mongo.Db) {
    const subjectCollection = db.collection<ISubjectCreate>(
      DefaultSubjects.subjects,
    );
    const permissionsCollection = db.collection<IPermissionCreate>(
      DefaultSubjects.permissions,
    );
    const rolesCollection = db.collection<IRole>(DefaultSubjects.roles);

    const roles = await rolesCollection
      .find({
        name: {
          $in: [
            DefaultRoles.admin,
            DefaultRoles.employee,
            DefaultRoles.employer,
          ],
        },
      })
      .toArray();

    const subjects = await subjectCollection.find().toArray();

    const employeeSubjectId = subjects
      .find((subject) => subject.name === DefaultSubjects.employees)
      ._id.toString();
    const employerSubjectId = subjects
      .find((subject) => subject.name === DefaultSubjects.employers)
      ._id.toString();
    const allSubjectId = subjects
      .find((subject) => subject.name === DefaultSubjects.all)
      ._id.toString();
    const usersSubjectId = subjects
      .find((subject) => subject.name === DefaultSubjects.users)
      ._id.toString();

    const userPermissions: IPermissionCreate[] = [
      {
        action: PermissionAction.read,
        subject: usersSubjectId,
        condition: {
          _id: { $eq: '${_id}' },
        },
      },
      {
        action: PermissionAction.update,
        subject: usersSubjectId,
        condition: {
          _id: { $eq: '${_id}' },
        },
      },
      {
        action: PermissionAction.delete,
        subject: usersSubjectId,
        condition: {
          _id: { $eq: '${_id}' },
        },
      },
    ];
    const permissions = await permissionsCollection
      .find({
        $or: [
          {
            $and: [
              {
                action: PermissionAction.read,
              },
              {
                subject: employeeSubjectId,
              },
              {
                condition: { $ne: null },
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.update,
              },
              {
                subject: employeeSubjectId,
              },
              {
                condition: { $ne: null },
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.delete,
              },
              {
                subject: employeeSubjectId,
              },
              {
                condition: { $ne: null },
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.read,
              },
              {
                subject: employerSubjectId,
              },
              {
                condition: null,
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.read,
              },
              {
                subject: employerSubjectId,
              },
              {
                condition: { $ne: null },
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.update,
              },
              {
                subject: employerSubjectId,
              },
              {
                condition: { $ne: null },
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.delete,
              },
              {
                subject: employerSubjectId,
              },
              {
                condition: { $ne: null },
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.read,
              },
              {
                subject: employeeSubjectId,
              },
              {
                condition: null,
              },
            ],
          },
          {
            $and: [
              {
                action: PermissionAction.manage,
              },
              {
                subject: allSubjectId,
              },
            ],
          },
          ...userPermissions,
        ],
      })
      .toArray();

    const roleIds = roles.map((role) => role._id);
    const permissionIds = permissions.map((permission) => permission._id);

    await rolesCollection.deleteMany({
      _id: { $in: roleIds },
    });

    await permissionsCollection.deleteMany({
      _id: {
        $in: permissionIds,
      },
    });

    const operations = defaultSubjects.map((entity) => {
      return subjectCollection.deleteOne({ name: entity.name });
    });
    await Promise.all(operations);
  },
};
