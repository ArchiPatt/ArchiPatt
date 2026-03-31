import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class IdempotencyLedger {
  @PrimaryColumn({ type: "varchar", length: 255 })
  key!: string;

  @Column({ type: "varchar", length: 128 })
  scope!: string;

  @Column({ type: "int" })
  statusCode!: number;

  @Column({ type: "jsonb" })
  body!: unknown;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
