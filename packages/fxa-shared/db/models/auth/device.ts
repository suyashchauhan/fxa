/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { aggregateNameValuePairs, uuidTransformer } from '../../transformers';
import { AuthBaseModel } from './auth-base';

export class Device extends AuthBaseModel {
  public static tableName = 'devices';
  public static idColumn = ['uid', 'id'];

  protected $uuidFields = ['id', 'uid', 'sessionTokenId', 'refreshTokenId'];
  protected $intBoolFields = ['callbackIsExpired'];

  // table fields
  public id!: string;
  public uid!: string;
  public sessionTokenId!: string;
  public name?: string;
  public type?: string;
  public createdAt?: number;
  public callbackURL?: string;
  public callbackPublicKey?: string;
  public callbackAuthKey?: string;
  public callbackIsExpired!: boolean;
  public refreshTokenId?: string;

  // joined fields (from accountDevices_# stored proc)
  public uaBrowser?: string;
  public uaBrowserVersion?: string;
  public uaOS?: string;
  public uaOSVersion?: string;
  public uaDeviceType?: string;
  public uaFormFactor?: string;
  public lastAccessTime?: string;
  public commandName?: string;
  public commandData?: string;

  public static async findByUid(uid: string) {
    const knex = Device.knex();
    const uidBuffer = uuidTransformer.to(uid);
    const [result] = await knex.raw('Call accountDevices_16(?)', uidBuffer);
    const rowPacket = result.shift() as any[];
    if (rowPacket.length === 0) {
      return [];
    }
    return aggregateNameValuePairs(
      rowPacket,
      'id',
      'commandName',
      'commandData',
      'availableCommands'
    ).map((row: any) => Device.fromDatabaseJson(row));
  }
}
