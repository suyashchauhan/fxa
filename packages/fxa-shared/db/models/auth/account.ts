/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthBaseModel } from './auth-base';
import { Email } from './email';
import { Device } from './device';
import { uuidTransformer } from '../../transformers';

export type AccountOptions = {
  include?: 'emails'[];
};

export class Account extends AuthBaseModel {
  public static tableName = 'accounts';
  public static idColumn = 'uid';

  protected $uuidFields = [
    'uid',
    'emailCode',
    'kA',
    'wrapWrapKb',
    'authSalt',
    'verifyHash',
  ];

  public uid!: string;
  public createdAt!: number;
  public locale!: string;
  public email!: string;
  public emailVerified!: boolean;
  public normalizedEmail!: string;
  public emailCode!: string;
  public primaryEmail?: Email;
  public kA!: string;
  public wrapWrapKb!: string;
  public verifierVersion!: number;
  public verifyHash?: string;
  public authSalt!: string;
  public verifierSetAt!: number;
  public lockedAt!: number;
  public profileChangedAt!: number;
  public keysChangedAt!: number;
  public ecosystemAnonId!: string;
  public devices?: Device[];
  public emails?: Email[];

  public static relationMappings = {
    emails: {
      join: {
        from: 'accounts.uid',
        to: 'emails.uid',
      },
      modelClass: Email,
      relation: AuthBaseModel.HasManyRelation,
    },
    devices: {
      join: {
        from: 'accounts.uid',
        to: 'devices.uid',
      },
      modelClass: Device,
      relation: AuthBaseModel.HasManyRelation,
    },
  };

  public static async findByUid(uid: string, options?: AccountOptions) {
    const knex = Account.knex();
    const account = await Account.query()
      .select(
        'uid',
        'email',
        'emailVerified',
        'emailCode',
        'kA',
        'wrapWrapKb',
        'verifierVersion',
        'authSalt',
        'verifierSetAt',
        'createdAt',
        'locale',
        knex.raw(
          'COALESCE(profileChangedAt, verifierSetAt, createdAt) AS profileChangedAt'
        ),
        knex.raw(
          'COALESCE(keysChangedAt, verifierSetAt, createdAt) AS keysChangedAt'
        ),
        'ecosystemAnonId'
      )
      .where('uid', uuidTransformer.to(uid))
      .first();
    if (!account) {
      return null;
    }
    // it's actually faster as separate queries
    if (options?.include?.includes('emails')) {
      account.emails = await Email.findByUid(uid);
      account.primaryEmail = account.emails?.find((email) => email.isPrimary);
    }
    return account;
  }
}
