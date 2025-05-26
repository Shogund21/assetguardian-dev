
import { Database } from './database';

type PublicSchema = Database['public'];

export type Tables = PublicSchema['Tables'];

export type TablesInsert<
  T extends keyof PublicSchema['Tables'] = keyof PublicSchema['Tables']
> = PublicSchema['Tables'][T]['Insert'];

export type TablesUpdate<
  T extends keyof PublicSchema['Tables'] = keyof PublicSchema['Tables']
> = PublicSchema['Tables'][T]['Update'];

export type TableEnums = PublicSchema['Enums'];
