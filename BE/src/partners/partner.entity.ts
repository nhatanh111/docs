import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'partners', timestamps: true })
export class Partner extends Model {
  @Column({ primaryKey: true })
  declare id: string;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: true })
  email: string;

  @Column({ allowNull: false })
  clientId: string;

  @Column({ defaultValue: 'active' })
  status: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  accountId: number;
}
