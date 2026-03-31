import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CreditStatus } from "../enums/CreditStatus";

@Entity()
export class Credit {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  clientId!: string;

  @Column({ type: "uuid" })
  accountId!: string;

  @Column({ type: "uuid" })
  tariffId!: string;

  @Column({ type: "numeric", precision: 18, scale: 2 })
  principalAmount!: string;

  @Column({ type: "numeric", precision: 18, scale: 2 })
  outstandingAmount!: string;

  @Column({ type: "text", default: CreditStatus.Active })
  status!: CreditStatus;

  @Column({ type: "timestamptz" })
  issuedAt!: Date;

  @Column({ type: "timestamptz" })
  nextPaymentDueAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  overdueSince!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  closedAt!: Date | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  idempotencyKey!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
