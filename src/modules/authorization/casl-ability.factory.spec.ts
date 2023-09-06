import { AuthorizationService } from './authorization.service';
import { CaslAbilityFactory } from './casl-ability.factory';

describe('CaslAbilityFactory', () => {
  it('should be defined', () => {
    const authorizationServiceSpy = new AuthorizationService(null, null);

    const sut = new CaslAbilityFactory(authorizationServiceSpy);
    expect(sut).toBeDefined();
  });
});
