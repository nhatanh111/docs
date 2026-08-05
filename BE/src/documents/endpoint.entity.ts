import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'endpoints', timestamps: true })
export class ApiEndpoint extends Model {
  @Column({ primaryKey: true })
  declare endpointId: string;

  @Column({ allowNull: false })
  declare documentId: string;

  @Column({ allowNull: false })
  declare method: string;

  @Column({ allowNull: false })
  declare path: string;

  @Column({ allowNull: false })
  declare name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare requestSample: any;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare responseFormat: any;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare fields: any[];

  @Column({ type: DataType.JSONB, allowNull: true })
  declare allowedPartners: string[];
}
