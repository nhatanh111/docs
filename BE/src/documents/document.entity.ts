import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'documents', timestamps: true })
export class ApiDocument extends Model {
  @Column({ primaryKey: true })
  declare id: string;

  @Column({ allowNull: false })
  declare projectId: string;

  @Column({ allowNull: false })
  declare projectName: string;

  @Column({ allowNull: false })
  declare title: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare allowedPartners: string[];
}
