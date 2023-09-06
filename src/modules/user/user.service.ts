import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@schemas';
import { ErrorCodes } from '@shared/enums';
import { validatePasswordComplexity } from '@shared/helpers';
import { IUserCreate, IUserPayload, IUserUpdate } from '@shared/interfaces';
import { hash } from 'bcrypt';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(user: IUserCreate): Promise<IUserPayload> {
    const { password, ...rest } = user;
    const userExists = await this.userModel.exists({ email: user.email });
    if (userExists)
      throw new BadRequestException({
        errorCode: ErrorCodes.USER_ALREADY_REGISTERED,
        message: 'Email já cadastrado!',
      });
    let newUser: IUserCreate = { ...rest };
    if (user.password) {
      validatePasswordComplexity(user.password);
      newUser = { ...rest, password: await hash(password, 10) };
    }

    const createdUser = new this.userModel(newUser);
    return (await createdUser.save()).populate({
      path: 'role',
      populate: {
        path: 'permissions',
        model: 'Permission',
        populate: {
          path: 'subject',
          model: 'Subject',
        },
      },
    });
  }

  async findByEmail(email: string): Promise<IUserPayload> {
    return this.userModel
      .findOne({
        email,
      })
      .populate({
        path: 'role',
        populate: {
          path: 'permissions',
          model: 'Permission',
          populate: {
            path: 'subject',
            model: 'Subject',
          },
        },
      })
      .lean();
  }

  async findById(id: string): Promise<IUserPayload> {
    return this.userModel
      .findById(id)
      .populate({
        path: 'role',
        populate: {
          path: 'permissions',
          model: 'Permission',
          populate: {
            path: 'subject',
            model: 'Subject',
          },
        },
      })
      .lean();
  }

  async updateUserByEmail(email: string, user: IUserUpdate) {
    let newData: IUserUpdate = { ...user };

    if (user.password) {
      validatePasswordComplexity(user.password);
      newData = { ...user, password: await hash(user.password, 10) };
    }

    return this.userModel
      .findOneAndUpdate({ email }, newData, {
        lean: true,
        new: true,
      })
      .populate({
        path: 'role',
        populate: {
          path: 'permissions',
          model: 'Permission',
          populate: {
            path: 'subject',
            model: 'Subject',
          },
        },
      })
      .exec();
  }
}
