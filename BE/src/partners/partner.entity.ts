import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'partners', timestamps: true })
export class Partner extends Model {
  @Column({ primaryKey: true })
  declare id: string;

  @Column({ allowNull: false })
  declare name: string;

  @Column({ allowNull: true })
  declare email: string;

  @Column({ allowNull: false })
  declare clientId: string;

  @Column({ defaultValue: 'active' })
  declare status: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare accountId: number;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare profileIds: string[];

  @Column({ type: DataType.JSONB, allowNull: true })
  declare allowedApis: string[];

  @Column({ type: DataType.JSONB, allowNull: true })
  declare overrides: { allow: string[]; deny: string[] };
}
