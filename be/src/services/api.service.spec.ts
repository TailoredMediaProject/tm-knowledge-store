import ApiService from './api.service';

describe('ApiService', () => {
    it('should validate correctly UTC string', () => {
        expect(ApiService.checkUTCString('2021-12-07T09:50:11.541Z')).toBeTruthy();
    });
    it('should validate correctly wrong UTC string', () => {
        ['021-12-07T09:50:11.541Z', 'a', '02983012u4901324'].forEach(s =>
          expect(ApiService.checkUTCString(s)).toBeFalsy()
        );
    });
});
