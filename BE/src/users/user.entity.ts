import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ allowNull: false, unique: true })
  email: string;

  @Column({ allowNull: false })
  password: string;

  @Column({ defaultValue: 'ĐỐI TÁC' })
  role: string;

  @Column({ defaultValue: 'Active' })
  status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;
}
