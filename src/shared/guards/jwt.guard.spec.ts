/* eslint-disable @typescript-eslint/unbound-method */
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt.guard';
import { ExecutionContext } from '@nestjs/common';
import { ExpiredTokenException } from '../exceptions';

describe('JwtAuthGuard', () => {
  let sut: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard, Reflector],
    }).compile();

    sut = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if the handler is marked as public', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const context = {
        getHandler: () => ({ public: true } as any),
        getClass: () => ({} as any),
      };
      const result = sut.canActivate(context as ExecutionContext);
      expect(result).toEqual(true);
    });

    it('should call super.canActivate if the handler is not public', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest.spyOn(sut, 'canActivate').mockReturnValue(true);

      const context: any = {
        switchToHttp: () => ({
          getRequest: () => ({ headers: { authorization: 'Bearer token' } }),
          getResponse: jest.fn(),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      };

      const result = await sut.canActivate(context);

      expect(result).toEqual(true);

      expect(sut.canActivate).toHaveBeenCalled();
    });
  });

  describe('handleRequest', () => {
    it('should throw an ExpiredTokenException if the JWT is expired', () => {
      const context: any = {};
      const err = null;
      const user = null;
      const info = { message: 'jwt expired' };
      const status = null;
      const result = () => sut.handleRequest(err, user, info, context, status);
      expect(result).toThrowError(ExpiredTokenException);
    });

    it('should call super.handleRequest if the JWT is not expired', () => {
      jest.spyOn(sut, 'handleRequest').mockReturnValue(true);
      const context: any = {};
      const err = null;
      const user = null;
      const info = null;
      const status = null;
      const result = sut.handleRequest(err, user, info, context, status);

      expect(result).toEqual(true);
      expect(sut.handleRequest).toHaveBeenCalled();
    });

    it('should call super.handleRequest if there is a non-expiration related error', () => {
      jest.spyOn(sut, 'handleRequest').mockReturnValue(true);
      const context: any = {};
      const err = new Error('something went wrong');
      const user = null;
      const info = null;
      const status = null;
      const result = sut.handleRequest(err, user, info, context, status);

      expect(result).toEqual(true);
      expect(sut.handleRequest).toHaveBeenCalled();
    });
  });
});
