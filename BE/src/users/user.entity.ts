import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ allowNull: false, unique: true })
  declare email: string;

  @Column({ allowNull: false })
  declare password: string;

  @Column({ defaultValue: 'ĐỐI TÁC' })
  declare role: string;

  @Column({ defaultValue: 'Active' })
  declare status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string;
}
