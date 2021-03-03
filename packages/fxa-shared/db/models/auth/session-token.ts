/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AuthBaseModel } from './auth-base';
import { aggregateNameValuePairs, uuidTransformer } from '../../transformers';

/** Session Token
 *
 * Note that this class does not currently implement all the functionality of the
 * `session_token.js` version from `fxa-auth-server`.
 */
export class SessionToken extends AuthBaseModel {
  public static tableName = 'sessionTokens';
  public static idColumn = 'tokenId';

  protected $uuidFields = [
    'tokenId',
    'uid',
    'tokenData',
    'deviceId',
    'tokenVerificationId',
  ];
  protected $intBoolFields = [
    'emailVerified',
    'mustVerify',
    'deviceCallbackIsExpired',
  ];

  // table fields
  tokenData!: string;
  uid!: string;
  createdAt!: number;
  uaBrowser?: string;
  uaBrowserVersion?: string;
  uaOS?: string;
  uaOSVersion?: string;
  uaDeviceType?: string;
  lastAccessTime!: number;
  uaFormFactor?: string;
  authAt!: number;
  verificationMethod?: number;
  verifiedAt?: number;
  mustVerify!: boolean;

  // joined fields (from sessionWithDevice_# stored proc)
  emailVerified!: boolean;
  email!: string;
  emailCode!: string;
  verifierSetAt!: number;
  locale!: string;
  profileChangedAt!: number;
  keysChangedAt!: number;
  accountCreatedAt!: number;
  deviceId!: string;
  deviceName?: string;
  deviceType?: string;
  deviceCreatedAt!: number;
  deviceCallbackUrl?: string;
  deviceCallbackPublicKey?: string;
  deviceCallbackAuthKey?: string;
  deviceCallbackIsExpired!: boolean;
  deviceCommandName?: string;
  deviceCommandData?: string;
  tokenVerificationId?: string;

  get tokenVerified() {
    return !this.tokenVerificationId;
  }

  get state() {
    return this.tokenVerified ? 'verified' : 'unverified';
  }

  static async findByTokenId(id: string) {
    const rows = await SessionToken.callProcedure('sessionWithDevice_18', [
      uuidTransformer.to(id),
    ]);
    if (!rows.length) {
      return null;
    }
    return SessionToken.fromDatabaseJson(
      aggregateNameValuePairs(
        rows,
        'deviceId',
        'deviceCommandName',
        'deviceCommandData',
        'deviceAvailableCommands'
      )[0]
    );
  }

  static async findByUid(uid: string) {
    const rows = await SessionToken.callProcedure('sessions_11', [
      uuidTransformer.to(uid),
    ]);
    if (!rows.length) {
      return [];
    }
    return aggregateNameValuePairs(
      rows,
      'deviceId',
      'deviceCommandName',
      'deviceCommandData',
      'deviceAvailableCommands'
    ).map((row: any) => SessionToken.fromDatabaseJson(row));
  }
}
