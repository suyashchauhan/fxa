/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthBaseModel } from './auth-base';
import { uuidTransformer } from '../../transformers';

export class Email extends AuthBaseModel {
  public static tableName = 'emails';
  public static idColumn = 'id';

  protected $uuidFields = ['uid', 'emailCode'];
  protected $intBoolFields = ['isVerified', 'isPrimary'];

  public normalizedEmail!: string;
  public email!: string;
  public uid!: string;
  public isVerified!: boolean;
  public isPrimary!: boolean;
  public emailCode!: string;
  public verifiedAt?: number;
  public createdAt!: number;

  public static async findByUid(uid: string) {
    return await Email.query()
      .where('uid', uuidTransformer.to(uid))
      .orderBy('isPrimary', 'DESC');
  }
}
